import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { 
  Check, 
  Play, 
  Pause, 
  Plus 
} from 'lucide-react';

export const DailyTimelineView: React.FC = () => {
  const { 
    processes, 
    goals, 
    completeProcess, 
    startProcess, 
    pauseProcess, 
    reopenProcess, 
    openProcessModal, 
    openGoalDetail 
  } = useTracker();

  const todayDateObj = new Date();
  const todayStr = todayDateObj.toISOString().split('T')[0];
  const formattedToday = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const todayProcesses = processes
    .filter(p => p.startDate === todayStr || (p.deadline || '').startsWith(todayStr))
    .sort((a, b) => (a.scheduledTime || '09:00').localeCompare(b.scheduledTime || '09:00'));

  const completedToday = todayProcesses.filter(p => p.status === 'Completed').length;
  const totalToday = todayProcesses.length;
  const dailyProgress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const goalConnectedCount = todayProcesses.filter(p => p.goalId).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2">
        <div>
          <div className="font-caveat font-bold text-[24px] text-[var(--tomato-ink)] leading-none mb-1">
            {formattedToday}
          </div>
          <h1 className="font-fraunces font-semibold text-[36px] sm:text-[42px] text-[var(--ink)] tracking-tight leading-tight">
            Daily Timeline
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Chronological schedule of your day's routines and their link to your goals.
          </p>
        </div>

        <button
          onClick={() => openProcessModal()}
          className="planner-btn btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add process</span>
        </button>
      </div>

      {/* Progress Band */}
      <div className="planner-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--rule)] gap-4 items-center">
          <div className="pr-4">
            <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Daily Progress</div>
            <div className="font-fraunces font-semibold text-[44px] text-[var(--ink)] tabular-nums leading-none mt-1">
              {dailyProgress}%
            </div>
          </div>

          <div className="sm:col-span-2 sm:pl-4 space-y-2">
            <div className="hatched-track">
              <div 
                className="hatched-fill-tomato"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--muted)] tabular-nums font-sans">
              <span>{completedToday} of {totalToday} tasks finished</span>
              <span>{goalConnectedCount} connected to future goals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Timeline Stream */}
      <div className="planner-card p-6 sm:p-7">
        
        {todayProcesses.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--muted)]">
            <p className="font-fraunces italic text-lg text-[var(--ink)] mb-1">No tasks scheduled for today.</p>
            <p className="max-w-sm mx-auto mb-4">
              Add your engineering, study, or project sessions to view your timeline.
            </p>
            <button
              onClick={() => openProcessModal()}
              className="planner-btn btn-primary text-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add process</span>
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            {todayProcesses.map((proc, index) => {
              const isCompleted = proc.status === 'Completed';
              const isRunning = proc.isTimerRunning;
              const linkedGoal = goals.find(g => g.id === proc.goalId);
              const isLast = index === todayProcesses.length - 1;

              const elapsed = proc.elapsedSeconds || 0;
              const mins = Math.floor(elapsed / 60);
              const secs = elapsed % 60;
              const timerStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

              return (
                <div key={proc.id} className="flex gap-4 sm:gap-6 group">
                  
                  {/* Left Column: Scheduled Hour + Ink Line */}
                  <div className="flex flex-col items-center shrink-0 w-12 sm:w-16">
                    <span className="text-xs font-sans tabular-nums text-[var(--muted)] font-medium mb-1.5">
                      {proc.scheduledTime || '09:00'}
                    </span>

                    <button
                      type="button"
                      onClick={() => isCompleted ? reopenProcess(proc.id) : completeProcess(proc.id)}
                      className="planner-checkbox z-10"
                      aria-checked={isCompleted}
                      aria-label={isCompleted ? `Mark ${proc.name} incomplete` : `Mark ${proc.name} complete`}
                    >
                      {isCompleted && (
                        <svg 
                          className="w-7 h-7 -mt-1 -ml-0.5 overflow-visible" 
                          viewBox="0 0 28 28" 
                          fill="none"
                          aria-hidden="true"
                        >
                          <path 
                            d="M 4 14 L 11 22 L 25 5" 
                            stroke="var(--tomato)" 
                            strokeWidth="3.4" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        </svg>
                      )}
                    </button>

                    {!isLast && (
                      <div className="w-[2px] flex-1 my-1 bg-[var(--ink)]" />
                    )}
                  </div>

                  {/* Right Column: Process Block */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className={`p-4 rounded-[10px] border-2 border-[var(--ink)] bg-[var(--card)] transition-colors ${
                      isCompleted ? 'opacity-80' : isRunning ? 'border-[var(--tomato)]' : ''
                    }`}>
                      
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-[15px] font-medium ${
                            isCompleted ? 'task-completed-label' : 'text-[var(--ink)]'
                          }`}>
                            {proc.name}
                          </h3>

                          {proc.priority === 'Critical' && (
                            <span className="text-[11px] text-[var(--tomato-ink)] font-bold">
                              urgent
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-[var(--faint)] tabular-nums">
                          {proc.estimatedDuration}m
                        </span>
                      </div>

                      {proc.description && (
                        <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">
                          {proc.description}
                        </p>
                      )}

                      {/* Goal Connection & Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--rule)]">
                        <div>
                          {linkedGoal ? (
                            <button 
                              onClick={() => openGoalDetail(linkedGoal.id)}
                              className="goal-pill hover:border-[var(--tomato)] hover:text-[var(--tomato-ink)] transition-colors"
                            >
                              Goal: {linkedGoal.name} ({linkedGoal.progress}%)
                            </button>
                          ) : (
                            <span className="text-xs text-[var(--faint)] italic">
                              Standalone routine
                            </span>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          {isRunning && (
                            <span className="text-xs text-[var(--tomato)] tabular-nums font-bold mr-1">
                              {timerStr}
                            </span>
                          )}

                          {!isCompleted ? (
                            <>
                              <button
                                onClick={() => isRunning ? pauseProcess(proc.id) : startProcess(proc.id)}
                                className="planner-btn btn-secondary text-xs py-1 px-2.5"
                              >
                                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                <span>{isRunning ? 'Pause' : 'Focus'}</span>
                              </button>

                              <button
                                onClick={() => completeProcess(proc.id)}
                                className="planner-btn btn-primary text-xs py-1 px-2.5"
                              >
                                <span>Done</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => reopenProcess(proc.id)}
                              className="planner-btn btn-secondary text-xs py-1 px-2.5"
                            >
                              Reopen
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
