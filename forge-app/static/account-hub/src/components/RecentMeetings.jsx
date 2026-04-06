import React from 'react';
import './RecentMeetings.css';

function RecentMeetings({ meetings }) {
  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.startTime) > new Date()
  );
  const pastMeetings = meetings.filter(
    (m) => new Date(m.startTime) <= new Date()
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="hub-section meetings-section">
      <h3 className="section-title">Meetings</h3>
      <div className="meetings-tabs">
        <div className="meetings-group">
          <h4 className="group-title">Upcoming ({upcomingMeetings.length})</h4>
          {upcomingMeetings.length > 0 ? (
            <div className="meetings-list">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="meeting-item">
                  <h4 className="meeting-title">{meeting.title}</h4>
                  <p className="meeting-time">📅 {formatTime(meeting.startTime)}</p>
                  {meeting.notesUrl && (
                    <a href={meeting.notesUrl} className="meeting-link" target="_blank" rel="noopener noreferrer">
                      📄 Notes
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No upcoming meetings</p>
          )}
        </div>

        {pastMeetings.length > 0 && (
          <div className="meetings-group">
            <h4 className="group-title">Recent ({pastMeetings.length})</h4>
            <div className="meetings-list">
              {pastMeetings.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="meeting-item past">
                  <h4 className="meeting-title">{meeting.title}</h4>
                  <p className="meeting-time">✓ {formatTime(meeting.startTime)}</p>
                  {meeting.recordingUrl && (
                    <a href={meeting.recordingUrl} className="meeting-link" target="_blank" rel="noopener noreferrer">
                      🎥 Recording
                    </a>
                  )}
                  {meeting.notesUrl && (
                    <a href={meeting.notesUrl} className="meeting-link" target="_blank" rel="noopener noreferrer">
                      📄 Notes
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default RecentMeetings;
