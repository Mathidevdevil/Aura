import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { ArrowRight, Plus } from 'lucide-react';

export const GoalContributionBanner: React.FC = () => {
  const { goals, openGoalDetail, openGoalModal, setActiveTab } = useTracker();

  return (
    <section aria-label="Goals Overview" className="planner-card p-6">
      
      {/* Header */}
      <div className="flex items-baseline justify-between pb-4 border-b border-[var(--rule)]">
        <div>
          <h2 className="font-fraunces font-semibold text-[24px] text-[var(--ink)] leading-tight">
            Goals
          </h2>
          <p className="text-[13px] text-[var(--muted)] mt-0.5">
            Active long-term milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openGoalModal()}
            className="text-[12px] font-semibold text-[var(--tomato-ink)] hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>New</span>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className="text-[12px] text-[var(--muted)] hover:text-[var(--ink)] inline-flex items-center gap-1"
          >
            <span>All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* One row per goal with name, Fraunces percentage, and hatched bar */}
      {goals.length === 0 ? (
        <div className="py-8 text-center text-xs text-[var(--muted)]">
          <p className="font-fraunces italic text-base text-[var(--ink)] mb-1">No goals created yet.</p>
          <button
            onClick={() => openGoalModal()}
            className="planner-btn btn-secondary text-xs mt-2"
          >
            Create goal
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--rule)] pt-1">
          {goals.map((goal) => (
            <li
              key={goal.id}
              onClick={() => openGoalDetail(goal.id)}
              className="py-3.5 first:pt-3 last:pb-1 cursor-pointer group"
            >
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <span className="text-[14px] font-medium text-[var(--ink)] group-hover:text-[var(--tomato-ink)] transition-colors truncate">
                  {goal.name}
                </span>

                <span className="font-fraunces font-semibold text-[18px] text-[var(--ink)] tabular-nums shrink-0">
                  {goal.progress}%
                </span>
              </div>

              {/* Hatched blue bar */}
              <div className="hatched-track">
                <div 
                  className="hatched-fill-blue"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

    </section>
  );
};
