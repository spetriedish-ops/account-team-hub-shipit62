import { motion } from "framer-motion";

/**
 * ActivityFeed — Recent activity stream for the account
 * Props:
 *   activities: Array of { user, action, time, type }
 *   Types: 'page', 'task', 'meeting', 'ticket', 'slack'
 */

const typeIcons = {
  page: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  task: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  meeting: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  ticket: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  slack: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
};

const typeColors = {
  page: "text-primary bg-blue-50",
  task: "text-[hsl(152,55%,42%)] bg-green-50",
  meeting: "text-[hsl(214,82%,40%)] bg-blue-50",
  ticket: "text-[hsl(14,88%,45%)] bg-red-50",
  slack: "text-[hsl(38,100%,50%)] bg-amber-50",
};

const defaultActivities = [
  { user: "Sarah C.", action: "created meeting notes for QBR Prep", time: "2h ago", type: "page" },
  { user: "Marcus J.", action: "updated Jira task: Integration scope", time: "3h ago", type: "task" },
  { user: "Aisha P.", action: "scheduled Executive Onsite", time: "Yesterday", type: "meeting" },
  { user: "David K.", action: "escalated support ticket #4821", time: "Yesterday", type: "ticket" },
  { user: "Emma T.", action: "pinned message to hub channel", time: "2d ago", type: "slack" },
];

const ActivityFeed = ({ activities = defaultActivities }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25, duration: 0.3 }}
    className="atlassian-card p-5"
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-[hsl(216,33%,17%)]">Recent Activity</h2>
      <button className="text-xs text-primary font-medium hover:underline">See all</button>
    </div>
    <div className="space-y-3">
      {activities.map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 + i * 0.05 }}
          className="flex items-start gap-3"
        >
          <div className={`mt-0.5 p-1.5 rounded ${typeColors[a.type] || typeColors.task}`}>
            {typeIcons[a.type] || typeIcons.task}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[hsl(216,33%,17%)]">
              <span className="font-medium">{a.user}</span>{" "}
              <span className="text-[hsl(215,16%,47%)]">{a.action}</span>
            </p>
            <p className="text-xs text-[hsl(215,16%,47%)] mt-0.5">{a.time}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default ActivityFeed;
