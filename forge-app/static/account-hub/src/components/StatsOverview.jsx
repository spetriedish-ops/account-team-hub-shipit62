import React, { useState } from "react";

// Icons as simple SVG components to avoid lucide-react dependency issues
const ClipboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const UserPlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3zm16 0a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h1a2 2 0 012 2v3z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

/**
 * StatsOverview — 4 metric cards at the top of the Account Hub
 * Props:
 *   metrics: { openTasks, unclaimedTasks, supportTickets, meetings }
 *   All default to mock values if not provided (useful during development)
 */
const StatsOverview = ({ metrics = {} }) => {
  const stats = [
    {
      label: "Open Tasks",
      value: metrics.openTasks ?? "12",
      change: metrics.openTasksChange ?? "+3 this week",
      icon: ClipboardIcon,
      color: "text-primary",
    },
    {
      label: "Unclaimed Tasks",
      value: metrics.unclaimedTasks ?? "5",
      change: metrics.unclaimedChange ?? "2 high priority",
      icon: UserPlusIcon,
      color: "text-[hsl(38,100%,50%)]",
    },
    {
      label: "Open Support Tickets",
      value: metrics.supportTickets ?? "8",
      change: metrics.supportChange ?? "1 critical",
      icon: HeadphonesIcon,
      color: "text-[hsl(14,88%,45%)]",
    },
    {
      label: "Upcoming Meetings",
      value: metrics.meetings ?? "4",
      change: metrics.meetingsChange ?? "Next: Tomorrow 10am",
      icon: CalendarIcon,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="atlassian-card p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[hsl(215,16%,47%)] uppercase tracking-wide">{s.label}</span>
            <span className={s.color}><s.icon /></span>
          </div>
          <p className="text-2xl font-semibold text-[hsl(216,33%,17%)]">{s.value}</p>
          <p className="text-xs text-[hsl(215,16%,47%)]">{s.change}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
