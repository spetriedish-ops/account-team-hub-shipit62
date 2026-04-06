import React from 'react';
import './GrayAreaQueue.css';

function GrayAreaQueue({ tasks, onClaimTask }) {
  const getPriorityColor = (priority) => {
    const colors = {
      High: 'priority-high',
      Medium: 'priority-medium',
      Low: 'priority-low',
    };
    return colors[priority] || 'priority-low';
  };

  return (
    <section className="hub-section gray-area-section">
      <h3 className="section-title">Gray Area Queue</h3>
      {tasks.length > 0 ? (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-header">
                <span className={`task-priority ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <h4 className="task-title">{task.summary}</h4>
              </div>
              <p className="task-meta">{task.id} • Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              <button
                className="claim-button"
                onClick={() => onClaimTask(task.id)}
              >
                Claim Task
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No unclaimed tasks 🎉</p>
      )}
    </section>
  );
}

export default GrayAreaQueue;
