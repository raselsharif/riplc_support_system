import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import OfficerLayout from "../layouts/OfficerLayout";
import ItLayout from "../layouts/ItLayout";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" }
  })
};

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const getLayout = () => {
    switch (user?.role) {
      case "admin": return AdminLayout;
      case "underwriting":
      case "mis": return OfficerLayout;
      case "it": return ItLayout;
      default: return UserLayout;
    }
  };

  const Layout = getLayout();
  const isAdmin = user?.role === "admin" || user?.role === "it";

  useEffect(() => {
    fetchArticles();
  }, [category]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 50 };
      if (category) params.category = category;
      const res = await api.get("/knowledge-base", { params });
      setArticles(res.data.articles);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchArticles();
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/knowledge-base/search", { params: { q: search } });
      setArticles(res.data.articles);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (article) => {
    setSelectedArticle(article);
    try {
      await api.put(`/knowledge-base/${article.id}/view`);
    } catch (error) {}
  };

  const categories = ["All", "IT Support", "Underwriting", "MIS", "General", "Policies"];

  const filteredArticles = category === "All" || !category
    ? articles
    : articles.filter((a) => a.category === category);

  if (selectedArticle) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedArticle(null)}
            className="mb-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Back to Knowledge Base
          </button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium dark:bg-sky-900/50 dark:text-sky-300">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-gray-400">{selectedArticle.views} views</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h1>
            </div>
            <div className="p-6 prose max-w-none">
              {selectedArticle.content.split("\n").map((p, i) => (
                <p key={i} className="text-gray-700 mb-3">{p}</p>
              ))}
            </div>
            <div className="px-6 py-3 bg-gray-50 text-xs text-gray-400">
              Last updated: {new Date(selectedArticle.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-sm text-gray-500">Find answers to common questions</p>
          </div>
          {isAdmin && (
            <Link
              to="/admin/knowledge-base/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              + New Article
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search articles..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Search
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === "All" ? "" : cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                (category === cat || (!category && cat === "All"))
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
            <p className="text-lg mb-2">No articles found</p>
            {isAdmin && (
              <Link to="/admin/knowledge-base/create" className="text-blue-600 hover:underline">
                Create the first article
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article, i) => (
              <motion.button
                key={article.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => handleView(article)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-left hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {article.category}
                </span>
                <h3 className="text-base font-semibold text-gray-900 mt-3 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {article.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{article.views} views</span>
                  <span>{new Date(article.updated_at).toLocaleDateString()}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default KnowledgeBase;
