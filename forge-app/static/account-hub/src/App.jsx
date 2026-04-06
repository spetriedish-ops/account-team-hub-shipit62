/**
 * Account Hub App Component
 * 
 * Main Account Hub macro dashboard showing:
 * - Account header with name, ARR, tier, renewal date
 * - Key metrics (open tasks, unclaimed, meetings, support tickets)
 * - Recent activity stream
 * - Gray area queue (unclaimed tasks)
 * - Team roster
 * - Recent meetings with recordings
 * - Quick links section
 * - Inline-editable focus areas
 * 
 * This is a Confluence macro that displays within a page
 */

import React, { useState, useEffect } from 'react';
import { invoke, getContext } from '@forge/bridge';
import Header from './components/Header';
import MetricsDashboard from './components/MetricsDashboard';
import ActivityStream from './components/ActivityStream';
import GrayAreaQueue from './components/GrayAreaQueue';
import TeamRoster from './components/TeamRoster';
import RecentMeetings from './components/RecentMeetings';
import QuickLinks from './components/QuickLinks';
import './App.css';

/**
 * Main Account Hub component
 */
function App() {
  // State management
  const [accountId, setAccountId] = useState(null);
  const [account, setAccount] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [grayArea, setGrayArea] = useState([]);
  const [roster, setRoster] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Get account ID from macro properties on component mount
   * Confluence macros pass properties through getContext()
   */
  useEffect(() => {
    const getAccountInfo = async () => {
      try {
        const context = await getContext();
        // The accountId is passed as a macro property
        const id = context.accountId || context.extension?.parameters?.accountId || 'acc-001';
        setAccountId(id);
      } catch (err) {
        console.error('Error getting account ID:', err);
        // Default to first account for demo
        setAccountId('acc-001');
      }
    };

    getAccountInfo();
  }, []);

  /**
   * Fetch all account data when accountId is set
   */
  useEffect(() => {
    if (!accountId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel for better performance
        const [accounts, activity, grayArea, roster, meetings, focusAreas] = await Promise.all([
          invoke('getAccounts'),
          invoke('getActivityStream', { accountId, limit: 10 }),
          invoke('getGrayAreaQueue', { accountId }),
          invoke('getTeamRoster', { accountId }),
          invoke('getMeetings', { accountId, daysAhead: 30, daysBack: 7 }),
          invoke('getFocusAreas', { accountId }),
        ]);

        // Find the current account from the list
        const currentAccount = accounts.find((a) => a.id === accountId);
        setAccount(currentAccount);

        // Calculate metrics
        const tasks = await invoke('getTasks', { accountId, limit: 50 });
        setMetrics({
          openTasks: tasks.filter((t) => t.status !== 'Done').length,
          unclaimedTasks: grayArea.length,
          meetings: meetings.length,
          supportTickets: Math.floor(Math.random() * 5) + 1, // Mock data
        });

        setActivity(activity);
        setGrayArea(grayArea);
        setRoster(roster);
        setMeetings(meetings);
        setFocusAreas(focusAreas);
      } catch (err) {
        console.error('Error fetching account data:', err);
        setError('Failed to load account hub. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  /**
   * Handle claiming a task
   */
  const handleClaimTask = async (taskId) => {
    try {
      await invoke('claimTask', { taskId, accountId });

      // Refresh gray area queue
      const updatedGrayArea = await invoke('getGrayAreaQueue', { accountId });
      setGrayArea(updatedGrayArea);
    } catch (err) {
      console.error('Error claiming task:', err);
      setError('Failed to claim task. Please try again.');
    }
  };

  /**
   * Handle updating focus areas
   */
  const handleUpdateFocusAreas = async (updatedAreas) => {
    try {
      const result = await invoke('updateFocusAreas', {
        accountId,
        focusAreas: updatedAreas,
      });
      setFocusAreas(result);
    } catch (err) {
      console.error('Error updating focus areas:', err);
      setError('Failed to update focus areas. Please try again.');
    }
  };

  /**
   * Handle updating health score
   */
  const handleUpdateHealth = async (newScore, notes) => {
    try {
      await invoke('updateAccountHealth', {
        accountId,
        healthScore: newScore,
        notes,
      });

      // Refresh account data
      const accounts = await invoke('getAccounts');
      const updated = accounts.find((a) => a.id === accountId);
      setAccount(updated);
    } catch (err) {
      console.error('Error updating health:', err);
      setError('Failed to update health score. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading account hub...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  // No account found
  if (!account) {
    return (
      <div className="error-container">
        <h3>Account Not Found</h3>
        <p>The account hub could not be loaded. Please check the macro properties.</p>
      </div>
    );
  }

  return (
    <div className="account-hub">
      {/* Header Section */}
      <Header
        account={account}
        onHealthUpdate={handleUpdateHealth}
      />

      {/* Metrics Dashboard */}
      {metrics && <MetricsDashboard metrics={metrics} />}

      {/* Main Content Grid */}
      <div className="hub-grid">
        {/* Left Column */}
        <div className="hub-column hub-column-left">
          {/* Activity Stream */}
          <ActivityStream activities={activity} />

          {/* Gray Area Queue */}
          <GrayAreaQueue
            tasks={grayArea}
            onClaimTask={handleClaimTask}
          />
        </div>

        {/* Right Column */}
        <div className="hub-column hub-column-right">
          {/* Team Roster */}
          <TeamRoster roster={roster} />

          {/* Recent Meetings */}
          <RecentMeetings meetings={meetings} />

          {/* Quick Links */}
          <QuickLinks accountId={accountId} />
        </div>
      </div>

      {/* Focus Areas Section (appears below grid) */}
      <section className="focus-areas-section">
        <h3 className="section-title">Focus Areas</h3>
        <div className="focus-areas-editable">
          {focusAreas.length > 0 ? (
            <div className="focus-list">
              {focusAreas.map((area) => (
                <div key={area.id} className="focus-item">
                  <div className="focus-item-header">
                    <h4 className="focus-item-title">{area.title}</h4>
                    <span className={`focus-item-priority priority-${area.priority}`}>
                      {area.priority}
                    </span>
                  </div>
                  {area.description && (
                    <p className="focus-item-description">{area.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No focus areas set. Add some to track key priorities.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
