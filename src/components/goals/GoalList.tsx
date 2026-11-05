import React, { useState, useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { GoalCard } from './GoalCard';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown 
} from 'lucide-react';
import { GoalCategory } from '../../types';

export const GoalList: React.FC = () => {
  const { goals, milestones, openGoalModal } = useTracker();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'targetDate' | 'progress' | 'name'>('targetDate');

  const categories: GoalCategory[] = [
    'Career Goal',
    'Learning Goal',
    'Project Goal',
    'Certification Goal',
    'Academic Goal',
    'Personal Development Goal',
    'Other'
  ];

  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      const matchesSearch = 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && g.status !== statusFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'targetDate') {
        return a.targetDate.localeCompare(b.targetDate);
      }
      if (sortBy === 'progress') {
        return b.progress - a.progress;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [goals, searchQuery, categoryFilter, statusFilter, sortBy]);

  const activeCount = goals.filter(g => g.status !== 'Completed').length;
  const completedCount = goals.filter(g => g.status === 'Completed').length;
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0;
  const totalMilestones = milestones.length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2">
        <div>
          <h1 className="font-fraunces font-semibold text-[36px] sm:text-[42px] text-[var(--ink)] tracking-tight leading-tight">
            Future Goals
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Map long-term ambitions into verifiable milestone roadmaps fueled by your daily processes.
          </p>
        </div>

        <button
          onClick={() => openGoalModal()}
          className="planner-btn btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add goal</span>
        </button>
      </div>

      {/* Aggregate Stats Band in Planner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="planner-card p-4 text-center">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Active Goals</div>
          <div className="font-fraunces font-semibold text-[32px] text-[var(--blue)] tabular-nums mt-1">
            {activeCount}
          </div>
        </div>
        <div className="planner-card p-4 text-center">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Overall Progress</div>
          <div className="font-fraunces font-semibold text-[32px] text-[var(--tomato)] tabular-nums mt-1">
            {avgProgress}%
          </div>
        </div>
        <div className="planner-card p-4 text-center">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Total Milestones</div>
          <div className="font-fraunces font-semibold text-[32px] text-[var(--ink)] tabular-nums mt-1">
            {totalMilestones}
          </div>
        </div>
        <div className="planner-card p-4 text-center">
          <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">Completed Goals</div>
          <div className="font-fraunces font-semibold text-[32px] text-[var(--green)] tabular-nums mt-1">
            {completedCount}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="planner-card p-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--faint)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals by name, milestones, or notes..."
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
              <option value="targetDate">Sort by Target Date</option>
              <option value="progress">Sort by Progress</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[var(--rule)] text-xs">
          <div className="flex items-center gap-1 text-[var(--muted)] mr-1">
            <Filter className="w-3 h-3" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">Filters:</span>
          </div>

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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 rounded-[6px] bg-[var(--paper)] text-[var(--ink)] border border-[var(--ink)] text-xs font-medium"
          >
            <option value="all">All Health Statuses</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Behind Schedule">Behind Schedule</option>
            <option value="Completed">Completed</option>
          </select>

          {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-[var(--tomato-ink)] hover:underline ml-auto font-bold"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Goal Cards Grid */}
      {filteredGoals.length === 0 ? (
        <div className="py-16 text-center planner-card p-8">
          <p className="font-fraunces italic text-lg text-[var(--ink)] mb-1">
            No future goals found.
          </p>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto mb-4">
            Define your long-term ambitions to link your daily activities.
          </p>
          <button
            onClick={() => openGoalModal()}
            className="planner-btn btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

    </div>
  );
};
