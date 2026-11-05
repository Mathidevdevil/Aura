import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Goal, GoalStatus } from '../../types';
import { 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowRight 
} from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const { 
    milestones, 
    openGoalDetail, 
    openMilestoneModal, 
    openGoalModal, 
    deleteGoal 
  } = useTracker();

  const goalMilestones = milestones
    .filter(m => m.goalId === goal.id)
    .sort((a, b) => a.order - b.order);

  const completedMilestones = goalMilestones.filter(m => m.status === 'Completed').length;

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

  const statusBadge = getStatusBadge(goal.status);

  const handleDelete = () => {
    if (window.confirm(`Delete goal "${goal.name}" and all associated milestones?`)) {
      deleteGoal(goal.id);
    }
  };

  return (
    <div className="planner-card p-6 flex flex-col justify-between">
      
      <div>
        {/* Top Header: Category, Status & Action menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-[9999px] border border-[var(--rule)] text-[var(--muted)] bg-[var(--paper)]">
              {goal.category}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-[9999px] border bg-[var(--paper)] ${statusBadge.style}`}>
              {statusBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => openGoalModal(goal)}
              className="p-1 rounded-[6px] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
              title="Edit goal"
              aria-label="Edit goal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded-[6px] text-[var(--muted)] hover:text-[var(--tomato-ink)] hover:bg-[var(--paper)] transition-colors"
              title="Delete goal"
              aria-label="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Goal Name & Progress Percentage */}
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h3 
            onClick={() => openGoalDetail(goal.id)}
            className="font-fraunces font-semibold text-[20px] text-[var(--ink)] hover:text-[var(--tomato)] transition-colors cursor-pointer leading-snug"
          >
            {goal.name}
          </h3>

          <span className="font-fraunces font-semibold text-[26px] text-[var(--ink)] tabular-nums shrink-0">
            {goal.progress}%
          </span>
        </div>

        {goal.description && (
          <p className="text-[13px] text-[var(--muted)] line-clamp-2 leading-relaxed mb-4">
            {goal.description}
          </p>
        )}

        {/* Hatched Blue Progress Bar */}
        <div className="hatched-track mb-5">
          <div 
            className="hatched-fill-blue"
            style={{ width: `${goal.progress}%` }}
          />
        </div>

        {/* Milestones Roadmap Preview */}
        <div className="pt-3 border-t border-[var(--rule)] mb-4">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="text-[var(--muted)] font-medium">
              Milestones ({completedMilestones} of {goalMilestones.length} done)
            </span>
            <button
              onClick={() => openMilestoneModal(goal.id)}
              className="text-xs text-[var(--tomato-ink)] hover:underline inline-flex items-center gap-0.5 font-semibold"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>

          {goalMilestones.length === 0 ? (
            <p className="text-xs text-[var(--faint)] italic">No milestones yet. Click Add to define roadmap.</p>
          ) : (
            <div className="space-y-2.5">
              {goalMilestones.slice(0, 3).map((ms, idx) => (
                <div key={ms.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className={`truncate ${
                      ms.status === 'Completed' ? 'line-through text-[var(--faint)]' : 'text-[var(--ink)] font-medium'
                    }`}>
                      {idx + 1}. {ms.name}
                    </span>
                    <span className="tabular-nums text-[var(--muted)] text-[12px] shrink-0 font-medium">
                      {ms.status === 'Completed' ? 'Done' : `${ms.progress}%`}
                    </span>
                  </div>
                  <div className="hatched-track h-2">
                    <div 
                      className={ms.status === 'Completed' ? "hatched-fill-green" : "hatched-fill-blue"}
                      style={{ width: `${ms.progress}%` }}
                    />
                  </div>
                </div>
              ))}

              {goalMilestones.length > 3 && (
                <div className="text-[11px] text-[var(--faint)] pt-1 font-caveat font-bold text-base">
                  +{goalMilestones.length - 3} more phases planned
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Card Footer: Target Date & Detail Link */}
      <div className="pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs text-[var(--muted)]">
        <div className="flex items-center gap-1.5 tabular-nums">
          <Calendar className="w-3.5 h-3.5 text-[var(--faint)]" />
          <span>Target: {goal.targetDate}</span>
          <span>•</span>
          <span className={daysRemaining <= 14 ? 'text-[var(--tomato-ink)] font-bold' : ''}>
            {daysRemaining > 0 ? `${daysRemaining}d left` : 'Due today'}
          </span>
        </div>

        <button
          onClick={() => openGoalDetail(goal.id)}
          className="text-xs text-[var(--ink)] hover:text-[var(--tomato)] font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>Deep view</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
