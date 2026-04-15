import { useState } from 'react';
import { motion } from 'framer-motion';

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

  const inputClass = "min-h-[44px] px-4 py-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm";
  const selectClass = `${inputClass} cursor-pointer appearance-none bg-no-repeat`;
  const inputStyle = {
    backgroundColor: "var(--input-bg)",
    borderColor: "var(--input-border)",
    color: "var(--text-primary)",
    "--tw-ring-color": "var(--primary)"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl shadow-md p-4 md:p-5 mb-6 border"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Filters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {showStatus && (
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className={selectClass}
              style={{ ...inputStyle, backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {showBranch && branches.length > 0 && (
          <div className="relative">
            <select
              value={filters.branch_id}
              onChange={(e) => handleChange('branch_id', e.target.value)}
              className={selectClass}
              style={{ ...inputStyle, backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showDateRange && (
          <>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleChange('date_from', e.target.value)}
              placeholder="From"
              className={inputClass}
              style={inputStyle}
            />
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleChange('date_to', e.target.value)}
              placeholder="To"
              className={inputClass}
              style={inputStyle}
            />
          </>
        )}

        <div className="relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search..."
            className={`${inputClass} pl-10`}
            style={inputStyle}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Filters;
