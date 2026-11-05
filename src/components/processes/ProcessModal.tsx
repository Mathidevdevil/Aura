import React, { useState, useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { PriorityLevel, RecurrenceType, ProcessStatus } from '../../types';
import { getTodayDateString } from '../../services/storage';
import { X, Check } from 'lucide-react';

export const ProcessModal: React.FC = () => {
  const { 
    isProcessModalOpen, 
    closeProcessModal, 
    editingProcess, 
    addProcess, 
    updateProcess, 
    goals, 
    milestones 
  } = useTracker();

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Deep Work');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [deadline, setDeadline] = useState(`${getTodayDateString()}T18:00`);
  const [status, setStatus] = useState<ProcessStatus>('Not Started');
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('None');
  const [goalId, setGoalId] = useState<string>('');
  const [milestoneId, setMilestoneId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const categories = [
    'Deep Work',
    'Engineering',
    'Coding',
    'Learning',
    'Research',
    'Practice',
    'Review',
    'Design',
    'Other'
  ];

  useEffect(() => {
    if (editingProcess) {
      setName(editingProcess.name);
      setDescription(editingProcess.description || '');
      setCategory(editingProcess.category || 'Deep Work');
      setPriority(editingProcess.priority || 'Medium');
      setStartDate(editingProcess.startDate || getTodayDateString());
      setScheduledTime(editingProcess.scheduledTime || '09:00');
      setDeadline(editingProcess.deadline || `${getTodayDateString()}T18:00`);
      setStatus(editingProcess.status || 'Not Started');
      setEstimatedDuration(editingProcess.estimatedDuration || 60);
      setRecurrence(editingProcess.recurrence || 'None');
      setGoalId(editingProcess.goalId || '');
      setMilestoneId(editingProcess.milestoneId || '');
      setNotes(editingProcess.notes || '');
    } else {
      setName('');
      setDescription('');
      setCategory('Deep Work');
      setPriority('Medium');
      setStartDate(getTodayDateString());
      setScheduledTime('09:00');
      setDeadline(`${getTodayDateString()}T18:00`);
      setStatus('Not Started');
      setEstimatedDuration(60);
      setRecurrence('None');
      setGoalId(goals[0]?.id || '');
      setMilestoneId('');
      setNotes('');
    }
  }, [editingProcess, isProcessModalOpen, goals]);

  if (!isProcessModalOpen) return null;

  const availableMilestones = milestones.filter(m => m.goalId === goalId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProcess) {
      updateProcess(editingProcess.id, {
        name,
        description,
        category,
        priority,
        startDate,
        scheduledTime,
        deadline,
        status,
        estimatedDuration: Number(estimatedDuration),
        recurrence,
        goalId: goalId || undefined,
        milestoneId: milestoneId || undefined,
        notes,
      });
    } else {
      addProcess({
        name,
        description,
        category,
        priority,
        startDate,
        scheduledTime,
        deadline,
        status,
        estimatedDuration: Number(estimatedDuration),
        elapsedSeconds: 0,
        isTimerRunning: false,
        recurrence,
        goalId: goalId || undefined,
        milestoneId: milestoneId || undefined,
        notes,
      });
    }

    closeProcessModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeProcessModal}
      />

      {/* Modal Dialog */}
      <div className="planner-card relative w-full max-w-2xl bg-[var(--card)] z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-baseline justify-between px-6 py-4 border-b border-[var(--rule)]">
          <div>
            <h2 className="font-fraunces font-semibold text-[26px] text-[var(--ink)] leading-tight">
              {editingProcess ? 'Edit Process' : 'New Process'}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Specify daily task parameters and optionally link to a future goal.
            </p>
          </div>

          <button
            onClick={closeProcessModal}
            className="planner-btn btn-icon w-8 h-8"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 font-sans">
          
          {/* Process Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
              Process Name <span className="text-[var(--tomato-ink)]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Study Verilog FSMs, Synthesize RTL"
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-sm text-[var(--ink)] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief context on scope or expected deliverables"
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-sm text-[var(--ink)] focus:outline-none"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Date, Scheduled Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Scheduled Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Deadline & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Deadline
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              >
                <option value="None">None (One-off)</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Goal & Milestone Linkage */}
          <div className="p-4 rounded-[10px] border-2 border-[var(--ink)] bg-[var(--paper)] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] block">
              Link to Future Goal (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[var(--muted)] mb-1">
                  Future Goal
                </label>
                <select
                  value={goalId}
                  onChange={(e) => {
                    setGoalId(e.target.value);
                    setMilestoneId('');
                  }}
                  className="w-full px-3 py-2 rounded-[6px] bg-[var(--card)] border border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
                >
                  <option value="">No Linked Goal (Standalone)</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.progress}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[var(--muted)] mb-1">
                  Specific Milestone
                </label>
                <select
                  disabled={!goalId || availableMilestones.length === 0}
                  value={milestoneId}
                  onChange={(e) => setMilestoneId(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] bg-[var(--card)] border border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none disabled:opacity-50"
                >
                  <option value="">General Goal Progress</option>
                  {availableMilestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.progress}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProcessStatus)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Paused">Paused</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key references, checkpoints or observations"
                className="w-full px-3.5 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[var(--rule)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeProcessModal}
              className="planner-btn btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="planner-btn btn-primary text-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{editingProcess ? 'Save changes' : 'Add process'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
