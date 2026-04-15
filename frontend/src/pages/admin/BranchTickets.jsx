import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import TicketTable from '../../components/TicketTable';
import LoadMore from '../../components/LoadMore';
import Filters from '../../components/Filters';
import { ticketService, dashboardService } from '../../services/api';
import usePolling from '../../hooks/usePolling';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" }
  })
};

const BranchTickets = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [filters, setFilters] = useState({ branch_id: branchId });

  useEffect(() => {
    fetchData();
  }, [branchId]);

  useEffect(() => {
    fetchTickets(false);
  }, [filters]);

  usePolling(async () => {
    try {
      const res = await ticketService.getAll({ ...filters, branch_id: branchId, limit: page * PAGE_SIZE, offset: 0 });
      setTickets(res.data || []);
    } catch (e) {
      // ignore poll errors
    }
  }, 5000, false);

  const fetchData = async () => {
    try {
      const branchRes = await dashboardService.getBranchStats();
      const found = branchRes.data.find(b => b.id === parseInt(branchId));
      setBranch(found);

      const statsRes = await dashboardService.getStats({ branch_id: branchId });
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch branch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      const response = await ticketService.getAll({ ...filters, branch_id: branchId, limit: PAGE_SIZE, offset: reset ? 0 : (page - 1) * PAGE_SIZE });
      setTickets(reset ? response.data : (prev) => [...prev, ...response.data]);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      if (reset) {
        setLoading(false);
      }
    }
  };

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await ticketService.getAll({ ...filters, branch_id: branchId, limit: PAGE_SIZE, offset: page * PAGE_SIZE });
      setTickets(prev => [...prev, ...response.data]);
      setPage(nextPage);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load more tickets:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await ticketService.delete(ticketId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, branch_id: branchId });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mb-6 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-80 transition-all group"
          style={{ 
            color: "var(--primary)",
            backgroundColor: "var(--bg-muted)"
          }}
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8 p-6 rounded-2xl border relative overflow-hidden"
        style={{ 
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-default)"
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-active), transparent)" }} />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{branch?.name || 'Branch'} Tickets</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                #{branch?.branch_code}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{branch?.address}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="p-5 rounded-xl text-white shadow-lg relative overflow-hidden group"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 bg-white group-hover:scale-150 transition-transform duration-500" />
          <p className="text-xs opacity-80 font-medium">Total Tickets</p>
          <p className="text-3xl font-bold mt-1">{stats?.total || 0}</p>
          <div className="absolute bottom-0 right-0 p-2 opacity-20">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
        </motion.div>

        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="p-5 rounded-xl text-white shadow-lg relative overflow-hidden group"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 bg-white group-hover:scale-150 transition-transform duration-500" />
          <p className="text-xs opacity-80 font-medium">Open</p>
          <p className="text-3xl font-bold mt-1">{stats?.open || 0}</p>
          <div className="absolute bottom-0 right-0 p-2 opacity-20">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        </motion.div>

        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="p-5 rounded-xl text-white shadow-lg relative overflow-hidden group"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 bg-white group-hover:scale-150 transition-transform duration-500" />
          <p className="text-xs opacity-80 font-medium">Pending</p>
          <p className="text-3xl font-bold mt-1">{stats?.pending || 0}</p>
          <div className="absolute bottom-0 right-0 p-2 opacity-20">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
        </motion.div>

        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="p-5 rounded-xl text-white shadow-lg relative overflow-hidden group"
          style={{ background: "linear-gradient(135deg, #64748b, #475569)" }}
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 bg-white group-hover:scale-150 transition-transform duration-500" />
          <p className="text-xs opacity-80 font-medium">Closed</p>
          <p className="text-3xl font-bold mt-1">{stats?.closed || 0}</p>
          <div className="absolute bottom-0 right-0 p-2 opacity-20">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Filters
          onFilterChange={handleFilterChange}
          showDateRange={true}
          showBranch={false}
          showStatus={true}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <TicketTable
          tickets={tickets}
          showUser={true}
          showBranch={false}
          onDelete={handleDeleteTicket}
        />
        <LoadMore onLoadMore={handleLoadMore} hasMore={hasMore} loading={loadingMore} />
      </motion.div>
    </AdminLayout>
  );
};

export default BranchTickets;
