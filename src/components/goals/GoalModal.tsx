import React, { useState, useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { GoalCategory, PriorityLevel, GoalStatus } from '../../types';
import { getTodayDateString, getRelativeDate } from '../../services/storage';
import { X, Check } from 'lucide-react';

export const GoalModal: React.FC = () => {
  const { isGoalModalOpen, closeGoalModal, editingGoal, addGoal, updateGoal } = useTracker();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Career Goal');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [targetDate, setTargetDate] = useState(getRelativeDate(180));
  const [status, setStatus] = useState<GoalStatus>('In Progress');
  const [notes, setNotes] = useState('');

  const categories: GoalCategory[] = [
    'Career Goal',
    'Learning Goal',
    'Project Goal',
    'Certification Goal',
    'Academic Goal',
    'Personal Development Goal',
    'Other'
  ];

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setDescription(editingGoal.description || '');
      setCategory(editingGoal.category || 'Career Goal');
      setPriority(editingGoal.priority || 'High');
      setStartDate(editingGoal.startDate || getTodayDateString());
      setTargetDate(editingGoal.targetDate || getRelativeDate(180));
      setStatus(editingGoal.status || 'In Progress');
      setNotes(editingGoal.notes || '');
    } else {
      setName('');
      setDescription('');
      setCategory('Career Goal');
      setPriority('High');
      setStartDate(getTodayDateString());
      setTargetDate(getRelativeDate(180));
      setStatus('In Progress');
      setNotes('');
    }
  }, [editingGoal, isGoalModalOpen]);

  if (!isGoalModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name,
        description,
        category,
        priority,
        startDate,
        targetDate,
        status,
        notes,
      });
    } else {
      addGoal({
        name,
        description,
        category,
        priority,
        startDate,
        targetDate,
        progress: 0,
        status,
        notes,
      });
    }

    closeGoalModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeGoalModal}
      />

      <div className="planner-card relative w-full max-w-xl bg-[var(--card)] z-10 flex flex-col max-h-[90vh]">
        
        <div className="flex items-baseline justify-between px-6 py-4 border-b border-[var(--rule)]">
          <div>
            <h2 className="font-fraunces font-semibold text-[26px] text-[var(--ink)] leading-tight">
              {editingGoal ? 'Edit Goal' : 'New Future Goal'}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Define target delivery date and roadmap parameters.
            </p>
          </div>

          <button
            onClick={closeGoalModal}
            className="planner-btn btn-icon w-8 h-8"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 font-sans">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
              Goal Name <span className="text-[var(--tomato-ink)]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Become a VLSI Engineer, Master AI Agents"
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-sm text-[var(--ink)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High-level ambition, criteria for success, or motivation"
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-sm text-[var(--ink)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Start Date
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
                Target Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Health Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Behind Schedule">Behind Schedule</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Checkpoints or additional context"
                className="w-full px-3.5 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--rule)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeGoalModal}
              className="planner-btn btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="planner-btn btn-primary text-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{editingGoal ? 'Save changes' : 'Create goal'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
