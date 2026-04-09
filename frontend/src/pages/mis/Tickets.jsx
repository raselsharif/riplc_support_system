import OfficerLayout from '../../layouts/OfficerLayout';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TicketTable from '../../components/TicketTable';
import LoadMore from '../../components/LoadMore';
import Filters from '../../components/Filters';
import { ticketService, lookupService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import usePolling from '../../hooks/usePolling';

const MisTickets = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState(null);
  const [filtersReady, setFiltersReady] = useState(false);
  const [branches, setBranches] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const { addToast } = useToast();

  useEffect(() => {
    const branchIdFromUrl = searchParams.get('branch_id');
    const statusFromUrl = searchParams.get('status');
    const initial = { problem_type: 'mis' };
    if (branchIdFromUrl) initial.branch_id = branchIdFromUrl;
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
        console.error('Failed to fetch branches:', error);
      }
    };
    fetchBranches();
  }, []);

  usePolling(async () => {
    if (!filtersReady || !filters) return;
    try {
      const res = await ticketService.getAll({ ...filters, problem_type: 'mis', limit: page * PAGE_SIZE, offset: 0 });
      setTickets(res.data || []);
    } catch (e) {
      // ignore poll errors
    }
  }, 5000, false);

  const fetchTickets = async (reset = false) => {
    if (!filtersReady || !filters) return;
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        const response = await ticketService.getAll({ ...filters, problem_type: 'mis', limit: PAGE_SIZE, offset: 0 });
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
      const response = await ticketService.getAll({ ...filters, problem_type: 'mis', limit: PAGE_SIZE, offset: page * PAGE_SIZE });
      setTickets(prev => [...prev, ...response.data]);
      setPage(nextPage);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load more tickets:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, problem_type: 'mis' });
    setLoading(true);
  };

  return (
    <OfficerLayout>
      <h1 className="text-2xl font-bold mb-6">MIS Approval Queue</h1>

      <Filters
        onFilterChange={handleFilterChange}
        showDateRange={true}
        showBranch={true}
        branches={branches}
        showStatus={true}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <TicketTable tickets={tickets} showUser={true} showBranch={true} />
          <LoadMore onLoadMore={handleLoadMore} hasMore={hasMore} loading={loadingMore} />
        </>
      )}
    </OfficerLayout>
  );
};

export default MisTickets;
