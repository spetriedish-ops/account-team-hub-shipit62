import React from 'react';
import './TeamRoster.css';

function TeamRoster({ roster }) {
  return (
    <section className="hub-section roster-section">
      <h3 className="section-title">Team Roster</h3>
      {roster.length > 0 ? (
        <div className="roster-grid">
          {roster.map((member, idx) => (
            <div key={idx} className="roster-card">
              <div className="member-avatar">{member.name.charAt(0)}</div>
              <h4 className="member-name">{member.name}</h4>
              <p className="member-role">{member.role}</p>
              <span className="member-owns">{member.owns}</span>
              <a href={`mailto:${member.email}`} className="member-email">
                {member.email}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No team members configured</p>
      )}
    </section>
  );
}

export default TeamRoster;
