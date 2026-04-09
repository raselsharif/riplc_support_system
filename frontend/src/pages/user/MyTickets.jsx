import UserLayout from '../../layouts/UserLayout';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TicketTable from '../../components/TicketTable';
import LoadMore from '../../components/LoadMore';
import Filters from '../../components/Filters';
import { ticketService } from '../../services/api';
import usePolling from '../../hooks/usePolling';

const MyTickets = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const initialStatus = searchParams.get('status');
  const [filters, setFilters] = useState(
    initialStatus ? { status: initialStatus } : {}
  );

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    setFilters(prev => {
      const newFilters = { ...prev };
      if (statusFromUrl) {
        newFilters.status = statusFromUrl;
      } else {
        delete newFilters.status;
      }
      return newFilters;
    });
  }, [searchParams]);

  useEffect(() => {
    fetchTickets(true);
  }, [filters]);

  usePolling(async () => {
    try {
      const res = await ticketService.getAll({ ...filters, limit: page * PAGE_SIZE, offset: 0 });
      setTickets(res.data || []);
    } catch (e) {
      // ignore poll errors
    }
  }, 5000, false);

  const fetchTickets = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        const response = await ticketService.getAll({ ...filters, limit: PAGE_SIZE, offset: 0 });
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
      const response = await ticketService.getAll({ ...filters, limit: PAGE_SIZE, offset: page * PAGE_SIZE });
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
    setFilters(newFilters);
    setLoading(true);
  };

  return (
    <UserLayout>
      <h1 className="text-2xl font-bold mb-6">My Tickets</h1>

      <Filters
        onFilterChange={handleFilterChange}
        showDateRange={true}
        showBranch={false}
        showStatus={true}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <TicketTable tickets={tickets} />
          <LoadMore onLoadMore={handleLoadMore} hasMore={hasMore} loading={loadingMore} />
        </>
      )}
    </UserLayout>
  );
};

export default MyTickets;
