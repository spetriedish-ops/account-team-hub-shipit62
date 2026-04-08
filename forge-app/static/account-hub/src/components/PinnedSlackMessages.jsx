import { motion } from "framer-motion";

/**
 * PinnedSlackMessages — Messages pinned to the Hub via :hub-pin: emoji
 * Props:
 *   messages: Array of { channel, author, text, time }
 */

const defaultMessages = [
  { channel: "#account-strategy", author: "Sarah Chen", text: "Final deck for the exec onsite is ready — please review by EOD Thursday.", time: "Yesterday, 4:12 PM" },
  { channel: "#support-escalations", author: "David Kim", text: "Ticket #4821 resolved. Root cause was misconfigured SSO — documented in runbook.", time: "Mon, 11:30 AM" },
  { channel: "#general", author: "Marcus Johnson", text: "Reminder: QBR prep sync tomorrow at 10am PT. Agenda doc linked in thread.", time: "Mon, 9:05 AM" },
];

const PinnedSlackMessages = ({ messages = defaultMessages }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35, duration: 0.3 }}
    className="atlassian-card p-5"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <h2 className="text-sm font-semibold text-[hsl(216,33%,17%)]">Pinned from Slack</h2>
      </div>
      <button className="text-xs text-primary font-medium hover:underline">Manage pins</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 + i * 0.05 }}
          className="p-3 rounded border border-[hsl(220,13%,89%)] hover:bg-[hsl(220,14%,93%)] transition-colors space-y-2"
        >
          <div className="flex items-center gap-1.5 text-xs text-[hsl(215,16%,47%)]">
            <span>#</span>
            <span>{msg.channel.replace('#', '')}</span>
          </div>
          <p className="text-sm text-[hsl(216,33%,17%)] line-clamp-2">{msg.text}</p>
          <div className="flex items-center justify-between text-xs text-[hsl(215,16%,47%)]">
            <span className="font-medium text-[hsl(216,33%,17%)]">{msg.author}</span>
            <span>{msg.time}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default PinnedSlackMessages;
