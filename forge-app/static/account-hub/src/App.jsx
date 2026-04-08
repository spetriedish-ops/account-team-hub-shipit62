import React, { useState, useEffect } from "react";

import FocusAreasBanner from "./components/FocusAreasBanner";
import StatsOverview from "./components/StatsOverview";
import ActivityFeed from "./components/ActivityFeed";
import GrayAreaQueue from "./components/GrayAreaQueue";
import PinnedSlackMessages from "./components/PinnedSlackMessages";
import AccountTeam from "./components/AccountTeam";
import BottomLinks from "./components/BottomLinks";

// @forge/bridge — safely required so app renders even outside Forge iframe
let invoke = async () => null;
let getContext = async () => ({});
try {
  const bridge = require("@forge/bridge");
  invoke = bridge.invoke;
  getContext = bridge.getContext;
} catch (e) {
  console.warn("@forge/bridge unavailable — using mock data");
}

function App() {
  const [loading, setLoading] = useState(true);
  const [accountName, setAccountName] = useState("Account Hub");
  const [accountId, setAccountId] = useState("acc-001");
  const [grayAreaItems, setGrayAreaItems] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const context = await getContext();
        const id = context.extension?.parameters?.accountId || context.accountId || "acc-001";
        const pageTitle = context.extension?.content?.title || context.extension?.page?.title || null;
        setAccountId(id);
        if (pageTitle) setAccountName(pageTitle);
      } catch (e) {
        console.warn("Could not get context:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleFocusAreasUpdate = async (updated) => {
    try { await invoke("updateFocusAreas", { accountId, focusAreas: updated }); } catch (e) {}
  };

  const handleTaskClaimed = async (taskId) => {
    try { await invoke("claimTask", { taskId }); } catch (e) {}
    setGrayAreaItems((prev) => prev.map((i) => i.id === taskId ? { ...i, assignee: "You" } : i));
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#42526E", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: "14px" }}>Loading {accountName}...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F4F5F7", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#0052CC", padding: "12px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "white", fontWeight: "bold", fontSize: "12px" }}>{accountName.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <div style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>{accountName}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>Account Hub</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#172B4D", margin: 0 }}>
            Good morning, <span style={{ color: "#0052CC" }}>Team</span> 👋
          </h2>
          <p style={{ fontSize: "13px", color: "#42526E", marginTop: "4px" }}>
            Here's what's happening across {accountName} today.
          </p>
        </div>

        <FocusAreasBanner focusAreas={focusAreas.length ? focusAreas : undefined} onUpdate={handleFocusAreasUpdate} />
        <StatsOverview />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <ActivityFeed />
          <GrayAreaQueue items={grayAreaItems.length ? grayAreaItems : undefined} onClaim={handleTaskClaimed} />
        </div>

        <PinnedSlackMessages />
        <AccountTeam />
        <BottomLinks accountId={accountId} />
      </div>
    </div>
  );
}

export default App;
