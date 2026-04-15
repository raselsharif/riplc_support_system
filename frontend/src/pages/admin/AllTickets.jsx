import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import TicketTable from '../../components/TicketTable';
import LoadMore from '../../components/LoadMore';
import Filters from '../../components/Filters';
import { ticketService, lookupService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import usePolling from '../../hooks/usePolling';
import { motion } from 'framer-motion';

const AdminTickets = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState(null);
  const [filtersReady, setFiltersReady] = useState(false);
  const [branches, setBranches] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { addToast } = useToast();
  const PAGE_SIZE = 20;

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    const initial = {};
    if (statusFromUrl) initial.status = statusFromUrl;
    setFilters(initial);
    setFiltersReady(true);
    setLoading(true);
  }, [searchParams]);

  useEffect(() => {
    if (!filtersReady || !filters) return;
    fetchTickets(true);
  }, [filters, filtersReady]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await lookupService.getBranches();
        setBranches(res.data);
      } catch (error) {
      }
    };
    fetchBranches();
  }, []);

  usePolling(async () => {
    if (!filtersReady || !filters) return;
    try {
      const res = await ticketService.getAll({ ...filters, limit: page * PAGE_SIZE, offset: 0 });
      setTickets(res.data);
    } catch (e) {
    }
  }, 5000, false);

  const fetchTickets = async (reset = false) => {
    if (!filtersReady || !filters) return;
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        const response = await ticketService.getAll({ ...filters, limit: PAGE_SIZE, offset: 0 });
        setTickets(response.data);
        setHasMore(response.data.length === PAGE_SIZE);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!filters) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await ticketService.getAll({ ...filters, limit: PAGE_SIZE, offset: page * PAGE_SIZE });
      setTickets(prev => [...prev, ...response.data]);
      setPage(nextPage);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (error) {
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await ticketService.delete(ticketId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setLoading(true);
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          All Tickets
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Manage and view all support tickets
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl shadow-lg p-4 mb-6 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Filters</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Search and filter tickets</p>
          </div>
        </div>
        <Link
          to="/admin/tickets/create"
          className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
            color: "white"
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Ticket
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Filters
          onFilterChange={handleFilterChange}
          showDateRange={true}
          showBranch={true}
          branches={branches}
          showStatus={true}
        />
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <TicketTable
              tickets={tickets}
              showUser={true}
              showBranch={true}
              onDelete={handleDeleteTicket}
            />
          </motion.div>
          <LoadMore 
            onLoadMore={handleLoadMore} 
            hasMore={hasMore} 
            loading={loadingMore} 
          />
        </>
      )}
    </AdminLayout>
  );
};

export default AdminTickets;
