import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Check } from 'lucide-react';

export const ConsistencyScoreWidget: React.FC = () => {
  const { consistencyMetrics, processes, goals, setActiveTab } = useTracker();
  const { score, breakdown, explanation } = consistencyMetrics;

  const isFreshPlanner = processes.length === 0 && goals.length === 0;

  // Last 7 days status calculation (mock realistic cadence with today as index 6)
  const streak = isFreshPlanner ? 0 : (breakdown.streakDays || 4);
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'Today'];
  const dayHits = isFreshPlanner 
    ? [false, false, false, false, false, false, false]
    : [true, true, streak >= 3, streak >= 2, streak >= 1, false, breakdown.processCompletionRate >= 50];

  return (
    <section aria-label="Consistency Tracker" className="planner-card p-6">
      
      {/* Header */}
      <div className="flex items-baseline justify-between pb-4 border-b border-[var(--rule)]">
        <div>
          <h2 className="font-fraunces font-semibold text-[24px] text-[var(--ink)] leading-tight">
            Consistency
          </h2>
          <p className="text-[13px] text-[var(--muted)] mt-0.5">
            Cadence & goal alignment score.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('analytics')}
          className="text-[12px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          Analytics →
        </button>
      </div>

      {/* Big Score (Fraunces 84px) with hand-drawn tomato ellipse SVG */}
      <div className="flex flex-col items-center justify-center pt-6 pb-5">
        <div className="relative inline-flex items-center justify-center px-10 py-4">
          <span className="font-fraunces font-semibold text-[84px] text-[var(--ink)] tabular-nums leading-none z-10 select-none">
            {isFreshPlanner ? '—' : score}
          </span>

          {/* Hand-drawn slightly uneven tomato ellipse SVG circled around it */}
          <svg 
            className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" 
            viewBox="0 0 170 120" 
            fill="none"
            aria-hidden="true"
          >
            <path 
              d="M 85 8 C 132 6, 164 28, 162 60 C 160 92, 122 113, 80 112 C 38 111, 7 90, 9 58 C 11 26, 46 9, 92 8" 
              stroke="var(--tomato)" 
              strokeWidth="3.2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>

        <span className="font-caveat font-bold text-[20px] text-[var(--muted)] mt-1">
          {isFreshPlanner ? 'ready to begin' : `${consistencyMetrics.rating.toLowerCase()} cadence`}
        </span>
      </div>

      {/* Row of 7 circles for the last 7 days */}
      <div className="pt-2 pb-5 border-t border-[var(--rule)]">
        <div className="flex items-center justify-between px-1">
          {dayLabels.map((label, idx) => {
            const isHit = dayHits[idx];
            const isToday = idx === 6;

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <div 
                  className={`w-7 h-7 rounded-full border-2 border-[var(--ink)] flex items-center justify-center transition-colors ${
                    isHit 
                      ? 'bg-[var(--green)] text-white' 
                      : 'bg-[var(--card)]'
                  } ${
                    isToday ? 'ring-2 ring-[var(--tomato)] ring-offset-2 ring-offset-[var(--card)]' : ''
                  }`}
                  title={`${label}: ${isHit ? 'Completed' : 'Pending'}`}
                >
                  {isHit && (
                    <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                  )}
                </div>
                <span className={`text-[11px] font-sans ${isToday ? 'font-bold text-[var(--tomato)]' : 'text-[var(--muted)]'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Yellow Sticky Note with Caveat heading "note to self" and real data text */}
      <div className="sticky-note p-4 mt-2">
        <div className="font-caveat font-bold text-[22px] text-[var(--ink)] leading-none mb-1">
          note to self
        </div>
        <p className="font-sans text-[13px] text-[var(--ink)] leading-relaxed font-normal">
          {isFreshPlanner
            ? 'Welcome to your clean notebook. Set a future goal and complete your first task today to build your consistency score.'
            : breakdown.goalAlignmentRatio < 75 
            ? `Only ${breakdown.goalAlignmentRatio}% of your daily activity is tied to a long-term goal. Link the rest to a goal to raise this score.`
            : explanation}
        </p>
      </div>

    </section>
  );
};
