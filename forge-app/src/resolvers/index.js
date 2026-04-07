/**
 * Account Team Hub - Main Resolver Entry Point
 * 
 * This file registers all GraphQL resolvers that are called from the frontend
 * via @forge/bridge. Each resolver handles data fetching and mutations from
 * Jira, Confluence, Google Calendar, Slack, and Forge Storage.
 * 
 * Resolvers are organized by domain:
 * - Account: Account data, health scores, team rosters
 * - Activity: Activity stream aggregation from multiple sources
 * - Tasks: Jira tasks and gray area queue management
 * - Meetings: Google Calendar sync and meeting notes
 */

import Resolver from '@forge/resolver';
import * as accountResolver from './accountResolver.js';
import * as activityResolver from './activityResolver.js';
import * as tasksResolver from './tasksResolver.js';
import * as meetingsResolver from './meetingsResolver.js';

const resolver = new Resolver();

// ========== ACCOUNT RESOLVERS ==========
/**
 * Fetches all accounts with basic info (name, ARR, tier, health)
 * Used by Portfolio View to display the account list
 */
resolver.define('getAccounts', accountResolver.getAccounts);

/**
 * Fetches detailed health score and trend for a single account
 * @param {string} accountId - The account ID to fetch health for
 */
resolver.define('getAccountHealth', accountResolver.getAccountHealth);

/**
 * Updates the health score for an account and stores in Forge Storage
 * @param {string} accountId - Account ID
 * @param {number} healthScore - New health score (0-100)
 * @param {string} notes - Optional notes about the change
 */
resolver.define('updateAccountHealth', accountResolver.updateAccountHealth);

/**
 * Fetches the team roster for an account including roles and ownership
 * @param {string} accountId - Account ID
 */
resolver.define('getTeamRoster', accountResolver.getTeamRoster);

// ========== ACTIVITY RESOLVERS ==========
/**
 * Fetches aggregated activity stream for an account
 * Combines Jira updates, Confluence changes, and Slack activity
 * @param {string} accountId - Account ID
 * @param {number} limit - Maximum number of activity items to return
 */
resolver.define('getActivityStream', activityResolver.getActivityStream);

// ========== TASK RESOLVERS ==========
/**
 * Fetches Jira tasks for an account
 * @param {string} accountId - Account ID
 * @param {string} status - Optional status filter (open, in-progress, done)
 * @param {number} limit - Maximum number of tasks
 */
resolver.define('getTasks', tasksResolver.getTasks);

/**
 * Fetches the gray area queue - unclaimed tasks that need attention
 * @param {string} accountId - Account ID
 */
resolver.define('getGrayAreaQueue', tasksResolver.getGrayAreaQueue);

/**
 * Claims a task by assigning it to the current user
 * @param {string} taskId - Jira task/issue ID
 * @param {string} accountId - Account ID (for audit logging)
 */
resolver.define('claimTask', tasksResolver.claimTask);

// ========== MEETING RESOLVERS ==========
/**
 * Fetches meetings for an account from Google Calendar
 * Includes meeting metadata, notes, and recording links
 * @param {string} accountId - Account ID
 * @param {number} daysAhead - Number of days to look ahead
 */
resolver.define('getMeetings', meetingsResolver.getMeetings);

/**
 * Updates focus areas for an account (stored in page properties)
 * @param {string} accountId - Account ID
 * @param {Array} focusAreas - Array of focus area objects
 */
resolver.define('updateFocusAreas', meetingsResolver.updateFocusAreas);

/**
 * Fetches focus areas for an account
 * @param {string} accountId - Account ID
 */
resolver.define('getFocusAreas', meetingsResolver.getFocusAreas);

export default resolver.getDefinitions();
