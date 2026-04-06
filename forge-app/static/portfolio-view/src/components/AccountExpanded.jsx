/**
 * Account Expanded Component
 * 
 * Shows detailed information for an expanded account:
 * - Team roster with roles
 * - Focus areas
 * - Quick stats
 * - Link to account hub
 */

import React from 'react';
import './AccountExpanded.css';

function AccountExpanded({ account, data }) {
  const { roster = [], focusAreas = [] } = data;

  return (
    <div className="account-expanded">
      <div className="expanded-content">
        {/* Team Roster Section */}
        <div className="expanded-section">
          <h4 className="section-title">Team Roster</h4>
          {roster.length > 0 ? (
            <div className="roster-table">
              <div className="roster-header">
                <div className="roster-col-name">Name</div>
                <div className="roster-col-role">Role</div>
                <div className="roster-col-owns">Owns</div>
              </div>
              {roster.map((member, idx) => (
                <div key={idx} className="roster-row">
                  <div className="roster-col-name">
                    <span className="member-name">{member.name}</span>
                    <span className="member-email">{member.email}</span>
                  </div>
                  <div className="roster-col-role">{member.role}</div>
                  <div className="roster-col-owns">{member.owns}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No team members configured</p>
          )}
        </div>

        {/* Focus Areas Section */}
        <div className="expanded-section">
          <h4 className="section-title">Focus Areas</h4>
          {focusAreas.length > 0 ? (
            <div className="focus-areas-list">
              {focusAreas.map((area) => (
                <div key={area.id} className="focus-area-item">
                  <div className="focus-area-header">
                    <h5 className="focus-title">{area.title}</h5>
                    <span className={`focus-priority priority-${area.priority}`}>
                      {area.priority}
                    </span>
                  </div>
                  {area.description && (
                    <p className="focus-description">{area.description}</p>
                  )}
                  <div className="focus-meta">
                    {area.owner && <span className="focus-owner">Owner: {area.owner}</span>}
                    {area.dueDate && (
                      <span className="focus-due">Due: {new Date(area.dueDate).toLocaleDateString()}</span>
                    )}
                    {area.status && <span className={`focus-status status-${area.status}`}>{area.status}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No focus areas set</p>
          )}
        </div>

        {/* Actions Section */}
        <div className="expanded-section actions-section">
          <a
            href={`/wiki/spaces/ACCOUNT/pages/viewpage.action?pageId=${account.id}`}
            className="go-to-hub-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            → Go to Account Hub
          </a>
        </div>
      </div>
    </div>
  );
}

export default AccountExpanded;
