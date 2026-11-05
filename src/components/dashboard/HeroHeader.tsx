import React from 'react';
import { useTracker } from '../../context/TrackerContext';

export const HeroHeader: React.FC = () => {
  const { 
    processes, 
    goals, 
    milestones, 
    consistencyMetrics, 
    userName,
    setActiveTab 
  } = useTracker();

  // Current formatted date in Caveat: e.g. "Thursday, 5 November"
  const now = new Date();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const day = now.getDate();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const dateFormatted = `${weekday}, ${day} ${month}`;

  // Time-aware greeting: before 12 = morning, 12:00-16:59 = afternoon, otherwise evening
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const todayStr = now.toISOString().split('T')[0];
  const todayProcesses = processes.filter(p => p.startDate === todayStr || (p.deadline || '').startsWith(todayStr));
  const completedToday = todayProcesses.filter(p => p.status === 'Completed').length;
  const remainingToday = todayProcesses.length - completedToday;

  const dailyPercentage = todayProcesses.length > 0 
    ? Math.round((completedToday / todayProcesses.length) * 100) 
    : 0;

  // Goals calculations
  const activeGoals = goals.filter(g => g.status !== 'Completed');
  const avgGoalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) 
    : 0;

  // Milestones calculations
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const milestonePercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Caveat scribble text
  const scribbleText = processes.length === 0 && goals.length === 0
    ? "your notebook is ready — add your first goal or task above"
    : todayProcesses.length === 0 
    ? "no tasks planned for today yet" 
    : remainingToday === 0 
    ? "all done, nice" 
    : `${completedToday} down, ${remainingToday} to go`;

  return (
    <section aria-label="Greeting and Overview" className="space-y-6">
      
      {/* 3. Greeting block */}
      <div>
        {/* Caveat date line in --tomato-ink */}
        <div className="font-caveat font-bold text-[24px] sm:text-[28px] text-[var(--tomato-ink)] leading-tight mb-0.5">
          {dateFormatted}
        </div>

        {/* Fraunces h1: 60px (-0.035em), under 860px 42px. Hand-drawn wavy tomato SVG underline under Mathi */}
        <h1 className="font-fraunces font-semibold text-[28px] sm:text-[40px] md-custom:text-[60px] tracking-[-0.035em] text-[var(--ink)] leading-[1.1] break-words">
          {timeGreeting},{' '}
          <span className="relative inline-block">
            <span>{userName ? `${userName}.` : 'there.'}</span>
            <svg 
              className="absolute -bottom-2 left-0 w-full h-[12px] overflow-visible pointer-events-none" 
              viewBox="0 0 140 12" 
              fill="none" 
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path 
                d="M 2 7 C 28 13, 56 2, 85 8 C 110 13, 126 3, 138 7" 
                stroke="var(--tomato)" 
                strokeWidth="3.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </h1>

        {/* Tagline in Fraunces italic 20px, --muted */}
        <p className="font-fraunces italic text-[18px] sm:text-[20px] text-[var(--muted)] mt-2">
          What are you working on today, and how is it moving your future goals?
        </p>
      </div>

      {/* 4. Stats row: 4 cards in a grid (under 1060px: 2 columns) */}
      <div className="grid grid-cols-2 lg-custom:grid-cols-4 gap-2.5 sm:gap-5">
        
        {/* Card 1: Today */}
        <div 
          onClick={() => setActiveTab('timeline')}
          className="planner-card p-3 sm:p-5 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-[11px] sm:text-[12.5px] uppercase tracking-[0.08em] text-[var(--muted)] font-semibold block truncate">
              Today's progress
            </span>
            <div className="font-fraunces font-semibold text-[26px] sm:text-[36px] md-custom:text-[52px] text-[var(--ink)] tabular-nums leading-none my-1.5 sm:my-3">
              {dailyPercentage}%
            </div>
          </div>
          <div>
            <div className="hatched-track mb-2">
              <div 
                className="hatched-fill-tomato"
                style={{ width: `${dailyPercentage}%` }}
              />
            </div>
            <div className="text-[11.5px] sm:text-[13px] text-[var(--muted)] tabular-nums truncate">
              {completedToday} of {todayProcesses.length} tasks completed
            </div>
          </div>
        </div>

        {/* Card 2: Active Goals */}
        <div 
          onClick={() => setActiveTab('goals')}
          className="planner-card p-3 sm:p-5 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-[11px] sm:text-[12.5px] uppercase tracking-[0.08em] text-[var(--muted)] font-semibold block truncate">
              Active goals
            </span>
            <div className="font-fraunces font-semibold text-[26px] sm:text-[36px] md-custom:text-[52px] text-[var(--ink)] tabular-nums leading-none my-1.5 sm:my-3">
              {activeGoals.length}
            </div>
          </div>
          <div>
            <div className="hatched-track mb-2">
              <div 
                className="hatched-fill-blue"
                style={{ width: `${avgGoalProgress}%` }}
              />
            </div>
            <div className="text-[11.5px] sm:text-[13px] text-[var(--muted)] tabular-nums truncate">
              {avgGoalProgress}% average progress
            </div>
          </div>
        </div>

        {/* Card 3: Milestones */}
        <div 
          onClick={() => setActiveTab('goals')}
          className="planner-card p-3 sm:p-5 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-[11px] sm:text-[12.5px] uppercase tracking-[0.08em] text-[var(--muted)] font-semibold block truncate">
              Milestones
            </span>
            <div className="font-fraunces font-semibold text-[26px] sm:text-[36px] md-custom:text-[52px] text-[var(--ink)] tabular-nums leading-none my-1.5 sm:my-3">
              {completedMilestones}
            </div>
          </div>
          <div>
            <div className="hatched-track mb-2">
              <div 
                className="hatched-fill-green"
                style={{ width: `${milestonePercent}%` }}
              />
            </div>
            <div className="text-[11.5px] sm:text-[13px] text-[var(--muted)] tabular-nums truncate">
              {completedMilestones} of {totalMilestones} reached
            </div>
          </div>
        </div>

        {/* Card 4: Consistency */}
        <div 
          onClick={() => setActiveTab('analytics')}
          className="planner-card p-3 sm:p-5 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-[11px] sm:text-[12.5px] uppercase tracking-[0.08em] text-[var(--muted)] font-semibold block truncate">
              Consistency
            </span>
            <div className="font-fraunces font-semibold text-[26px] sm:text-[36px] md-custom:text-[52px] text-[var(--ink)] tabular-nums leading-none my-1.5 sm:my-3">
              {consistencyMetrics.score}
            </div>
          </div>
          <div>
            <div className="hatched-track mb-2">
              <div 
                className="hatched-fill-tomato"
                style={{ width: `${consistencyMetrics.score}%` }}
              />
            </div>
            <div className="text-[11.5px] sm:text-[13px] text-[var(--muted)] tabular-nums truncate">
              {consistencyMetrics.rating} • {consistencyMetrics.breakdown.streakDays}d streak
            </div>
          </div>
        </div>

      </div>

      {/* 5. Caveat scribble below the stats */}
      <div className="flex items-center gap-2 pt-1">
        <span className="font-caveat font-bold text-[24px] text-[var(--tomato-ink)]">
          ✎ {scribbleText}
        </span>
      </div>

    </section>
  );
};
