import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { HeroHeader } from './HeroHeader';
import { GoalContributionBanner } from './GoalContributionBanner';
import { ConsistencyScoreWidget } from './ConsistencyScoreWidget';
import { TodayTimelinePreview } from './TodayTimelinePreview';
import { BookOpen } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { processes, goals, openGoalModal, openProcessModal, loadDemoData } = useTracker();
  const isFreshPlanner = processes.length === 0 && goals.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 3, 4, 5: Greeting block, Stats Row, Caveat Scribble */}
      <HeroHeader />

      {/* Fresh Planner Onboarding Guidance Card (shown when empty) */}
      {isFreshPlanner && (
        <div className="planner-card p-6 sm:p-7 bg-[var(--card)] border-2 border-[var(--ink)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--rule)] pb-4">
            <div>
              <h2 className="font-fraunces font-semibold text-[26px] text-[var(--ink)] leading-tight">
                Your planner is a clean canvas
              </h2>
              <p className="text-[14px] text-[var(--muted)] mt-1">
                Aura has two pillars: set your future goals, and execute daily processes that push them forward.
              </p>
            </div>
            <button
              onClick={loadDemoData}
              className="text-xs font-semibold text-[var(--tomato-ink)] hover:underline inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Or explore with sample data</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Step 1: Add a Goal */}
            <div 
              onClick={() => openGoalModal()}
              className="p-4 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-[10px] shadow-[2px_2px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--blue)] text-white flex items-center justify-center shrink-0 border-2 border-[var(--ink)] font-bold text-sm">
                1
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[var(--ink)] group-hover:text-[var(--tomato-ink)]">
                    Create a Future Goal
                  </span>
                  <span className="font-caveat font-bold text-base text-[var(--tomato-ink)]">step 1</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                  Career, learning, certification, or project goal with target date.
                </p>
              </div>
            </div>

            {/* Step 2: Add a Daily Process */}
            <div 
              onClick={() => openProcessModal()}
              className="p-4 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-[10px] shadow-[2px_2px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--tomato)] text-white flex items-center justify-center shrink-0 border-2 border-[var(--ink)] font-bold text-sm">
                2
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[var(--ink)] group-hover:text-[var(--tomato-ink)]">
                    Plan Today's Process
                  </span>
                  <span className="font-caveat font-bold text-base text-[var(--tomato-ink)]">step 2</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                  Add today's tasks and link them to your goal to build consistency.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Two columns (1.5fr / 1fr, gap 28px). Under 1060px: stacks vertically */}
      <div className="grid grid-cols-1 lg-custom:grid-cols-[1.5fr_1fr] gap-7 items-start">
        
        {/* Left Card: "Today's activity" */}
        <TodayTimelinePreview />

        {/* Right Column (Two cards: Goals, Consistency) */}
        <div className="space-y-7">
          {/* Card (a): Goals */}
          <GoalContributionBanner />

          {/* Card (b): Consistency with 84px Score, 7 Day Circles & Sticky Note */}
          <ConsistencyScoreWidget />
        </div>

      </div>

    </div>
  );
};
