import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { 
  X, 
  Target, 
  Check, 
  Plus, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import { GoalStatus } from '../../types';

export const GoalDetailModal: React.FC = () => {
  const { 
    viewingGoalId, 
    closeGoalDetail, 
    goals, 
    milestones, 
    processes, 
    history, 
    openMilestoneModal, 
    toggleMilestoneComplete, 
    updateMilestone, 
    deleteMilestone, 
    openProcessModal, 
    openGoalModal 
  } = useTracker();

  if (!viewingGoalId) return null;

  const goal = goals.find(g => g.id === viewingGoalId);
  if (!goal) return null;

  const goalMilestones = milestones
    .filter(m => m.goalId === goal.id)
    .sort((a, b) => a.order - b.order);

  const completedMilestones = goalMilestones.filter(m => m.status === 'Completed');
  const remainingMilestones = goalMilestones.filter(m => m.status !== 'Completed');

  const linkedProcesses = processes.filter(p => p.goalId === goal.id);
  const completedProcesses = linkedProcesses.filter(p => p.status === 'Completed');

  const now = new Date();
  const targetDateObj = new Date(goal.targetDate);
  const diffTime = targetDateObj.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getStatusBadge = (s: GoalStatus) => {
    switch (s) {
      case 'On Track':
        return { label: 'On Track', style: 'text-[var(--green)] border-[var(--green)]' };
      case 'At Risk':
        return { label: 'At Risk', style: 'text-[var(--tomato)] border-[var(--tomato)]' };
      case 'Behind Schedule':
        return { label: 'Behind Schedule', style: 'text-[var(--tomato-ink)] border-[var(--tomato-ink)]' };
      case 'Completed':
        return { label: 'Completed', style: 'text-[var(--green)] border-[var(--green)]' };
      default:
        return { label: 'In Progress', style: 'text-[var(--blue)] border-[var(--blue)]' };
    }
  };

  const statusBadgeInfo = getStatusBadge(goal.status);
  const goalHistory = history.filter(h => h.relatedGoalId === goal.id).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeGoalDetail}
      />

      {/* Modal Dialog */}
      <div className="planner-card relative w-full max-w-4xl bg-[var(--card)] z-10 flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 border-b border-[var(--rule)]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs">
              <span className="goal-pill">
                {goal.category}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-[9999px] border bg-[var(--paper)] ${statusBadgeInfo.style}`}>
                {statusBadgeInfo.label}
              </span>
              <span className="text-[var(--muted)]">
                Priority: {goal.priority}
              </span>
            </div>

            <h1 className="font-fraunces font-semibold text-[32px] text-[var(--ink)] leading-tight">
              {goal.name}
            </h1>
            {goal.description && (
              <p className="text-[14px] text-[var(--muted)] mt-1 max-w-2xl leading-relaxed">
                {goal.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => openGoalModal(goal)}
              className="planner-btn btn-secondary text-xs py-1.5 px-3"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit goal</span>
            </button>
            <button
              onClick={closeGoalDetail}
              className="planner-btn btn-icon w-8 h-8"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Key Metrics Band */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-[10px] border border-[var(--ink)] bg-[var(--paper)] text-center">
              <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Progress</div>
              <div className="font-fraunces font-semibold text-[28px] text-[var(--ink)] tabular-nums mt-1">
                {goal.progress}%
              </div>
            </div>
            <div className="p-3.5 rounded-[10px] border border-[var(--ink)] bg-[var(--paper)] text-center">
              <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Target Date</div>
              <div className="font-fraunces font-semibold text-[18px] text-[var(--ink)] tabular-nums mt-1">
                {goal.targetDate}
              </div>
              <div className="text-[11px] text-[var(--muted)] tabular-nums mt-0.5 font-sans">
                {daysRemaining > 0 ? `${daysRemaining}d left` : 'Due today'}
              </div>
            </div>
            <div className="p-3.5 rounded-[10px] border border-[var(--ink)] bg-[var(--paper)] text-center">
              <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Milestones</div>
              <div className="font-fraunces font-semibold text-[28px] text-[var(--green)] tabular-nums mt-1">
                {completedMilestones.length} <span className="text-[14px] text-[var(--faint)] font-sans">/ {goalMilestones.length}</span>
              </div>
            </div>
            <div className="p-3.5 rounded-[10px] border border-[var(--ink)] bg-[var(--paper)] text-center">
              <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Daily Synergy</div>
              <div className="font-fraunces font-semibold text-[28px] text-[var(--blue)] tabular-nums mt-1">
                {completedProcesses.length} <span className="text-[14px] text-[var(--faint)] font-sans">/ {linkedProcesses.length}</span>
              </div>
            </div>
          </div>

          {/* Stepper Rail Roadmap */}
          <div className="p-5 rounded-[10px] border-2 border-[var(--ink)] bg-[var(--paper)]">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-fraunces font-semibold text-[20px] text-[var(--ink)]">
                Goal Stepper & Roadmap
              </h3>
              <span className="text-xs text-[var(--muted)] tabular-nums">
                {goal.startDate} → {goal.targetDate}
              </span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-center min-w-[500px]">
                {/* Node 0: Goal Created */}
                <div className="flex flex-col items-center shrink-0 w-24 text-center">
                  <div className="w-7 h-7 rounded-full bg-[var(--green)] border-2 border-[var(--ink)] text-white flex items-center justify-center text-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-xs text-[var(--ink)] mt-1.5 font-bold">Created</span>
                  <span className="text-[11px] text-[var(--faint)] tabular-nums">{goal.startDate}</span>
                </div>

                <div className="flex-1 h-[2px] bg-[var(--ink)] shrink-0" />

                {/* Milestone Nodes */}
                {goalMilestones.map((ms, idx) => {
                  const isDone = ms.status === 'Completed';

                  return (
                    <React.Fragment key={ms.id}>
                      <div className="flex flex-col items-center shrink-0 w-28 text-center px-1">
                        <div className={`w-7 h-7 rounded-full border-2 border-[var(--ink)] flex items-center justify-center text-xs tabular-nums font-bold ${
                          isDone
                            ? 'bg-[var(--green)] text-white'
                            : 'bg-[var(--card)] text-[var(--ink)]'
                        }`}>
                          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                        </div>
                        <span className="text-xs text-[var(--ink)] mt-1.5 truncate max-w-[100px] font-medium" title={ms.name}>
                          {ms.name}
                        </span>
                        <span className="text-[11px] text-[var(--muted)] tabular-nums font-sans">
                          {ms.progress}%
                        </span>
                      </div>

                      <div className="flex-1 h-[2px] bg-[var(--ink)] shrink-0" />
                    </React.Fragment>
                  );
                })}

                {/* Final Target Node */}
                <div className="flex flex-col items-center shrink-0 w-24 text-center">
                  <div className={`w-7 h-7 rounded-full border-2 border-[var(--ink)] flex items-center justify-center text-xs ${
                    goal.progress === 100
                      ? 'bg-[var(--green)] text-white'
                      : 'bg-[var(--card)] text-[var(--ink)]'
                  }`}>
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-[var(--ink)] mt-1.5 font-bold">Target</span>
                  <span className="text-[11px] text-[var(--faint)] tabular-nums">{goal.targetDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Milestones List */}
          <div className="p-5 rounded-[10px] border-2 border-[var(--ink)] bg-[var(--card)]">
            <div className="flex items-baseline justify-between pb-3 border-b border-[var(--rule)]">
              <div>
                <h3 className="font-fraunces font-semibold text-[20px] text-[var(--ink)]">
                  Milestones
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Overall goal progress is automatically computed from phase progress.
                </p>
              </div>

              <button
                onClick={() => openMilestoneModal(goal.id)}
                className="planner-btn btn-secondary text-xs py-1 px-3"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add milestone</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--rule)]">
              {goalMilestones.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--muted)]">
                  No milestones defined yet. Break this goal into measurable phases.
                </div>
              ) : (
                goalMilestones.map((ms, idx) => {
                  const isDone = ms.status === 'Completed';

                  return (
                    <div key={ms.id} className="py-3.5 first:pt-3 last:pb-1">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleMilestoneComplete(ms.id)}
                            className="planner-checkbox"
                            aria-checked={isDone}
                            aria-label={isDone ? `Mark milestone ${ms.name} incomplete` : `Mark milestone ${ms.name} complete`}
                          >
                            {isDone && (
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

                          <div className="min-w-0">
                            <span className={`text-[14px] ${
                              isDone ? 'task-completed-label' : 'text-[var(--ink)] font-medium'
                            }`}>
                              Phase {idx + 1}: {ms.name}
                            </span>
                            {ms.description && (
                              <p className="text-[12px] text-[var(--muted)] line-clamp-1">{ms.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-fraunces font-semibold text-[16px] text-[var(--ink)] tabular-nums">
                            {ms.progress}%
                          </span>

                          <button
                            onClick={() => openMilestoneModal(goal.id, ms)}
                            className="p-1 rounded-[4px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                            title="Edit milestone"
                            aria-label="Edit milestone"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete milestone "${ms.name}"?`)) {
                                deleteMilestone(ms.id);
                              }
                            }}
                            className="p-1 rounded-[4px] text-[var(--muted)] hover:text-[var(--tomato-ink)] transition-colors"
                            title="Delete milestone"
                            aria-label="Delete milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Slider & progress */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={ms.progress}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMilestone(ms.id, { progress: val, status: val === 100 ? 'Completed' : 'In Progress' });
                          }}
                          className="flex-1 accent-[var(--tomato)] cursor-pointer h-1.5"
                        />
                        <span className="text-[11px] text-[var(--faint)] tabular-nums shrink-0">
                          Due: {ms.deadline}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Linked Daily Processes */}
          <div className="p-5 rounded-[10px] border-2 border-[var(--ink)] bg-[var(--paper)]">
            <div className="flex items-baseline justify-between pb-3 border-b border-[var(--rule)]">
              <div>
                <h3 className="font-fraunces font-semibold text-[20px] text-[var(--ink)]">
                  Linked Daily Processes ({linkedProcesses.length})
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Completed routines that directly contribute to this goal's milestone progress.
                </p>
              </div>

              <button
                onClick={() => openProcessModal()}
                className="planner-btn btn-secondary text-xs py-1 px-3"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Link process</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--rule)]">
              {linkedProcesses.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--muted)]">
                  No daily processes currently linked to this goal.
                </div>
              ) : (
                linkedProcesses.map((lp) => (
                  <div key={lp.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        lp.status === 'Completed' ? 'bg-[var(--green)]' : 'bg-[var(--tomato)]'
                      }`} />
                      <span className={lp.status === 'Completed' ? 'task-completed-label' : 'text-[var(--ink)] font-medium'}>
                        {lp.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[var(--muted)] tabular-nums">
                      <span>{lp.estimatedDuration}m</span>
                      <span>•</span>
                      <span className={lp.status === 'Completed' ? 'text-[var(--green)] font-bold' : ''}>
                        {lp.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Goal Activity History */}
          {goalHistory.length > 0 && (
            <div className="pt-2 border-t border-[var(--rule)] space-y-1.5">
              <span className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">
                Recent Audit Trail
              </span>
              <div className="space-y-1">
                {goalHistory.map(h => (
                  <div key={h.id} className="text-xs text-[var(--muted)] flex items-center justify-between">
                    <span>{h.description}</span>
                    <span className="tabular-nums text-[var(--faint)]">
                      {new Date(h.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
