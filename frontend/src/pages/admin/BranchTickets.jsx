import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import TicketTable from '../../components/TicketTable';
import LoadMore from '../../components/LoadMore';
import Filters from '../../components/Filters';
import { ticketService, dashboardService } from '../../services/api';
import usePolling from '../../hooks/usePolling';

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
    fetchTickets(true);
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
        const response = await ticketService.getAll({ ...filters, branch_id: branchId, limit: PAGE_SIZE, offset: 0 });
        setTickets(response.data);
        setHasMore(response.data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
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
    setLoading(true);
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
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{branch?.name || 'Branch'} Tickets</h1>
        <p className="text-gray-500">Branch Code: {branch?.branch_code}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-sky-500 dark:bg-sky-600 text-white p-3 rounded-lg">
          <p className="text-xs opacity-80">Total</p>
          <p className="text-xl font-bold">{stats?.total || 0}</p>
        </div>
        <div className="bg-emerald-500 dark:bg-emerald-600 text-white p-3 rounded-lg">
          <p className="text-xs opacity-80">Open</p>
          <p className="text-xl font-bold">{stats?.open || 0}</p>
        </div>
        <div className="bg-amber-500 dark:bg-amber-600 text-white p-3 rounded-lg">
          <p className="text-xs opacity-80">Pending</p>
          <p className="text-xl font-bold">{stats?.pending || 0}</p>
        </div>
        <div className="bg-slate-500 dark:bg-slate-600 text-white p-3 rounded-lg">
          <p className="text-xs opacity-80">Closed</p>
          <p className="text-xl font-bold">{stats?.closed || 0}</p>
        </div>
      </div>

      <Filters
        onFilterChange={handleFilterChange}
        showDateRange={true}
        showBranch={false}
        showStatus={true}
      />

      <>
        <TicketTable
          tickets={tickets}
          showUser={true}
          showBranch={false}
          onDelete={handleDeleteTicket}
        />
        <LoadMore onLoadMore={handleLoadMore} hasMore={hasMore} loading={loadingMore} />
      </>
    </AdminLayout>
  );
};

export default BranchTickets;
