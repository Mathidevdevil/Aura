import React, { useState, useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { MilestoneStatus } from '../../types';
import { getRelativeDate } from '../../services/storage';
import { X, Check } from 'lucide-react';

export const MilestoneModal: React.FC = () => {
  const { 
    isMilestoneModalOpen, 
    closeMilestoneModal, 
    editingMilestone, 
    milestoneTargetGoalId, 
    addMilestone, 
    updateMilestone,
    goals 
  } = useTracker();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(getRelativeDate(30));
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<MilestoneStatus>('Not Started');

  const targetGoal = goals.find(g => g.id === milestoneTargetGoalId || g.id === editingMilestone?.goalId);

  useEffect(() => {
    if (editingMilestone) {
      setName(editingMilestone.name);
      setDescription(editingMilestone.description || '');
      setDeadline(editingMilestone.deadline || getRelativeDate(30));
      setProgress(editingMilestone.progress || 0);
      setStatus(editingMilestone.status || 'Not Started');
    } else {
      setName('');
      setDescription('');
      setDeadline(getRelativeDate(30));
      setProgress(0);
      setStatus('Not Started');
    }
  }, [editingMilestone, isMilestoneModalOpen]);

  if (!isMilestoneModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMilestone) {
      updateMilestone(editingMilestone.id, {
        name,
        description,
        deadline,
        progress: Number(progress),
        status: Number(progress) === 100 ? 'Completed' : status,
      });
    } else if (milestoneTargetGoalId) {
      addMilestone({
        goalId: milestoneTargetGoalId,
        name,
        description,
        deadline,
        progress: Number(progress),
        status: Number(progress) === 100 ? 'Completed' : status,
        order: 99,
      });
    }

    closeMilestoneModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeMilestoneModal}
      />

      <div className="planner-card relative w-full max-w-lg bg-[var(--card)] z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-baseline justify-between px-6 py-4 border-b border-[var(--rule)]">
          <div>
            <h2 className="font-fraunces font-semibold text-[26px] text-[var(--ink)] leading-tight">
              {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Goal: <span className="text-[var(--ink)] font-bold">{targetGoal?.name || 'Selected Goal'}</span>
            </p>
          </div>

          <button
            onClick={closeMilestoneModal}
            className="planner-btn btn-icon w-8 h-8"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 font-sans">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
              Milestone Name <span className="text-[var(--tomato-ink)]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master Verilog Syntax & Modules"
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
              placeholder="Outcome criteria for this phase"
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-sm text-[var(--ink)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
                className="w-full px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
              <span>Progress Percentage</span>
              <span className="font-fraunces text-base tabular-nums">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProgress(val);
                if (val === 100) setStatus('Completed');
              }}
              className="w-full accent-[var(--tomato)] cursor-pointer h-1.5"
            />
          </div>

          <div className="pt-4 border-t border-[var(--rule)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeMilestoneModal}
              className="planner-btn btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="planner-btn btn-primary text-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{editingMilestone ? 'Save milestone' : 'Add milestone'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
