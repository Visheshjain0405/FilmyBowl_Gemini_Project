// src/pages/RewrittenArticleView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Bot,
  Copy,
  Check,
  ExternalLink,
  Tag,
  Sparkles,
  FileText,
  BookOpen,
  Zap,
  TrendingUp,
} from "lucide-react";
import api from "../api/axios";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || "dw68ctxg5";

const coverUrl = (a, { w = 1200, h = 630 } = {}) => {
  if (a?.imageCdnUrl) return a.imageCdnUrl;
  if (a?.imagePublicId)
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w=${w},h=${h},q_auto,f_auto/${a.imagePublicId}`;
  return "";
};

const RewrittenArticleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedContent, setCopiedContent] = useState(false);

  useEffect(() => {
    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/rewritearticles/${id}`);
      setArticle(response.data);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to fetch article";
      setError(message);
      console.error("Error fetching rewritten article:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = dateString?.$date
        ? new Date(dateString.$date)
        : new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = dateString?.$date ? new Date(dateString.$date) : new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 48) return 'Yesterday';
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
      return formatDate(dateString);
    } catch {
      return '';
    }
  };

  const calculateReadTime = (content) => {
    if (!content) return "1 min read";
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return `${Math.max(1, Math.ceil(wordCount / wordsPerMinute))} min read`;
  };

  const getKeywordsArray = (keywords) => {
    if (!keywords) return [];
    return String(keywords)
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  };

  const handleCopyContent = async () => {
    if (!article?.content) return;
    try {
      // Remove markdown formatting for cleaner copy
      const cleanContent = article.content
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '');
      await navigator.clipboard.writeText(cleanContent);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  const parseContent = (content) => {
    if (!content) return { keywords: "", metaDesc: "", mainContent: "" };

    const lines = content.split("\n");
    let keywords = "";
    let metaDesc = "";
    let mainContent = "";
    let isMainContent = false;

    for (let line of lines) {
      if (line.startsWith("🔑 Target Keywords:")) {
        keywords = line.replace("🔑 Target Keywords:", "").trim();
      } else if (line.startsWith("📝 Meta Description:")) {
        metaDesc = line.replace("📝 Meta Description:", "").trim();
      } else if (line === "---") {
        isMainContent = true;
      } else if (isMainContent) {
        mainContent += line + "\n";
      }
    }

    return { keywords, metaDesc, mainContent: mainContent.trim() };
  };

  const renderMarkdown = (content) => {
    if (!content) return "";
    return content
      // headers
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-8">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-gray-700 mb-3 mt-6">$1</h3>')
      // bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // paragraphs
      .split('\n\n')
      .map(para => `<p class="text-gray-700 leading-relaxed mb-5">${para}</p>`)
      .join('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading AI article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/rewritten-articles")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const { keywords, metaDesc, mainContent } = parseContent(article.content);
  const keywordsArray = getKeywordsArray(article.targetKeywords || keywords);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <div className="bg-white shadow-sm border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/rewritten-articles")}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Articles</span>
            </button>

            <button
              onClick={handleCopyContent}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                copiedContent
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copiedContent ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Content</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* AI Badge Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-xl font-bold text-white">AI-Enhanced Article</h2>
                    <Sparkles className="h-5 w-5 text-indigo-200" />
                  </div>
                  <p className="text-indigo-100">
                    Rewritten and optimized by {article.model || "AI Technology"}
                  </p>
                </div>
              </div>
              
              {article.wordCount > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-indigo-100 text-sm">Word Count</p>
                    <p className="text-2xl font-bold text-white">{article.wordCount.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Article Card */}
        <article className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Article Header */}
          <div className="p-8">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center space-x-1.5 text-sm text-gray-500">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>{getRelativeTime(article.createdAt)}</span>
              </div>
              
              <div className="flex items-center space-x-1.5 text-sm text-gray-500">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span>{calculateReadTime(article.content)}</span>
              </div>

              <div className="flex items-center space-x-1.5 text-sm text-gray-500">
                <Zap className="h-4 w-4 text-indigo-600" />
                <span>AI Rewritten</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
              {article.title}
            </h1>

            {/* SEO Meta Description */}
            {(article.metaDescription || metaDesc) && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-indigo-900 mb-2">
                      SEO Meta Description
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {(article.metaDescription || metaDesc).replace(/\*\*/g, "")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Original Source Info */}
            {(article.sourceTitle || article.sourceLink || article.sourceAuthor) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                      Original Source
                    </p>
                    {article.sourceTitle && (
                      <p className="text-gray-900 font-medium mb-1">{article.sourceTitle}</p>
                    )}
                    {article.sourceAuthor && (
                      <p className="text-sm text-gray-600 mb-2">By {article.sourceAuthor}</p>
                    )}
                    {article.sourceDate && (
                      <p className="text-xs text-gray-500">Published: {formatDate(article.sourceDate)}</p>
                    )}
                  </div>
                  {article.sourceLink && (
                    <a
                      href={article.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <span>View Original</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cover Image */}
          {coverUrl(article) && (
            <div className="px-8 mb-8">
              <div className="relative rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={coverUrl(article)}
                  alt={article.title}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "500px" }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            </div>
          )}

          {/* Keywords Section */}
          {keywordsArray.length > 0 && (
            <div className="px-8 mb-8">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-5">
                <div className="flex items-center space-x-2 mb-3">
                  <Tag className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    Target Keywords ({keywordsArray.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywordsArray.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="px-8 pb-8">
            <div className="prose prose-lg max-w-none">
              <div
                className="article-content"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(mainContent || article.content),
                }}
              />
            </div>

            {/* AI Stats Footer */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {article.promptTokens > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-100">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="text-2xl font-bold text-indigo-900">{article.promptTokens.toLocaleString()}</p>
                    <p className="text-xs text-indigo-700 font-medium">Prompt Tokens</p>
                  </div>
                )}
                
                {article.completionTokens > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-100">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="text-2xl font-bold text-indigo-900">{article.completionTokens.toLocaleString()}</p>
                    <p className="text-xs text-indigo-700 font-medium">Completion Tokens</p>
                  </div>
                )}

                {article.totalTokens > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-100">
                    <div className="flex items-center justify-center mb-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="text-2xl font-bold text-indigo-900">{article.totalTokens.toLocaleString()}</p>
                    <p className="text-xs text-indigo-700 font-medium">Total Tokens</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Bottom CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">AI Enhancement Complete</h3>
                <p className="text-gray-600">This article has been optimized for SEO and readability</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/rewritten-articles")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
            >
              View All Articles
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .article-content h1 {
          color: #1f2937;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
        }
        .article-content h2 {
          color: #374151;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .article-content h3 {
          color: #4b5563;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .article-content p {
          margin-bottom: 1.25rem;
          line-height: 1.75;
          color: #374151;
        }
        .article-content strong {
          color: #4f46e5;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default RewrittenArticleView;