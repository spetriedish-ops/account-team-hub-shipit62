/**
 * Activity Resolver
 * 
 * Aggregates activity from multiple sources:
 * - Jira: Issue updates, comments, status changes
 * - Confluence: Page updates, comments
 * - Slack: Messages in account channels (via pin listener)
 * 
 * Combines these into a single chronological activity stream
 * sorted by recency for the Account Hub dashboard.
 */

import { requestJira, requestConfluence } from '@forge/api';
import { kvs } from '@forge/kvs';

/**
 * Mock activity data for demonstration
 */
const MOCK_ACTIVITIES = {
  'acc-001': [
    {
      id: 'act-001',
      type: 'jira-update',
      title: 'Implementation phase started',
      description: 'ACME-156: Implementation Kickoff moved to In Progress',
      icon: 'jira',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      actor: 'Bob Johnson',
      link: 'https://jira.example.com/browse/ACME-156',
    },
    {
      id: 'act-002',
      type: 'confluence-update',
      title: 'Hub page updated',
      description: 'Account Team Hub - Q2 Planning notes added',
      icon: 'confluence',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      actor: 'Sarah Johnson',
      link: 'https://confluence.example.com/pages/viewpage.action?pageId=123',
    },
    {
      id: 'act-003',
      type: 'slack-message',
      title: 'Slack discussion',
      description: 'acme-account channel: Implementation blockers discussion',
      icon: 'slack',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      actor: 'Mike Chen',
    },
    {
      id: 'act-004',
      type: 'jira-comment',
      title: 'Issue commented',
      description: 'ACME-145: Customer confirmed new requirements',
      icon: 'jira',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      actor: 'Alice Smith',
      link: 'https://jira.example.com/browse/ACME-145',
    },
  ],
  'acc-002': [
    {
      id: 'act-101',
      type: 'jira-update',
      title: 'Task assigned',
      description: 'TF-089: Integration testing assigned to Dev team',
      icon: 'jira',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      actor: 'Eva Martinez',
      link: 'https://jira.example.com/browse/TF-89',
    },
  ],
  'acc-003': [
    {
      id: 'act-201',
      type: 'jira-update',
      title: 'Support ticket resolved',
      description: 'SH-045: Feature request - API pagination completed',
      icon: 'jira',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      actor: 'Frank Robinson',
      link: 'https://jira.example.com/browse/SH-45',
    },
  ],
};

/**
 * getActivityStream
 * Fetches aggregated activity stream for an account
 * Combines Jira updates, Confluence changes, and Slack activity
 * 
 * Note: This is a stub showing how to call Jira and Confluence APIs
 * In production, you would:
 * 1. Query Jira API for recent issue updates with account label/component
 * 2. Query Confluence API for recent page changes with account tag
 * 3. Fetch Slack activity from Forge Storage (populated by webtrigger)
 * 
 * @param {string} accountId - Account ID
 * @param {number} limit - Maximum number of activity items to return (default 20)
 * @returns {Promise<Array>} Sorted array of activity objects
 */
export async function getActivityStream({ accountId, limit = 20 }) {
  try {
    // Check Forge Storage for cached activity
    const cacheKey = `account:${accountId}:activity:stream`;
    let cachedActivity = await kvs.get(cacheKey);

    if (!cachedActivity || Date.now() - (cachedActivity.cachedAt || 0) > 5 * 60 * 1000) {
      // Cache is older than 5 minutes or doesn't exist - fetch fresh data
      cachedActivity = await fetchActivityFromSources(accountId);
      cachedActivity.cachedAt = Date.now();
      await kvs.set(cacheKey, cachedActivity);
    }

    // Sort by timestamp (newest first) and limit results
    const activities = (cachedActivity.items || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return activities;
  } catch (error) {
    console.error(`Error fetching activity stream for account ${accountId}:`, error);
    // Return mock data as fallback
    return (MOCK_ACTIVITIES[accountId] || []).slice(0, limit);
  }
}

/**
 * Fetches activity from multiple sources
 * This is where you'd integrate with real APIs
 * 
 * @private
 * @param {string} accountId - Account ID
 * @returns {Promise<Object>} Combined activity data
 */
async function fetchActivityFromSources(accountId) {
  const activities = [];

  try {
    // Example: Fetch from Jira
    // This would query for issues with a specific label or custom field
    // const jiraResponse = await requestJira({
    //   url: `/rest/api/3/search?jql=labels=${accountId} ORDER BY updated DESC`,
    // });
    // 
    // if (jiraResponse.issues) {
    //   jiraResponse.issues.forEach(issue => {
    //     activities.push({
    //       type: 'jira-update',
    //       title: issue.key,
    //       description: issue.fields.summary,
    //       actor: issue.fields.assignee?.displayName || 'Unassigned',
    //       timestamp: issue.fields.updated,
    //       link: `https://jira.example.com/browse/${issue.key}`,
    //     });
    //   });
    // }

    // Example: Fetch from Confluence
    // This would query for pages with a specific label
    // const confluenceResponse = await requestConfluence({
    //   url: `/wiki/api/v2/pages?label=${accountId}`,
    // });
    //
    // if (confluenceResponse.results) {
    //   confluenceResponse.results.forEach(page => {
    //     activities.push({
    //       type: 'confluence-update',
    //       title: page.title,
    //       description: `Updated: ${page.version.message || 'No message'}`,
    //       actor: page.version.by.displayName,
    //       timestamp: page.version.createdAt,
    //       link: page.links.webui,
    //     });
    //   });
    // }

    // Fetch Slack activity from Forge Storage (if available)
    const slackActivityKey = `account:${accountId}:slack:activity`;
    const slackActivity = await kvs.get(slackActivityKey);
    if (slackActivity) {
      activities.push(...(slackActivity || []));
    }
  } catch (error) {
    console.error('Error fetching from external sources:', error);
    // Continue with partial data rather than failing completely
  }

  return { items: activities };
}

/**
 * addActivityItem
 * Called internally to add activity items to the stream
 * Used by webtriggers when receiving external events
 * 
 * @param {string} accountId - Account ID
 * @param {Object} activityItem - Activity object to add
 * @returns {Promise<void>}
 */
export async function addActivityItem(accountId, activityItem) {
  try {
    const cacheKey = `account:${accountId}:activity:stream`;
    const current = (await kvs.get(cacheKey)) || { items: [] };

    // Add new item to the beginning
    current.items = [
      {
        ...activityItem,
        id: `act-${Date.now()}`,
        timestamp: activityItem.timestamp || new Date().toISOString(),
      },
      ...(current.items || []),
    ];

    // Keep only last 100 items
    if (current.items.length > 100) {
      current.items = current.items.slice(0, 100);
    }

    current.cachedAt = Date.now();
    await kvs.set(cacheKey, current);
  } catch (error) {
    console.error(`Error adding activity for account ${accountId}:`, error);
  }
}

/**
 * clearActivityCache
 * Clears the cached activity stream for an account
 * Called when you need to force a fresh fetch
 * 
 * @param {string} accountId - Account ID
 * @returns {Promise<void>}
 */
export async function clearActivityCache(accountId) {
  try {
    const cacheKey = `account:${accountId}:activity:stream`;
    await kvs.delete(cacheKey);
  } catch (error) {
    console.error(`Error clearing activity cache for account ${accountId}:`, error);
  }
}
