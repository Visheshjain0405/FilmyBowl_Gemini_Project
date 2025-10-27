import mongoose from 'mongoose';

const AppConfigSchema = new mongoose.Schema({
  key:   { type: String, default: '' }, // Gemini API key (store server-side; do not expose)
  model: { type: String, default: '' }, // e.g., gemini-2.5-flash
  // (optional) you can also persist last used keywords/meta if you want cron to reuse them
}, { timestamps: true, collection: 'appconfig' });

export const AppConfig = mongoose.model('AppConfig', AppConfigSchema);
