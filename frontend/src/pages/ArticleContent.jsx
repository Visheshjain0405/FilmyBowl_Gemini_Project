// src/pages/ArticleContent.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Clock, ExternalLink, Copy, Check, User, Tag, 
  TrendingUp, MessageCircle, ChevronRight, Sparkles
} from 'lucide-react';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

const ArticleContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Article data
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Utility functions
  const getCover = (a) => a?.imageCdnUrl || a?.imageSourceUrl || a?.thumbnail || '';

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    try {
      const date = dateString?.$date ? new Date(dateString.$date) : new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown Date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Unknown Date';
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
    if (!content || typeof content !== 'string') return '1 min read';
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    return `${minutes} min read`;
  };

  const extractDomain = (url) => {
    if (!url) return 'Source';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'External Link';
    }
  };

  const formatContent = (content) => {
    if (!content) return null;
    return content
      .split('\n')
      .filter(p => p.trim() !== '')
      .map((paragraph, index) => (
        <p key={index} className="mb-5 text-gray-800 leading-relaxed text-lg">
          {paragraph}
        </p>
      ));
  };

  // Fetch article
  const fetchArticle = async (articleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/articles/${articleId}`);
      setArticle(response.data);
    } catch (err) {
      setError('Failed to load the article. It may have been removed or the link is incorrect.');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchArticle(id);
  }, [id]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Action handlers
  const handleBack = () => navigate('/articles');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyContent = async () => {
    if (!article?.content) return;
    try {
      await navigator.clipboard.writeText(article.content);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => fetchArticle(id)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Article Found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Articles</span>
            </button>

            {/* Copy Content Button */}
            <button
              onClick={handleCopyContent}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                copiedText 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copiedText ? (
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <article className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Article Header */}
          <div className="p-8">
            {/* Meta Information */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm">
                  {extractDomain(article.link)}
                </span>
                
                <div className="flex items-center space-x-1.5 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span>{getRelativeTime(article.date || article.createdAt)}</span>
                </div>
                
                <div className="flex items-center space-x-1.5 text-sm text-gray-500">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>{calculateReadTime(article.content)}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                {article.title}
              </h1>

              {/* Author Info */}
              {article.author && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{article.author}</p>
                      <p className="text-sm text-gray-500">Author</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">Published</p>
                    <p className="text-xs text-gray-500">{formatDate(article.date || article.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {getCover(article) && (
            <div className="px-8 mb-8">
              <div className="relative rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={getCover(article)}
                  alt={article.title}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '500px' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="px-8 pb-8">
            <div className="prose prose-lg max-w-none">
              {formatContent(article.content)}
            </div>

            {/* Original Source Link */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 mb-1 flex items-center">
                      <ExternalLink className="h-5 w-5 mr-2 text-indigo-600" />
                      Read Original Article
                    </p>
                    <p className="text-sm text-gray-600">Visit the source for complete details</p>
                  </div>

                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors duration-200 ml-4"
                  >
                    <span className="font-medium whitespace-nowrap">View Source</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles Placeholder */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-gray-600 mb-1">No related articles yet</p>
            <p className="text-sm text-gray-400">Check back later for similar content</p>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50"
          title="Scroll to top"
        >
          <ArrowLeft className="h-5 w-5 transform rotate-90" />
        </button>
      )}
    </div>
  );
};

export default ArticleContent;