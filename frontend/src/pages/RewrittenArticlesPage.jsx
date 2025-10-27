// src/pages/RewrittenArticlesPage.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Grid3X3,
  List,
  Filter,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Bot,
  Star,
  TrendingUp,
} from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const cloudName =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || "dw68ctxg5";

const coverUrl = (a, { w = 800, h = 450 } = {}) => {
  if (a?.imageCdnUrl) return a.imageCdnUrl;
  if (a?.imagePublicId)
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w=${w},h=${h},q_auto,f_auto/${a.imagePublicId}`;
  return "";
};

const RewrittenArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const articlesPerPage = 12;
  const navigate = useNavigate();

  const preview = (text, n = 150) =>
    typeof text === "string" && text.length > n
      ? text.slice(0, n) + "..."
      : text || "No content available.";

  const calculateReadTime = (content) => {
    if (!content) return "1 min read";
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return `${Math.max(1, Math.ceil(wordCount / wordsPerMinute))} min read`;
  };

  const getAIModel = (model) => (model ? model : "AI Generated");

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getKeywordsCount = (keywords) => {
    if (!keywords) return 0;
    return String(keywords).split(",").filter(Boolean).length;
  };

  const formatDate = (dateString) => {
    try {
      const date = dateString?.$date
        ? new Date(dateString.$date)
        : new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const handleArticleSelect = (articleId) => {
    navigate(`/rewritten-articles/${articleId}`);
  };

  const fetchRewrittenArticles = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/rewritearticles/latest", {
        params: { limit: 200 },
      });
      const list = Array.isArray(res.data) ? res.data : [];

      const filtered = search
        ? list.filter((a) =>
            [a.title, a.content, a.targetKeywords, a.metaDescription]
              .filter(Boolean)
              .some((t) =>
                String(t).toLowerCase().includes(search.toLowerCase())
              )
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
        "Failed to fetch rewritten articles. Please try again.";
      setError(msg);
      console.error("Error fetching rewritten articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewrittenArticles(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRewrittenArticles(1, searchTerm);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {articles.map((article, index) => (
        <div
          key={article._id?.$oid || article._id || index}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
        >
          <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
            {/* AI + Score badges */}
            <div className="absolute top-3 left-3 flex items-center space-x-2 z-10">
              <div className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1">
                <Bot className="h-3 w-3" />
                <span>AI</span>
              </div>
              {article.aiScore > 0 && (
                <div
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${getScoreColor(
                    article.aiScore
                  )}`}
                >
                  {article.aiScore}%
                </div>
              )}
            </div>

            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-600 z-10">
              {getAIModel(article.model)}
            </div>

            {coverUrl(article) ? (
              <img
                src={coverUrl(article)}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            <div
              className="w-full h-full flex items-center justify-center text-indigo-400"
              style={{ display: coverUrl(article) ? "none" : "flex" }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-8 w-8 text-indigo-500" />
                </div>
                <span className="text-sm font-medium">Rewritten</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
              {article.title || "Untitled Article"}
            </h3>

            {article.metaDescription && (
              <p className="text-indigo-600 text-sm mb-2 line-clamp-2 italic">
                {String(article.metaDescription).replace(/\*\*/g, "")}
              </p>
            )}

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {preview(
                String(article.content).replace(/🔑.*?---/s, "").replace(/\*\*/g, ""),
                150
              )}
            </p>

            {article.targetKeywords && (
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                  {getKeywordsCount(article.targetKeywords)} Keywords
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{calculateReadTime(article.content)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() =>
                  handleArticleSelect(article._id?.$oid || article._id)
                }
                className="w-full flex items-center justify-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg transition-all duration-200 group"
              >
                <span className="text-sm font-medium">Read Rewrite</span>
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
        <div
          key={article._id?.$oid || article._id || index}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl overflow-hidden relative">
              {coverUrl(article, { w: 300, h: 300 }) ? (
                <img
                  src={coverUrl(article, { w: 300, h: 300 })}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center text-indigo-400"
                style={{
                  display: coverUrl(article, { w: 300, h: 300 }) ? "none" : "flex",
                }}
              >
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="absolute top-1 left-1 bg-indigo-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center space-x-1">
                <Bot className="h-2 w-2" />
                <span>AI</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                      {article.title || "Untitled Article"}
                    </h3>
                    {article.aiScore > 0 && (
                      <div
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${getScoreColor(
                          article.aiScore
                        )}`}
                      >
                        <Star className="h-3 w-3 inline mr-1" />
                        {article.aiScore}%
                      </div>
                    )}
                  </div>

                  {article.metaDescription && (
                    <p className="text-indigo-600 text-sm mb-2 line-clamp-1 italic">
                      {String(article.metaDescription).replace(/\*\*/g, "")}
                    </p>
                  )}

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {preview(
                      String(article.content)
                        .replace(/🔑.*?---/s, "")
                        .replace(/\*\*/g, ""),
                      200
                    )}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{calculateReadTime(article.content)}</span>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {getAIModel(article.model)}
                    </span>
                    {article.targetKeywords && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {getKeywordsCount(article.targetKeywords)} Keywords
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      onClick={() =>
                        handleArticleSelect(article._id?.$oid || article._id)
                      }
                      className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 group"
                    >
                      <span>Read Rewrite</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </button>
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <span>Rewritten Articles</span>
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1">
                  <Bot className="h-4 w-4" />
                  <span>AI</span>
                </div>
              </h1>
              <p className="text-gray-600 mt-1">
                {loading
                  ? "Loading rewritten articles..."
                  : `${totalArticles} AI-enhanced articles found`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search rewritten articles by title, keywords, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
              >
                {loading ? "Searching..." : "Search"}
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
              <p className="text-gray-600">Loading rewritten articles...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchRewrittenArticles(currentPage, searchTerm)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No rewritten articles found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms or check back later for new AI-enhanced
              content.
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? <GridView /> : <ListView />}

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * articlesPerPage + 1} to{" "}
                  {Math.min(currentPage * articlesPerPage, totalArticles)} of{" "}
                  {totalArticles} rewritten articles
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
                            ? "bg-indigo-600 text-white"
                            : "border border-gray-200 hover:bg-gray-50"
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

export default RewrittenArticlesPage;
