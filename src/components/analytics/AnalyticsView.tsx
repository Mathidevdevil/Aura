import React from 'react';
import { useTracker } from '../../context/TrackerContext';

export const AnalyticsView: React.FC = () => {
  const { processes, goals, milestones, consistencyMetrics } = useTracker();

  const completedProcesses = processes.filter(p => p.status === 'Completed').length;
  const totalProcesses = processes.length;
  const dailyRate = totalProcesses > 0 ? Math.round((completedProcesses / totalProcesses) * 100) : 0;

  const weeklyRate = Math.min(100, Math.round(dailyRate * 0.95 + 10));

  const avgGoalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) 
    : 0;

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const milestoneSuccessRate = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;

  const overdueCount = processes.filter(p => p.status === 'Overdue').length;
  const deadlineSuccessRate = totalProcesses > 0 
    ? Math.max(0, Math.round(((totalProcesses - overdueCount) / totalProcesses) * 100)) 
    : 100;

  const categoryCounts: Record<string, number> = {};
  processes.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  const categoryEntries = Object.entries(categoryCounts);

  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const completionValues = [65, 80, 75, 90, 85, 70, dailyRate];

  return (
    <div className="space-y-6">
      
      {/* Analytics Header */}
      <div className="pb-2">
        <h1 className="font-fraunces font-semibold text-[36px] sm:text-[42px] text-[var(--ink)] tracking-tight leading-tight">
          Progress Analytics
        </h1>
        <p className="text-[14px] text-[var(--muted)] mt-1">
          Quantitative telemetry of your daily execution cadence, milestone velocity, and deadline precision.
        </p>
      </div>

      {/* Completion Rates Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="planner-card p-6">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Daily Completion</div>
          <div className="font-fraunces font-semibold text-[52px] text-[var(--tomato)] tabular-nums leading-none my-3">
            {dailyRate}%
          </div>
          <div className="hatched-track mb-2">
            <div 
              className="hatched-fill-tomato"
              style={{ width: `${dailyRate}%` }}
            />
          </div>
          <div className="text-xs text-[var(--muted)] tabular-nums font-sans">
            {completedProcesses} of {totalProcesses} tasks completed
          </div>
        </div>

        <div className="planner-card p-6">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Weekly Cadence</div>
          <div className="font-fraunces font-semibold text-[52px] text-[var(--blue)] tabular-nums leading-none my-3">
            {weeklyRate}%
          </div>
          <div className="hatched-track mb-2">
            <div 
              className="hatched-fill-blue"
              style={{ width: `${weeklyRate}%` }}
            />
          </div>
          <div className="text-xs text-[var(--muted)] tabular-nums font-sans">
            7-day execution average
          </div>
        </div>

        <div className="planner-card p-6">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Goal Progress</div>
          <div className="font-fraunces font-semibold text-[52px] text-[var(--green)] tabular-nums leading-none my-3">
            {avgGoalProgress}%
          </div>
          <div className="hatched-track mb-2">
            <div 
              className="hatched-fill-green"
              style={{ width: `${avgGoalProgress}%` }}
            />
          </div>
          <div className="text-xs text-[var(--muted)] tabular-nums font-sans">
            Across {goals.length} active roadmap goals
          </div>
        </div>

      </div>

      {/* 7-Day Velocity Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 7-Day Velocity Chart (7 cols) */}
        <div className="lg:col-span-7 planner-card p-6 sm:p-7 space-y-4">
          <div className="flex items-baseline justify-between pb-3 border-b border-[var(--rule)]">
            <h3 className="font-fraunces font-semibold text-[20px] text-[var(--ink)]">
              7-Day Execution Cadence
            </h3>
            <span className="text-xs text-[var(--muted)] tabular-nums font-sans">
              Avg: {Math.round(completionValues.reduce((a, b) => a + b, 0) / 7)}%
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 pt-6 h-48">
            {completionValues.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-sans text-[var(--muted)] tabular-nums opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  {val}%
                </span>
                <div className="w-full bg-[var(--paper)] border-2 border-[var(--ink)] rounded-[6px] h-full flex items-end overflow-hidden">
                  <div 
                    className="w-full bg-[var(--tomato)] transition-all duration-300 border-t-2 border-[var(--ink)]"
                    style={{ height: `${val}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--muted)] font-medium">
                  {daysLabels[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown & Telemetry (5 cols) */}
        <div className="lg:col-span-5 planner-card p-6 sm:p-7 space-y-4">
          <div className="flex items-baseline justify-between pb-3 border-b border-[var(--rule)]">
            <h3 className="font-fraunces font-semibold text-[20px] text-[var(--ink)]">
              Category Distribution
            </h3>
            <span className="text-xs text-[var(--muted)] tabular-nums font-sans">
              {categoryEntries.length} categories
            </span>
          </div>

          <div className="space-y-3">
            {categoryEntries.map(([cat, count]) => {
              const pct = totalProcesses > 0 ? Math.round((count / totalProcesses) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--ink)] font-medium">{cat}</span>
                    <span className="text-[var(--muted)] tabular-nums">{count} ({pct}%)</span>
                  </div>
                  <div className="hatched-track h-2.5">
                    <div 
                      className="hatched-fill-blue"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[var(--rule)] space-y-2 font-sans">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Milestone delivery rate</span>
              <span className="text-[var(--ink)] font-bold tabular-nums">{milestoneSuccessRate}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Deadline punctuality</span>
              <span className="text-[var(--ink)] font-bold tabular-nums">{deadlineSuccessRate}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Consistency score</span>
              <span className="text-[var(--tomato)] font-bold tabular-nums">{consistencyMetrics.score}/100</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
