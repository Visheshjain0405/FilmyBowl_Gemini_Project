import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; // Updated model
const GEMINI_KEY = process.env.GEMINI_KEY;

if (!GEMINI_KEY) {
  console.error('⚠️ Missing Gemini API key! Set GEMINI_KEY in .env');
  process.exit(1);
}

const GEMINI_ENDPOINT = (model, key) =>
  `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

app.post('/api/humanize', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'No text provided' });

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Please convert the following AI-generated text to clear, natural human-readable text without changing the meaning:\n\n${text}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096 // Increased for longer texts
    }
  };

  try {
    const { data } = await axios.post(GEMINI_ENDPOINT(GEMINI_MODEL, GEMINI_KEY), payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 120000
    });

    const humanText = (data?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('')
      .trim();

    if (!humanText) return res.status(500).json({ error: 'No human text returned from Gemini' });

    res.json({ humanText });
  } catch (err) {
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.error?.message || err.message || 'Unknown error';
    console.error('Gemini request error:', status, message);
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Humanizer API running on http://localhost:${PORT}`);
});
