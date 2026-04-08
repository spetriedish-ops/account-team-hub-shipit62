import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FocusAreasBanner — Editable focus areas at the top of the Hub
 * Props:
 *   focusAreas: Array of { id, text }
 *   onUpdate: Callback when focus areas change (to persist via resolver)
 */

const defaultFocusAreas = [
  { id: "1", text: "Drive Q3 expansion motion — target 2 upsell opportunities by end of quarter" },
  { id: "2", text: "Resolve outstanding SSO integration blockers before exec onsite" },
  { id: "3", text: "Increase Confluence adoption across engineering org (currently 34%)" },
];

const FocusAreasBanner = ({ focusAreas: initial = defaultFocusAreas, onUpdate }) => {
  const [areas, setAreas] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  const startEdit = (a) => { setEditingId(a.id); setEditText(a.text); };

  const saveEdit = (id) => {
    const updated = areas.map((a) => a.id === id ? { ...a, text: editText } : a);
    setAreas(updated);
    setEditingId(null);
    if (onUpdate) onUpdate(updated);
  };

  const addArea = () => {
    if (!newText.trim()) return;
    const updated = [...areas, { id: Date.now().toString(), text: newText.trim() }];
    setAreas(updated);
    setNewText("");
    setAdding(false);
    if (onUpdate) onUpdate(updated);
  };

  const removeArea = (id) => {
    const updated = areas.filter((a) => a.id !== id);
    setAreas(updated);
    if (onUpdate) onUpdate(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="atlassian-card p-4 border-l-4 border-l-primary"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-sm font-semibold text-[hsl(216,33%,17%)]">Key Focus Areas</h2>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
        >
          + Add focus area
        </button>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {areas.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 group"
            >
              <span className="text-primary mt-0.5 text-sm">•</span>
              {editingId === a.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(a.id); if (e.key === "Escape") setEditingId(null); }}
                    className="flex-1 text-sm px-2 py-1 rounded border border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button onClick={() => saveEdit(a.id)} className="text-xs text-white bg-primary rounded px-2 py-1">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-[hsl(215,16%,47%)]">Cancel</button>
                </div>
              ) : (
                <div className="flex-1 flex items-start justify-between gap-2">
                  <p className="text-sm text-[hsl(216,33%,17%)]">{a.text}</p>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                    <button onClick={() => startEdit(a)} className="text-[hsl(215,16%,47%)] hover:text-primary">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => removeArea(a.id)} className="text-[hsl(215,16%,47%)] hover:text-red-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {adding && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-primary text-sm">•</span>
            <input
              autoFocus
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addArea(); if (e.key === "Escape") setAdding(false); }}
              placeholder="Type a focus area and press Enter..."
              className="flex-1 text-sm px-2 py-1 rounded border border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={addArea} className="text-xs text-white bg-primary rounded px-2 py-1">Add</button>
            <button onClick={() => setAdding(false)} className="text-xs text-[hsl(215,16%,47%)]">Cancel</button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FocusAreasBanner;
