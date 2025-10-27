import express from 'express';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import cron from 'node-cron';

import cloudinary from './src/config/cloudinary.js';
import { Article } from './src/models/Article.js';
import { RewriteArticle } from './src/models/RewriteArticle.js';
import { AppConfig } from './src/models/AppConfig.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PORT      = process.env.PORT      || 9000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/FilmyBowl';
const URL       = 'https://tracktollywood.com/category/movie-news/';

// Optional: score rewritten text only
const ZEROGPT_API_URL = 'https://api.zerogpt.com/api/detect/detectText';
const ZEROGPT_API_KEY = process.env.ZEROGPT_API_KEY || '';

// Gemini endpoint
const GEMINI_ENDPOINT = (model, key) =>
  `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

// Retry only for timeouts/5xx (not for 4xx)
axiosRetry(axios, {
  retries: 2,
  retryDelay: (n) => n * 1000,
  retryCondition: (e) => e.code === 'ETIMEDOUT' || e.response?.status >= 500,
});

// ---- Mongo (no deprecated options)
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---- global flags for scheduler
let isRunning = false;
let lastRunAt = null;
let schedulerEnabled = false;
let stopScheduler = false; // stop on auth/quota issues

// ---- AppConfig helpers
async function getSavedGeminiConfig() {
  const doc = await AppConfig.findOne({});
  return { apiKey: doc?.key?.trim() || '', model: doc?.model?.trim() || '' };
}
async function saveGeminiConfig({ apiKey, model }) {
  const payload = {};
  if (apiKey) payload.key = apiKey.trim();
  if (model)  payload.model = model.trim();
  const saved = await AppConfig.findOneAndUpdate({}, { $set: payload }, { upsert: true, new: true });
  // reset stop flag on new config
  stopScheduler = false;
  return { apiKey: saved.key, model: saved.model };
}

// ---------- AI score on rewritten content ----------
async function detectAIContent(text) {
  if (!ZEROGPT_API_KEY || !text || text.trim().length < 10) return { aiScore: 0 };
  try {
    const { data } = await axios.post(ZEROGPT_API_URL, { input_text: text }, {
      headers: { 'ApiKey': ZEROGPT_API_KEY, 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      timeout: 60000,
    });
    return { aiScore: data?.data?.fakePercentage || 0 };
  } catch {
    return { aiScore: 0 };
  }
}

// ---------- scraping helpers ----------
async function fetchFullArticle(link) {
  try {
    const { data } = await axios.get(link, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
    });
    const $ = cheerio.load(data);
    const chunks = [];
    $('.td-post-content p').each((i, el) => {
      const t = $(el).text().trim();
      if (t) chunks.push(t);
    });
    return chunks.join('\n\n');
  } catch (e) {
    console.error(`Error fetching article ${link}: ${e.message}`);
    return '';
  }
}

async function downloadImage(url, filename) {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' } });
  fs.mkdirSync('./temp', { recursive: true });
  const filePath = path.join('./temp', filename);
  fs.writeFileSync(filePath, response.data);
  return filePath;
}

// ---------- prompt: SEO Markdown with bolded keywords & header block ----------
function buildRewritePrompt(topic, keywords = [], metaDescription = '') {
  const cleaned = (Array.isArray(keywords) ? keywords : String(keywords || '').split(','))
    .map(k => k.trim()).filter(Boolean);
  const csv = cleaned.join(', ');

  return `You are a senior news editor. Rewrite a 600–800 word, AdSense-friendly article based on the topic and source text below.

GOAL:
- Produce SEO-optimized content in **Markdown** (NOT HTML).
- Begin with two lines exactly like this (no extra spaces or labels):
  🔑 Target Keywords: <comma-separated keywords>
  📝 Meta Description: <<=160 chars, include at least one keyword>
- Then a line with just three dashes: ---
- Then the full article using Markdown headings:
  - One H1 ("# ") at the top with a new, catchy, SEO title.
  - Several H2 ("## ") and some H3 ("### ") subheadings.
  - Short paragraphs (2–4 sentences each).
- In the body, **bold every exact occurrence of the target keywords** using **double asterisks** (e.g., **keyword**).
- Use active voice, simple language, accurate facts; be neutral, no clickbait/violence.
- End with "## Conclusion" and a short closing paragraph.

If the user did NOT supply keywords or meta:
- Derive 15–25 relevant target keywords and show them comma-separated in the first line.
- Write a concise meta description (<=160 chars) in the second line.

IMPORTANT:
- Total length MUST be between 600 and 800 words. HARD CAP: do not exceed 900 words under any circumstance.
- The H1 must be the NEW article title (catchy and descriptive). Do not add any "Title:" labels. Just the "# " heading.
- The first two lines must be present exactly with the icons and labels shown.

TOPIC:
${topic}

TARGET KEYWORDS (may be blank; derive if blank):
${csv || '(none provided)'}

SUGGESTED META (may be blank; write one if blank):
${metaDescription || '(none provided)'}

Return only the final Markdown. Do not include any additional notes or commentary.`;
}

// ---------- word count helpers ----------
function stripFrontMatter(md = '') {
  if (!md) return '';
  const lines = md.split(/\r?\n/);
  const bodyLines = [];
  let seenSep = false;
  for (const l of lines) {
    if (!seenSep) {
      if (l.trim() === '---') seenSep = true;
      continue;
    }
    bodyLines.push(l);
  }
  return bodyLines.join('\n').trim();
}

function countWordsFromMarkdown(md = '') {
  const body = stripFrontMatter(md);
  const textish = body
    .replace(/[#>*_`~\-!\[\]\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!textish) return 0;
  return textish.split(' ').length;
}

// ---------- simple Gemini call (valid payload + generous token cap) ----------
async function rewriteWithGemini({ apiKey, model, topic, sourceText, keywords = [], metaDescription = '' }) {
  if (!apiKey) throw new Error('Missing Gemini API key');
  if (!model) throw new Error('Missing Gemini model');

  const MAX_SOURCE_CHARS = 10000;
  const safeSource =
    sourceText && sourceText.length > MAX_SOURCE_CHARS
      ? sourceText.slice(0, MAX_SOURCE_CHARS) + '\n\n[Truncated due to length]'
      : (sourceText || '');

  const prompt = buildRewritePrompt(topic, keywords, metaDescription);

  const payload = {
    contents: [{
      role: 'user',
      parts: [{ text:
`SOURCE TEXT (use as factual input; do not copy verbatim):
---
${safeSource}

INSTRUCTIONS:
${prompt}` }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096
    }
  };

  try {
    const { data } = await axios.post(
      GEMINI_ENDPOINT(model, apiKey),
      payload,
      { timeout: 120000, headers: { 'Content-Type': 'application/json' } }
    );

    const cand = data?.candidates?.[0] || {};
    const parts = cand?.content?.parts || [];
    const text = parts.map(p => p.text || '').join('').trim();

    const finish = cand?.finishReason || '';
    const hitTokenLimit = /MAX_TOKENS|length/i.test(String(finish));

    if (!text) throw new Error('Empty completion');
    return { text, promptUsed: prompt, modelUsed: model, hitTokenLimit };
  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.error?.message || err.message;

    const isAuthOrQuota =
      status === 401 ||
      status === 403 ||
      (status === 400 && /api key|permission|quota|project|unauthorized/i.test(msg));

    if (isAuthOrQuota) {
      console.error(`Gemini auth/quota error (${status}): ${msg}. Stopping scheduler.`);
      stopScheduler = true;
    } else {
      console.error(`Gemini request error (${status || 'n/a'}): ${msg}`);
    }
    throw err;
  }
}

// ---------- util: extract new title from Markdown (first H1) ----------
function extractTitleFromMarkdown(md) {
  if (!md) return '';
  const lines = md.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^#\s+(.+?)\s*$/);
    if (m) return m[1].trim();
  }
  return (lines.find(l => l.trim() && !l.startsWith('🔑') && !l.startsWith('📝') && !l.startsWith('---')) || '').trim();
}

// ---------- range-enforcing rewrite helpers ----------
function withinRange(n, min, max) {
  return n >= min && n <= max;
}

function splitFrontMatter(md = '') {
  const lines = md.split(/\r?\n/);
  const header = [];
  const body = [];
  let seenSep = false;
  for (const l of lines) {
    if (!seenSep) {
      header.push(l);
      if (l.trim() === '---') seenSep = true;
      continue;
    }
    body.push(l);
  }
  return { header: header.join('\n'), body: body.join('\n') };
}

// last-resort: hard trim body to maxWords while keeping header/front-matter intact
function hardTrimMarkdown(md = '', maxWords = 900) {
  const { header, body } = splitFrontMatter(md);
  const tokens = body
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  if (tokens.length <= maxWords) return md;

  const trimmedBody = tokens.slice(0, maxWords).join(' ') + ' …';
  return `${header}\n${trimmedBody}`;
}

async function ensureWordRangeRewrite({
  apiKey, model, topic, sourceText, keywords = [], metaDescription = '',
  minWords = 600, maxWords = 800, hardCap = 900, maxAttempts = 3
}) {
  let last = { text: '', promptUsed: '', modelUsed: model, status: 'pending', wordCount: 0 };
  let extraPrompt = '';
  let tokenBumpNote = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { text, promptUsed, modelUsed, hitTokenLimit } = await rewriteWithGemini({
      apiKey, model, topic, sourceText, keywords,
      metaDescription: (metaDescription || '') + extraPrompt + tokenBumpNote
    });

    let wc = countWordsFromMarkdown(text);

    // If within target range, done
    if (withinRange(wc, minWords, maxWords)) {
      return { text, promptUsed, modelUsed, wordCount: wc, status: 'full' };
    }

    // If over hard cap, trim immediately; maybe we land in-range
    let adjusted = text;
    if (wc > hardCap) {
      adjusted = hardTrimMarkdown(text, hardCap);
      wc = countWordsFromMarkdown(adjusted);
      if (withinRange(wc, minWords, maxWords)) {
        return { text: adjusted, promptUsed, modelUsed, wordCount: wc, status: 'full' };
      }
    }

    last = {
      text: adjusted,
      promptUsed,
      modelUsed,
      wordCount: wc,
      status: wc < minWords ? 'under' : (wc > maxWords ? 'over' : 'pending')
    };

    // Prepare the next attempt: expand or condense
    if (wc < minWords) {
      extraPrompt = `

ADDITIONAL REQUIREMENT:
Your previous draft was ${wc} words. Expand to between ${minWords} and ${maxWords} words. Add concise context, background, and relevant details. Keep Markdown format. HARD CAP 900 words.`;
    } else {
      extraPrompt = `

ADDITIONAL REQUIREMENT:
Your previous draft was ${wc} words. Condense to between ${minWords} and ${maxWords} words without losing key facts. Remove repetition and filler. Keep Markdown format. HARD CAP 900 words.`;
    }

    tokenBumpNote = hitTokenLimit
      ? ` The previous answer was truncated due to token limit; ensure the full article is delivered complete within the specified word range.`
      : '';

    await sleep(800);
  }

  // Final guard: if still above hard cap, trim again
  if (last.wordCount > hardCap) {
    const trimmed = hardTrimMarkdown(last.text, hardCap);
    return { ...last, text: trimmed, wordCount: countWordsFromMarkdown(trimmed), status: 'over' };
  }

  return last;
}

// ---------- main scrape+rewrite pipeline ----------
async function scrapeMovieNews({ apiKey, model, doRewrite = true, keywords = [], metaDescription = '' } = {}) {
  const { data } = await axios.get(URL, {
    timeout: 30000,
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' },
  });

  const $ = cheerio.load(data);
  const articleEls = $('.td-module-container.td-category-pos-image');

  fs.mkdirSync('./temp', { recursive: true });

  for (let i = 0; i < articleEls.length; i++) {
    const el = articleEls[i];
    const title = $(el).find('h3.entry-title a').text().trim();
    const link = $(el).find('h3.entry-title a').attr('href');
    const author = $(el).find('.td-post-author-name a').text().trim();
    const date = $(el).find('time.entry-date').attr('datetime');
    const thumb = $(el).find('span.entry-thumb').attr('data-img-url');

    console.log(`Processing article ${i + 1}: ${title}`);

    const content = await fetchFullArticle(link);

    // Upload image (optional)
    let thumbnail = '';
    if (thumb) {
      try {
        const tempName = `article_${i}_${Date.now()}.jpg`;
        const localPath = await downloadImage(thumb, tempName);
        const result = await cloudinary.uploader.upload(localPath, {
          folder: 'filmybowl/articles',
          use_filename: true,
          unique_filename: true
        });
        thumbnail = result.secure_url;
        fs.unlinkSync(localPath);
      } catch (e) {
        console.error(`Cloudinary upload error for ${title}: ${e.message}`);
      }
    }

    // Upsert original into Article (dedupe by link)
    const baseDoc = { title, link, author, date: date ? new Date(date) : undefined, thumbnail, content };
    const savedArticle = await Article.findOneAndUpdate(
      { link },
      { $setOnInsert: baseDoc },
      { upsert: true, new: true }
    );
    console.log(`${savedArticle.createdAt.getTime() === savedArticle.updatedAt.getTime() ? 'Inserted' : 'Duplicate skipped'} Article: ${title}`);

    // Rewrite if allowed + we have creds
    if (doRewrite && savedArticle && apiKey && model) {
      try {
        await sleep(500);

        // enforce 600–800 words with hard cap 900, retry up to 3 times
        const result = await ensureWordRangeRewrite({
          apiKey,
          model,
          topic: title,
          sourceText: content,
          keywords,
          metaDescription,
          minWords: 600,
          maxWords: 800,
          hardCap: 900,
          maxAttempts: 3
        });

        const markdown   = result.text;
        const promptUsed = result.promptUsed;
        const modelUsed  = result.modelUsed;
        const wordCount  = result.wordCount || countWordsFromMarkdown(markdown);

        // status: 'full' when within range; 'under' or 'over' otherwise
        const status     = result.status || (
          wordCount < 600 ? 'under' : (wordCount > 800 ? 'over' : 'full')
        );

        if (markdown && markdown.length > 100) {
          // parse top two lines (keywords/meta) for saving
          const lines = markdown.split(/\r?\n/);
          let kwLine = '';
          let metaLine = '';
          for (const l of lines) {
            if (l.startsWith('🔑')) kwLine = l; // "🔑 Target Keywords: ..."
            else if (l.startsWith('📝')) metaLine = l; // "📝 Meta Description: ..."
            if (kwLine && metaLine) break;
          }
          const kwCSV = kwLine.replace(/^🔑\s*Target Keywords:\s*/i, '').trim();
          const meta = metaLine.replace(/^📝\s*Meta Description:\s*/i, '').trim();

          const newTitle = extractTitleFromMarkdown(markdown);

          // score rewritten content
          const { aiScore } = await detectAIContent(markdown);

          await RewriteArticle.findOneAndUpdate(
            { articleId: savedArticle._id },
            {
              articleId: savedArticle._id,
              sourceTitle: title,
              sourceLink: link,
              sourceAuthor: author,
              sourceDate: date ? new Date(date) : undefined,

              title: newTitle || title,
              content: markdown,                 // Markdown content
              targetKeywords: kwCSV || '',       // comma-separated
              metaDescription: meta || '',

              model: modelUsed,
              promptUsed,
              aiScore,

              // persist status + word count
              status,               // 'full' if 600–800; 'under' or 'over' otherwise
              wordCount
            },
            { upsert: true, new: true }
          );

          console.log(
            `Rewrote & saved (${status}, ${wordCount} words, AI score ${aiScore}%): ${newTitle || title} via Gemini:${modelUsed}`
          );
        } else {
          console.warn(`Rewrite too short or empty for: ${title}`);
        }
      } catch (e) {
        console.error(`Rewrite skipped for "${title}": ${e.message}`);
        if (stopScheduler) {
          console.error('Stopping processing due to invalid key or quota.');
          break;
        }
      }
    }

    await sleep(800);
  }

  console.log('Scraping finished!');
}

// ---------- Manual Start (saves key/model to DB if provided) ----------
app.post('/api/start', async (req, res) => {
  try {
    const body = req.body || {};
    const headerKey = (req.headers['x-api-key'] || '').trim();
    const apiKey = headerKey || (body.apiKey || '').trim();
    const model  = (body.model || '').trim();

    // parse optional keywords/meta (can be string "a, b" or array)
    const keywords = Array.isArray(body.keywords)
      ? body.keywords.map(k => String(k)).map(s => s.trim()).filter(Boolean)
      : (typeof body.keywords === 'string'
        ? body.keywords.split(',').map(s => s.trim()).filter(Boolean)
        : []);

    const metaDescription = (body.metaDescription || '').trim();

    // If provided, save & reset stop flag
    if (apiKey && model) {
      await saveGeminiConfig({ apiKey, model });
    }

    // fallback to DB values
    const saved = await getSavedGeminiConfig();
    const finalKey   = apiKey  || saved.apiKey;
    const finalModel = model   || saved.model;

    if (!finalKey)  return res.status(400).json({ error: 'Missing Gemini API key (none sent and none saved)' });
    if (!finalModel) return res.status(400).json({ error: 'Missing Gemini model (none sent and none saved)' });

    await scrapeMovieNews({ apiKey: finalKey, model: finalModel, doRewrite: true, keywords, metaDescription });
    lastRunAt = new Date();

    res.json({
      message: 'Scrape + rewrite completed using active config.',
      model: finalModel,
      keywords: keywords.join(', '),
      metaDescription
    });
  } catch (e) {
    const status = e?.response?.status || 500;
    const detail = e?.response?.data?.error?.message || e.message || 'Unknown error';
    res.status(status).json({ error: detail });
  }
});

// ---------- Config APIs ----------
app.post('/api/config', async (req, res) => {
  const { apiKey, model } = req.body || {};
  if (!apiKey || !model) return res.status(400).json({ error: 'apiKey and model are required' });
  const saved = await saveGeminiConfig({ apiKey, model }); // resets stop flag
  res.json({ message: 'Saved', model: saved.model });
});

app.get('/api/config', async (req, res) => {
  const c = await getSavedGeminiConfig();
  res.json({ hasKey: !!c.apiKey, model: c.model || '' });
});

// ---------- Status ----------
app.get('/api/status', (req, res) => {
  res.json({
    running: isRunning,
    lastRunAt,
    schedulerEnabled,
    stopped: stopScheduler
  });
});

// ---------- Lists ----------
app.get('/api/articles/latest', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const rows = await Article.find().sort({ createdAt: -1 }).limit(limit);
  res.json(rows);
});

// list (to match FE)
app.get('/api/rewritearticles/latest', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const rows = await RewriteArticle.find().sort({ createdAt: -1 }).limit(limit);
  res.json(rows);
});

// filter by status if needed (optional helper)
// /api/rewritearticles?status=pending
app.get('/api/rewritearticles', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const q = {};
  if (req.query.status) q.status = req.query.status;
  const rows = await RewriteArticle.find(q).sort({ createdAt: -1 }).limit(limit);
  res.json(rows);
});

app.get('/api/articles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Detail route for a single rewritten article
app.get('/api/rewritearticles/:id', async (req, res) => {
  try {
    const doc = await RewriteArticle.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Rewritten article not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching rewritten article by ID:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ---------- Hourly Scheduler ----------
function startScheduler() {
  schedulerEnabled = true;
  cron.schedule('0 * * * *', async () => {
    if (stopScheduler) {
      console.log('[Cron] Scheduler stopped due to previous auth/quota error. Update key to resume.');
      return;
    }
    if (isRunning) {
      console.log('[Cron] Previous run still in progress. Skipping.');
      return;
    }
    const { apiKey, model } = await getSavedGeminiConfig();
    if (!apiKey || !model) {
      console.log('[Cron] Gemini key/model not set. Skipping.');
      return;
    }
    isRunning = true;
    console.log('[Cron] Hourly scrape started...');
    try {
      await scrapeMovieNews({ apiKey, model, doRewrite: true });
      lastRunAt = new Date();
      console.log('[Cron] Hourly scrape completed.');
    } catch (e) {
      console.error('[Cron] Hourly scrape failed:', e.message);
    } finally {
      isRunning = false;
    }
  });
}
startScheduler();

// ---------- Boot ----------
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
