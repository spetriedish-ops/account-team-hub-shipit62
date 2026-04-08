import React, { useState, useEffect } from "react";
// @forge/bridge is the Forge API bridge — only works inside Atlassian iframe context
// Wrap in try/catch so the app renders with mock data even outside Forge
let invoke, getContext;
try {
  const forgeBridge = require("@forge/bridge");
  invoke = forgeBridge.invoke;
  getContext = forgeBridge.getContext;
} catch (e) {
  console.warn("@forge/bridge not available — running in standalone mode with mock data");
  invoke = async () => null;
  getContext = async () => ({});
}
import { motion } from "framer-motion";

// New Lovable-designed components
import FocusAreasBanner from "./components/FocusAreasBanner";
import StatsOverview from "./components/StatsOverview";
import ActivityFeed from "./components/ActivityFeed";
import GrayAreaQueue from "./components/GrayAreaQueue";
import PinnedSlackMessages from "./components/PinnedSlackMessages";
import AccountTeam from "./components/AccountTeam";
import BottomLinks from "./components/BottomLinks";

// Import Tailwind + global styles
import "./index.css";

/**
 * Account Hub — Main Forge macro app
 *
 * This component is the entry point for the Account Hub Confluence macro.
 * It fetches account data from the backend resolvers via @forge/bridge,
 * and renders the full hub UI using the Lovable-designed components.
 *
 * Data flow:
 *   Confluence macro context → accountId, pageTitle
 *   @forge/bridge invoke() → resolver functions → Jira/Confluence/Slack data
 */

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [accountName, setAccountName] = useState("Account Hub");
  const [metrics, setMetrics] = useState({});
  const [activities, setActivities] = useState([]);
  const [grayAreaItems, setGrayAreaItems] = useState([]);
  const [slackMessages, setSlackMessages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);

  // Step 1: Get context from Confluence macro (accountId + page title)
  useEffect(() => {
    const init = async () => {
      try {
        const context = await getContext();

        // accountId is passed as a macro property in the Confluence editor
        const id = context.extension?.parameters?.accountId
          || context.accountId
          || "acc-001";

        // Use the Confluence page title as the account name
        const pageTitle = context.extension?.content?.title
          || context.extension?.page?.title
          || null;

        setAccountId(id);
        if (pageTitle) setAccountName(pageTitle);
      } catch (err) {
        console.error("Error getting context:", err);
        setAccountId("acc-001");
      }
    };
    init();
  }, []);

  // Step 2: Once we have the accountId, fetch all data in parallel
  useEffect(() => {
    if (!accountId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel for performance
        const [tasks, activity, slackPins, roster, focus] = await Promise.allSettled([
          invoke("getTasks", { accountId }),
          invoke("getActivityStream", { accountId }),
          invoke("getSlackPins", { accountId }),
          invoke("getTeamRoster", { accountId }),
          invoke("getFocusAreas", { accountId }),
        ]);

        // Tasks → metrics + gray area queue
        if (tasks.status === "fulfilled" && tasks.value) {
          const taskData = tasks.value;
          const allTasks = taskData.tasks || [];
          const unclaimed = allTasks.filter((t) => !t.assignee || t.assignee === "Unassigned");

          setMetrics({
            openTasks: allTasks.filter((t) => t.status !== "Done").length,
            unclaimedTasks: unclaimed.length,
            supportTickets: taskData.supportTickets || 0,
            meetings: taskData.upcomingMeetings || 0,
          });

          setGrayAreaItems(
            (taskData.grayAreaQueue || unclaimed.slice(0, 4)).map((t) => ({
              id: t.id || t.key,
              title: t.summary || t.title,
              assignee: t.assignee || "Unassigned",
              age: t.age || "—",
              priority: t.priority?.toLowerCase() || "medium",
            }))
          );
        }

        // Activity stream
        if (activity.status === "fulfilled" && activity.value) {
          setActivities(activity.value.activities || []);
        }

        // Slack pins
        if (slackPins.status === "fulfilled" && slackPins.value) {
          setSlackMessages(slackPins.value.pins || []);
        }

        // Team roster
        if (roster.status === "fulfilled" && roster.value) {
          setTeamMembers(roster.value.members || []);
        }

        // Focus areas
        if (focus.status === "fulfilled" && focus.value) {
          setFocusAreas(focus.value.focusAreas || []);
        }
      } catch (err) {
        console.error("Error fetching account data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  const handleFocusAreasUpdate = async (updated) => {
    try {
      await invoke("updateFocusAreas", { accountId, focusAreas: updated });
    } catch (err) {
      console.error("Failed to save focus areas:", err);
    }
  };

  const handleTaskClaimed = (taskId) => {
    setGrayAreaItems((prev) =>
      prev.map((item) => item.id === taskId ? { ...item, assignee: "You" } : item)
    );
    setMetrics((prev) => ({
      ...prev,
      unclaimedTasks: Math.max(0, (prev.unclaimedTasks || 1) - 1),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] bg-[hsl(210,16%,97%)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[hsl(215,16%,47%)]">Loading {accountName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] bg-[hsl(210,16%,97%)] flex items-center justify-center p-6">
        <div className="atlassian-card p-6 max-w-md text-center space-y-3">
          <p className="text-sm font-semibold text-[hsl(14,88%,45%)]">Failed to load account data</p>
          <p className="text-xs text-[hsl(215,16%,47%)]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-primary font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(210,16%,97%)] min-h-screen">
      {/* Account Hub Header */}
      <header className="bg-primary px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {accountName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">{accountName}</h1>
            <p className="text-xs text-white/70">Account Hub</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-[hsl(216,33%,17%)]">
            Good morning, <span className="text-primary">Team</span> 👋
          </h2>
          <p className="text-sm text-[hsl(215,16%,47%)] mt-1">
            Here's what's happening across {accountName} today.
          </p>
        </motion.div>

        {/* Focus Areas */}
        <FocusAreasBanner
          focusAreas={focusAreas.length ? focusAreas : undefined}
          onUpdate={handleFocusAreasUpdate}
        />

        {/* Stats */}
        <StatsOverview metrics={metrics} />

        {/* Activity + Gray Area Queue side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed activities={activities.length ? activities : undefined} />
          <GrayAreaQueue
            items={grayAreaItems.length ? grayAreaItems : undefined}
            onClaim={handleTaskClaimed}
          />
        </div>

        {/* Pinned Slack Messages */}
        <PinnedSlackMessages messages={slackMessages.length ? slackMessages : undefined} />

        {/* Account Team */}
        <AccountTeam members={teamMembers.length ? teamMembers : undefined} />

        {/* Quick Links */}
        <BottomLinks accountId={accountId} />
      </main>
    </div>
  );
}

export default App;
