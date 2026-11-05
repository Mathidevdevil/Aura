import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Filter } from 'lucide-react';
import { ActivityHistory } from '../../types';

export const ActivityHistoryView: React.FC = () => {
  const { history } = useTracker();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredHistory = history.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'completed' && item.type.includes('completed')) return true;
    if (filterType === 'goals' && item.type.includes('goal')) return true;
    if (filterType === 'milestones' && item.type.includes('milestone')) return true;
    if (filterType === 'ai' && item.type.includes('ai')) return true;
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const getDayGroupLabel = (isoDate: string) => {
    const dStr = isoDate.split('T')[0];
    if (dStr === todayStr) return 'Today';
    if (dStr === yesterdayStr) return 'Yesterday';
    return new Date(isoDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const grouped: Record<string, ActivityHistory[]> = {};
  filteredHistory.forEach(item => {
    const label = getDayGroupLabel(item.date);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2">
        <div>
          <h1 className="font-fraunces font-semibold text-[36px] sm:text-[42px] text-[var(--ink)] tracking-tight leading-tight">
            Activity History
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Complete record of routines executed, milestones updated, and deadlines adjusted.
          </p>
        </div>

        {/* Filter select */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-[var(--muted)]" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-semibold outline-none"
          >
            <option value="all">All Events ({history.length})</option>
            <option value="completed">Completions Only</option>
            <option value="goals">Goal Actions</option>
            <option value="milestones">Milestone Updates</option>
            <option value="ai">AI Suggestions</option>
          </select>
        </div>
      </div>

      {/* Grouped Activity Log in Planner Cards */}
      <div className="space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--muted)] planner-card p-8">
            <p className="font-fraunces italic text-lg text-[var(--ink)] mb-1">No activity events found.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dayLabel, items]) => (
            <div key={dayLabel} className="planner-card p-6 space-y-3">
              <div className="font-caveat font-bold text-[24px] text-[var(--tomato-ink)] pb-2 border-b border-[var(--rule)]">
                {dayLabel}
              </div>

              <ul className="divide-y-[1.5px] divide-dashed divide-[var(--rule)]">
                {items.map((event) => (
                  <li key={event.id} className="py-3 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[var(--tomato)] shrink-0" />
                      <span className="text-[14px] text-[var(--ink)] font-medium truncate">
                        {event.description}
                      </span>
                    </div>

                    <span className="text-[12px] text-[var(--faint)] tabular-nums shrink-0 font-sans">
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
