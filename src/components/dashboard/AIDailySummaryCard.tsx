import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { ArrowRight } from 'lucide-react';

export const AIDailySummaryCard: React.FC = () => {
  const { dailySummary, setActiveTab } = useTracker();

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] rounded-[8px] p-6">
      
      {/* Header */}
      <div className="flex items-baseline justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="font-serif text-lg text-[var(--text)] font-normal">
            Daily Summary
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Grounded data synthesis of today's progress and next steps.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('advisor')}
          className="text-xs text-[var(--muted)] hover:text-[var(--text)] inline-flex items-center gap-1 transition-colors"
        >
          <span>Goal advisor</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Numerical Telemetry Row with hairlines */}
      <div className="grid grid-cols-4 divide-x divide-[var(--border)] py-4 border-b border-[var(--border)] text-center">
        <div>
          <div className="font-serif text-2xl text-[var(--text)] tabular-nums font-normal">
            {dailySummary.processesCompleted}
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">Done</div>
        </div>
        <div>
          <div className="font-serif text-2xl text-[var(--text)] tabular-nums font-normal">
            {dailySummary.processesPending}
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">Pending</div>
        </div>
        <div>
          <div className="font-serif text-2xl text-[var(--text)] tabular-nums font-normal">
            {dailySummary.goalRelatedActivitiesCount}
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">Goal-tied</div>
        </div>
        <div>
          <div className="font-serif text-2xl text-[var(--overdue)] tabular-nums font-normal">
            {dailySummary.processesOverdue}
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">Overdue</div>
        </div>
      </div>

      {/* AI Daily Insight */}
      <div className="pt-4 space-y-3">
        <div>
          <div className="text-xs text-[var(--muted)] font-medium mb-1">
            Data-driven observation
          </div>
          <p className="text-xs text-[var(--text)] leading-relaxed">
            {dailySummary.aiInsight}
          </p>
        </div>

        {/* Next Focus */}
        <div className="border-l-2 border-[var(--accent)] pl-3 py-1">
          <div className="text-xs text-[var(--muted)] font-medium mb-0.5">
            Recommended next focus
          </div>
          <p className="text-xs text-[var(--text)] leading-relaxed">
            {dailySummary.nextFocus}
          </p>
        </div>
      </div>

    </div>
  );
};
