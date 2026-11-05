import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Process, 
  Goal, 
  Milestone, 
  ActivityHistory, 
  SmartSuggestion, 
  Reminder,
  ConsistencyMetrics,
  AIDailySummary
} from '../types';
import { 
  StorageService, 
  getTodayDateString, 
  INITIAL_PROCESSES, 
  INITIAL_GOALS, 
  INITIAL_MILESTONES, 
  INITIAL_HISTORY, 
  INITIAL_SUGGESTIONS, 
  INITIAL_REMINDERS 
} from '../services/storage';
import { AIEngine, NLCommandResult } from '../services/aiEngine';
import confetti from 'canvas-confetti';

export type NavigationTab = 
  | 'dashboard' 
  | 'processes' 
  | 'timeline' 
  | 'goals' 
  | 'deadlines' 
  | 'calendar' 
  | 'analytics' 
  | 'advisor' 
  | 'history';

interface TrackerContextType {
  // Core Entities
  processes: Process[];
  goals: Goal[];
  milestones: Milestone[];
  history: ActivityHistory[];
  suggestions: SmartSuggestion[];
  reminders: Reminder[];
  
  // User Profile & Onboarding
  userName: string;
  setUserName: (name: string) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: (name: string, loadDemo: boolean) => void;
  loadDemoData: () => void;
  clearToFreshSlate: () => void;

  // Theme & Navigation
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Computed AI Metrics
  consistencyMetrics: ConsistencyMetrics;
  dailySummary: AIDailySummary;
  unreadRemindersCount: number;

  // Process Actions
  addProcess: (data: Omit<Process, 'id' | 'createdDate' | 'updatedDate'>) => Process;
  updateProcess: (id: string, updates: Partial<Process>) => void;
  deleteProcess: (id: string) => void;
  completeProcess: (id: string) => void;
  startProcess: (id: string) => void;
  pauseProcess: (id: string) => void;
  reopenProcess: (id: string) => void;

  // Goal Actions
  addGoal: (data: Omit<Goal, 'id' | 'createdDate' | 'updatedDate'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Milestone Actions
  addMilestone: (data: Omit<Milestone, 'id'>) => Milestone;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  toggleMilestoneComplete: (id: string) => void;

  // Suggestions & Reminders Actions
  acceptSuggestion: (id: string) => void;
  rejectSuggestion: (id: string) => void;
  markReminderRead: (id: string) => void;
  clearReminders: () => void;

  // AI Commands & Chat
  executeNaturalLanguage: (cmd: string) => NLCommandResult;

  // Modals Management
  isProcessModalOpen: boolean;
  editingProcess: Process | null;
  openProcessModal: (proc?: Process) => void;
  closeProcessModal: () => void;

  isGoalModalOpen: boolean;
  editingGoal: Goal | null;
  openGoalModal: (goal?: Goal) => void;
  closeGoalModal: () => void;

  isMilestoneModalOpen: boolean;
  editingMilestone: Milestone | null;
  milestoneTargetGoalId: string | null;
  openMilestoneModal: (goalId: string, ms?: Milestone) => void;
  closeMilestoneModal: () => void;

  viewingGoalId: string | null;
  openGoalDetail: (goalId: string) => void;
  closeGoalDetail: () => void;

  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  isRemindersOpen: boolean;
  setRemindersOpen: (open: boolean) => void;

  // Backup & Reset
  resetData: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('aura_tracker_theme_v1');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // User Profile & Onboarding states
  const [userName, setUserNameState] = useState<string>(() => {
    return StorageService.getUserName() || 'Mathi';
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !StorageService.hasOnboarded();
  });

  const setUserName = useCallback((name: string) => {
    const trimmed = name.trim() || 'Mathi';
    setUserNameState(trimmed);
    StorageService.saveUserName(trimmed);
  }, []);

  // Entities state
  const [processes, setProcesses] = useState<Process[]>(() => StorageService.getProcesses());
  const [goals, setGoals] = useState<Goal[]>(() => StorageService.getGoals());
  const [milestones, setMilestones] = useState<Milestone[]>(() => StorageService.getMilestones());
  const [history, setHistory] = useState<ActivityHistory[]>(() => StorageService.getHistory());
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>(() => StorageService.getSuggestions());
  const [reminders, setReminders] = useState<Reminder[]>(() => StorageService.getReminders());

  const completeOnboarding = useCallback((name: string, loadDemo: boolean) => {
    const finalName = name.trim() || 'Mathi';
    setUserName(finalName);
    StorageService.setOnboarded(true);
    setIsOnboardingOpen(false);

    if (loadDemo) {
      setProcesses(INITIAL_PROCESSES);
      setGoals(INITIAL_GOALS);
      setMilestones(INITIAL_MILESTONES);
      setHistory(INITIAL_HISTORY);
      setSuggestions(INITIAL_SUGGESTIONS);
      setReminders(INITIAL_REMINDERS);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } else {
      setProcesses([]);
      setGoals([]);
      setMilestones([]);
      setHistory([]);
      setSuggestions([]);
      setReminders([]);
      StorageService.saveProcesses([]);
      StorageService.saveGoals([]);
      StorageService.saveMilestones([]);
      StorageService.saveHistory([]);
      StorageService.saveSuggestions([]);
      StorageService.saveReminders([]);
    }
  }, [setUserName]);

  const loadDemoData = useCallback(() => {
    setProcesses(INITIAL_PROCESSES);
    setGoals(INITIAL_GOALS);
    setMilestones(INITIAL_MILESTONES);
    setHistory(INITIAL_HISTORY);
    setSuggestions(INITIAL_SUGGESTIONS);
    setReminders(INITIAL_REMINDERS);
    StorageService.setOnboarded(true);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  }, []);

  const clearToFreshSlate = useCallback(() => {
    setProcesses([]);
    setGoals([]);
    setMilestones([]);
    setHistory([]);
    setSuggestions([]);
    setReminders([]);
    StorageService.saveProcesses([]);
    StorageService.saveGoals([]);
    StorageService.saveMilestones([]);
    StorageService.saveHistory([]);
    StorageService.saveSuggestions([]);
    StorageService.saveReminders([]);
    StorageService.setOnboarded(true);
  }, []);

  // Modal states
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestoneTargetGoalId, setMilestoneTargetGoalId] = useState<string | null>(null);

  const [viewingGoalId, setViewingGoalId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isRemindersOpen, setRemindersOpen] = useState(false);

  // Sync theme with HTML class and data-theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'night');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('aura_tracker_theme_v1', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    StorageService.saveProcesses(processes);
  }, [processes]);

  useEffect(() => {
    StorageService.saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    StorageService.saveMilestones(milestones);
  }, [milestones]);

  useEffect(() => {
    StorageService.saveHistory(history);
  }, [history]);

  useEffect(() => {
    StorageService.saveSuggestions(suggestions);
  }, [suggestions]);

  useEffect(() => {
    StorageService.saveReminders(reminders);
  }, [reminders]);

  // Log activity helper
  const logActivity = useCallback((
    type: ActivityHistory['type'],
    description: string,
    relatedProcessId?: string,
    relatedGoalId?: string
  ) => {
    const entry: ActivityHistory = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type,
      description,
      date: new Date().toISOString(),
      relatedProcessId,
      relatedGoalId,
    };
    setHistory(prev => [entry, ...prev.slice(0, 99)]);
  }, []);

  // Recalculate goals when milestones or processes change
  const refreshGoalProgress = useCallback((goalId: string, currentMilestones: Milestone[]) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return AIEngine.recalculateGoalProgress(g, currentMilestones);
      }
      return g;
    }));
  }, []);

  // Active timers tick effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses(prev => {
        let changed = false;
        const updated = prev.map(p => {
          if (p.isTimerRunning && p.status === 'In Progress') {
            changed = true;
            return { ...p, elapsedSeconds: (p.elapsedSeconds || 0) + 1 };
          }
          return p;
        });
        return changed ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // AI Consistency and Daily Summary (memoized)
  const consistencyMetrics = useMemo(() => {
    return AIEngine.calculateConsistencyScore(processes, goals, milestones, history);
  }, [processes, goals, milestones, history]);

  const dailySummary = useMemo(() => {
    return AIEngine.generateDailySummary(processes, goals, milestones);
  }, [processes, goals, milestones]);

  const unreadRemindersCount = useMemo(() => {
    return reminders.filter(r => !r.read).length;
  }, [reminders]);

  // Evaluate reminders periodically
  useEffect(() => {
    const dynamicReminders = AIEngine.evaluateReminders(processes, goals, milestones);
    if (dynamicReminders.length > 0) {
      setReminders(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const newOnes = dynamicReminders.filter(r => !existingIds.has(r.id));
        if (newOnes.length > 0) {
          return [...newOnes, ...prev];
        }
        return prev;
      });
    }

    // Also detect suggestions
    const newSuggestions = AIEngine.detectSmartSuggestions(processes, goals);
    if (newSuggestions.length > 0) {
      setSuggestions(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const toAdd = newSuggestions.filter(s => !existingIds.has(s.id));
        return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
      });
    }
  }, [processes, goals, milestones]);

  // Process Actions
  const addProcess = useCallback((data: Omit<Process, 'id' | 'createdDate' | 'updatedDate'>) => {
    const today = getTodayDateString();
    const newProcess: Process = {
      ...data,
      id: 'proc-' + Date.now(),
      createdDate: today,
      updatedDate: today,
    };
    setProcesses(prev => [newProcess, ...prev]);
    logActivity('process_created', `Created process: "${newProcess.name}"`, newProcess.id, newProcess.goalId);
    return newProcess;
  }, [logActivity]);

  const updateProcess = useCallback((id: string, updates: Partial<Process>) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates, updatedDate: getTodayDateString() };
        if (updates.deadline && updates.deadline !== p.deadline) {
          logActivity('deadline_changed', `Updated deadline for "${p.name}" to ${updates.deadline}`, id, p.goalId);
        } else {
          logActivity('process_edited', `Edited process: "${p.name}"`, id, p.goalId);
        }
        return updated;
      }
      return p;
    }));
  }, [logActivity]);

  const deleteProcess = useCallback((id: string) => {
    const target = processes.find(p => p.id === id);
    if (target) {
      setProcesses(prev => prev.filter(p => p.id !== id));
      logActivity('process_deleted', `Deleted process: "${target.name}"`, id, target.goalId);
    }
  }, [processes, logActivity]);

  const completeProcess = useCallback((id: string) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        const completed: Process = {
          ...p,
          status: 'Completed',
          isTimerRunning: false,
          completedAt: new Date().toISOString(),
          updatedDate: getTodayDateString(),
        };

        // Micro-interaction celebration
        try {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b']
          });
        } catch (_) {}

        // Log and attribute goal contribution
        const linkedGoal = goals.find(g => g.id === p.goalId);
        if (linkedGoal) {
          logActivity(
            'process_completed',
            `Completed: "${p.name}" (+Contribution to goal "${linkedGoal.name}")`,
            id,
            linkedGoal.id
          );
        } else {
          logActivity('process_completed', `Completed process: "${p.name}"`, id);
        }

        return completed;
      }
      return p;
    }));
  }, [goals, logActivity]);

  const startProcess = useCallback((id: string) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        logActivity('process_status_change', `Started timer for process: "${p.name}"`, id, p.goalId);
        return {
          ...p,
          status: 'In Progress',
          isTimerRunning: true,
          updatedDate: getTodayDateString(),
        };
      }
      // Stop other timers
      if (p.isTimerRunning) {
        return { ...p, isTimerRunning: false };
      }
      return p;
    }));
  }, [logActivity]);

  const pauseProcess = useCallback((id: string) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        logActivity('process_status_change', `Paused process: "${p.name}"`, id, p.goalId);
        return {
          ...p,
          status: 'Paused',
          isTimerRunning: false,
          updatedDate: getTodayDateString(),
        };
      }
      return p;
    }));
  }, [logActivity]);

  const reopenProcess = useCallback((id: string) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        logActivity('process_status_change', `Reopened process: "${p.name}"`, id, p.goalId);
        return {
          ...p,
          status: 'Not Started',
          isTimerRunning: false,
          completedAt: undefined,
          updatedDate: getTodayDateString(),
        };
      }
      return p;
    }));
  }, [logActivity]);

  // Goal Actions
  const addGoal = useCallback((data: Omit<Goal, 'id' | 'createdDate' | 'updatedDate'>) => {
    const today = getTodayDateString();
    const newGoal: Goal = {
      ...data,
      id: 'goal-' + Date.now(),
      createdDate: today,
      updatedDate: today,
    };
    setGoals(prev => [newGoal, ...prev]);
    logActivity('goal_created', `Created new goal: "${newGoal.name}" (${newGoal.category})`, undefined, newGoal.id);
    return newGoal;
  }, [logActivity]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const updated = { ...g, ...updates, updatedDate: getTodayDateString() };
        logActivity('goal_updated', `Updated goal: "${g.name}" (Progress: ${updated.progress}%, Status: ${updated.status})`, undefined, id);
        return updated;
      }
      return g;
    }));
  }, [logActivity]);

  const deleteGoal = useCallback((id: string) => {
    const target = goals.find(g => g.id === id);
    if (target) {
      setGoals(prev => prev.filter(g => g.id !== id));
      // Unlink processes
      setProcesses(prev => prev.map(p => p.goalId === id ? { ...p, goalId: undefined, milestoneId: undefined } : p));
      // Remove milestones
      setMilestones(prev => prev.filter(m => m.goalId !== id));
      logActivity('goal_updated', `Deleted goal: "${target.name}"`);
    }
  }, [goals, logActivity]);

  // Milestone Actions
  const addMilestone = useCallback((data: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...data,
      id: 'ms-' + Date.now(),
    };
    const nextMilestones = [...milestones, newMilestone];
    setMilestones(nextMilestones);
    refreshGoalProgress(newMilestone.goalId, nextMilestones);
    logActivity('milestone_updated', `Added milestone: "${newMilestone.name}"`, undefined, newMilestone.goalId);
    return newMilestone;
  }, [milestones, refreshGoalProgress, logActivity]);

  const updateMilestone = useCallback((id: string, updates: Partial<Milestone>) => {
    let targetGoalId = '';
    const nextMilestones = milestones.map(m => {
      if (m.id === id) {
        targetGoalId = m.goalId;
        const updated = { ...m, ...updates };
        if (updates.progress === 100 && m.progress !== 100) {
          updated.status = 'Completed';
          updated.completedAt = new Date().toISOString();
        }
        return updated;
      }
      return m;
    });

    setMilestones(nextMilestones);
    if (targetGoalId) {
      refreshGoalProgress(targetGoalId, nextMilestones);
      logActivity('milestone_updated', `Updated milestone progress`, undefined, targetGoalId);
    }
  }, [milestones, refreshGoalProgress, logActivity]);

  const deleteMilestone = useCallback((id: string) => {
    const target = milestones.find(m => m.id === id);
    if (target) {
      const nextMilestones = milestones.filter(m => m.id !== id);
      setMilestones(nextMilestones);
      refreshGoalProgress(target.goalId, nextMilestones);
      logActivity('milestone_updated', `Removed milestone: "${target.name}"`, undefined, target.goalId);
    }
  }, [milestones, refreshGoalProgress, logActivity]);

  const toggleMilestoneComplete = useCallback((id: string) => {
    let targetGoalId = '';
    const nextMilestones = milestones.map(m => {
      if (m.id === id) {
        targetGoalId = m.goalId;
        const isDone = m.status === 'Completed';
        const updated: Milestone = {
          ...m,
          status: isDone ? 'In Progress' : 'Completed',
          progress: isDone ? 50 : 100,
          completedAt: isDone ? undefined : new Date().toISOString(),
        };

        if (!isDone) {
          try {
            confetti({
              particleCount: 90,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#06b6d4', '#8b5cf6', '#10b981']
            });
          } catch (_) {}
          logActivity('milestone_completed', `Completed milestone: "${m.name}"!`, undefined, m.goalId);
        }
        return updated;
      }
      return m;
    });

    setMilestones(nextMilestones);
    if (targetGoalId) {
      refreshGoalProgress(targetGoalId, nextMilestones);
    }
  }, [milestones, refreshGoalProgress, logActivity]);

  // Suggestions actions
  const acceptSuggestion = useCallback((id: string) => {
    const suggestion = suggestions.find(s => s.id === id);
    if (!suggestion) return;

    if (suggestion.type === 'link_process_to_goal' && suggestion.processId && suggestion.goalId) {
      updateProcess(suggestion.processId, { goalId: suggestion.goalId });
      logActivity('ai_suggestion_applied', `Applied AI Suggestion: Linked "${suggestion.processName}" to goal "${suggestion.goalName}"`, suggestion.processId, suggestion.goalId);
    }

    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'accepted' } : s));
  }, [suggestions, updateProcess, logActivity]);

  const rejectSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
  }, []);

  // Reminders actions
  const markReminderRead = useCallback((id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, read: true } : r));
  }, []);

  const clearReminders = useCallback(() => {
    setReminders(prev => prev.map(r => ({ ...r, read: true })));
  }, []);

  // Global Natural Language Command execution
  const executeNaturalLanguage = useCallback((cmd: string): NLCommandResult => {
    const result = AIEngine.parseNaturalLanguageCommand(cmd, goals, processes);

    if (result.success && result.action === 'create_process' && result.payload) {
      addProcess(result.payload);
    } else if (result.success && result.action === 'create_goal' && result.payload) {
      addGoal(result.payload);
    } else if (result.success && result.action === 'create_milestone' && result.payload) {
      addMilestone(result.payload);
    } else if (result.success && result.action === 'complete_process' && result.payload?.processId) {
      completeProcess(result.payload.processId);
    } else if (result.action === 'query_answer') {
      setActiveTab('advisor');
    }

    return result;
  }, [goals, processes, addProcess, addGoal, addMilestone, completeProcess]);

  // Modal helpers
  const openProcessModal = useCallback((proc?: Process) => {
    setEditingProcess(proc || null);
    setIsProcessModalOpen(true);
  }, []);

  const closeProcessModal = useCallback(() => {
    setEditingProcess(null);
    setIsProcessModalOpen(false);
  }, []);

  const openGoalModal = useCallback((goal?: Goal) => {
    setEditingGoal(goal || null);
    setIsGoalModalOpen(true);
  }, []);

  const closeGoalModal = useCallback(() => {
    setEditingGoal(null);
    setIsGoalModalOpen(false);
  }, []);

  const openMilestoneModal = useCallback((goalId: string, ms?: Milestone) => {
    setMilestoneTargetGoalId(goalId);
    setEditingMilestone(ms || null);
    setIsMilestoneModalOpen(true);
  }, []);

  const closeMilestoneModal = useCallback(() => {
    setMilestoneTargetGoalId(null);
    setEditingMilestone(null);
    setIsMilestoneModalOpen(false);
  }, []);

  const openGoalDetail = useCallback((goalId: string) => {
    setViewingGoalId(goalId);
  }, []);

  const closeGoalDetail = useCallback(() => {
    setViewingGoalId(null);
  }, []);

  // Reset / Backup
  const resetData = useCallback(() => {
    StorageService.resetAllData();
    setProcesses([]);
    setGoals([]);
    setMilestones([]);
    setHistory([]);
    setSuggestions([]);
    setReminders([]);
    setUserNameState('Mathi');
    setIsOnboardingOpen(true);
  }, []);

  const exportData = useCallback(() => {
    return StorageService.exportAllData();
  }, []);

  const importData = useCallback((jsonStr: string) => {
    const ok = StorageService.importAllData(jsonStr);
    if (ok) {
      window.location.reload();
    }
    return ok;
  }, []);

  return (
    <TrackerContext.Provider
      value={{
        processes,
        goals,
        milestones,
        history,
        suggestions,
        reminders,
        theme,
        toggleTheme,
        userName,
        setUserName,
        isOnboardingOpen,
        setIsOnboardingOpen,
        completeOnboarding,
        loadDemoData,
        clearToFreshSlate,
        activeTab,
        setActiveTab,
        consistencyMetrics,
        dailySummary,
        unreadRemindersCount,
        addProcess,
        updateProcess,
        deleteProcess,
        completeProcess,
        startProcess,
        pauseProcess,
        reopenProcess,
        addGoal,
        updateGoal,
        deleteGoal,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        toggleMilestoneComplete,
        acceptSuggestion,
        rejectSuggestion,
        markReminderRead,
        clearReminders,
        executeNaturalLanguage,
        isProcessModalOpen,
        editingProcess,
        openProcessModal,
        closeProcessModal,
        isGoalModalOpen,
        editingGoal,
        openGoalModal,
        closeGoalModal,
        isMilestoneModalOpen,
        editingMilestone,
        milestoneTargetGoalId,
        openMilestoneModal,
        closeMilestoneModal,
        viewingGoalId,
        openGoalDetail,
        closeGoalDetail,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        isRemindersOpen,
        setRemindersOpen,
        resetData,
        exportData,
        importData,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};

