import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7");

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/analytics", { params: { days: period } });
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  const maxVal = Math.max(...(stats.dailyTickets || []).map((d) => d.count), 1);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500">Insights and performance metrics</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ backgroundColor: "var(--select-bg)", borderColor: "var(--select-border)", color: "var(--text-primary)" }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Total Tickets</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTickets}</p>
            <p className="text-xs text-green-600 mt-1">↑ {stats.newTickets} new</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.resolvedTickets}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.totalTickets > 0 ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100) : 0}% resolution rate
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Avg Response</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.avgResponseTime}h</p>
            <p className="text-xs text-gray-400 mt-1">Hours to first response</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Active Users</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.activeUsers}</p>
            <p className="text-xs text-gray-400 mt-1">Logged in this period</p>
          </div>
        </div>

        {/* Daily Tickets Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Ticket Volume</h2>
          <div className="flex items-end gap-1 sm:gap-2 h-48">
            {stats.dailyTickets?.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative flex items-end justify-center" style={{ height: "160px" }}>
                  <div
                    className="w-full max-w-[40px] bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                    style={{ height: `${(day.count / maxVal) * 100}%`, minHeight: day.count > 0 ? "4px" : "0" }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 truncate w-full text-center">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">By Department</h2>
            <div className="space-y-3">
              {stats.byDepartment?.map((dept) => (
                <div key={dept.problem_type} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 capitalize w-24">{dept.problem_type}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dept.problem_type === "it" ? "bg-purple-500" :
                        dept.problem_type === "underwriting" ? "bg-blue-500" : "bg-green-500"
                      }`}
                      style={{ width: `${stats.totalTickets > 0 ? (dept.count / stats.totalTickets) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{dept.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">By Priority</h2>
            <div className="space-y-3">
              {stats.byPriority?.map((p) => (
                <div key={p.priority} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 capitalize w-16">{p.priority}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        p.priority === "urgent" ? "bg-red-500" :
                        p.priority === "high" ? "bg-orange-500" :
                        p.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${stats.totalTickets > 0 ? (p.count / stats.totalTickets) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;
