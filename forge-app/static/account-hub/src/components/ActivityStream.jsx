import React from 'react';
import './ActivityStream.css';

function ActivityStream({ activities }) {
  const getActivityIcon = (type) => {
    const icons = {
      'jira-update': '📋',
      'jira-comment': '💬',
      'confluence-update': '📄',
      'slack-message': '💬',
      'slack-pin': '📌',
      'calendar-event': '📅',
    };
    return icons[type] || '📌';
  };

  return (
    <section className="hub-section activity-section">
      <h3 className="section-title">Recent Activity</h3>
      {activities.length > 0 ? (
        <div className="activity-list">
          {activities.map((item) => (
            <div key={item.id} className="activity-item">
              <div className="activity-icon">{getActivityIcon(item.type)}</div>
              <div className="activity-content">
                <h4 className="activity-title">{item.title}</h4>
                <p className="activity-description">{item.description}</p>
                <span className="activity-meta">by {item.actor} • {new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No recent activity</p>
      )}
    </section>
  );
}

export default ActivityStream;
