/**
 * Header Component
 * 
 * Account header displaying:
 * - Account name and logo
 * - Key metrics (ARR, tier, renewal date)
 * - Health score selector
 * - Status indicators
 */

import React, { useState } from 'react';
import './Header.css';

function Header({ account, onHealthUpdate }) {
  const [healthScore, setHealthScore] = useState(account.healthScore || 70);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [notes, setNotes] = useState('');

  const handleHealthSubmit = async (e) => {
    e.preventDefault();
    await onHealthUpdate(healthScore, notes);
    setNotes('');
    setShowHealthForm(false);
  };

  const getHealthStatus = (score) => {
    if (score < 30) return { status: 'critical', emoji: '🔴' };
    if (score < 60) return { status: 'at-risk', emoji: '🟠' };
    if (score < 85) return { status: 'healthy', emoji: '🟡' };
    return { status: 'excellent', emoji: '🟢' };
  };

  const health = getHealthStatus(healthScore);

  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <header className="hub-header">
      <div className="header-main">
        <div className="header-title">
          <h1 className="account-name">{account.name}</h1>
          <span className="account-id">{account.id}</span>
        </div>

        <div className="header-metrics">
          <div className="metric">
            <span className="metric-label">ARR</span>
            <span className="metric-value">{formatCurrency(account.arr)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Tier</span>
            <span className={`metric-value tier-${account.tier?.toLowerCase().replace('-', '')}`}>
              {account.tier || '-'}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Renewal</span>
            <span className="metric-value">{formatDate(account.renewalDate)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">CSM</span>
            <span className="metric-value">{account.csm || '-'}</span>
          </div>
        </div>
      </div>

      <div className="header-health">
        <button
          className={`health-button health-${health.status}`}
          onClick={() => setShowHealthForm(!showHealthForm)}
          title="Click to update health score"
        >
          <span className="health-emoji">{health.emoji}</span>
          <span className="health-value">{healthScore}</span>
        </button>

        {showHealthForm && (
          <form className="health-form" onSubmit={handleHealthSubmit}>
            <div className="form-group">
              <label htmlFor="health-score">Health Score (0-100)</label>
              <input
                id="health-score"
                type="range"
                min="0"
                max="100"
                value={healthScore}
                onChange={(e) => setHealthScore(parseInt(e.target.value))}
              />
              <div className="score-display">{healthScore}</div>
            </div>

            <div className="form-group">
              <label htmlFor="health-notes">Notes</label>
              <textarea
                id="health-notes"
                placeholder="What changed the health score?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Update
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowHealthForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </header>
  );
}

export default Header;
