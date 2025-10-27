// server.js
// Scrape → (if <500w) rewrite with Gemini → humanize via FastAPI → upload image to Cloudinary → save all + scores
// Sequential with configurable delay; token usage & AI score storage; no .env used.

import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import mongoose from "mongoose";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ---------------- Config ----------------
const PORT = 9000;
const MONGO_URI = "mongodb://127.0.0.1:27017/FilmyBowl";
const LIST_URL = "https://tracktollywood.com/category/movie-news/";

// Pacing & limits
const BETWEEN_ITEMS_DELAY_MS = 30_000; // 30s (change as you like)
const STARTUP_MAX_ITEMS = 10;
const REWRITE_IF_ORIGINAL_LT_WORDS = 500;

// Gemini (direct; v1beta generateContent)
const GEMINI_API_KEY = "AIzaSyDlV0gjKvJF3Xf8ShYrEyScNMCLnyEAAKM";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;

// ZeroGPT (optional)—leave blank to skip scoring
const ZEROGPT_API_URL = "https://api.zerogpt.com/api/detect/detectText";
const ZEROGPT_API_KEY = ""; // put your key here, or leave '' to skip

// Humanizer service (your FastAPI on Render)
const HUMANIZER_BASE = "https://aitext-to-humantext-convertor.onrender.com";
const HUMANIZER_NEWS_RAW = `${HUMANIZER_BASE}/humanize/news`;
const HUMANIZER_NEWS_JSON = `${HUMANIZER_BASE}/humanize/news/json`;
const HUMANIZER_HEALTH = `${HUMANIZER_BASE}/health`;

// Humanizer robustness settings
const HUMANIZER_TIMEOUT_MS = 300_000;   // 5 min for cold starts
const HUMANIZER_RETRIES = 3;
const HUMANIZER_BACKOFF_MS = 5_000;
const HUMANIZER_MAX_INPUT_CHARS = 90_000; // under service 100k limit

// ---- Cloudinary (no .env; fill your creds) ----
const CLOUDINARY_CLOUD_NAME = "dw68ctxg5";
const CLOUDINARY_API_KEY    = "173724212916631";
const CLOUDINARY_API_SECRET = "0NamAs8sYjDyh6lXXSYXyVf5-dU";
const CLOUDINARY_FOLDER     = "filmybowl/articles";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// ---------------- Mongo Models ----------------
const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, index: true },
    link: { type: String, unique: true, index: true },
    author: String,
    date: Date,

    // listing thumb (source trace)
    thumbnail: String,

    // best image found on article page (source trace)
    imageSourceUrl: String,

    // Cloudinary
    imageCdnUrl: String,
    imagePublicId: String,

    content: String,
  },
  { timestamps: true }
);

const RewriteArticleSchema = new mongoose.Schema(
  {
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article", index: true },
    sourceTitle: String,
    sourceLink: String,
    sourceAuthor: String,
    sourceDate: Date,

    title: String,        // rewritten H1 title
    content: String,      // Markdown
    model: String,

    // carry over image
    imageCdnUrl: String,
    imagePublicId: String,

    // metrics
    wordCount: Number,
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number,
    aiScore: Number,      // AI score of rewritten text
  },
  { timestamps: true }
);

const HumanizeArticleSchema = new mongoose.Schema(
  {
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article", index: true },
    rewriteId: { type: mongoose.Schema.Types.ObjectId, ref: "RewriteArticle", index: true },

    sourceTitle: String,
    sourceLink: String,

    // Input (rewritten)
    inputText: String,
    inputWordCount: Number,
    inputSentenceCount: Number,

    // Output (humanized)
    humanizedText: String,
    outputWordCount: Number,
    outputSentenceCount: Number,

    readabilityImprovement: Number,
    settings: Object,

    // AI score for humanized text
    aiScore: Number,

    // convenience: carry image too
    imageCdnUrl: String,
    imagePublicId: String,
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", ArticleSchema);
const RewriteArticle = mongoose.model("RewriteArticle", RewriteArticleSchema);
const HumanizeArticle = mongoose.model("HumanizeArticle", HumanizeArticleSchema);

// ---------------- Helpers ----------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function countWords(text = "") {
  const t = String(text)
    .replace(/[#>*_`~\-!\[\]\(\)]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t ? t.split(" ").length : 0;
}

function extractTitle(md = "") {
  const line = (md.split(/\r?\n/).find((l) => l.startsWith("# ")) || "")
    .replace(/^#\s+/, "")
    .trim();
  return line || "";
}

async function fetchFullArticleAndImage(link) {
  try {
    const { data } = await axios.get(link, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });
    const $ = cheerio.load(data);

    // Content
    const chunks = [];
    $(".td-post-content p").each((i, el) => {
      const t = $(el).text().trim();
      if (t) chunks.push(t);
    });
    const text = chunks.join("\n\n");

    // Best image: og:image > twitter:image > featured > first in content
    const og = $('meta[property="og:image"]').attr("content")?.trim();
    const tw = $('meta[name="twitter:image"]').attr("content")?.trim();
    const featured =
      $(".td-post-featured-image img").attr("src")?.trim() ||
      $(".td-post-featured-image a img").attr("src")?.trim();
    const firstImg = $(".td-post-content img").first().attr("src")?.trim();

    const bestImage = og || tw || featured || firstImg || "";

    return { text, bestImage };
  } catch (e) {
    console.error(`Error fetching article ${link}: ${e.message}`);
    return { text: "", bestImage: "" };
  }
}

async function uploadRemoteImageToCloudinary(imageUrl, folder = CLOUDINARY_FOLDER) {
  if (!imageUrl) return { secure_url: "", public_id: "" };
  try {
    const res = await cloudinary.uploader.upload(imageUrl, {
      folder,
      overwrite: false,
      invalidate: false,
      unique_filename: true,
      use_filename: true,
    });
    return { secure_url: res.secure_url || "", public_id: res.public_id || "" };
  } catch (e) {
    console.error("Cloudinary upload error:", e.message);
    return { secure_url: "", public_id: "" };
  }
}

function buildPrompt(topic, source) {
  return `You are a professional film journalist. Write a neutral, factual, SEO-friendly movie news article in Markdown format based on the topic and source text below.

Rules:
- Start with a catchy H1 title ('# ').
- Include subheadings (##) for clarity.
- Keep the article between 600–800 words (hard cap 900).
- Avoid exaggeration or clickbait.

Topic: ${topic}
---
Source:
${source}`;
}

async function detectAIContent(text) {
  try {
    if (!ZEROGPT_API_KEY || !text || text.trim().length < 10) return 0;
    const { data } = await axios.post(
      ZEROGPT_API_URL,
      { input_text: text },
      {
        headers: {
          ApiKey: ZEROGPT_API_KEY,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        timeout: 60_000,
      }
    );
    return Number(data?.data?.fakePercentage || 0);
  } catch {
    return 0;
  }
}

async function rewriteWithGemini(topic, sourceText) {
  const payload = {
    contents: [{ role: "user", parts: [{ text: buildPrompt(topic, sourceText) }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  };

  const { data } = await axios.post(
    GEMINI_ENDPOINT(GEMINI_MODEL, GEMINI_API_KEY),
    payload,
    { timeout: 120_000, headers: { "Content-Type": "application/json" } }
  );

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || "";
  if (!text) throw new Error("Empty response from Gemini");

  const usage = data?.usageMetadata || {};
  const promptTokens = Number(usage.promptTokenCount || 0);
  const completionTokens = Number(usage.candidatesTokenCount || 0);
  const totalTokens =
    Number(usage.totalTokenCount || promptTokens + completionTokens);

  return { markdown: text, promptTokens, completionTokens, totalTokens };
}

// ---- Humanizer helpers (robust) ----
function safeTrimForHumanizer(text = "") {
  if (!text) return "";
  return text.length > HUMANIZER_MAX_INPUT_CHARS
    ? text.slice(0, HUMANIZER_MAX_INPUT_CHARS) + "\n\n[Truncated]"
    : text;
}
async function warmUpHumanizer() {
  try {
    await axios.get(HUMANIZER_HEALTH, { timeout: 15_000 });
    return true;
  } catch {
    return false;
  }
}
async function humanizeNewsRobust(text) {
  const bodyRaw = safeTrimForHumanizer(text);
  await warmUpHumanizer(); // best-effort

  let lastErr;
  for (let attempt = 1; attempt <= HUMANIZER_RETRIES; attempt++) {
    const tryJsonFallback = attempt === HUMANIZER_RETRIES; // final attempt JSON

    try {
      let resp;
      if (!tryJsonFallback) {
        resp = await axios.post(HUMANIZER_NEWS_RAW, bodyRaw, {
          headers: { "Content-Type": "text/plain" },
          timeout: HUMANIZER_TIMEOUT_MS,
        });
      } else {
        resp = await axios.post(
          HUMANIZER_NEWS_JSON,
          {
            text: bodyRaw,
            use_passive: true,
            use_synonyms: true,
            p_passive: 0.2,
            p_synonym_replacement: 0.4,
            p_academic_transition: 0.5,
          },
          { headers: { "Content-Type": "application/json" }, timeout: HUMANIZER_TIMEOUT_MS }
        );
      }

      const d = resp?.data || {};
      return {
        originalText: d.original_text ?? bodyRaw,
        humanizedText: d.humanized_text ?? "",
        inputWordCount: Number(d.input_word_count ?? 0),
        inputSentenceCount: Number(d.input_sentence_count ?? 0),
        outputWordCount: Number(d.output_word_count ?? 0),
        outputSentenceCount: Number(d.output_sentence_count ?? 0),
        readabilityImprovement: Number(d.readability_improvement ?? 0),
        settings: d.settings ?? {},
      };
    } catch (e) {
      lastErr = e;
      const status = e?.response?.status;
      const isTimeout = e?.code === "ECONNABORTED";
      const isRetriable = isTimeout || (status >= 500 && status <= 599);
      if (attempt < HUMANIZER_RETRIES && isRetriable) {
        const backoff = HUMANIZER_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.warn(
          `Humanize attempt ${attempt} failed (${isTimeout ? "timeout" : status}); retrying in ${Math.round(
            backoff / 1000
          )}s...`
        );
        await sleep(backoff);
        continue;
      }
      break;
    }
  }
  throw lastErr || new Error("Humanizer failed");
}

// ---------------- Scraper (sequential with delay) ----------------
async function scrapeAndRewriteSequential({
  listUrl = LIST_URL,
  maxItems = STARTUP_MAX_ITEMS,
  delayMs = BETWEEN_ITEMS_DELAY_MS,
} = {}) {
  console.log("🔎 Fetching list:", listUrl);
  const { data } = await axios.get(listUrl, {
    timeout: 30_000,
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    },
  });

  const $ = cheerio.load(data);
  const cards = $(".td-module-container.td-category-pos-image");

  let inserted = 0,
    skipped = 0,
    rewrites = 0,
    humanized = 0;

  for (let i = 0; i < cards.length && i < maxItems; i++) {
    const el = cards[i];
    const title = $(el).find("h3.entry-title a").text().trim();
    const link = $(el).find("h3.entry-title a").attr("href");
    const author = $(el).find(".td-post-author-name a").text().trim();
    const date = $(el).find("time.entry-date").attr("datetime");
    const thumb = $(el).find("span.entry-thumb").attr("data-img-url");

    if (!title || !link) continue;

    const exists = await Article.findOne({ link }).lean();
    if (exists) {
      skipped++;
      console.log(`⏭️  Skipped (already exists): ${title}`);
      console.log(`⏳ Waiting ${delayMs / 1000}s before next...`);
      await sleep(delayMs);
      continue;
    }

    console.log(`📰 Scraping: ${title}`);
    const { text: content, bestImage } = await fetchFullArticleAndImage(link);
    const originalWordCount = countWords(content);

    // Image choose + upload to Cloudinary
    const chosenImageSource = bestImage || thumb || "";
    const { secure_url: cdnUrl, public_id: publicId } =
      await uploadRemoteImageToCloudinary(chosenImageSource);

    // Save original article
    const saved = await Article.create({
      title,
      link,
      author,
      date: date ? new Date(date) : undefined,
      thumbnail: thumb || "",
      imageSourceUrl: chosenImageSource || "",
      imageCdnUrl: cdnUrl || "",
      imagePublicId: publicId || "",
      content,
    });
    inserted++;

    // ---- Rewrite only if original < threshold ----
    let rewriteDoc = null;
    if (originalWordCount < REWRITE_IF_ORIGINAL_LT_WORDS) {
      try {
        const { markdown, promptTokens, completionTokens, totalTokens } =
          await rewriteWithGemini(title, content);

        const newTitle = extractTitle(markdown) || title;
        const wordCount = countWords(markdown);
        const aiScore = await detectAIContent(markdown);

        rewriteDoc = await RewriteArticle.findOneAndUpdate(
          { articleId: saved._id },
          {
            articleId: saved._id,
            sourceTitle: title,
            sourceLink: link,
            sourceAuthor: author,
            sourceDate: date ? new Date(date) : undefined,

            title: newTitle,
            content: markdown,
            model: GEMINI_MODEL,

            // carry image
            imageCdnUrl: saved.imageCdnUrl || "",
            imagePublicId: saved.imagePublicId || "",

            wordCount,
            promptTokens,
            completionTokens,
            totalTokens,
            aiScore,
          },
          { upsert: true, new: true }
        );

        rewrites++;
        console.log(
          `✍️  Rewritten: ${newTitle} (**${wordCount}** words | tokens: prompt=${promptTokens}, completion=${completionTokens}, total=${totalTokens} | AI score=${aiScore}%)`
        );

        // ---- HUMANIZE the rewritten article via FastAPI ----
        try {
          const h = await humanizeNewsRobust(markdown);
          const humanAI = await detectAIContent(h.humanizedText);

          await HumanizeArticle.findOneAndUpdate(
            { articleId: saved._id, rewriteId: rewriteDoc._id },
            {
              articleId: saved._id,
              rewriteId: rewriteDoc._id,

              sourceTitle: title,
              sourceLink: link,

              inputText: h.originalText,
              inputWordCount: h.inputWordCount,
              inputSentenceCount: h.inputSentenceCount,

              humanizedText: h.humanizedText,
              outputWordCount: h.outputWordCount,
              outputSentenceCount: h.outputSentenceCount,
              readabilityImprovement: h.readabilityImprovement,
              settings: h.settings,

              aiScore: humanAI,

              // carry image for convenience
              imageCdnUrl: saved.imageCdnUrl || "",
              imagePublicId: saved.imagePublicId || "",
            },
            { upsert: true, new: true }
          );

          humanized++;
          console.log(
            `🧑‍💻 Humanized: (**${h.outputWordCount}** words | AI score=${humanAI}% | Δreadability=${h.readabilityImprovement}%)`
          );
        } catch (e) {
          console.error(`Humanize failed for "${newTitle}": ${e.message}`);
        }
      } catch (e) {
        console.error(`Rewrite failed for "${title}": ${e.message}`);
      }
    } else {
      console.log(
        `ℹ️  Original is ${originalWordCount} words (>= ${REWRITE_IF_ORIGINAL_LT_WORDS}). Skipping rewrite & humanize.`
      );
    }

    console.log(`⏳ Waiting ${delayMs / 1000}s before next...`);
    await sleep(delayMs);
  }

  console.log(
    `✅ Done. Inserted: ${inserted}, Skipped: ${skipped}, Rewrote: ${rewrites}, Humanized: ${humanized}`
  );
  return { inserted, skipped, rewrites, humanized };
}

// ---------------- Endpoints ----------------
app.get("/api/articles/latest", async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const rows = await Article.find().sort({ createdAt: -1 }).limit(limit);
  res.json(rows);
});

// Get one article by id
app.get("/api/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const art = await Article.findById(id);
    if (!art) return res.status(404).json({ error: "Article not found" });
    res.json(art);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.get("/api/rewritearticles/latest", async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const rows = await RewriteArticle.find().sort({ createdAt: -1 }).limit(limit);
  res.json(rows);
});

// Get ONE rewritten article (with optional original fields for convenience)
app.get("/api/rewritearticles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const rewrite = await RewriteArticle.findById(id).lean();
    if (!rewrite) return res.status(404).json({ error: "Rewrite not found" });

    // (Optional) also send back original Article for extra context / fallback
    const article = await Article.findById(rewrite.articleId).lean();

    // Prefer image saved on rewrite; fallback to original article's image
    const imageCdnUrl = rewrite.imageCdnUrl || article?.imageCdnUrl || "";
    const imagePublicId = rewrite.imagePublicId || article?.imagePublicId || "";

    res.json({
      ...rewrite,
      // add convenience fields for the view
      imageCdnUrl,
      imagePublicId,
      source: {
        title: rewrite.sourceTitle || article?.title || "",
        link: rewrite.sourceLink || article?.link || "",
        author: rewrite.sourceAuthor || article?.author || "",
        date: rewrite.sourceDate || article?.date || null,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.get("/api/humanizearticles/latest", async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const rows = await HumanizeArticle.find().sort({ createdAt: -1 }).limit(limit);
  res.json(rows);
});

// Regenerate rewrite (and humanize) for a given Article ID
app.post("/api/rewrite/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    const art = await Article.findById(articleId);
    if (!art) return res.status(404).json({ error: "Article not found" });

    // rewrite
    const { markdown, promptTokens, completionTokens, totalTokens } =
      await rewriteWithGemini(art.title, art.content);

    const newTitle = extractTitle(markdown) || art.title;
    const wordCount = countWords(markdown);
    const aiScore = await detectAIContent(markdown);

    const rewriteDoc = await RewriteArticle.findOneAndUpdate(
      { articleId: art._id },
      {
        articleId: art._id,
        sourceTitle: art.title,
        sourceLink: art.link,
        sourceAuthor: art.author,
        sourceDate: art.date,

        title: newTitle,
        content: markdown,
        model: GEMINI_MODEL,

        // carry image from Article
        imageCdnUrl: art.imageCdnUrl || "",
        imagePublicId: art.imagePublicId || "",

        wordCount,
        promptTokens,
        completionTokens,
        totalTokens,
        aiScore,
      },
      { upsert: true, new: true }
    );

    console.log(
      `♻️  Regenerated: ${newTitle} (**${wordCount}** words | tokens: prompt=${promptTokens}, completion=${completionTokens}, total=${totalTokens} | AI score=${aiScore}%)`
    );

    // humanize regenerated
    let hSaved = null;
    try {
      const h = await humanizeNewsRobust(markdown);
      const humanAI = await detectAIContent(h.humanizedText);

      hSaved = await HumanizeArticle.findOneAndUpdate(
        { articleId: art._id, rewriteId: rewriteDoc._id },
        {
          articleId: art._id,
          rewriteId: rewriteDoc._id,

          sourceTitle: art.title,
          sourceLink: art.link,

          inputText: h.originalText,
          inputWordCount: h.inputWordCount,
          inputSentenceCount: h.inputSentenceCount,

          humanizedText: h.humanizedText,
          outputWordCount: h.outputWordCount,
          outputSentenceCount: h.outputSentenceCount,
          readabilityImprovement: h.readabilityImprovement,
          settings: h.settings,

          aiScore: humanAI,

          // carry image from Article
          imageCdnUrl: art.imageCdnUrl || "",
          imagePublicId: art.imagePublicId || "",
        },
        { upsert: true, new: true }
      );

      console.log(
        `🧑‍💻 Re-Humanized: (**${h.outputWordCount}** words | AI score=${humanAI}% | Δreadability=${h.readabilityImprovement}%)`
      );
    } catch (e) {
      console.error(`Humanize (regenerate) failed: ${e.message}`);
    }

    res.json({
      message: "Regenerated rewrite & humanize",
      rewrite: rewriteDoc,
      humanize: hSaved,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------- Boot ----------------
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, async () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      try {
        await scrapeAndRewriteSequential({
          listUrl: LIST_URL,
          maxItems: STARTUP_MAX_ITEMS,
          delayMs: BETWEEN_ITEMS_DELAY_MS,
        });
      } catch (e) {
        console.error("Startup scrape failed:", e.message);
      }
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
})();
