/**
 * Health Badge Component
 * 
 * Displays a health score with appropriate color coding:
 * - Red (Critical): 0-29
 * - Orange (At Risk): 30-59
 * - Yellow (Healthy): 60-84
 * - Green (Excellent): 85-100
 */

import React from 'react';
import './HealthBadge.css';

function HealthBadge({ score }) {
  // Determine health status based on score
  const getHealthStatus = (score) => {
    if (score < 30) return { status: 'critical', emoji: '🔴', label: 'Critical' };
    if (score < 60) return { status: 'at-risk', emoji: '🟠', label: 'At Risk' };
    if (score < 85) return { status: 'healthy', emoji: '🟡', label: 'Healthy' };
    return { status: 'excellent', emoji: '🟢', label: 'Excellent' };
  };

  const health = getHealthStatus(score);

  return (
    <div className={`health-badge health-${health.status}`} title={`Health: ${health.label} (${score})`}>
      <span className="health-emoji">{health.emoji}</span>
      <span className="health-score">{score}</span>
    </div>
  );
}

export default HealthBadge;
