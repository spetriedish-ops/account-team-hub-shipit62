import React from 'react';
import './QuickLinks.css';

function QuickLinks({ accountId }) {
  const links = [
    {
      id: 'jira',
      label: 'Jira Project',
      icon: '📋',
      url: `/jira/project/${accountId}`,
      description: 'View all tasks',
    },
    {
      id: 'confluence',
      label: 'Hub Page',
      icon: '📄',
      url: `/wiki/spaces/ACCOUNT/pages/viewpage.action?pageId=${accountId}`,
      description: 'Hub documentation',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: '📅',
      url: '/calendar',
      description: 'Team schedule',
    },
    {
      id: 'slack',
      label: 'Slack Channel',
      icon: '💬',
      url: '/slack',
      description: 'Team chat',
    },
  ];

  return (
    <section className="hub-section quick-links-section">
      <h3 className="section-title">Quick Links</h3>
      <div className="links-grid">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            className="quick-link"
            title={link.description}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="link-icon">{link.icon}</span>
            <span className="link-label">{link.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default QuickLinks;
