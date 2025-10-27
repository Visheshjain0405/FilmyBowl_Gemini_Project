import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title:     { type: String, required: true, unique: true },
  link:      { type: String, required: true, unique: true },
  author:    { type: String },
  date:      { type: Date },
  thumbnail: { type: String },
  content:   { type: String } // raw scraped text
}, { timestamps: true, collection: 'articles' });

export const Article = mongoose.model('Article', ArticleSchema);
