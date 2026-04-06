/**
 * Meetings Resolver
 * 
 * Handles:
 * - Fetching meetings from Google Calendar for an account team
 * - Managing focus areas (account priorities) stored as page properties
 * - Linking meeting recordings from Loom
 * 
 * Focus areas are editable directly from the Account Hub and stored
 * in Confluence page properties for persistence.
 */

import { storage } from '@forge/api';

/**
 * Mock meetings data for demonstration
 */
const MOCK_MEETINGS = {
  'acc-001': [
    {
      id: 'meet-001',
      title: 'Weekly Sync - Implementation Team',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      attendees: ['Bob Johnson', 'Alice Smith', 'Sarah Johnson'],
      recordingUrl: null,
      notesUrl: 'https://confluence.example.com/display/ACME/Weekly+Sync+Notes',
      status: 'scheduled',
    },
    {
      id: 'meet-002',
      title: 'Quarterly Business Review',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
      attendees: ['Sarah Johnson', 'Alice Smith', 'Carol Davis'],
      recordingUrl: null,
      notesUrl: null,
      status: 'scheduled',
    },
    {
      id: 'meet-003',
      title: 'Implementation Sync',
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      attendees: ['Bob Johnson', 'Alice Smith', 'Sarah Johnson'],
      recordingUrl: 'https://loom.com/share/abc123xyz',
      notesUrl: 'https://confluence.example.com/display/ACME/Impl+Sync+3%2F30',
      status: 'completed',
    },
  ],
  'acc-002': [
    {
      id: 'meet-101',
      title: 'Dev Sync',
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      attendees: ['Eva Martinez', 'David Lee'],
      recordingUrl: null,
      notesUrl: null,
      status: 'scheduled',
    },
  ],
  'acc-003': [],
};

/**
 * Mock focus areas for demonstration
 */
const MOCK_FOCUS_AREAS = {
  'acc-001': [
    {
      id: 'fa-001',
      title: 'Complete Implementation Phase 1',
      description: 'Get core features live by end of Q2',
      owner: 'Bob Johnson',
      dueDate: '2025-06-30',
      status: 'in-progress',
      priority: 'critical',
    },
    {
      id: 'fa-002',
      title: 'Secure expansion commitment',
      description: 'Land 3-year contract renewal with expansion',
      owner: 'Sarah Johnson',
      dueDate: '2025-06-15',
      status: 'in-progress',
      priority: 'high',
    },
  ],
  'acc-002': [
    {
      id: 'fa-101',
      title: 'Beta testing completed',
      description: 'Complete beta testing and gather feedback',
      owner: 'Eva Martinez',
      dueDate: '2025-05-30',
      status: 'in-progress',
      priority: 'high',
    },
  ],
  'acc-003': [],
};

/**
 * getMeetings
 * Fetches meetings for an account from Google Calendar
 * Includes both upcoming and recent past meetings
 * 
 * In production, this would:
 * 1. Use OAuth to get access to the account team's Google Calendar
 * 2. Query the Calendar API for events with the account label/description
 * 3. Enrich with recording URLs from Loom API
 * 4. Parse notes from Confluence via page properties
 * 
 * @param {string} accountId - Account ID
 * @param {number} daysAhead - Number of days to look ahead (default 30)
 * @param {number} daysBack - Number of past days to include (default 7)
 * @returns {Promise<Array>} Array of meeting objects sorted by date
 */
export async function getMeetings({ accountId, daysAhead = 30, daysBack = 7 }) {
  try {
    // Try to fetch from Forge Storage cache first
    const cacheKey = `account:${accountId}:meetings`;
    let cachedMeetings = await storage.get(cacheKey);

    if (!cachedMeetings || Date.now() - (cachedMeetings.cachedAt || 0) > 15 * 60 * 1000) {
      // Cache is older than 15 minutes - fetch fresh data
      cachedMeetings = {
        items: await fetchMeetingsFromCalendar(accountId, daysAhead, daysBack),
        cachedAt: Date.now(),
      };
      await storage.set(cacheKey, cachedMeetings);
    }

    // Filter by date range
    const now = new Date();
    const startOfRange = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const endOfRange = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const meetings = (cachedMeetings.items || [])
      .filter((m) => {
        const meetingDate = new Date(m.startTime);
        return meetingDate >= startOfRange && meetingDate <= endOfRange;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return meetings;
  } catch (error) {
    console.error(`Error fetching meetings for account ${accountId}:`, error);
    // Return mock data as fallback
    return MOCK_MEETINGS[accountId] || [];
  }
}

/**
 * fetchMeetingsFromCalendar
 * Internal function that demonstrates how to fetch from Google Calendar API
 * 
 * @private
 * @param {string} accountId - Account ID
 * @param {number} daysAhead - Days to look ahead
 * @param {number} daysBack - Days to look back
 * @returns {Promise<Array>} Array of meetings
 */
async function fetchMeetingsFromCalendar(accountId, daysAhead, daysBack) {
  try {
    // In production, you would:
    // 1. Get stored Google Calendar access token from Forge Storage
    // 2. Query Calendar API with time range
    // 3. Filter events by account team members or calendar
    //
    // Example:
    // const token = await storage.get(`account:${accountId}:google-token`);
    // const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    //   query: {
    //     timeMin: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
    //     timeMax: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString(),
    //     q: accountId, // Search for events mentioning account ID
    //   },
    // });
    //
    // const events = await response.json();
    // return events.items.map(event => ({
    //   id: event.id,
    //   title: event.summary,
    //   startTime: event.start.dateTime,
    //   endTime: event.end.dateTime,
    //   attendees: event.attendees.map(a => a.displayName),
    //   status: 'scheduled',
    // }));

    // Return mock data as fallback
    return MOCK_MEETINGS[accountId] || [];
  } catch (error) {
    console.error('Error fetching from Google Calendar:', error);
    return MOCK_MEETINGS[accountId] || [];
  }
}

/**
 * getFocusAreas
 * Fetches the focus areas (priorities/goals) for an account
 * These are stored in Confluence page properties and cached in Forge Storage
 * 
 * @param {string} accountId - Account ID
 * @returns {Promise<Array>} Array of focus area objects
 */
export async function getFocusAreas(accountId) {
  try {
    const key = `account:${accountId}:focus-areas`;
    let focusAreas = await storage.get(key);

    if (!focusAreas) {
      // Initialize with mock data or fetch from Confluence
      focusAreas = MOCK_FOCUS_AREAS[accountId] || [];
      if (focusAreas.length > 0) {
        await storage.set(key, focusAreas);
      }
    }

    return focusAreas;
  } catch (error) {
    console.error(`Error fetching focus areas for account ${accountId}:`, error);
    return MOCK_FOCUS_AREAS[accountId] || [];
  }
}

/**
 * updateFocusAreas
 * Updates the focus areas for an account
 * Stores in both Forge Storage and Confluence page properties
 * 
 * In production, this would also update the Confluence page properties
 * so that the Account Hub macro can read them
 * 
 * @param {string} accountId - Account ID
 * @param {Array} focusAreas - New array of focus area objects
 * @returns {Promise<Array>} Updated focus areas
 */
export async function updateFocusAreas({ accountId, focusAreas }) {
  try {
    // Validate focus areas
    if (!Array.isArray(focusAreas)) {
      throw new Error('Focus areas must be an array');
    }

    focusAreas.forEach((area, index) => {
      if (!area.title) {
        throw new Error(`Focus area ${index} must have a title`);
      }
    });

    // Ensure each has an ID
    const enrichedAreas = focusAreas.map((area) => ({
      id: area.id || `fa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...area,
      lastUpdated: new Date().toISOString(),
    }));

    // Store in Forge Storage
    const key = `account:${accountId}:focus-areas`;
    await storage.set(key, enrichedAreas);

    // Log the update
    const historyKey = `account:${accountId}:focus-areas:history`;
    const history = (await storage.get(historyKey)) || [];
    history.push({
      timestamp: new Date().toISOString(),
      areas: enrichedAreas,
    });
    await storage.set(historyKey, history);

    // In production, also update Confluence page properties:
    // await requestConfluence({
    //   url: `/wiki/api/v2/pages/${pageId}`,
    //   method: 'PUT',
    //   body: JSON.stringify({
    //     properties: {
    //       'account-focus-areas': JSON.stringify(enrichedAreas),
    //     },
    //   }),
    // });

    return enrichedAreas;
  } catch (error) {
    console.error(`Error updating focus areas for account ${accountId}:`, error);
    throw error;
  }
}

/**
 * addMeetingRecording
 * Associates a Loom recording URL with a meeting
 * Called after a meeting is recorded
 * 
 * @param {string} meetingId - Meeting ID
 * @param {string} recordingUrl - Loom video URL
 * @param {string} accountId - Account ID
 * @returns {Promise<Object>} Updated meeting object
 */
export async function addMeetingRecording({ meetingId, recordingUrl, accountId }) {
  try {
    const key = `account:${accountId}:meetings`;
    const cachedMeetings = await storage.get(key);

    if (cachedMeetings && cachedMeetings.items) {
      const meeting = cachedMeetings.items.find((m) => m.id === meetingId);
      if (meeting) {
        meeting.recordingUrl = recordingUrl;
        await storage.set(key, cachedMeetings);
        return meeting;
      }
    }

    throw new Error(`Meeting ${meetingId} not found`);
  } catch (error) {
    console.error(`Error adding recording to meeting ${meetingId}:`, error);
    throw error;
  }
}

/**
 * addMeetingNotes
 * Associates notes (Confluence page) with a meeting
 * 
 * @param {string} meetingId - Meeting ID
 * @param {string} notesUrl - Confluence page URL
 * @param {string} accountId - Account ID
 * @returns {Promise<Object>} Updated meeting object
 */
export async function addMeetingNotes({ meetingId, notesUrl, accountId }) {
  try {
    const key = `account:${accountId}:meetings`;
    const cachedMeetings = await storage.get(key);

    if (cachedMeetings && cachedMeetings.items) {
      const meeting = cachedMeetings.items.find((m) => m.id === meetingId);
      if (meeting) {
        meeting.notesUrl = notesUrl;
        await storage.set(key, cachedMeetings);
        return meeting;
      }
    }

    throw new Error(`Meeting ${meetingId} not found`);
  } catch (error) {
    console.error(`Error adding notes to meeting ${meetingId}:`, error);
    throw error;
  }
}
