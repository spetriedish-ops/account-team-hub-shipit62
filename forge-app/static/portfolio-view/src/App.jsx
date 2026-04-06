/**
 * Portfolio View App Component
 * 
 * Cross-account dashboard showing all accounts with:
 * - Health scores and trends
 * - Key metrics (ARR, tier, renewal date)
 * - Quick filtering by health, tier, and attention status
 * - Expandable rows showing team roster and focus areas
 * - Navigation to individual account hubs
 * 
 * This component calls resolvers via @forge/bridge to fetch data
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import FilterBar from './components/FilterBar';
import AccountRow from './components/AccountRow';
import './App.css';

/**
 * Main Portfolio View component
 * Manages state for accounts, filters, and loading
 */
function App() {
  // State management
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [healthFilter, setHealthFilter] = useState('all'); // all, critical, at-risk, healthy, excellent
  const [tierFilter, setTierFilter] = useState('all'); // all, enterprise, mid-market, smb
  const [myAccounts, setMyAccounts] = useState(false);
  const [needsAttention, setNeedsAttention] = useState(false);

  // Expanded row tracking
  const [expandedAccountId, setExpandedAccountId] = useState(null);

  /**
   * Fetch accounts on component mount
   */
  useEffect(() => {
    fetchAccounts();
  }, []);

  /**
   * Apply filters whenever accounts or filter state changes
   */
  useEffect(() => {
    applyFilters();
  }, [accounts, healthFilter, tierFilter, myAccounts, needsAttention]);

  /**
   * Fetches all accounts from the resolver
   */
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the getAccounts resolver defined in src/resolvers/index.js
      const result = await invoke('getAccounts');
      setAccounts(result || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Applies filters to the accounts list
   * Returns accounts that match ALL active filters
   */
  const applyFilters = () => {
    let filtered = [...accounts];

    // Filter by health score
    if (healthFilter !== 'all') {
      filtered = filtered.filter((account) => {
        const score = account.healthScore || 70;
        switch (healthFilter) {
          case 'critical':
            return score < 30;
          case 'at-risk':
            return score >= 30 && score < 60;
          case 'healthy':
            return score >= 60 && score < 85;
          case 'excellent':
            return score >= 85;
          default:
            return true;
        }
      });
    }

    // Filter by tier
    if (tierFilter !== 'all') {
      filtered = filtered.filter((account) => account.tier === tierFilter);
    }

    // Filter for needs attention (unassigned tasks or low health)
    if (needsAttention) {
      filtered = filtered.filter((account) => {
        const score = account.healthScore || 70;
        // Needs attention if health < 70 OR renewal coming up
        const renewalDate = new Date(account.renewalDate);
        const weeksUntilRenewal = (renewalDate - new Date()) / (7 * 24 * 60 * 60 * 1000);
        return score < 70 || weeksUntilRenewal < 12;
      });
    }

    // Filter for my accounts by CSM name
    // In production, replace 'currentUser' with the result of getContext() to get the logged-in user
    if (myAccounts) {
      filtered = filtered.filter((account) => {
        // Match against the CSM field on the account — in production this would use
        // the current user's Atlassian account ID or email from @forge/bridge getContext()
        const currentUser = 'Sarah Johnson'; // TODO: replace with getContext() call
        return account.csm === currentUser;
      });
    }

    setFilteredAccounts(filtered);
  };

  /**
   * Toggles expanded state for an account row
   */
  const toggleExpanded = (accountId) => {
    setExpandedAccountId(expandedAccountId === accountId ? null : accountId);
  };

  /**
   * Refreshes the accounts list
   */
  const handleRefresh = () => {
    fetchAccounts();
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading account portfolio...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <div className="error-container">
          <h2>Error Loading Accounts</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} style={{ marginTop: '16px' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-view">
      {/* Header */}
      <header className="portfolio-header">
        <div className="header-content">
          <h1>Account Portfolio View</h1>
          <p className="header-subtitle">
            Cross-account dashboard • {filteredAccounts.length} of {accounts.length} accounts
          </p>
        </div>
        <button className="refresh-button" onClick={handleRefresh} title="Refresh data">
          ⟳ Refresh
        </button>
      </header>

      {/* Filter Bar */}
      <FilterBar
        healthFilter={healthFilter}
        tierFilter={tierFilter}
        myAccounts={myAccounts}
        needsAttention={needsAttention}
        onHealthFilterChange={setHealthFilter}
        onTierFilterChange={setTierFilter}
        onMyAccountsChange={setMyAccounts}
        onNeedsAttentionChange={setNeedsAttention}
      />

      {/* Accounts Table */}
      <div className="accounts-container">
        {filteredAccounts.length === 0 ? (
          <div className="empty-state">
            <p>No accounts match your filters</p>
            <button onClick={() => {
              setHealthFilter('all');
              setTierFilter('all');
              setMyAccounts(false);
              setNeedsAttention(false);
            }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="accounts-list">
            <div className="accounts-header">
              <div className="col-expand"></div>
              <div className="col-name">Account Name</div>
              <div className="col-health">Health</div>
              <div className="col-tier">Tier</div>
              <div className="col-arr">ARR</div>
              <div className="col-renewal">Renewal Date</div>
              <div className="col-csm">CSM</div>
            </div>

            {filteredAccounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                isExpanded={expandedAccountId === account.id}
                onExpand={() => toggleExpanded(account.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="portfolio-footer">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}

export default App;
