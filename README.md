# Account Team Hub

> A shared operating surface for account teams — bringing activity, ownership, and meeting context together in one Confluence-based hub, with a portfolio view for managing multiple accounts.

---

## The Problem

Account teams lose context to silos. Notes live in personal Confluence spaces. Loom recordings never make it back to the right place. Tasks fall through the cracks because nobody knows who owns them. The best case is someone proactively drops an update in Slack — the worst case is your teammate walks into a renewal call blind.

This project addresses that with a Forge-powered Confluence hub that auto-captures activity, surfaces what needs attention, and makes ownership unambiguous.

---

## What It Is

**Account Team Hub** is an Atlassian Forge application that turns a Confluence space into a real-time collaboration surface for account teams. Each customer account gets its own Hub — a single page that aggregates signals from across your stack so the whole team stays aligned without extra effort.

A **Portfolio View** sits above the individual hubs, giving AEs, CSMs, and SEs a single triage dashboard across all their accounts.

---

## Features

### Individual Account Hub

| Section | Description |
|---|---|
| **Header & Health Score** | Account metadata (ARR, tier, renewal date) plus a manual health indicator (`Strong` / `Good` / `At Risk` / `Critical`) with change history |
| **Key Focus Areas** | 1–3 active strategic contexts — the "what's the story right now" for this account |
| **Metrics Dashboard** | At-a-glance counts: open tasks, unclaimed tasks, meetings (30d), support tickets |
| **Critical Support Alert** | Prominent banner for P1/P2 JSM tickets — only appears when active |
| **Activity Stream** | Auto-populated feed from Calendar, Confluence, Jira, and upcoming meetings |
| **Gray Area Queue** | Accountability engine for tasks without a clear owner — surfaces unclaimed items with a one-click Claim button |
| **Pinned from Slack** | Curated highlights from the account Slack channel via `:hub-pin:` emoji reactions |
| **Account Team** | Ownership matrix showing who's on the team (AE, CSM, SE, etc.) and what they own |
| **Recent Meetings** | Last 5–7 meetings with recording links, notes status, and a `No Notes` flag |
| **Quick Links** | One-click access to meeting notes, Jira board, key docs, and support queue |

### Portfolio View

A cross-account dashboard that lives in the Atlassian top nav (not tied to any single Confluence space).

- **"Needs Attention" default** — Opens to a filtered triage list, not a spreadsheet of everything
- **My Accounts scope** — Personal home base showing only accounts where the user holds a role
- **Configurable attention signals** — Per-user thresholds for P1/P2 tickets, unclaimed tasks, meeting gaps, and renewal risk
- **Expand-in-place** — Click any row to see focus areas, health context, team roster, and quick stats without losing your place
- **Manual drag-to-reorder** — Custom sort order persisted per user in Forge Storage
- **Composable filters** — Health, tier, scope, and "needs attention" all compose cleanly

---

## Architecture

### 1:1:1 Model

| Layer | Implementation |
|---|---|
| Knowledge Home | Confluence Space per account |
| Work Tracking | Jira Project per account |
| Meeting Capture | Loom Notetaker + Slack fallback |
| Calendar | Shared Google Calendar per account |
| Support | JSM integration |

### Tech Stack

- **Platform**: Atlassian (Confluence, Jira, JSM)
- **Extension Framework**: Atlassian Forge
- **Integrations**: Google Calendar, Slack, Loom

### Forge Components

**Custom Macros**
- `Account Dashboard Macro` — Renders the activity stream, metrics, and ownership matrix
- `Gray Area Queue Macro` — Renders unclaimed tasks with a live Claim button
- `Focus Areas Macro` — Inline-editable focus areas stored in Confluence page properties

**Webhooks & Listeners**
- `Google Calendar Sync` — Listens for events on the shared account calendar and creates meeting stub pages in Confluence
- `Slack Pin Listener` — Watches for `:hub-pin:` reactions and syncs messages to the Hub
- `JSM Ticket Watcher` — Monitors for P1/P2 tickets and surfaces them in the alert banner

---

## Meeting Notes Workflow

### Path A — Recording Allowed
1. Loom Notetaker joins via the shared calendar invite
2. Loom generates a page with recording + AI notes
3. Page is force-routed to the account's Confluence space (`Meeting Notes/` subtree)
4. Activity stream and Recent Meetings section pick it up automatically

### Path B — No Recording
1. Post-meeting Slack workflow prompts: *"Quick notes from today's call with [Customer]?"*
2. Team member replies in thread
3. Forge/Slack integration creates a lightweight Confluence page
4. Page is linked to the calendar event and surfaced in Recent Meetings

---

## Confluence Space Structure

```
[Account Name] Space
├── Home (Hub Dashboard — custom macros)
├── Meeting Notes/
│   ├── 2025-03-15 - QBR with Leadership
│   ├── 2025-03-10 - Technical Deep Dive
│   └── ...
├── Key Documents/
│   ├── Architecture Overview
│   ├── Security & Compliance
│   └── SOW & Contract
└── Resources/
    └── Customer Contacts
```

---

## Jira Project Structure

```
[ACME] Project
├── Issue Types
│   ├── Task
│   ├── Gray Area Task (custom)
│   └── Action Item
├── Components
│   ├── Technical
│   ├── Commercial
│   ├── Success
│   └── Support
└── Custom Fields
    ├── Requested By
    ├── Suggested Owner
    └── Account Context
```

---

## Design Principles

- **Little to no lift** — Auto-capture where possible, one-click sharing where not
- **Signal over noise** — Curated content, not firehose feeds
- **Clear accountability** — Surface what's unclaimed, make it easy to claim
- **Open by default** — Accessible to the whole company

---

## Project Status

This project is currently in the **design and prototyping phase**.

- [x] Architecture defined
- [x] Portfolio View interactive mockup (`portfolio-view.jsx`)
- [x] Hub component design documented
- [x] Meeting capture workflow designed
- [ ] Validate architecture with Atlassian Forge capabilities
- [ ] Design Jira project template
- [ ] Prototype Activity Stream macro
- [ ] Map Google Calendar → Confluence integration
- [ ] Create wireframes for individual Hub components
- [ ] Identify pilot accounts for testing

---

## Open Questions

1. **Space provisioning** — Manual creation or automated when a new account is added to the CRM?
2. **Calendar sync frequency** — Real-time webhooks or periodic polling?
3. **Slack integration scope** — Read-only (pins only) or bidirectional (post from Hub)?
4. **Loom routing** — Does the Loom→Confluence integration support destination targeting by calendar or team?
5. **Custom order persistence** — One global custom order in the Portfolio View, or per-filter-state?
6. **Mobile experience** — Confluence mobile app sufficient, or is a dedicated view needed?
7. **Notification strategy** — Digest vs. real-time? Portfolio-level digests vs. per-Hub alerts?

---

## Future Roadmap

- **Rovo Integration (v2)** — AI-generated summaries of Slack channel activity and "What did I miss?" catch-up
- **Automated Health Score (v2)** — Signal-based scoring from meeting frequency, ticket volume, engagement metrics, and executive touch cadence
- **Team Portfolio Views** — Manager-level view across a rep's full book of business
- **Cross-account search** — Pattern matching across Hub content

---

## Related Files

| File | Description |
|---|---|
| `portfolio-view.jsx` | Interactive React mockup of the Portfolio View |
| `account-team-hub-project-brief.md` | Full project brief with architecture and component specs |
| `portfolio-view-design-notes.md` | Design decisions and information architecture for the Portfolio View |
| `loom-meeting-capture-notes.md` | Meeting capture workflow design and Recent Meetings UI spec |
