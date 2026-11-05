import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Process } from '../../types';
import { getTodayDateString, getRelativeDate } from '../../services/storage';
import { 
  Edit2, 
  Save, 
  X 
} from 'lucide-react';

export const DeadlineTrackerView: React.FC = () => {
  const { processes, updateProcess, completeProcess, goals } = useTracker();
  
  // State for inline deadline editor
  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null);
  const [newDeadlineVal, setNewDeadlineVal] = useState<string>('');

  const todayStr = getTodayDateString();
  const tomorrowStr = getRelativeDate(1);
  const endOfWeekStr = getRelativeDate(7);

  // Group processes by urgency
  const overdue: Process[] = [];
  const dueToday: Process[] = [];
  const dueTomorrow: Process[] = [];
  const dueThisWeek: Process[] = [];
  const upcoming: Process[] = [];

  processes.forEach(p => {
    if (p.status === 'Completed') return;
    if (!p.deadline) return;

    const dateOnly = p.deadline.split('T')[0];

    if (p.status === 'Overdue' || dateOnly < todayStr) {
      overdue.push(p);
    } else if (dateOnly === todayStr) {
      dueToday.push(p);
    } else if (dateOnly === tomorrowStr) {
      dueTomorrow.push(p);
    } else if (dateOnly <= endOfWeekStr) {
      dueThisWeek.push(p);
    } else {
      upcoming.push(p);
    }
  });

  const handleStartEdit = (proc: Process) => {
    setEditingDeadlineId(proc.id);
    setNewDeadlineVal(proc.deadline || `${todayStr}T18:00`);
  };

  const handleSaveDeadline = (id: string) => {
    if (newDeadlineVal) {
      updateProcess(id, { deadline: newDeadlineVal });
    }
    setEditingDeadlineId(null);
  };

  const renderDeadlineGroup = (
    title: string,
    list: Process[],
    tone?: 'overdue' | 'accent' | 'default'
  ) => {
    return (
      <div className="planner-card p-6">
        <div className="flex items-baseline justify-between pb-3 border-b border-[var(--rule)] mb-2">
          <div>
            <h3 className={`font-fraunces font-semibold text-[20px] ${
              tone === 'overdue' ? 'text-[var(--tomato-ink)]' : 'text-[var(--ink)]'
            }`}>
              {title}
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {list.length} {list.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>

          <span className="font-fraunces font-semibold text-[18px] tabular-nums text-[var(--muted)]">
            {list.length}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--faint)] italic">
            No deadlines scheduled in this window.
          </div>
        ) : (
          <ul className="divide-y-[1.5px] divide-dashed divide-[var(--rule)]">
            {list.map((proc) => {
              const isEditing = editingDeadlineId === proc.id;
              const linkedGoal = goals.find(g => g.id === proc.goalId);

              return (
                <li key={proc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => completeProcess(proc.id)}
                      className="planner-checkbox"
                      title="Mark complete"
                      aria-label={`Mark ${proc.name} complete`}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-medium text-[var(--ink)] truncate">
                          {proc.name}
                        </span>
                        {proc.priority === 'Critical' && (
                          <span className="text-[11px] text-[var(--tomato-ink)] font-bold">
                            urgent
                          </span>
                        )}
                      </div>

                      {linkedGoal && (
                        <div className="mt-1">
                          <span className="goal-pill text-[11px] py-0.5 px-2">
                            {linkedGoal.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: Deadline edit & controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="datetime-local"
                          value={newDeadlineVal}
                          onChange={(e) => setNewDeadlineVal(e.target.value)}
                          className="px-2 py-1 rounded-[6px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveDeadline(proc.id)}
                          className="planner-btn btn-primary text-xs py-1 px-2"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingDeadlineId(null)}
                          className="planner-btn btn-secondary text-xs py-1 px-2"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--muted)] tabular-nums font-medium font-sans">
                          {proc.deadline?.replace('T', ' ')}
                        </span>
                        <button
                          onClick={() => handleStartEdit(proc)}
                          className="p-1 rounded-[4px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                          title="Edit deadline"
                          aria-label="Edit deadline"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-2">
        <h1 className="font-fraunces font-semibold text-[36px] sm:text-[42px] text-[var(--ink)] tracking-tight leading-tight">
          Deadlines
        </h1>
        <p className="text-[14px] text-[var(--muted)] mt-1">
          Review time-sensitive tasks categorized by urgency. Edit deadlines anytime.
        </p>
      </div>

      {/* Summary Band */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        <div className="planner-card p-4">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Overdue</div>
          <div className={`font-fraunces font-semibold text-[28px] tabular-nums mt-1 ${
            overdue.length > 0 ? 'text-[var(--tomato-ink)]' : 'text-[var(--ink)]'
          }`}>
            {overdue.length}
          </div>
        </div>
        <div className="planner-card p-4">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Due Today</div>
          <div className="font-fraunces font-semibold text-[28px] text-[var(--tomato)] tabular-nums mt-1">
            {dueToday.length}
          </div>
        </div>
        <div className="planner-card p-4">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Tomorrow</div>
          <div className="font-fraunces font-semibold text-[28px] text-[var(--blue)] tabular-nums mt-1">
            {dueTomorrow.length}
          </div>
        </div>
        <div className="planner-card p-4">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">This Week</div>
          <div className="font-fraunces font-semibold text-[28px] text-[var(--ink)] tabular-nums mt-1">
            {dueThisWeek.length}
          </div>
        </div>
        <div className="planner-card p-4">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Upcoming</div>
          <div className="font-fraunces font-semibold text-[28px] text-[var(--faint)] tabular-nums mt-1">
            {upcoming.length}
          </div>
        </div>
      </div>

      {/* Urgency Groups */}
      <div className="space-y-6">
        {renderDeadlineGroup('Overdue Deadlines', overdue, 'overdue')}
        {renderDeadlineGroup('Due Today', dueToday, 'accent')}
        {renderDeadlineGroup('Due Tomorrow', dueTomorrow)}
        {renderDeadlineGroup('Due This Week', dueThisWeek)}
        {renderDeadlineGroup('Upcoming Beyond This Week', upcoming)}
      </div>

    </div>
  );
};
