// src/pages/ArticlesPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Grid3X3, List, Filter, Calendar, Eye, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const articlesPerPage = 12;
  const navigate = useNavigate();

  // Prefer Cloudinary image, fallback to original thumbnail
  const getCover = (a) => a?.imageCdnUrl || a?.thumbnail || '';

  const preview = (text, n = 150) =>
    typeof text === 'string' && text.length > n ? text.slice(0, n) + '...' : (text || 'No content available.');

  const calculateReadTime = (content) => {
    if (!content || typeof content !== 'string') return '1 min read';
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(wordCount / wordsPerMinute))} min read`;
  };

  const extractDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'External Link';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = dateString?.$date ? new Date(dateString.$date) : new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Unknown';
    }
  };

  const handleArticleSelect = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  const fetchArticles = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/articles/latest', { params: { limit: 200 } });
      const list = Array.isArray(res.data) ? res.data : [];

      const filtered = search
        ? list.filter(a =>
            [a.title, a.content, a.author]
              .filter(Boolean)
              .some(t => String(t).toLowerCase().includes(search.toLowerCase()))
          )
        : list;

      const total = filtered.length;
      const totalPagesCalc = Math.max(1, Math.ceil(total / articlesPerPage));
      const start = (page - 1) * articlesPerPage;
      const paged = filtered.slice(start, start + articlesPerPage);

      setArticles(paged);
      setTotalArticles(total);
      setTotalPages(totalPagesCalc);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch articles. Please try again.';
      setError(msg);
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchArticles(1, searchTerm);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {articles.map((article, index) => (
        <div key={article._id?.$oid || article._id || index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
            {getCover(article) ? (
              <img
                src={getCover(article)}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-full h-full flex items-center justify-center text-indigo-400"
              style={{ display: getCover(article) ? 'none' : 'flex' }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Eye className="h-8 w-8 text-indigo-500" />
                </div>
                <span className="text-sm font-medium">Article</span>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-600">
              {extractDomain(article.link)}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
              {article.title || 'Untitled Article'}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {preview(article.content, 150)}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(article.date || article.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{calculateReadTime(article.content)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleArticleSelect(article._id?.$oid || article._id)}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg transition-all duration-200 group"
              >
                <span className="text-sm font-medium">Read More</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <div key={article._id?.$oid || article._id || index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start space-x-4">
            {/* Thumb */}
            <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl overflow-hidden">
              {getCover(article) ? (
                <img
                  src={getCover(article)}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center text-indigo-400"
                style={{ display: getCover(article) ? 'none' : 'flex' }}
              >
                <Eye className="h-6 w-6" />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {article.title || 'Untitled Article'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {preview(article.content, 200)}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(article.date || article.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{calculateReadTime(article.content)}</span>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {extractDomain(article.link)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div />
                    <div className="flex items-center space-x-3">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-indigo-600 transition-colors duration-200"
                      >
                        View Original →
                      </a>
                      <button
                        onClick={() => handleArticleSelect(article._id?.$oid || article._id)}
                        className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 group"
                      >
                        <span>Read More</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
              <p className="text-gray-600 mt-1">
                {loading ? 'Loading articles...' : `${totalArticles} articles found`}
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <div className="bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-colors duration-200"
                title="Filters (placeholder)"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading articles...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchArticles(currentPage, searchTerm)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search terms or check back later.</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? <GridView /> : <ListView />}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * articlesPerPage) + 1} to {Math.min(currentPage * articlesPerPage, totalArticles)} of {totalArticles} articles
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = Math.max(1, currentPage - 2) + index;
                    if (pageNumber > totalPages) return null;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          pageNumber === currentPage
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;
