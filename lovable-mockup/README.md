# Account Team Hub - Lovable Mockup

A complete, self-contained React component for the Account Team Hub app - a prototype for an Atlassian Forge app.

## Features

### View 1: Portfolio View
A cross-account triage dashboard with:
- **Filter Bar**: Toggle "Needs Attention", filter by Health (All/Strong/Good/At Risk/Critical), Tier, and "My Accounts" scope
- **Accounts Table**: Displays Account Name, Tier, ARR, Health Score (color-coded badges), Renewal Date, Open Tasks, Unclaimed Tasks, Last Meeting, and Attention Flags
- **Expandable Rows**: Click any row to expand in-place showing:
  - Key Focus Areas (1-3 bullet points)
  - Team Roster (AE/CSM/SE names)
  - "Go to Hub" button to navigate to individual account view
- **Drag & Drop**: Reorder accounts manually using the drag handle
- **Sample Data**: 6 enterprise accounts with varied health scores and attention flags

### View 2: Account Hub (Individual Account)
A rich single-account view showing:
- **Header**: Account name, ARR, Tier, Renewal Date, Health Score selector
- **Key Focus Areas**: Inline-editable text areas with add/remove functionality
- **Metrics Dashboard**: 4 stat cards (Open Tasks, Unclaimed Tasks, Meetings, Support Tickets)
- **Critical Support Alert**: Prominent red banner for P1/P2 tickets
- **Activity Stream**: Feed of recent activities (Confluence updates, Jira tasks, meetings, Slack pins, etc.)
- **Gray Area Queue**: List of unclaimed tasks with individual "Claim" buttons
- **Pinned from Slack**: 2-3 pinned messages with author, timestamp, and text
- **Account Team**: Roster table with Role, Name, and Owns columns
- **Recent Meetings**: Last 5 meetings with date, title, Notes status, and recording links
- **Quick Links**: Buttons for Meeting Notes, Jira Board, Key Docs, Support Queue

## Installation & Usage

### For Lovable.dev:
1. Copy the entire content of `AccountTeamHub.jsx`
2. Paste it into a new Lovable component
3. Make sure Tailwind CSS and Lucide React icons are enabled in your Lovable project
4. The component is fully self-contained and ready to use

### Dependencies:
- React (useState hooks)
- Tailwind CSS (for styling)
- Lucide React (for icons: ChevronDown, ChevronUp, GripVertical, Clock, Users, AlertCircle, FileText, MessageSquare, Plus, X)

### In a Standard React App:
```jsx
import AccountTeamHub from './AccountTeamHub';

export default function App() {
  return <AccountTeamHub />;
}
```

## Styling

- **Color Palette**: Atlassian-inspired with blue (#0052CC), green (#00875A), amber (#FF991F), red (#DE350B)
- **Health Badges**: Color-coded (Green=Strong, Blue=Good, Amber=At Risk, Red=Critical)
- **Professional Design**: Clean, enterprise SaaS feel with responsive grid layouts
- **Tailwind CSS**: All styling uses utility classes for easy customization

## Interactive Features

- **Navigation**: Switch between Portfolio View and individual Account Hubs via navigation bar
- **Filtering**: Real-time account filtering by health, tier, attention status
- **Drag & Drop**: Reorder accounts in the portfolio view
- **Expandable Rows**: Click table rows to expand detailed information
- **Editable Fields**: Inline editing for key focus areas
- **Claimable Tasks**: Toggle task claims in the Gray Area Queue
- **Health Selector**: Change account health status from dropdown

## Sample Data

Includes 6 realistic enterprise accounts:
- **Acme Corp** (At Risk)
- **Globex Industries** (Strong)
- **Initech** (Good)
- **Umbrella Corp** (Critical)
- **Wayne Enterprises** (Good)
- **Stark Industries** (Strong)

Each account includes team roster, key focus areas, tasks, meetings, and activity feeds.

## Notes

- All data is hardcoded in the component for easy mockup/prototyping
- No external API calls required
- Component is fully responsive and works on desktop/tablet/mobile
- Easy to customize colors, data, and sections
