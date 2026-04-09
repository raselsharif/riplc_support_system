import { useState } from 'react';

const Filters = ({ onFilterChange, showDateRange = true, showBranch = false, showStatus = true, branches = [] }) => {
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
    branch_id: '',
    search: ''
  });

  const handleChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="rounded-lg shadow p-4 mb-6" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {showStatus && (
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="min-h-[44px] px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        )}

        {showBranch && branches.length > 0 && (
          <select
            value={filters.branch_id}
            onChange={(e) => handleChange('branch_id', e.target.value)}
            className="min-h-[44px] px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        )}

        {showDateRange && (
          <>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleChange('date_from', e.target.value)}
              placeholder="From Date"
              className="min-h-[44px] px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            />
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleChange('date_to', e.target.value)}
              placeholder="To Date"
              className="min-h-[44px] px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            />
          </>
        )}

        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Search tickets..."
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        />
      </div>
    </div>
  );
};

export default Filters;
