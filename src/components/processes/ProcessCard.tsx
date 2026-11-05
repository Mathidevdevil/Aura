import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Process, PriorityLevel, ProcessStatus } from '../../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Calendar, 
  Edit3, 
  Trash2, 
  Repeat
} from 'lucide-react';

interface ProcessCardProps {
  process: Process;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({ process }) => {
  const { 
    goals, 
    completeProcess, 
    startProcess, 
    pauseProcess, 
    reopenProcess, 
    deleteProcess, 
    openProcessModal,
    openGoalDetail 
  } = useTracker();

  const isCompleted = process.status === 'Completed';
  const isRunning = process.isTimerRunning;
  const isOverdue = process.status === 'Overdue';

  const linkedGoal = goals.find(g => g.id === process.goalId);

  // Timer format
  const elapsed = process.elapsedSeconds || 0;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timerStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'Critical':
        return 'text-[var(--tomato-ink)] border-[var(--tomato)]';
      case 'High':
        return 'text-[var(--tomato)] border-[var(--rule)]';
      case 'Medium':
        return 'text-[var(--muted)] border-[var(--rule)]';
      case 'Low':
        return 'text-[var(--faint)] border-[var(--rule)]';
    }
  };

  const getStatusBadge = (s: ProcessStatus) => {
    switch (s) {
      case 'Completed':
        return 'text-[var(--green)] border-[var(--green)]';
      case 'In Progress':
        return 'text-[var(--blue)] border-[var(--blue)]';
      case 'Paused':
        return 'text-[var(--muted)] border-[var(--rule)]';
      case 'Overdue':
        return 'text-[var(--tomato-ink)] border-[var(--tomato)]';
      default:
        return 'text-[var(--muted)] border-[var(--rule)]';
    }
  };

  const formatDeadline = (dl: string) => {
    if (!dl) return 'No deadline';
    const parts = dl.split('T');
    const date = parts[0];
    const time = parts[1] ? ` ${parts[1]}` : '';
    return `${date}${time}`;
  };

  const handleDelete = () => {
    if (window.confirm(`Delete process "${process.name}"?`)) {
      deleteProcess(process.id);
    }
  };

  return (
    <div 
      className={`planner-card p-5 flex flex-col justify-between transition-colors ${
        isCompleted ? 'opacity-85' : isRunning ? 'border-[var(--tomato)]' : ''
      }`}
    >
      {/* Top Bar: Category, Priority, Recurrence & Actions */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] px-2 py-0.5 rounded-[9999px] border border-[var(--rule)] text-[var(--muted)] bg-[var(--paper)]">
              {process.category}
            </span>

            <span className={`text-[11px] px-2 py-0.5 rounded-[9999px] border bg-[var(--paper)] ${getPriorityBadge(process.priority)}`}>
              {process.priority}
            </span>

            <span className={`text-[11px] px-2 py-0.5 rounded-[9999px] border bg-[var(--paper)] ${getStatusBadge(process.status)}`}>
              {process.status}
            </span>

            {process.recurrence !== 'None' && (
              <span className="text-[11px] px-2 py-0.5 rounded-[9999px] border border-[var(--rule)] text-[var(--muted)] flex items-center gap-1 bg-[var(--paper)]">
                <Repeat className="w-2.5 h-2.5" />
                <span>{process.recurrence}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => openProcessModal(process)}
              className="p-1 rounded-[6px] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
              title="Edit process"
              aria-label="Edit process"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded-[6px] text-[var(--muted)] hover:text-[var(--tomato-ink)] hover:bg-[var(--paper)] transition-colors"
              title="Delete process"
              aria-label="Delete process"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Process Title & 24px Square Checkbox */}
        <div className="flex items-start gap-3 mb-2.5">
          <button
            type="button"
            onClick={() => isCompleted ? reopenProcess(process.id) : completeProcess(process.id)}
            className="planner-checkbox mt-0.5"
            aria-checked={isCompleted}
            aria-label={isCompleted ? `Mark ${process.name} incomplete` : `Mark ${process.name} complete`}
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

          <div className="min-w-0 flex-1">
            <h3 className={`text-[15px] font-medium leading-snug ${
              isCompleted ? 'task-completed-label' : 'text-[var(--ink)]'
            }`}>
              {process.name}
            </h3>

            {process.description && (
              <p className="text-[13px] text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">
                {process.description}
              </p>
            )}
          </div>
        </div>

        {/* Linked Goal Tag */}
        {linkedGoal && (
          <div className="mb-3">
            <button 
              onClick={() => openGoalDetail(linkedGoal.id)}
              className="goal-pill hover:border-[var(--tomato)] hover:text-[var(--tomato-ink)] transition-colors"
            >
              Goal: {linkedGoal.name} ({linkedGoal.progress}%)
            </button>
          </div>
        )}

        {/* Notes */}
        {process.notes && (
          <div className="mb-3 p-2 rounded-[6px] border border-[var(--rule)] bg-[var(--paper)] text-[12px] text-[var(--muted)] italic">
            "{process.notes}"
          </div>
        )}
      </div>

      {/* Bottom Info & Action Controls */}
      <div className="pt-3 border-t border-[var(--rule)] space-y-2.5">
        
        {/* Timing Meta: Scheduled Hour & Deadline */}
        <div className="flex items-center justify-between text-[12px] text-[var(--muted)]">
          <div className="flex items-center gap-1.5 tabular-nums">
            <Clock className="w-3 h-3 text-[var(--faint)]" />
            <span>{process.scheduledTime || '09:00'} ({process.estimatedDuration}m)</span>
          </div>

          <div className={`flex items-center gap-1 tabular-nums ${
            isOverdue ? 'text-[var(--tomato-ink)] font-semibold' : 'text-[var(--muted)]'
          }`}>
            <Calendar className="w-3 h-3 text-[var(--faint)]" />
            <span>{formatDeadline(process.deadline)}</span>
          </div>
        </div>

        {/* Stopwatch & Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          
          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="flex items-center gap-1 text-[12px] font-bold text-[var(--tomato)] tabular-nums">
                <span className="w-2 h-2 rounded-full bg-[var(--tomato)] animate-pulse" />
                {timerStr}
              </span>
            )}
            {!isRunning && elapsed > 0 && (
              <span className="text-[12px] text-[var(--faint)] tabular-nums">
                Logged: {Math.floor(elapsed / 60)}m
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <>
                <button
                  onClick={() => isRunning ? pauseProcess(process.id) : startProcess(process.id)}
                  className="planner-btn btn-secondary text-xs py-1 px-2.5"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => completeProcess(process.id)}
                  className="planner-btn btn-primary text-xs py-1 px-2.5"
                >
                  <span>Done</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => reopenProcess(process.id)}
                className="planner-btn btn-secondary text-xs py-1 px-2.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reopen</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
