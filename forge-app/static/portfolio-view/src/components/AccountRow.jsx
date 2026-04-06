/**
 * Account Row Component
 * 
 * Displays a single account in the portfolio table with:
 * - Account name and key metrics
 * - Health score badge
 * - Expandable section showing detailed info
 * - Navigation to account hub
 */

import React, { useState } from 'react';
import { invoke } from '@forge/bridge';
import HealthBadge from './HealthBadge';
import AccountExpanded from './AccountExpanded';
import './AccountRow.css';

function AccountRow({ account, isExpanded, onExpand }) {
  const [expandedData, setExpandedData] = useState(null);
  const [loadingExpanded, setLoadingExpanded] = useState(false);

  /**
   * Handles expanding an account row
   * Fetches additional data (team roster, focus areas) on demand
   */
  const handleExpand = async () => {
    if (isExpanded) {
      // Collapsing
      onExpand();
      return;
    }

    // Expanding - fetch additional data
    if (!expandedData) {
      setLoadingExpanded(true);
      try {
        // Fetch team roster and focus areas in parallel
        const [roster, focusAreas] = await Promise.all([
          invoke('getTeamRoster', { accountId: account.id }),
          invoke('getFocusAreas', { accountId: account.id }),
        ]);

        setExpandedData({
          roster: roster || [],
          focusAreas: focusAreas || [],
        });
      } catch (error) {
        console.error('Error loading expanded data:', error);
        setExpandedData({ roster: [], focusAreas: [] });
      } finally {
        setLoadingExpanded(false);
      }
    }

    onExpand();
  };

  /**
   * Formats currency values
   */
  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  /**
   * Formats date to readable format
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Calculates weeks until renewal
   */
  const getWeeksUntilRenewal = () => {
    if (!account.renewalDate) return null;
    const renewal = new Date(account.renewalDate);
    const now = new Date();
    const weeks = Math.ceil((renewal - now) / (7 * 24 * 60 * 60 * 1000));
    return weeks;
  };

  const weeksUntilRenewal = getWeeksUntilRenewal();

  return (
    <React.Fragment>
      {/* Main Row */}
      <div className={`account-row ${isExpanded ? 'expanded' : ''}`}>
        {/* Expand Button */}
        <div className="col-expand">
          <button
            className={`expand-button ${isExpanded ? 'expanded' : ''}`}
            onClick={handleExpand}
            title={isExpanded ? 'Collapse' : 'Expand'}
            aria-label={isExpanded ? 'Collapse account details' : 'Expand account details'}
          >
            ▶
          </button>
        </div>

        {/* Account Name */}
        <div className="col-name">
          <div className="account-name-section">
            <h3 className="account-name">{account.name}</h3>
            <span className="account-id">{account.id}</span>
          </div>
        </div>

        {/* Health Score */}
        <div className="col-health">
          <HealthBadge score={account.healthScore || 70} />
        </div>

        {/* Tier */}
        <div className="col-tier">
          <span className={`tier-badge tier-${account.tier?.toLowerCase().replace('-', '')}`}>
            {account.tier || '-'}
          </span>
        </div>

        {/* ARR */}
        <div className="col-arr">
          <span className="arr-value">{formatCurrency(account.arr)}</span>
        </div>

        {/* Renewal Date */}
        <div className="col-renewal">
          <span className={`renewal-date ${weeksUntilRenewal && weeksUntilRenewal < 12 ? 'urgent' : ''}`}>
            {formatDate(account.renewalDate)}
          </span>
          {weeksUntilRenewal !== null && (
            <span className="weeks-until">
              {weeksUntilRenewal > 0 ? `${weeksUntilRenewal}w` : 'Overdue'}
            </span>
          )}
        </div>

        {/* CSM */}
        <div className="col-csm">
          <span className="csm-name">{account.csm || '-'}</span>
        </div>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="account-expanded-container">
          {loadingExpanded ? (
            <div className="loading-expanded">
              <span>Loading account details...</span>
            </div>
          ) : expandedData ? (
            <AccountExpanded account={account} data={expandedData} />
          ) : null}
        </div>
      )}
    </React.Fragment>
  );
}

export default AccountRow;
