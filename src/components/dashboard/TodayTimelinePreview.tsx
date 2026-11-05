import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Plus } from 'lucide-react';

export const TodayTimelinePreview: React.FC = () => {
  const { 
    processes, 
    goals, 
    completeProcess, 
    reopenProcess, 
    openProcessModal,
    openGoalDetail 
  } = useTracker();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayProcesses = processes
    .filter(p => p.startDate === todayStr || (p.deadline || '').startsWith(todayStr))
    .sort((a, b) => (a.scheduledTime || '09:00').localeCompare(b.scheduledTime || '09:00'));

  const handleToggle = (id: string, currentStatus: string) => {
    if (currentStatus === 'Completed') {
      reopenProcess(id);
    } else {
      completeProcess(id);
    }
  };

  return (
    <section aria-label="Today's Activity" className="planner-card p-6 sm:p-7">
      
      {/* Header */}
      <div className="flex items-baseline justify-between pb-5 border-b border-[var(--rule)]">
        <div>
          <h2 className="font-fraunces font-semibold text-[28px] text-[var(--ink)] leading-tight">
            Today's activity
          </h2>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            What you did today, and the goal each task moves forward.
          </p>
        </div>

        <button
          onClick={() => openProcessModal()}
          className="text-[13px] font-semibold text-[var(--tomato-ink)] hover:underline inline-flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New task</span>
        </button>
      </div>

      {/* List of task rows separated by 1.5px dashed --rule lines */}
      {todayProcesses.length === 0 ? (
        <div className="py-12 text-center text-[var(--muted)]">
          <p className="font-fraunces italic text-lg text-[var(--ink)] mb-1">Nothing planned for today yet.</p>
          <p className="text-[13px] mb-4">Add your first task to plan today's routines.</p>
          <button
            onClick={() => openProcessModal()}
            className="planner-btn btn-secondary text-xs"
          >
            + Add process
          </button>
        </div>
      ) : (
        <ul className="divide-y-[1.5px] divide-dashed divide-[var(--rule)]">
          {todayProcesses.map((proc) => {
            const isCompleted = proc.status === 'Completed';
            const linkedGoal = goals.find(g => g.id === proc.goalId);

            return (
              <li
                key={proc.id}
                className="py-3.5 first:pt-4 last:pb-1 flex items-center justify-between gap-4 group"
              >
                {/* Left: 24px square checkbox (2px ink border, 6px radius) + Task Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(proc.id, proc.status)}
                    className="planner-checkbox"
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

                  <div className="flex items-baseline gap-2 min-w-0">
                    <span 
                      onClick={() => handleToggle(proc.id, proc.status)}
                      className={`text-[15px] font-medium leading-snug cursor-pointer select-none truncate ${
                        isCompleted ? 'task-completed-label' : 'text-[var(--ink)]'
                      }`}
                    >
                      {proc.name}
                    </span>

                    {proc.scheduledTime && (
                      <span className="text-[12px] text-[var(--faint)] tabular-nums shrink-0">
                        {proc.scheduledTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Goal name as a small pill tag (1.5px ink border, fully rounded) */}
                <div className="shrink-0 flex items-center">
                  {linkedGoal ? (
                    <button
                      onClick={() => openGoalDetail(linkedGoal.id)}
                      className="goal-pill hover:bg-[var(--card)] hover:border-[var(--tomato)] hover:text-[var(--tomato-ink)] transition-colors"
                      title={`Linked to: ${linkedGoal.name}`}
                    >
                      {linkedGoal.name}
                    </button>
                  ) : (
                    <span className="text-[12px] text-[var(--faint)] italic">
                      no goal
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

    </section>
  );
};
