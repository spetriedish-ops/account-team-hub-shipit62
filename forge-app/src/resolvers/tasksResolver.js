/**
 * Tasks Resolver
 * 
 * Handles:
 * - Fetching Jira tasks/issues for an account
 * - Managing the "gray area queue" - unclaimed tasks needing attention
 * - Claiming tasks (assigning to current user)
 * 
 * The gray area queue is for tasks that:
 * - Are unassigned or assigned to a closed user
 * - Have high priority or are overdue
 * - Don't clearly belong to one team member
 * - Need immediate triage
 */

import { storage, requestJira } from '@forge/api';

/**
 * Mock Jira tasks for demonstration
 */
const MOCK_TASKS = {
  'acc-001': [
    {
      id: 'ACME-156',
      summary: 'Implementation Kickoff',
      status: 'In Progress',
      assignee: 'Bob Johnson',
      priority: 'High',
      dueDate: '2025-04-15',
      createdAt: '2025-03-01',
      labels: ['implementation', 'acme'],
    },
    {
      id: 'ACME-145',
      summary: 'Custom API Integration',
      status: 'To Do',
      assignee: null,
      priority: 'Medium',
      dueDate: '2025-04-20',
      createdAt: '2025-02-15',
      labels: ['development', 'acme'],
    },
    {
      id: 'ACME-134',
      summary: 'Support: Data Export Feature',
      status: 'To Do',
      assignee: null,
      priority: 'High',
      dueDate: '2025-04-08',
      createdAt: '2025-03-15',
      labels: ['support', 'acme', 'gray-area'],
    },
  ],
  'acc-002': [
    {
      id: 'TF-089',
      summary: 'Integration Testing Phase 2',
      status: 'In Progress',
      assignee: 'Eva Martinez',
      priority: 'High',
      dueDate: '2025-04-25',
      createdAt: '2025-03-10',
      labels: ['testing', 'techflow'],
    },
    {
      id: 'TF-078',
      summary: 'Database Optimization',
      status: 'To Do',
      assignee: null,
      priority: 'Medium',
      dueDate: '2025-05-01',
      createdAt: '2025-02-28',
      labels: ['infrastructure', 'techflow', 'gray-area'],
    },
  ],
  'acc-003': [
    {
      id: 'SH-045',
      summary: 'Feature Request: API Pagination',
      status: 'Done',
      assignee: 'Frank Robinson',
      priority: 'Medium',
      dueDate: '2025-03-30',
      createdAt: '2025-02-01',
      labels: ['feature', 'startup'],
    },
  ],
};

/**
 * getTasks
 * Fetches Jira tasks for an account with optional filtering
 * 
 * In production, this would query Jira API using:
 * - A custom field that stores the account ID
 * - A project component that represents the account
 * - A label convention like "account-{accountId}"
 * 
 * @param {string} accountId - Account ID
 * @param {string} status - Optional status filter (e.g., 'To Do', 'In Progress', 'Done')
 * @param {number} limit - Maximum tasks to return
 * @returns {Promise<Array>} Array of task objects
 */
export async function getTasks({ accountId, status, limit = 50 }) {
  try {
    // Try to fetch from Jira API
    // This is a stub showing the pattern - uncomment when Jira is configured
    //
    // const jql = buildJqlQuery(accountId, status);
    // const response = await requestJira({
    //   url: `/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=${limit}`,
    // });
    //
    // if (response.issues) {
    //   return response.issues.map(issue => ({
    //     id: issue.key,
    //     summary: issue.fields.summary,
    //     status: issue.fields.status.name,
    //     assignee: issue.fields.assignee?.displayName || null,
    //     priority: issue.fields.priority?.name || 'None',
    //     dueDate: issue.fields.duedate,
    //     createdAt: issue.fields.created,
    //     labels: issue.fields.labels || [],
    //   }));
    // }

    // Fallback to mock data
    let tasks = MOCK_TASKS[accountId] || [];

    // Apply status filter if provided
    if (status) {
      tasks = tasks.filter((t) => t.status === status);
    }

    // Apply limit
    return tasks.slice(0, limit);
  } catch (error) {
    console.error(`Error fetching tasks for account ${accountId}:`, error);
    return MOCK_TASKS[accountId]?.slice(0, limit) || [];
  }
}

/**
 * getGrayAreaQueue
 * Fetches unclaimed tasks that need immediate attention
 * 
 * A task is in the gray area if:
 * - It's unassigned (assignee is null)
 * - Priority is High or Medium
 * - It's overdue or due very soon
 * - It has the 'gray-area' label
 * - It's not blocked or in a closed status
 * 
 * @param {string} accountId - Account ID
 * @returns {Promise<Array>} Array of unclaimed task objects
 */
export async function getGrayAreaQueue(accountId) {
  try {
    // Fetch all tasks
    const allTasks = await getTasks({ accountId, limit: 100 });

    // Filter for gray area items
    const grayAreaTasks = allTasks.filter((task) => {
      // Must be unassigned
      if (task.assignee) {
        return false;
      }

      // Must be open (not done/closed)
      if (task.status === 'Done' || task.status === 'Closed') {
        return false;
      }

      // Must have high priority OR be overdue OR have gray-area label
      const now = new Date();
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const isOverdue = dueDate && dueDate < now;
      const isDueSoon = dueDate && dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // within 7 days

      const meetsGrayAreaCriteria =
        task.priority === 'High' ||
        isOverdue ||
        (isDueSoon && task.priority === 'Medium') ||
        (task.labels && task.labels.includes('gray-area'));

      return meetsGrayAreaCriteria;
    });

    // Sort by priority and due date
    grayAreaTasks.sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      const aPriority = priorityOrder[a.priority] ?? 3;
      const bPriority = priorityOrder[b.priority] ?? 3;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // If same priority, sort by due date (soonest first)
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aDate - bDate;
    });

    return grayAreaTasks;
  } catch (error) {
    console.error(`Error fetching gray area queue for account ${accountId}:`, error);
    // Return mock gray area items
    const mockTasks = MOCK_TASKS[accountId] || [];
    return mockTasks.filter((t) => !t.assignee && t.status !== 'Done');
  }
}

/**
 * claimTask
 * Claims a task by assigning it to the current user
 * Also logs the claim in Forge Storage for audit trail
 * 
 * In production, you would:
 * 1. Get the current user's email from context
 * 2. Call Jira API to update the issue assignment
 * 3. Add a comment to the issue documenting the claim
 * 4. Log the action in activity stream
 * 
 * @param {string} taskId - Jira issue key (e.g., 'ACME-156')
 * @param {string} accountId - Account ID (for audit logging)
 * @returns {Promise<Object>} Updated task object
 */
export async function claimTask({ taskId, accountId }) {
  try {
    // In production, get current user from context
    const currentUserEmail = 'current-user@example.com'; // This would come from @forge/api context

    // Call Jira API to assign the issue
    // Uncomment when Jira is configured:
    // const response = await requestJira({
    //   url: `/rest/api/3/issue/${taskId}`,
    //   method: 'PUT',
    //   body: JSON.stringify({
    //     fields: {
    //       assignee: {
    //         emailAddress: currentUserEmail,
    //       },
    //     },
    //   }),
    // });

    // Log the claim in Forge Storage
    const auditKey = `task:${taskId}:claims`;
    const claims = (await storage.get(auditKey)) || [];
    claims.push({
      claimedBy: currentUserEmail,
      claimedAt: new Date().toISOString(),
      accountId,
    });
    await storage.set(auditKey, claims);

    // Update claim count
    const claimCountKey = `account:${accountId}:stats:claimed`;
    const claimCount = (await storage.get(claimCountKey)) || 0;
    await storage.set(claimCountKey, claimCount + 1);

    // Return success response
    return {
      taskId,
      status: 'claimed',
      claimedBy: currentUserEmail,
      claimedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error claiming task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Helper function to build a JQL query for fetching account tasks
 * This demonstrates how you'd construct the query
 * 
 * @private
 * @param {string} accountId - Account ID
 * @param {string} status - Optional status filter
 * @returns {string} JQL query string
 */
function buildJqlQuery(accountId, status = null) {
  // Example patterns:
  // 1. Use a custom field: customfield_10000 = "ACC-001"
  // 2. Use a label: labels = "account-acc-001"
  // 3. Use a component: component = "Account-001"
  // 4. Use a project and a custom field: project = ACME AND accountId = "acc-001"

  let query = `labels = "account-${accountId}" ORDER BY updated DESC`;

  if (status) {
    query = `labels = "account-${accountId}" AND status = "${status}" ORDER BY updated DESC`;
  }

  return query;
}

/**
 * unclaimTask
 * Unassigns a task, returning it to the gray area queue
 * 
 * @param {string} taskId - Jira issue key
 * @param {string} accountId - Account ID
 * @returns {Promise<Object>} Updated task object
 */
export async function unclaimTask({ taskId, accountId }) {
  try {
    // Call Jira API to unassign the issue
    // const response = await requestJira({
    //   url: `/rest/api/3/issue/${taskId}`,
    //   method: 'PUT',
    //   body: JSON.stringify({
    //     fields: {
    //       assignee: null,
    //     },
    //   }),
    // });

    // Log the unclaim
    const auditKey = `task:${taskId}:unclaims`;
    const unclaims = (await storage.get(auditKey)) || [];
    unclaims.push({
      unclaimedAt: new Date().toISOString(),
      accountId,
    });
    await storage.set(auditKey, unclaims);

    return {
      taskId,
      status: 'unclaimed',
      unclaimedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error unclaiming task ${taskId}:`, error);
    throw error;
  }
}
