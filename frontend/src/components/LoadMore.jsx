const LoadMore = ({ onLoadMore, hasMore, loading }) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center py-6">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        style={{ 
          backgroundColor: "var(--primary)", 
          color: "var(--text-inverse)" 
        }}
      >
        {loading ? 'Loading...' : 'Show More'}
      </button>
    </div>
  );
};

export default LoadMore;