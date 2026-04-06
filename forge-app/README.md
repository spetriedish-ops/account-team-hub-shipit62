# Account Team Hub - Atlassian Forge App

A real-time collaboration surface for account teams, turning Confluence into a unified hub that aggregates signals from Jira, Google Calendar, Slack, and JSM.

## Overview

Account Team Hub provides:

- **Account Hub Macro** - Main dashboard embedded in Confluence pages showing account metrics, team roster, activity stream, and focus areas
- **Portfolio View** - Cross-account triage dashboard accessible from the Atlassian global nav
- **Gray Area Queue** - Unclaimed tasks requiring immediate attention with claim functionality
- **Activity Stream** - Real-time activity aggregation from Jira, Confluence, and Slack
- **Focus Areas** - Inline-editable account priorities and goals
- **Team Roster** - Account team member roles and contact information
- **Meeting Integration** - Google Calendar sync with recording links and meeting notes

## Project Structure

```
forge-app/
├── manifest.yml              # Forge app configuration
├── package.json              # Dependencies
├── src/
│   ├── resolvers/            # GraphQL resolver implementations
│   │   ├── index.js          # Resolver registration
│   │   ├── accountResolver.js
│   │   ├── activityResolver.js
│   │   ├── tasksResolver.js
│   │   └── meetingsResolver.js
│   └── webtriggers/          # External integration webhooks
│       ├── googleCalendarSync.js
│       └── slackPinListener.js
├── static/
│   ├── portfolio-view/       # Portfolio View React app
│   │   ├── index.html
│   │   ├── package.json
│   │   └── src/
│   │       ├── App.jsx
│   │       ├── App.css
│   │       ├── index.jsx
│   │       └── components/
│   └── account-hub/          # Account Hub macro React app
│       ├── index.html
│       ├── package.json
│       └── src/
│           ├── App.jsx
│           ├── App.css
│           ├── index.jsx
│           └── components/
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+ installed
- Atlassian Forge CLI installed: `npm install -g @forge/cli`
- Atlassian Cloud account with access to Confluence and Jira

### Setup Steps

1. **Install Forge CLI** (if not already installed)
   ```bash
   npm install -g @forge/cli
   ```

2. **Navigate to the forge-app directory**
   ```bash
   cd account-team-hub-shipit62/forge-app
   ```

3. **Install root dependencies**
   ```bash
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd static/portfolio-view && npm install
   cd ../account-hub && npm install
   cd ../..
   ```

5. **Deploy the app**
   ```bash
   forge deploy
   ```

6. **Install on your site**
   ```bash
   forge install
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory for sensitive configuration:

```env
# Google Calendar
GOOGLE_CALENDAR_ACCESS_TOKEN=your_token_here
GOOGLE_CALENDAR_REFRESH_TOKEN=your_token_here

# Slack
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-secret

# Jira
JIRA_API_TOKEN=your_token_here
```

### Macro Properties

When adding the Account Hub macro to a Confluence page, configure:

- **accountId**: The account ID to display (e.g., "acc-001")

Example: `[account-hub-macro accountId="acc-001"]`

## Key Features

### 1. Account Hub Macro

The main dashboard displayed in Confluence pages:

- **Header**: Account name, ARR, tier, renewal date, health score selector
- **Metrics Dashboard**: Open tasks, unclaimed tasks, meetings, support tickets
- **Activity Stream**: Recent updates from Jira, Confluence, and Slack
- **Gray Area Queue**: Unclaimed tasks with claim buttons
- **Team Roster**: Team members with roles and contact info
- **Recent Meetings**: Upcoming and past meetings with recordings/notes
- **Quick Links**: Navigation to related tools
- **Focus Areas**: Editable account priorities

### 2. Portfolio View

Global page showing all accounts:

- **Account List**: Cross-account dashboard with health scores
- **Filtering**: By health, tier, needs attention, my accounts
- **Expandable Details**: Team roster and focus areas per account
- **Quick Actions**: Navigate to individual account hubs

### 3. Gray Area Queue

Macro for displaying unclaimed tasks:

- Filters tasks by:
  - Unassigned status
  - High priority or overdue
  - Recent creation date
- Claim button assigns task to current user
- Sorted by priority and due date

### 4. Focus Areas Macro

Inline-editable account priorities:

- Create and edit focus areas directly in Confluence
- Store in page properties for persistence
- Track by priority, owner, and due date
- Status tracking (in progress, completed, at risk)

## Resolvers

### Account Resolvers

- `getAccounts()` - Fetch all accounts
- `getAccountHealth(accountId)` - Get health score and trends
- `updateAccountHealth({accountId, healthScore, notes})` - Update health
- `getTeamRoster(accountId)` - Get team members

### Activity Resolvers

- `getActivityStream({accountId, limit})` - Aggregated activity feed

### Task Resolvers

- `getTasks({accountId, status, limit})` - Fetch Jira tasks
- `getGrayAreaQueue(accountId)` - Get unclaimed tasks
- `claimTask({taskId, accountId})` - Assign task to user

### Meeting Resolvers

- `getMeetings({accountId, daysAhead, daysBack})` - Google Calendar events
- `getFocusAreas(accountId)` - Account focus areas
- `updateFocusAreas({accountId, focusAreas})` - Update focus areas

## Web Triggers

### Google Calendar Sync

**Endpoint**: `/webtrigger/google-calendar-sync`

Receives Google Calendar push notifications:
- Creates meeting stub pages in Confluence
- Updates activity stream
- Stores meeting metadata

**Setup**:
1. Configure Google Cloud project with Calendar API
2. Set push notification endpoint to this trigger URL
3. Store access token in Forge Storage

### Slack Pin Listener

**Endpoint**: `/webtrigger/slack-pin-listener`

Receives Slack events:
- Detects pinned messages in account channels
- Captures hub-pin emoji reactions
- Stores in Forge Storage
- Updates activity stream

**Setup**:
1. Create Slack app in your workspace
2. Subscribe to pin_added and reaction_added events
3. Set request URL to this trigger endpoint
4. Store bot token in environment variables

## Development

### Local Development

For frontend development with hot reload:

```bash
# Portfolio View
cd static/portfolio-view
npm run dev

# Account Hub
cd static/account-hub
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

### Building

```bash
# Build frontend bundles
cd static/portfolio-view && npm run build
cd ../account-hub && npm run build
```

## Data Storage

The app uses **Forge Storage** for:

- Account health scores and history
- Team roster information
- Activity stream cache
- Meeting recordings and notes
- Focus areas
- Gray area queue state
- Channel-to-account mappings (Slack)
- OAuth tokens (Google Calendar, Slack)

Storage keys follow naming conventions:

```
account:{accountId}:health
account:{accountId}:roster
account:{accountId}:focus-areas
account:{accountId}:activity:stream
account:{accountId}:meetings
account:{accountId}:gray-area-queue
task:{taskId}:claims
slack:channel:{channelId}:account
```

## API Integrations

### Jira

- Query tasks by account label/component
- Update issue assignments
- Add comments to issues
- Fetch issue metadata

### Confluence

- Query pages by label
- Create meeting stub pages
- Update page properties for focus areas
- Read/write activity stream

### Google Calendar

- Push notifications via webhook
- Fetch events for time range
- Create calendar events

### Slack

- Event subscriptions (pins, reactions)
- Fetch message content
- Get user information

## Troubleshooting

### App not showing in Confluence

1. Check that manifest.yml is valid: `forge validate`
2. Verify app was deployed: `forge list`
3. Ensure you have permissions to add macros

### Resolvers returning empty data

1. Check Forge Storage permissions in manifest
2. Verify external fetch URLs are whitelisted
3. Check resolver implementation in src/resolvers/

### Web triggers not receiving events

1. Verify endpoint URL is correct
2. Check webhook signing (Slack)
3. Review request signature verification
4. Check Forge logs: `forge logs`

## Production Deployment

### Before Going Live

1. Update mock data with real API calls
2. Implement proper error handling
3. Add request validation
4. Set up monitoring and logging
5. Configure rate limiting
6. Implement caching strategies

### Deployment Steps

```bash
# Test in development
forge deploy --no-confirm

# Deploy to production
forge deploy --no-confirm --environment production

# Verify deployment
forge list
```

## Support & Documentation

- [Forge Documentation](https://developer.atlassian.com/cloud/forge/)
- [Confluence API](https://developer.atlassian.com/cloud/confluence/rest/v2/)
- [Jira API](https://developer.atlassian.com/cloud/jira/rest/v3/)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Slack API](https://api.slack.com/)

## License

MIT License - See LICENSE file for details

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

**Last Updated**: April 2025
**Version**: 1.0.0
