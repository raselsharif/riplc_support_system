import Button from './Button';

const LoadMore = ({ onLoadMore, hasMore, loading }) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center py-6">
      <Button
        onClick={onLoadMore}
        loading={loading}
        size="md"
      >
        {loading ? 'Loading...' : 'Show More'}
      </Button>
    </div>
  );
};

export default LoadMore;
