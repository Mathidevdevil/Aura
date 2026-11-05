import React, { useState, useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { ProcessCard } from './ProcessCard';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown 
} from 'lucide-react';
import { PriorityLevel } from '../../types';

export const ProcessList: React.FC = () => {
  const { processes, goals, openProcessModal } = useTracker();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'status' | 'name'>('deadline');

  const categories = useMemo(() => {
    return Array.from(new Set(processes.map(p => p.category).filter(Boolean)));
  }, [processes]);

  const priorityWeights: Record<PriorityLevel, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1,
  };

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const matchQuery = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchQuery) return false;

      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

      if (goalFilter === 'linked' && !p.goalId) return false;
      if (goalFilter === 'unlinked' && p.goalId) return false;
      if (goalFilter !== 'all' && goalFilter !== 'linked' && goalFilter !== 'unlinked' && p.goalId !== goalFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        return (a.deadline || '').localeCompare(b.deadline || '');
      }
      if (sortBy === 'priority') {
        return priorityWeights[b.priority] - priorityWeights[a.priority];
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [processes, searchQuery, statusFilter, priorityFilter, categoryFilter, goalFilter, sortBy]);

  const completedCount = processes.filter(p => p.status === 'Completed').length;
  const inProgressCount = processes.filter(p => p.status === 'In Progress').length;
  const linkedCount = processes.filter(p => p.goalId).length;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2">
        <div>
          <h1 className="font-fraunces font-semibold text-[36px] sm:text-[42px] text-[var(--ink)] tracking-tight leading-tight">
            My Processes
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Track daily execution routines and observe how each task advances your future goals.
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

      {/* Stats Band in Planner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="planner-card p-4 text-center">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Total Active</div>
          <div className="font-fraunces font-semibold text-[32px] text-[var(--ink)] tabular-nums mt-1">
            {processes.length}
          </div>
        </div>
        <div className="planner-card p-4 text-center">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">In Progress</div>
          <div className="font-fraunces font-semibold text-[32px] text-[var(--tomato)] tabular-nums mt-1">
            {inProgressCount}
          </div>
        </div>
        <div className="planner-card p-4 text-center">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Completed</div>
          <div className="font-fraunces font-semibold text-[32px] text-[var(--green)] tabular-nums mt-1">
            {completedCount}
          </div>
        </div>
        <div className="planner-card p-4 text-center">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Goal-Tied</div>
          <div className="font-fraunces font-semibold text-[32px] text-[var(--blue)] tabular-nums mt-1">
            {linkedCount}
          </div>
        </div>
      </div>

      {/* Search and Filters Control Center */}
      <div className="planner-card p-5 space-y-3">
        
        {/* Top: Search bar & Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--faint)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by process name, notes, or description..."
              className="w-full pl-10 pr-4 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-xs text-[var(--ink)] font-medium focus:outline-none"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Bottom: Filter Selects */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[var(--rule)] text-xs">
          <div className="flex items-center gap-1 text-[var(--muted)] mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 rounded-[6px] bg-[var(--paper)] text-[var(--ink)] border border-[var(--ink)] text-xs font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
            <option value="Overdue">Overdue</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 rounded-[6px] bg-[var(--paper)] text-[var(--ink)] border border-[var(--ink)] text-xs font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-[6px] bg-[var(--paper)] text-[var(--ink)] border border-[var(--ink)] text-xs font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="px-2.5 py-1 rounded-[6px] bg-[var(--paper)] text-[var(--ink)] border border-[var(--ink)] text-xs font-medium"
          >
            <option value="all">All Goal Links</option>
            <option value="linked">Only Linked to Goals</option>
            <option value="unlinked">Unlinked (Standalone)</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>Goal: {g.name}</option>
            ))}
          </select>

          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || goalFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
                setGoalFilter('all');
              }}
              className="text-xs text-[var(--tomato-ink)] hover:underline ml-auto font-bold"
            >
              Reset filters
            </button>
          )}
        </div>

      </div>

      {/* Process Cards Grid */}
      {filteredProcesses.length === 0 ? (
        <div className="py-16 text-center planner-card p-8">
          <p className="font-fraunces italic text-lg text-[var(--ink)] mb-1">
            {processes.length === 0 ? "No processes created yet." : "No processes match your filter."}
          </p>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto mb-4">
            {processes.length === 0 
              ? "Plan your first daily routine and connect it to a future goal."
              : "Adjust your search query or create a new daily process to start tracking."}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProcesses.map((proc) => (
            <ProcessCard key={proc.id} process={proc} />
          ))}
        </div>
      )}

    </div>
  );
};
