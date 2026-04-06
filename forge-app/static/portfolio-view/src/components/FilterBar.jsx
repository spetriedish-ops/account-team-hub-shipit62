/**
 * Filter Bar Component
 * 
 * Provides filtering options for the account list:
 * - Health score filter
 * - Tier filter
 * - My accounts toggle
 * - Needs attention toggle
 */

import React from 'react';
import './FilterBar.css';

function FilterBar({
  healthFilter,
  tierFilter,
  myAccounts,
  needsAttention,
  onHealthFilterChange,
  onTierFilterChange,
  onMyAccountsChange,
  onNeedsAttentionChange,
}) {
  const healthOptions = [
    { value: 'all', label: 'All Health' },
    { value: 'critical', label: '🔴 Critical (<30)' },
    { value: 'at-risk', label: '🟠 At Risk (30-60)' },
    { value: 'healthy', label: '🟡 Healthy (60-85)' },
    { value: 'excellent', label: '🟢 Excellent (85+)' },
  ];

  const tierOptions = [
    { value: 'all', label: 'All Tiers' },
    { value: 'Enterprise', label: 'Enterprise' },
    { value: 'Mid-Market', label: 'Mid-Market' },
    { value: 'SMB', label: 'SMB' },
  ];

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <label htmlFor="health-filter">Health</label>
        <select
          id="health-filter"
          value={healthFilter}
          onChange={(e) => onHealthFilterChange(e.target.value)}
        >
          {healthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="tier-filter">Tier</label>
        <select
          id="tier-filter"
          value={tierFilter}
          onChange={(e) => onTierFilterChange(e.target.value)}
        >
          {tierOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section checkbox">
        <input
          type="checkbox"
          id="my-accounts"
          checked={myAccounts}
          onChange={(e) => onMyAccountsChange(e.target.checked)}
        />
        <label htmlFor="my-accounts">My Accounts</label>
      </div>

      <div className="filter-section checkbox">
        <input
          type="checkbox"
          id="needs-attention"
          checked={needsAttention}
          onChange={(e) => onNeedsAttentionChange(e.target.checked)}
        />
        <label htmlFor="needs-attention">Needs Attention</label>
      </div>
    </div>
  );
}

export default FilterBar;
