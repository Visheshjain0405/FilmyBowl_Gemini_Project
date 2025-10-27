import mongoose from 'mongoose';

const RewriteArticleSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', index: true },

  // source info
  sourceTitle: String,
  sourceLink: { type: String, index: true },
  sourceAuthor: String,
  sourceDate: Date,

  // rewritten (Gemini) article
  title: String,
  content: String, // Markdown (Gemini output)
  targetKeywords: String,     // CSV
  metaDescription: String,

  model: String,
  promptUsed: String,
  aiScore: Number,

  // enforcement info
  status: { type: String, enum: ['full', 'under', 'over', 'pending'], default: 'pending' },
  wordCount: Number,

  // --- NEW: External humanizer output (your Render API)
  humanizedContent: { type: String, default: '' },
  humanizeStats: { type: Object, default: null }
}, { timestamps: true });

export const RewriteArticle = mongoose.models.RewriteArticle || mongoose.model('RewriteArticle', RewriteArticleSchema);
