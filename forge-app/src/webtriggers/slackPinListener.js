/**
 * Slack Pin Listener Web Trigger
 * 
 * This webtrigger receives Slack event callbacks for pin reactions
 * and message updates in account team channels.
 * 
 * When a message is pinned or reacted to with 'hub-pin' emoji:
 * 1. The webtrigger receives the event
 * 2. Extracts the message content
 * 3. Maps it to the relevant account
 * 4. Stores it in Forge Storage
 * 5. Updates the Account Hub activity stream
 * 
 * Setup:
 * - Create a Slack App in your workspace
 * - Enable Event Subscriptions and subscribe to:
 //   - pin_added (for pinned messages)
 //   - reaction_added (for hub-pin emoji reactions)
 //   - message.channels, message.groups, message.im
 * - Set the Request URL to this webtrigger's endpoint
 * - Add the following bot token scopes:
 //   - pins:read
 //   - reactions:read
 //   - channels:read
 //   - users:read
 */

import { kvs } from '@forge/kvs';
import { addActivityItem } from '../resolvers/activityResolver.js';

/**
 * Handler for incoming Slack events
 * 
 * Slack sends events with the following structure:
 * {
 *   "token": "verification-token",
 *   "team_id": "T12345678",
 *   "api_app_id": "A12345678",
 *   "event": {
 *     "type": "pin_added",
 *     "user": "U12345678",
 *     "channel_id": "C12345678",
 *     "item": {
 *       "type": "message",
 *       "channel": "C12345678",
 *       "ts": "1234567890.123456"
 *     },
 *     "event_ts": "1234567890.123456"
 *   },
 *   "type": "event_callback",
 *   "event_id": "Ev12345678",
 *   "event_time": 1234567890
 * }
 * 
 * @param {Object} request - The web trigger request
 * @returns {Promise<Object>} Response object
 */
export async function handler(request) {
  try {
    const payload = request.body;

    console.log('Slack event received:', payload.event?.type);

    // Verify the request is from Slack
    // In production, verify the signing secret:
    // const verified = verifySlackSignature(request);
    // if (!verified) {
    //   return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    // }

    // Handle URL verification challenge from Slack
    if (payload.type === 'url_verification') {
      return {
        statusCode: 200,
        body: JSON.stringify({ challenge: payload.challenge }),
      };
    }

    // Handle event callbacks
    if (payload.type === 'event_callback') {
      const event = payload.event;

      // Route to appropriate handler
      if (event.type === 'pin_added') {
        await handlePinAdded(event, payload.team_id);
      } else if (event.type === 'reaction_added') {
        await handleReactionAdded(event, payload.team_id);
      } else if (event.type === 'message') {
        await handleMessage(event, payload.team_id);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true }),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Unknown event type' }),
    };
  } catch (error) {
    console.error('Error processing Slack event:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

/**
 * Handles pin_added events
 * Called when a message is pinned in a Slack channel
 * 
 * @private
 * @param {Object} event - Slack event object
 * @param {string} teamId - Slack team/workspace ID
 */
async function handlePinAdded(event, teamId) {
  try {
    const channelId = event.channel_id;
    const timestamp = event.item.ts;

    // Determine which account this pin is for
    // Strategy 1: Channel name contains account ID (e.g., #acme-account-hub)
    // Strategy 2: Store a mapping of Slack channels to account IDs
    const accountId = await mapChannelToAccount(channelId, teamId);

    if (!accountId) {
      console.warn(`Could not determine account for channel ${channelId}`);
      return;
    }

    // In production, fetch the actual message content from Slack API
    // const message = await fetchSlackMessage(channelId, timestamp);

    // Create a pin entry
    const pin = {
      id: `pin-${timestamp}`,
      channelId,
      timestamp,
      type: 'pinned-message',
      content: 'Message content would be fetched from Slack API',
      pinnedAt: new Date().toISOString(),
      pinnedBy: event.user,
    };

    // Store the pin
    const pinsKey = `account:${accountId}:slack:pins`;
    const pins = (await kvs.get(pinsKey)) || [];
    pins.push(pin);

    // Keep only last 100 pins
    if (pins.length > 100) {
      pins.shift();
    }

    await kvs.set(pinsKey, pins);

    // Add to activity stream
    await addActivityItem(accountId, {
      type: 'slack-pin',
      title: 'Message pinned',
      description: 'Important message pinned in #acme-account-hub',
      icon: 'slack',
      actor: 'Slack',
      timestamp: new Date().toISOString(),
    });

    console.log(`Pin added for account ${accountId}`);
  } catch (error) {
    console.error('Error handling pin_added event:', error);
  }
}

/**
 * Handles reaction_added events
 * Called when someone reacts with an emoji (specifically 'hub-pin')
 * 
 * @private
 * @param {Object} event - Slack event object
 * @param {string} teamId - Slack team/workspace ID
 */
async function handleReactionAdded(event, teamId) {
  try {
    // We're specifically interested in 'hub-pin' emoji
    if (event.reaction !== 'hub-pin' && event.reaction !== 'pin') {
      return; // Ignore other reactions
    }

    const channelId = event.item.channel;
    const timestamp = event.item.ts;
    const userId = event.user;

    // Determine which account
    const accountId = await mapChannelToAccount(channelId, teamId);

    if (!accountId) {
      console.warn(`Could not determine account for channel ${channelId}`);
      return;
    }

    // Store the reaction
    const reactionKey = `account:${accountId}:slack:reactions:${timestamp}`;
    const reactions = (await kvs.get(reactionKey)) || [];

    if (!reactions.includes(userId)) {
      reactions.push(userId);
      await kvs.set(reactionKey, reactions);

      // Add to activity stream if this is the first hub-pin
      if (reactions.length === 1) {
        await addActivityItem(accountId, {
          type: 'slack-reaction',
          title: 'Message marked with hub-pin',
          description: 'Team member marked a message as important',
          icon: 'slack',
          actor: 'Slack',
          timestamp: new Date().toISOString(),
        });
      }
    }

    console.log(`Reaction added to message for account ${accountId}`);
  } catch (error) {
    console.error('Error handling reaction_added event:', error);
  }
}

/**
 * Handles regular message events
 * Could be used to detect mentions or special keywords
 * 
 * @private
 * @param {Object} event - Slack event object
 * @param {string} teamId - Slack team/workspace ID
 */
async function handleMessage(event, teamId) {
  try {
    // Implement as needed for your use case
    // For example, detect @account-bot mentions or specific keywords
    console.log(`Message received in channel ${event.channel}`);
  } catch (error) {
    console.error('Error handling message event:', error);
  }
}

/**
 * Maps a Slack channel to an account ID
 * Strategies (in order):
 * 1. Look up in channel-to-account mapping stored in Forge Storage
 * 2. Parse the channel name (e.g., #acme-account or #acc-001)
 * 3. Return null if no mapping found
 * 
 * @private
 * @param {string} channelId - Slack channel ID
 * @param {string} teamId - Slack workspace ID
 * @returns {Promise<string|null>} Account ID or null
 */
async function mapChannelToAccount(channelId, teamId) {
  try {
    // Strategy 1: Check explicit mapping
    const mappingKey = `slack:channel:${channelId}:account`;
    const mappedAccountId = await kvs.get(mappingKey);

    if (mappedAccountId) {
      return mappedAccountId;
    }

    // Strategy 2: Parse channel name
    // In production, you'd fetch the channel name from Slack API
    // and look for patterns like:
    // - #acme-hub -> acc-001
    // - #techflow-account -> acc-002
    // - #account-acc-001 -> acc-001

    // For now, return null - implement based on your naming convention
    return null;
  } catch (error) {
    console.error('Error mapping channel to account:', error);
    return null;
  }
}

/**
 * Verifies that a request came from Slack
 * Uses the signing secret to verify the request signature
 * 
 * @private
 * @param {Object} request - The request object
 * @returns {boolean} True if signature is valid
 */
function verifySlackSignature(request) {
  // In production:
  // const crypto = require('crypto');
  // const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
  // const slackRequestTimestamp = request.headers['x-slack-request-timestamp'];
  // const slackSignature = request.headers['x-slack-signature'];
  //
  // // Verify timestamp is within 5 minutes
  // const timeNow = Math.floor(Date.now() / 1000);
  // if (Math.abs(timeNow - slackRequestTimestamp) > 300) {
  //   return false;
  // }
  //
  // // Verify signature
  // const baseString = `v0:${slackRequestTimestamp}:${request.rawBody}`;
  // const mySignature = 'v0=' + crypto
  //   .createHmac('sha256', slackSigningSecret)
  //   .update(baseString)
  //   .digest('hex');
  //
  // return crypto.timingSafeEqual(
  //   Buffer.from(mySignature),
  //   Buffer.from(slackSignature)
  // );

  return true; // Stub for now
}

/**
 * Fetches a message from Slack API
 * 
 * @private
 * @param {string} channelId - Channel ID
 * @param {string} timestamp - Message timestamp
 * @returns {Promise<Object>} Message content
 */
async function fetchSlackMessage(channelId, timestamp) {
  // In production:
  // const token = process.env.SLACK_BOT_TOKEN;
  // const response = await fetch(
  //   'https://slack.com/api/conversations.history',
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       channel: channelId,
  //       inclusive: true,
  //       latest: timestamp,
  //       limit: 1,
  //     }),
  //   }
  // );
  // const data = await response.json();
  // return data.messages[0];

  throw new Error('Not implemented in stub');
}
