import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Plus 
} from 'lucide-react';
import { getTodayDateString } from '../../services/storage';

export const CalendarView: React.FC = () => {
  const { processes, goals, milestones, openProcessModal, openGoalDetail } = useTracker();

  // Current calendar viewing month/year
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(getTodayDateString());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayStr(getTodayDateString());
  };

  const getDayItems = (dayNum: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    const dayProcesses = processes.filter(p => p.startDate === dateStr || p.deadline.startsWith(dateStr));
    const dayMilestones = milestones.filter(m => m.deadline === dateStr);
    const dayGoalTargets = goals.filter(g => g.targetDate === dateStr);

    return {
      dateStr,
      processes: dayProcesses,
      milestones: dayMilestones,
      goalTargets: dayGoalTargets,
      totalCount: dayProcesses.length + dayMilestones.length + dayGoalTargets.length,
    };
  };

  const selectedDayData = React.useMemo(() => {
    const dayProcesses = processes.filter(p => p.startDate === selectedDayStr || p.deadline.startsWith(selectedDayStr));
    const dayMilestones = milestones.filter(m => m.deadline === selectedDayStr);
    const dayGoalTargets = goals.filter(g => g.targetDate === selectedDayStr);

    return {
      dateStr: selectedDayStr,
      processes: dayProcesses,
      milestones: dayMilestones,
      goalTargets: dayGoalTargets,
    };
  }, [selectedDayStr, processes, goals, milestones]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = getTodayDateString();

  return (
    <div className="space-y-6">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2">
        <div>
          <h1 className="font-fraunces font-semibold text-[36px] sm:text-[42px] text-[var(--ink)] tracking-tight leading-tight">
            Calendar
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Visual map of scheduled processes, deadlines, and milestone target dates.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleToday}
            className="planner-btn btn-secondary text-xs"
          >
            Today
          </button>

          <div className="flex items-center border-2 border-[var(--ink)] rounded-[10px] bg-[var(--card)] p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-[var(--ink)] hover:text-[var(--tomato)] transition-colors"
              title="Previous month"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-fraunces font-semibold text-sm text-[var(--ink)] min-w-[130px] text-center px-2">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-[var(--ink)] hover:text-[var(--tomato)] transition-colors"
              title="Next month"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (8 cols), Day Detail Drawer on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6 planner-card">
          
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center border-b border-[var(--rule)] pb-2">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-xs uppercase tracking-wider text-[var(--muted)] font-bold">
                {day}
              </span>
            ))}
          </div>

          {/* Days Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-[8px] bg-[var(--paper)] opacity-40 border border-dashed border-[var(--rule)]" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const { dateStr, processes: dProc, milestones: dMs, totalCount } = getDayItems(dayNum);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDayStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDayStr(dateStr)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-[8px] border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--marker)] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]'
                      : isToday
                      ? 'bg-[var(--card)] border-[var(--tomato)]'
                      : 'bg-[var(--card)] border-[var(--rule)] hover:border-[var(--ink)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs tabular-nums font-bold ${
                      isToday
                        ? 'text-[var(--tomato)]'
                        : isSelected
                        ? 'text-[var(--ink)]'
                        : 'text-[var(--ink)]'
                    }`}>
                      {dayNum}
                    </span>

                    {totalCount > 0 && (
                      <span className="text-[10px] font-caveat font-bold text-[var(--tomato-ink)] text-sm">
                        {totalCount}
                      </span>
                    )}
                  </div>

                  {/* Micro task tags */}
                  <div className="space-y-1 overflow-hidden">
                    {dProc.slice(0, 2).map(p => (
                      <div
                        key={p.id}
                        className={`text-[10px] truncate px-1 rounded-[3px] border border-[var(--ink)] ${
                          p.status === 'Completed'
                            ? 'text-[var(--faint)] line-through bg-[var(--paper)]'
                            : 'text-[var(--ink)] bg-[var(--paper)] font-medium'
                        }`}
                      >
                        {p.name}
                      </div>
                    ))}
                    {dMs.slice(0, 1).map(m => (
                      <div
                        key={m.id}
                        className="text-[10px] truncate px-1 rounded-[3px] text-[var(--tomato-ink)] font-bold bg-[var(--paper)]"
                      >
                        ◆ {m.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Drawer (4 cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 planner-card space-y-4">
          <div className="flex items-baseline justify-between pb-3 border-b border-[var(--rule)]">
            <div>
              <h3 className="font-fraunces font-semibold text-[22px] text-[var(--ink)]">
                Agenda
              </h3>
              <p className="font-caveat font-bold text-[18px] text-[var(--tomato-ink)] mt-0.5">
                {selectedDayData.dateStr}
              </p>
            </div>

            <button
              onClick={() => openProcessModal()}
              className="planner-btn btn-secondary text-xs py-1 px-2.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>

          {/* Processes List for Selected Day */}
          <div className="space-y-3">
            <div>
              <span className="text-xs text-[var(--muted)] font-bold uppercase tracking-wider block mb-2">
                Processes ({selectedDayData.processes.length})
              </span>

              {selectedDayData.processes.length === 0 ? (
                <p className="text-xs text-[var(--faint)] italic">No processes on this date.</p>
              ) : (
                <ul className="divide-y divide-[var(--rule)]">
                  {selectedDayData.processes.map(proc => (
                    <li key={proc.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full border border-[var(--ink)] ${
                          proc.status === 'Completed' ? 'bg-[var(--green)]' : 'bg-[var(--tomato)]'
                        }`} />
                        <span className={`truncate ${
                          proc.status === 'Completed' ? 'task-completed-label' : 'text-[var(--ink)] font-medium'
                        }`}>
                          {proc.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--faint)] tabular-nums shrink-0 font-sans">
                        {proc.scheduledTime || '09:00'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Milestones on this date */}
            {selectedDayData.milestones.length > 0 && (
              <div className="pt-2 border-t border-[var(--rule)]">
                <span className="text-xs text-[var(--muted)] font-bold uppercase tracking-wider block mb-2">
                  Target Milestones ({selectedDayData.milestones.length})
                </span>
                <div className="space-y-1.5">
                  {selectedDayData.milestones.map(m => (
                    <div key={m.id} className="text-xs text-[var(--ink)] flex items-center gap-2">
                      <span className="text-[var(--tomato)] font-bold">◆</span>
                      <span className="truncate">{m.name}</span>
                      <span className="text-[11px] text-[var(--muted)] tabular-nums ml-auto font-medium">
                        {m.progress}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Goals due on this date */}
            {selectedDayData.goalTargets.length > 0 && (
              <div className="pt-2 border-t border-[var(--rule)]">
                <span className="text-xs text-[var(--muted)] font-bold uppercase tracking-wider block mb-2">
                  Goal Targets ({selectedDayData.goalTargets.length})
                </span>
                <div className="space-y-1.5">
                  {selectedDayData.goalTargets.map(g => (
                    <div 
                      key={g.id} 
                      onClick={() => openGoalDetail(g.id)}
                      className="text-xs text-[var(--ink)] hover:text-[var(--tomato)] cursor-pointer flex items-center gap-2"
                    >
                      <Target className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" />
                      <span className="truncate font-medium">{g.name}</span>
                      <span className="text-[11px] text-[var(--muted)] tabular-nums ml-auto font-medium">
                        {g.progress}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
