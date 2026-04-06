import React, { useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Clock, Users, AlertCircle, FileText, MessageSquare, Plus, X } from 'lucide-react';

// Sample data for accounts
const SAMPLE_ACCOUNTS = [
  {
    id: 1,
    name: 'Acme Corp',
    tier: 'Enterprise',
    arr: '$2.5M',
    health: 'At Risk',
    renewalDate: '2026-06-15',
    openTasks: 12,
    unclaimedTasks: 4,
    lastMeeting: '2026-03-28',
    attentionFlags: ['P1 Ticket', 'Unclaimed Tasks'],
    keyFocusAreas: ['Reduce implementation timeline', 'Optimize user adoption'],
    team: [
      { role: 'AE', name: 'Sarah Chen', owns: 'Growth' },
      { role: 'CSM', name: 'Mike Johnson', owns: 'Health' },
      { role: 'SE', name: 'Alex Rodriguez', owns: 'Technical' }
    ]
  },
  {
    id: 2,
    name: 'Globex Industries',
    tier: 'Enterprise',
    arr: '$3.2M',
    health: 'Strong',
    renewalDate: '2026-12-01',
    openTasks: 3,
    unclaimedTasks: 0,
    lastMeeting: '2026-04-02',
    attentionFlags: [],
    keyFocusAreas: ['Expand to new departments', 'Implement advanced analytics'],
    team: [
      { role: 'AE', name: 'Jessica Liu', owns: 'Expansion' },
      { role: 'CSM', name: 'David Park', owns: 'Success' },
      { role: 'SE', name: 'Emma Wilson', owns: 'Architecture' }
    ]
  },
  {
    id: 3,
    name: 'Initech',
    tier: 'Mid-Market',
    arr: '$850K',
    health: 'Good',
    renewalDate: '2026-08-22',
    openTasks: 7,
    unclaimedTasks: 2,
    lastMeeting: '2026-03-15',
    attentionFlags: ['Unclaimed Tasks'],
    keyFocusAreas: ['Integrate with legacy systems'],
    team: [
      { role: 'AE', name: 'Tom Brady', owns: 'Account' },
      { role: 'CSM', name: 'Lisa Martinez', owns: 'Operations' }
    ]
  },
  {
    id: 4,
    name: 'Umbrella Corp',
    tier: 'Enterprise',
    arr: '$4.1M',
    health: 'Critical',
    renewalDate: '2026-05-10',
    openTasks: 18,
    unclaimedTasks: 8,
    lastMeeting: '2026-02-28',
    attentionFlags: ['P1 Ticket', 'P2 Tickets', 'Unclaimed Tasks', 'Renewal Risk'],
    keyFocusAreas: ['Critical infrastructure upgrade', 'Team training program', 'Support SLA improvement'],
    team: [
      { role: 'AE', name: 'Robert Zhang', owns: 'Strategic' },
      { role: 'CSM', name: 'Patricia Evans', owns: 'Crisis Management' },
      { role: 'SE', name: 'Christopher Lee', owns: 'Implementation' }
    ]
  },
  {
    id: 5,
    name: 'Wayne Enterprises',
    tier: 'Enterprise',
    arr: '$1.8M',
    health: 'Good',
    renewalDate: '2026-10-05',
    openTasks: 5,
    unclaimedTasks: 1,
    lastMeeting: '2026-04-01',
    attentionFlags: [],
    keyFocusAreas: ['Enhance reporting capabilities'],
    team: [
      { role: 'AE', name: 'Bruce Wayne', owns: 'Enterprise' },
      { role: 'CSM', name: 'Alfred Pennyworth', owns: 'Support' }
    ]
  },
  {
    id: 6,
    name: 'Stark Industries',
    tier: 'Enterprise',
    arr: '$5.2M',
    health: 'Strong',
    renewalDate: '2026-11-15',
    openTasks: 2,
    unclaimedTasks: 0,
    lastMeeting: '2026-04-03',
    attentionFlags: [],
    keyFocusAreas: ['AI integration roadmap', 'Multi-region deployment'],
    team: [
      { role: 'AE', name: 'Tony Stark', owns: 'Innovation' },
      { role: 'CSM', name: 'Pepper Potts', owns: 'Executive' },
      { role: 'SE', name: 'James Rhodes', owns: 'Military Grade' }
    ]
  }
];

// Health badge component
const HealthBadge = ({ health, onClick, clickable = false }) => {
  const healthStyles = {
    'Strong': 'bg-green-100 text-green-800 border border-green-300',
    'Good': 'bg-blue-100 text-blue-800 border border-blue-300',
    'At Risk': 'bg-amber-100 text-amber-800 border border-amber-300',
    'Critical': 'bg-red-100 text-red-800 border border-red-300'
  };
  
  return (
    <span 
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${healthStyles[health]} ${clickable ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      {health}
    </span>
  );
};

// Attention flag badge
const FlagBadge = ({ flag }) => {
  if (flag.includes('P1')) return <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium mr-1 mb-1">🔴 {flag}</span>;
  if (flag.includes('P2')) return <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded font-medium mr-1 mb-1">🟠 {flag}</span>;
  if (flag.includes('Unclaimed')) return <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium mr-1 mb-1">⚠️ {flag}</span>;
  return <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded font-medium mr-1 mb-1">{flag}</span>;
};

// Portfolio View Component
const PortfolioView = ({ accounts, onAccountClick }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [needsAttention, setNeedsAttention] = useState(false);
  const [healthFilter, setHealthFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [myAccounts, setMyAccounts] = useState(false);
  const [accountOrder, setAccountOrder] = useState(accounts.map(a => a.id));
  const [draggedId, setDraggedId] = useState(null);

  const filteredAccounts = accounts.filter(acc => {
    if (needsAttention) {
      const hasAttentionIssue = acc.health === 'At Risk' || acc.health === 'Critical' || acc.unclaimedTasks > 0;
      if (!hasAttentionIssue) return false;
    }
    if (healthFilter !== 'All' && acc.health !== healthFilter) return false;
    if (tierFilter !== 'All' && acc.tier !== tierFilter) return false;
    return true;
  }).sort((a, b) => accountOrder.indexOf(a.id) - accountOrder.indexOf(b.id));

  const handleDragStart = (id) => setDraggedId(id);
  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;
    
    const newOrder = [...accountOrder];
    const draggedIndex = newOrder.indexOf(draggedId);
    const targetIndex = newOrder.indexOf(id);
    newOrder[draggedIndex] = newOrder[targetIndex];
    newOrder[targetIndex] = draggedId;
    setAccountOrder(newOrder);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={needsAttention}
              onChange={(e) => setNeedsAttention(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Needs Attention</span>
          </label>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Health:</label>
            <select 
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option>All</option>
              <option>Strong</option>
              <option>Good</option>
              <option>At Risk</option>
              <option>Critical</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Tier:</label>
            <select 
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option>All</option>
              <option>Enterprise</option>
              <option>Mid-Market</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <input 
              type="checkbox" 
              checked={myAccounts}
              onChange={(e) => setMyAccounts(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">My Accounts</span>
          </label>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Account Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">ARR</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Health</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Renewal Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Open Tasks</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Unclaimed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Last Meeting</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Attention</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <React.Fragment key={account.id}>
                  <tr 
                    draggable
                    onDragStart={() => handleDragStart(account.id)}
                    onDragOver={(e) => handleDragOver(e, account.id)}
                    onDrop={() => setDraggedId(null)}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === account.id ? null : account.id)}
                  >
                    <td className="px-4 py-3">
                      <GripVertical size={18} className="text-gray-400" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{account.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{account.tier}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{account.arr}</td>
                    <td className="px-4 py-3">
                      <HealthBadge health={account.health} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{account.renewalDate}</td>
                    <td className="px-4 py-3 text-sm font-medium">{account.openTasks}</td>
                    <td className="px-4 py-3 text-sm font-medium text-orange-600">{account.unclaimedTasks}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{account.lastMeeting}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {account.attentionFlags.slice(0, 2).map((flag, i) => (
                          <FlagBadge key={i} flag={flag} />
                        ))}
                        {account.attentionFlags.length > 2 && (
                          <span className="text-xs text-gray-600">+{account.attentionFlags.length - 2}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {expandedId === account.id && (
                    <tr className="bg-blue-50 border-b border-gray-200">
                      <td colSpan="10" className="px-4 py-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Key Focus Areas</h4>
                              <ul className="space-y-1 text-sm text-gray-700">
                                {account.keyFocusAreas.map((area, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>{area}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Team Roster</h4>
                              <div className="space-y-1 text-sm">
                                {account.team.map((member, i) => (
                                  <div key={i} className="text-gray-700">
                                    <span className="font-medium">{member.role}:</span> {member.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => onAccountClick(account)}
                            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 text-sm"
                          >
                            Go to Hub →
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Account Hub View Component
const AccountHubView = ({ account, onBack }) => {
  const [focusAreas, setFocusAreas] = useState(account.keyFocusAreas);
  const [newFocusArea, setNewFocusArea] = useState('');
  const [claimedTasks, setClaimedTasks] = useState({});
  const [health, setHealth] = useState(account.health);

  const unclaimedTasksList = Array.from({ length: account.unclaimedTasks }, (_, i) => ({
    id: i,
    title: `Task ${i + 1}`,
    description: i === 0 ? 'Critical P1 issue resolution' : `Routine task ${i}`
  }));

  const meetings = [
    { date: '2026-04-03', title: 'Executive Steering Committee', hasNotes: true, recording: 'loom.com/share/xxx' },
    { date: '2026-04-01', title: 'Implementation Review', hasNotes: true, recording: 'loom.com/share/yyy' },
    { date: '2026-03-28', title: 'Quarterly Business Review', hasNotes: false, recording: 'loom.com/share/zzz' },
    { date: '2026-03-21', title: 'Technical Architecture Discussion', hasNotes: true, recording: 'loom.com/share/aaa' },
    { date: '2026-03-15', title: 'Onboarding Kickoff', hasNotes: false, recording: 'loom.com/share/bbb' }
  ];

  const pinnedMessages = [
    { author: 'Sarah Chen', timestamp: '2 days ago', text: 'Great progress on the integration! The team is excited about the new features.' },
    { author: 'Mike Johnson', timestamp: '1 week ago', text: 'Please review the updated implementation timeline before Friday\'s call.' },
    { author: 'Alex Rodriguez', timestamp: '1 week ago', text: '🎉 Successfully deployed to production! Performance metrics looking excellent.' }
  ];

  const activityFeed = [
    { type: 'confluence', title: 'Implementation Guide Updated', time: '2 hours ago', icon: '📄' },
    { type: 'jira', title: 'P1 Issue Resolved - Database Optimization', time: '4 hours ago', icon: '✅' },
    { type: 'meeting', title: 'Executive Steering Committee Scheduled', time: '1 day ago', icon: '📅' },
    { type: 'slack', title: 'Implementation team pinned key architecture docs', time: '2 days ago', icon: '📌' },
    { type: 'jira', title: '5 tasks moved to In Progress', time: '3 days ago', icon: '🔄' }
  ];

  const handleAddFocusArea = () => {
    if (newFocusArea.trim()) {
      setFocusAreas([...focusAreas, newFocusArea]);
      setNewFocusArea('');
    }
  };

  const handleRemoveFocusArea = (index) => {
    setFocusAreas(focusAreas.filter((_, i) => i !== index));
  };

  const handleClaimTask = (taskId) => {
    setClaimedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Sample support tickets
  const p1Tickets = [
    { id: 'SUP-1001', severity: 'P1', title: 'Database Connection Timeout', status: 'Active', created: '2026-04-04' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
        <div className="flex justify-between items-start mb-4">
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
          >
            ← Back to Portfolio
          </button>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{account.arr}</div>
            <div className="text-sm text-gray-600">{account.tier}</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>Renewal: {account.renewalDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Health:</span>
            <select 
              value={health}
              onChange={(e) => setHealth(e.target.value)}
              className="cursor-pointer"
            >
              <option>Strong</option>
              <option>Good</option>
              <option>At Risk</option>
              <option>Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Critical Alert */}
      {p1Tickets.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Critical Support Alert</h3>
              <p className="text-sm text-red-800 mt-1">
                {p1Tickets[0].title} ({p1Tickets[0].id}) - Created {p1Tickets[0].created}
              </p>
              <button className="text-sm text-red-700 font-medium hover:underline mt-2">
                View in Support Queue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Focus Areas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Key Focus Areas</h2>
        <div className="space-y-3">
          {focusAreas.map((area, index) => (
            <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-200">
              <input 
                type="text"
                value={area}
                onChange={(e) => {
                  const updated = [...focusAreas];
                  updated[index] = e.target.value;
                  setFocusAreas(updated);
                }}
                className="flex-1 bg-transparent text-gray-900 font-medium outline-none"
              />
              <button 
                onClick={() => handleRemoveFocusArea(index)}
                className="text-gray-400 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input 
              type="text"
              value={newFocusArea}
              onChange={(e) => setNewFocusArea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFocusArea()}
              placeholder="Add a new focus area..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500"
            />
            <button 
              onClick={handleAddFocusArea}
              className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Open Tasks', value: account.openTasks, color: 'blue' },
          { label: 'Unclaimed Tasks', value: account.unclaimedTasks, color: 'orange' },
          { label: 'Meetings (30d)', value: '8', color: 'green' },
          { label: 'Support Tickets', value: account.attentionFlags.filter(f => f.includes('Ticket')).length, color: 'red' }
        ].map((metric, i) => (
          <div key={i} className={`bg-white rounded-lg shadow p-4 border-t-4 border-${metric.color}-500`}>
            <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
            <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Activity Stream & Gray Area Queue */}
      <div className="grid grid-cols-3 gap-6">
        {/* Activity Stream */}
        <div className="col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Stream</h2>
          <div className="space-y-3">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-gray-200 last:border-0">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gray Area Queue */}
        <div className="bg-gray-50 rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Gray Area Queue</h2>
          <div className="space-y-2">
            {unclaimedTasksList.map((task) => (
              <div key={task.id} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-600">{task.description}</p>
                </div>
                <button 
                  onClick={() => handleClaimTask(task.id)}
                  className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ml-2 ${
                    claimedTasks[task.id] 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                  }`}
                >
                  {claimedTasks[task.id] ? '✓ Claimed' : 'Claim'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pinned from Slack */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📌 Pinned from Slack</h2>
        <div className="space-y-4">
          {pinnedMessages.map((msg, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-gray-900">{msg.author}</span>
                <span className="text-xs text-gray-500">{msg.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Account Team & Recent Meetings */}
      <div className="grid grid-cols-2 gap-6">
        {/* Account Team */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Team</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Role</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Owns</th>
              </tr>
            </thead>
            <tbody>
              {account.team.map((member, i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td className="px-3 py-2 font-medium text-gray-900">{member.role}</td>
                  <td className="px-3 py-2 text-gray-700">{member.name}</td>
                  <td className="px-3 py-2 text-gray-600">{member.owns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Meetings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Meetings</h2>
          <div className="space-y-3">
            {meetings.map((meeting, i) => (
              <div key={i} className="pb-3 border-b border-gray-200 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-sm text-gray-900">{meeting.title}</p>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${meeting.hasNotes ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {meeting.hasNotes ? 'Notes' : 'No Notes'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{meeting.date}</p>
                <a href="#" className="text-xs text-blue-600 hover:underline">View Recording →</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Meeting Notes', icon: '📝' },
            { label: 'Jira Board', icon: '📋' },
            { label: 'Key Docs', icon: '📚' },
            { label: 'Support Queue', icon: '🆘' }
          ].map((link, i) => (
            <button 
              key={i}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded font-medium text-sm transition"
            >
              {link.icon} {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function AccountTeamHub() {
  const [currentView, setCurrentView] = useState('portfolio');
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    setCurrentView('hub');
  };

  const handleBackToPortfolio = () => {
    setSelectedAccount(null);
    setCurrentView('portfolio');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
              <h1 className="text-xl font-bold text-gray-900">Account Team Hub</h1>
            </div>
            <div className="flex gap-6">
              <button 
                onClick={() => handleBackToPortfolio()}
                className={`font-medium text-sm pb-2 border-b-2 transition ${
                  currentView === 'portfolio' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                Portfolio View
              </button>
              {selectedAccount && (
                <button 
                  onClick={() => setCurrentView('hub')}
                  className={`font-medium text-sm pb-2 border-b-2 transition ${
                    currentView === 'hub' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {selectedAccount.name} Hub
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, Sarah Chen</span>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">SC</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'portfolio' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Portfolio Overview</h2>
              <p className="text-gray-600 mt-1">Monitor and manage your enterprise accounts</p>
            </div>
            <PortfolioView 
              accounts={SAMPLE_ACCOUNTS} 
              onAccountClick={handleAccountClick}
            />
          </div>
        ) : (
          <div>
            <AccountHubView 
              account={selectedAccount} 
              onBack={handleBackToPortfolio}
            />
          </div>
        )}
      </main>
    </div>
  );
}