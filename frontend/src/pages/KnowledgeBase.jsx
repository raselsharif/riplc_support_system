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
            className="mb-4 text-sm font-medium flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ color: "var(--primary)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Knowledge Base
          </button>
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: "var(--border-light)" }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                  {selectedArticle.category}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedArticle.views} views</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{selectedArticle.title}</h1>
            </div>
            <div className="p-6 prose max-w-none">
              {selectedArticle.content.split("\n").map((p, i) => (
                <p key={i} className="mb-3" style={{ color: "var(--text-secondary)" }}>{p}</p>
              ))}
            </div>
            <div className="px-6 py-4 text-xs" style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}>
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Knowledge Base</h1>
              <p className="text-sm text-[var(--text-muted)]">Find answers to common questions</p>
            </div>
          </div>
          {isAdmin && (
            <Link
              to="/admin/knowledge-base/create"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
            >
              + New Article
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="rounded-xl border p-4 mb-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                (category === cat || (!category && cat === "All"))
                  ? "text-white shadow-lg"
                  : "hover:shadow-md"
              }`}
              style={category === cat || (!category && cat === "All")
                ? { background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }
                : { backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", borderColor: "var(--border-default)", border: "1px solid" }
              }
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
          <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-lg mb-2 text-[var(--text-secondary)]">No articles found</p>
            {isAdmin && (
              <Link to="/admin/knowledge-base/create" className="text-[var(--primary)] hover:underline font-medium">
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
                className="rounded-xl border p-5 text-left hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-active))" }} />
                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-muted)", color: "var(--primary)" }}>
                  {article.category}
                </span>
                <h3 className="text-base font-semibold mt-3 mb-2 line-clamp-2 transition-colors" style={{ color: "var(--text-primary)" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-primary)"}>
                  {article.title}
                </h3>
                <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--text-muted)" }}>
                  {article.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: "var(--border-light)", color: "var(--text-muted)" }}>
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
