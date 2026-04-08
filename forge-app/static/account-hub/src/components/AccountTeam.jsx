import { useState } from "react";
import { motion } from "framer-motion";

/**
 * AccountTeam — Team roster for the account
 * Props:
 *   members: Array of { id, name, title, accountRole, avatar }
 */

const avatarColors = [
  "bg-primary text-white",
  "bg-[hsl(152,55%,42%)] text-white",
  "bg-[hsl(38,100%,50%)] text-[hsl(216,33%,17%)]",
  "bg-[hsl(14,88%,45%)] text-white",
  "bg-[hsl(214,82%,40%)] text-white",
  "bg-[hsl(215,25%,35%)] text-white",
];

const defaultMembers = [
  { id: "1", name: "Sarah Chen", title: "Senior Account Executive", accountRole: "Account Lead", avatar: "SC" },
  { id: "2", name: "Marcus Johnson", title: "Strategy Director", accountRole: "Strategy Lead", avatar: "MJ" },
  { id: "3", name: "Aisha Patel", title: "Senior Designer", accountRole: "Creative Lead", avatar: "AP" },
  { id: "4", name: "David Kim", title: "Analytics Manager", accountRole: "Analytics Lead", avatar: "DK" },
  { id: "5", name: "Emma Torres", title: "Project Manager", accountRole: "Delivery Manager", avatar: "ET" },
  { id: "6", name: "James Wright", title: "Content Strategist", accountRole: "Content Lead", avatar: "JW" },
];

const AccountTeam = ({ members: initialMembers = defaultMembers }) => {
  const [members, setMembers] = useState(initialMembers);
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState("");

  const startEdit = (m) => { setEditingId(m.id); setEditRole(m.accountRole); };
  const saveEdit = (id) => {
    setMembers(members.map((m) => m.id === id ? { ...m, accountRole: editRole } : m));
    setEditingId(null);
  };
  const removeMember = (id) => setMembers(members.filter((m) => m.id !== id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="atlassian-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="text-sm font-semibold text-[hsl(216,33%,17%)]">Account Team</h2>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded hover:bg-primary/90 transition-colors">
          + Add Member
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {members.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.04 }}
            className="group relative p-4 rounded border border-[hsl(220,13%,89%)] text-center space-y-2 hover:bg-[hsl(220,14%,93%)] transition-colors"
          >
            <button
              onClick={() => removeMember(m.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(215,16%,47%)] hover:text-[hsl(14,88%,45%)]"
            >
              ✕
            </button>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-semibold ${avatarColors[i % avatarColors.length]}`}>
              {m.avatar}
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(216,33%,17%)] truncate">{m.name}</p>
              <p className="text-xs text-[hsl(215,16%,47%)] truncate">{m.title}</p>
            </div>
            {editingId === m.id ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(m.id); if (e.key === "Escape") setEditingId(null); }}
                  className="w-full px-2 py-1 text-xs rounded border border-[hsl(220,13%,89%)] focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button onClick={() => saveEdit(m.id)} className="text-[hsl(152,55%,42%)] text-xs">✓</button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 group/role">
                <span className="text-xs text-[hsl(215,16%,47%)] truncate">{m.accountRole}</span>
                <button onClick={() => startEdit(m)} className="opacity-0 group-hover/role:opacity-100 text-[hsl(215,16%,47%)] hover:text-primary transition-opacity">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AccountTeam;
