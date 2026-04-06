/**
 * Account Resolver
 * 
 * Handles fetching and updating account data including:
 * - Basic account information (name, ARR, tier, renewal date)
 * - Health scores and trends
 * - Team roster and roles
 * 
 * Data is primarily fetched from Forge Storage with fallback to mock data
 * for demonstration purposes.
 */

import { storage } from '@forge/api';

/**
 * Mock data for 3 sample accounts
 * In production, this would come from a Jira custom field, Service Desk, or external database
 */
const MOCK_ACCOUNTS = [
  {
    id: 'acc-001',
    name: 'Acme Corporation',
    arr: 250000,
    tier: 'Enterprise',
    renewalDate: '2025-06-30',
    healthScore: 85,
    csm: 'Sarah Johnson',
    segment: 'Mid-Market',
    createdAt: '2023-01-15',
  },
  {
    id: 'acc-002',
    name: 'TechFlow Inc',
    arr: 75000,
    tier: 'Mid-Market',
    renewalDate: '2025-09-15',
    healthScore: 62,
    csm: 'Mike Chen',
    segment: 'Growth',
    createdAt: '2023-06-20',
  },
  {
    id: 'acc-003',
    name: 'StartupHub Labs',
    arr: 15000,
    tier: 'SMB',
    renewalDate: '2025-12-01',
    healthScore: 92,
    csm: 'Emma Williams',
    segment: 'Startup',
    createdAt: '2024-01-10',
  },
];

const MOCK_TEAM_ROSTERS = {
  'acc-001': [
    { name: 'Alice Smith', role: 'Primary Contact', email: 'alice@acme.com', owns: 'Implementation' },
    { name: 'Bob Johnson', role: 'Technical Lead', email: 'bob@acme.com', owns: 'Integration' },
    { name: 'Carol Davis', role: 'Finance Approver', email: 'carol@acme.com', owns: 'Renewals' },
  ],
  'acc-002': [
    { name: 'David Lee', role: 'Primary Contact', email: 'david@techflow.com', owns: 'Main' },
    { name: 'Eva Martinez', role: 'DevOps Lead', email: 'eva@techflow.com', owns: 'Infrastructure' },
  ],
  'acc-003': [
    { name: 'Frank Robinson', role: 'Founder/Primary', email: 'frank@startuphub.com', owns: 'Everything' },
  ],
};

/**
 * getAccounts
 * Fetches all accounts with their basic information and current health scores
 * 
 * @returns {Promise<Array>} Array of account objects with health scores
 */
export async function getAccounts() {
  try {
    // Try to fetch accounts from Forge Storage
    // In production, you might query Jira for all issues with type=Account
    // or call an external service to get the account list
    const storageKey = 'accounts:list';
    const storedAccounts = await storage.get(storageKey);

    if (storedAccounts) {
      return storedAccounts;
    }

    // Fallback to mock data if not stored yet
    // Initialize mock accounts in storage for subsequent calls
    for (const account of MOCK_ACCOUNTS) {
      await storage.set(`account:${account.id}`, account);
    }
    await storage.set(storageKey, MOCK_ACCOUNTS);

    return MOCK_ACCOUNTS;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    // Return mock data as fallback
    return MOCK_ACCOUNTS;
  }
}

/**
 * getAccountHealth
 * Fetches detailed health information for a single account
 * Includes health score, trend (improving/declining), and contributing factors
 * 
 * @param {string} accountId - The account ID to fetch health for
 * @returns {Promise<Object>} Health object with score, trend, and factors
 */
export async function getAccountHealth(accountId) {
  try {
    const key = `account:${accountId}:health`;
    let healthData = await storage.get(key);

    if (!healthData) {
      // Create initial health data from mock account
      const account = MOCK_ACCOUNTS.find((a) => a.id === accountId);
      if (!account) {
        throw new Error(`Account ${accountId} not found`);
      }

      healthData = {
        accountId,
        score: account.healthScore,
        trend: 'stable', // or 'improving' or 'declining'
        factors: {
          supportTickets: { count: 2, status: 'good' }, // few tickets = good
          taskCompletion: { percentage: 78, status: 'good' },
          meetingFrequency: { count: 4, period: '30days', status: 'excellent' },
          renewalRisk: { status: 'low' },
        },
        lastUpdated: new Date().toISOString(),
      };

      await storage.set(key, healthData);
    }

    return healthData;
  } catch (error) {
    console.error(`Error fetching health for account ${accountId}:`, error);
    // Return reasonable default
    return {
      accountId,
      score: 70,
      trend: 'stable',
      factors: {
        supportTickets: { count: 0, status: 'unknown' },
        taskCompletion: { percentage: 0, status: 'unknown' },
        meetingFrequency: { count: 0, period: '30days', status: 'unknown' },
        renewalRisk: { status: 'unknown' },
      },
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * updateAccountHealth
 * Updates the health score for an account
 * Stores the change with timestamp in Forge Storage for audit trail
 * 
 * @param {string} accountId - Account ID
 * @param {number} healthScore - New health score (0-100)
 * @param {string} notes - Optional notes about why the score changed
 * @returns {Promise<Object>} Updated health object
 */
export async function updateAccountHealth({ accountId, healthScore, notes }) {
  try {
    if (healthScore < 0 || healthScore > 100) {
      throw new Error('Health score must be between 0 and 100');
    }

    const key = `account:${accountId}:health`;
    const currentHealth = await getAccountHealth(accountId);

    // Determine trend by comparing to previous score
    let trend = 'stable';
    if (healthScore > currentHealth.score + 5) {
      trend = 'improving';
    } else if (healthScore < currentHealth.score - 5) {
      trend = 'declining';
    }

    const updatedHealth = {
      ...currentHealth,
      score: healthScore,
      trend,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: 'current-user', // In production, get from @forge/api context
    };

    if (notes) {
      updatedHealth.notes = notes;
    }

    // Store the update
    await storage.set(key, updatedHealth);

    // Log the change for audit trail
    const auditKey = `account:${accountId}:health:history`;
    const history = (await storage.get(auditKey)) || [];
    history.push({
      timestamp: new Date().toISOString(),
      previousScore: currentHealth.score,
      newScore: healthScore,
      notes,
    });
    // Keep only last 50 updates
    if (history.length > 50) {
      history.shift();
    }
    await storage.set(auditKey, history);

    return updatedHealth;
  } catch (error) {
    console.error(`Error updating health for account ${accountId}:`, error);
    throw error;
  }
}

/**
 * getTeamRoster
 * Fetches the team roster for an account
 * Includes team members, their roles, and what they own/manage
 * 
 * @param {string} accountId - Account ID
 * @returns {Promise<Array>} Array of team member objects
 */
export async function getTeamRoster(accountId) {
  try {
    const key = `account:${accountId}:roster`;
    let roster = await storage.get(key);

    if (!roster) {
      // Use mock roster or fetch from Confluence/Jira
      roster = MOCK_TEAM_ROSTERS[accountId] || [];

      // Store in Forge Storage for future retrieval
      if (roster.length > 0) {
        await storage.set(key, roster);
      }
    }

    return roster;
  } catch (error) {
    console.error(`Error fetching team roster for account ${accountId}:`, error);
    return MOCK_TEAM_ROSTERS[accountId] || [];
  }
}

/**
 * updateTeamRoster
 * Updates the team roster for an account
 * Called when team members change or their roles are updated
 * 
 * @param {string} accountId - Account ID
 * @param {Array} roster - New roster array
 * @returns {Promise<Array>} Updated roster
 */
export async function updateTeamRoster({ accountId, roster }) {
  try {
    const key = `account:${accountId}:roster`;
    await storage.set(key, roster);

    // Log the change
    const auditKey = `account:${accountId}:roster:history`;
    const history = (await storage.get(auditKey)) || [];
    history.push({
      timestamp: new Date().toISOString(),
      changes: roster,
    });
    await storage.set(auditKey, history);

    return roster;
  } catch (error) {
    console.error(`Error updating roster for account ${accountId}:`, error);
    throw error;
  }
}
