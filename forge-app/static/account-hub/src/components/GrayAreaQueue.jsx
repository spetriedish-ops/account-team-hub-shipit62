import { useState } from "react";
// Note: @forge/bridge is NOT imported here — invoke is passed via the onClaim prop from App.jsx
// This keeps the component testable outside of Forge context

const priorityBg = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-500",
};

const defaultItems = [
  { id: "GAQ-1", title: "Licensing discrepancy on Enterprise tier", assignee: "Unassigned", age: "3d", priority: "high" },
  { id: "GAQ-2", title: "Custom integration request from VP Eng", assignee: "Sarah C.", age: "1d", priority: "medium" },
  { id: "GAQ-3", title: "Unclear ownership of analytics dashboard", assignee: "Unassigned", age: "5d", priority: "high" },
  { id: "GAQ-4", title: "Pilot feedback routing", assignee: "Marcus J.", age: "2d", priority: "low" },
];

const GrayAreaQueue = ({ items: initialItems = defaultItems, onClaim }) => {
  const [items, setItems] = useState(initialItems);

  const handleClaim = async (item) => {
    try {
      // Call the onClaim callback from App.jsx which handles the @forge/bridge invoke
      if (onClaim) await onClaim(item.id);
      setItems(items.map((i) => i.id === item.id ? { ...i, assignee: "You" } : i));
    } catch (err) {
      console.error("Failed to claim task:", err);
    }
  };

  return (
    <div
      className="atlassian-card p-5 flex-1"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[hsl(216,33%,17%)]">Gray Area Queue</h2>
        <button className="text-xs text-primary font-medium hover:underline">View all</button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="p-3 rounded border border-[hsl(220,13%,89%)] hover:bg-[hsl(220,14%,93%)] transition-colors space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-[hsl(216,33%,17%)] font-medium">{item.title}</p>
              <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 text-[11px] font-semibold rounded ${priorityBg[item.priority]}`}>
                {item.priority}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-[hsl(215,16%,47%)]">
                <span>👤 {item.assignee}</span>
                <span>🕐 {item.age}</span>
              </div>
              {item.assignee === "Unassigned" && (
                <button
                  onClick={() => handleClaim(item)}
                  className="text-xs font-medium text-primary border border-primary rounded px-2 py-0.5 hover:bg-primary hover:text-white transition-colors"
                >
                  Claim
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrayAreaQueue;
