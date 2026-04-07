/**
 * Google Calendar Sync Web Trigger
 * 
 * This webtrigger receives push notifications from Google Calendar
 * when events change in account team calendars.
 * 
 * When a meeting is scheduled for an account, this trigger:
 * 1. Receives the notification
 * 2. Creates a stub meeting note page in Confluence
 * 3. Stores meeting metadata in Forge Storage
 * 4. Updates the activity stream
 * 
 * Setup:
 * - Configure a Google Cloud project with Calendar API enabled
 * - Set the push notification endpoint to this trigger's URL
 * - Use Forge environment variables to store credentials
 */

import { kvs } from '@forge/kvs';
import { addActivityItem } from '../resolvers/activityResolver.js';

/**
 * Handler for incoming Google Calendar push notifications
 * 
 * Google Calendar sends notifications with the following structure:
 * {
 *   "kind": "calendar#notification",
 *   "type": "eventChange",
 *   "id": "event-id",
 *   "resourceId": "resource-id",
 *   "resourceUri": "https://www.googleapis.com/calendar/v3/calendars/primary/events/event-id"
 * }
 * 
 * @param {Object} request - The web trigger request
 * @returns {Promise<Object>} Response object
 */
export async function handler(request) {
  try {
    // Extract the notification payload
    const notification = request.body;

    console.log('Google Calendar notification received:', notification);

    // Verify the request is legitimate (in production, verify signature)
    // For now, we'll just process it

    // Extract account ID from the request
    // This could come from:
    // - Query parameter: ?accountId=acc-001
    // - Header: X-Account-ID: acc-001
    // - Calendar description or custom field
    const accountId = request.queryParameters?.accountId?.[0] || extractAccountIdFromNotification(notification);

    if (!accountId) {
      console.warn('Could not determine account ID from notification');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing account ID' }),
      };
    }

    // Fetch the full event details
    // In production, you'd call the Google Calendar API here with the stored access token
    // const event = await fetchEventFromCalendarAPI(notification.id);

    // Create or update the meeting in Forge Storage
    const meeting = {
      id: notification.id || `meet-${Date.now()}`,
      title: 'New Meeting (awaiting details)',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      attendees: [],
      status: 'scheduled',
      source: 'google-calendar',
      sourceId: notification.resourceId,
    };

    // Store meeting in account's meeting list
    const meetingKey = `account:${accountId}:meeting:${notification.id}`;
    await kvs.set(meetingKey, meeting);

    // Clear the meetings cache to force refresh
    const cacheKey = `account:${accountId}:meetings`;
    await kvs.delete(cacheKey);

    // Add to activity stream
    await addActivityItem(accountId, {
      type: 'calendar-event',
      title: 'New meeting scheduled',
      description: meeting.title,
      icon: 'calendar',
      actor: 'Google Calendar',
      timestamp: new Date().toISOString(),
    });

    // Create stub meeting notes page in Confluence
    // In production, you would:
    // 1. Create a new Confluence page in the account hub space
    // 2. Use a meeting notes template
    // 3. Link it back to the meeting in Forge Storage
    await createMeetingNotesPage(accountId, meeting);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, meetingId: meeting.id }),
    };
  } catch (error) {
    console.error('Error processing calendar notification:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

/**
 * Extracts the account ID from a Google Calendar notification
 * This is a helper function - in production, you'd have a more robust mapping
 * 
 * @private
 * @param {Object} notification - The notification object
 * @returns {string|null} Account ID or null if not found
 */
function extractAccountIdFromNotification(notification) {
  // Option 1: Store a mapping in Forge Storage
  // const mapping = await kvs.get('calendar:accountId:mapping');
  // return mapping[notification.resourceId];

  // Option 2: Parse from resource URI
  // https://www.googleapis.com/calendar/v3/calendars/acc-001@group.calendar.google.com/events/abc123

  // For this stub, return null - in production, implement one of the above
  return null;
}

/**
 * Creates a meeting notes page in Confluence
 * Called when a new meeting is synced from Google Calendar
 * 
 * @private
 * @param {string} accountId - Account ID
 * @param {Object} meeting - Meeting object
 * @returns {Promise<Object>} Created page info
 */
async function createMeetingNotesPage(accountId, meeting) {
  try {
    // In production, you would:
    // 1. Get the Account Hub page ID from Forge Storage
    // 2. Create a new page under that space with meeting notes template
    // 3. Store the page link back in the meeting object
    //
    // Example:
    // const hubPageId = await kvs.get(`account:${accountId}:hub-page-id`);
    // const noteTemplate = `
    //   h2. ${meeting.title}
    //   
    //   *Date & Time:* ${new Date(meeting.startTime).toLocaleString()}
    //   *Duration:* 60 minutes
    //   *Attendees:* [TBD]
    //   
    //   h3. Agenda
    //   - Item 1
    //   - Item 2
    //   
    //   h3. Notes
    //   [Add notes here]
    //   
    //   h3. Action Items
    //   - []
    // `;
    //
    // const response = await requestConfluence({
    //   url: `/wiki/api/v2/pages/${hubPageId}/children`,
    //   method: 'POST',
    //   body: JSON.stringify({
    //     type: 'page',
    //     title: `Meeting Notes: ${meeting.title}`,
    //     spaceId: accountHubSpaceId,
    //     body: {
    //       representation: 'wiki',
    //       value: noteTemplate,
    //     },
    //   }),
    // });

    console.log(`Would create meeting notes page for meeting: ${meeting.id}`);
    return null;
  } catch (error) {
    console.error('Error creating meeting notes page:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Fetches full event details from Google Calendar API
 * This is where you'd make the actual API call
 * 
 * @private
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Event details
 */
async function fetchEventFromCalendarAPI(eventId) {
  // In production:
  // const token = await kvs.get('google:calendar:access-token');
  // const response = await fetch(
  //   `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
  //   {
  //     headers: { Authorization: `Bearer ${token}` },
  //   }
  // );
  // return await response.json();

  throw new Error('Not implemented in stub');
}
