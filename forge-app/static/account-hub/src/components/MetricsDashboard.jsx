/**
 * Metrics Dashboard Component
 * 
 * Displays 4 key metric cards:
 * - Open Tasks
 * - Unclaimed Tasks
 * - Meetings (30 days)
 * - Support Tickets
 */

import React from 'react';
import './MetricsDashboard.css';

function MetricsDashboard({ metrics }) {
  const statCards = [
    {
      id: 'open-tasks',
      label: 'Open Tasks',
      value: metrics.openTasks || 0,
      icon: '📋',
      color: 'blue',
    },
    {
      id: 'unclaimed',
      label: 'Unclaimed Tasks',
      value: metrics.unclaimedTasks || 0,
      icon: '⚠️',
      color: 'orange',
    },
    {
      id: 'meetings',
      label: 'Upcoming Meetings',
      value: metrics.meetings || 0,
      icon: '📅',
      color: 'green',
    },
    {
      id: 'support',
      label: 'Support Tickets',
      value: metrics.supportTickets || 0,
      icon: '🎫',
      color: 'purple',
    },
  ];

  return (
    <div className="metrics-dashboard">
      {statCards.map((card) => (
        <div key={card.id} className={`metric-card metric-${card.color}`}>
          <div className="metric-icon">{card.icon}</div>
          <div className="metric-content">
            <div className="metric-value-large">{card.value}</div>
            <div className="metric-label-small">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MetricsDashboard;
