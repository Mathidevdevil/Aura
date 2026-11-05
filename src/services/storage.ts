import { Process, Goal, Milestone, ActivityHistory, SmartSuggestion, Reminder } from '../types';

const STORAGE_KEYS = {
  PROCESSES: 'aura_tracker_processes_v1',
  GOALS: 'aura_tracker_goals_v1',
  MILESTONES: 'aura_tracker_milestones_v1',
  HISTORY: 'aura_tracker_history_v1',
  SUGGESTIONS: 'aura_tracker_suggestions_v1',
  REMINDERS: 'aura_tracker_reminders_v1',
  THEME: 'aura_tracker_theme_v1',
  USER_NAME: 'aura_tracker_user_name_v1',
  HAS_ONBOARDED: 'aura_tracker_has_onboarded_v1',
};

// Formats a relative date YYYY-MM-DD
export function getRelativeDate(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Initial Seed Data (Exported for Onboarding & Demo Loader)
export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-vlsi-1',
    name: 'Become a VLSI Engineer',
    description: 'Master semiconductor digital design, synthesis, physical design, and tape-out methodology for high-performance silicon chips.',
    category: 'Career Goal',
    priority: 'Critical',
    startDate: getRelativeDate(-45),
    targetDate: getRelativeDate(180),
    progress: 46,
    status: 'On Track',
    notes: 'Focus on RTL design in Verilog/SystemVerilog, STA timing closure, and building physical design portfolio.',
    createdDate: getRelativeDate(-45),
    updatedDate: getRelativeDate(0),
  },
  {
    id: 'goal-ai-2',
    name: 'Master Autonomous AI Agents',
    description: 'Architect production-grade agentic systems with memory, tool routing, multi-agent consensus, and evaluation benchmarks.',
    category: 'Learning Goal',
    priority: 'High',
    startDate: getRelativeDate(-30),
    targetDate: getRelativeDate(90),
    progress: 68,
    status: 'On Track',
    notes: 'Targeting deep understanding of LLM reasoning chains, sandboxing, and autonomous problem solving.',
    createdDate: getRelativeDate(-30),
    updatedDate: getRelativeDate(0),
  },
  {
    id: 'goal-edge-3',
    name: 'Build Open Source Edge Computing Framework',
    description: 'Create ultra-low latency inference engine running on embedded RISC-V and ARM microcontrollers.',
    category: 'Project Goal',
    priority: 'Medium',
    startDate: getRelativeDate(-60),
    targetDate: getRelativeDate(120),
    progress: 38,
    status: 'At Risk',
    notes: 'Requires benchmark acceleration before submission to upcoming open source tech summit.',
    createdDate: getRelativeDate(-60),
    updatedDate: getRelativeDate(-3),
  },
];

export const INITIAL_MILESTONES: Milestone[] = [
  // Goal 1: VLSI Engineer
  {
    id: 'ms-vlsi-1',
    goalId: 'goal-vlsi-1',
    name: 'Learn Digital Electronics & CMOS Fundamentals',
    description: 'Combinational, sequential logic, setup/hold times, CMOS gate design.',
    deadline: getRelativeDate(-15),
    progress: 100,
    status: 'Completed',
    order: 1,
    completedAt: getRelativeDate(-15),
  },
  {
    id: 'ms-vlsi-2',
    goalId: 'goal-vlsi-1',
    name: 'Master Verilog & SystemVerilog RTL',
    description: 'FSM architecture, synthesizable subsets, testbenches, timing assertions.',
    deadline: getRelativeDate(20),
    progress: 70,
    status: 'In Progress',
    order: 2,
  },
  {
    id: 'ms-vlsi-3',
    goalId: 'goal-vlsi-1',
    name: 'Learn Physical Design & Static Timing Analysis',
    description: 'Synthesis, floorplanning, placement, routing, clock tree synthesis, and STA closure.',
    deadline: getRelativeDate(75),
    progress: 40,
    status: 'In Progress',
    order: 3,
  },
  {
    id: 'ms-vlsi-4',
    goalId: 'goal-vlsi-1',
    name: 'Complete VLSI Silicon Tapeout Projects',
    description: 'Design and simulate an open-source RISC-V core or DSP accelerator with OpenLane.',
    deadline: getRelativeDate(130),
    progress: 20,
    status: 'In Progress',
    order: 4,
  },
  {
    id: 'ms-vlsi-5',
    goalId: 'goal-vlsi-1',
    name: 'Interview Prep & Hardware Roles Applications',
    description: 'RTL coding rounds, system design interviews, and top semiconductor applications.',
    deadline: getRelativeDate(180),
    progress: 0,
    status: 'Not Started',
    order: 5,
  },

  // Goal 2: Master AI Agents
  {
    id: 'ms-ai-1',
    goalId: 'goal-ai-2',
    name: 'Foundations: LLM Architecture & Prompt Engineering',
    description: 'Transformer mechanics, context windows, few-shot conditioning, structured outputs.',
    deadline: getRelativeDate(-20),
    progress: 100,
    status: 'Completed',
    order: 1,
    completedAt: getRelativeDate(-20),
  },
  {
    id: 'ms-ai-2',
    goalId: 'goal-ai-2',
    name: 'Tool Calling, Code Execution & Sandboxed Environments',
    description: 'Dynamic schema generation, sandbox runtimes, error-recovery loops.',
    deadline: getRelativeDate(-5),
    progress: 100,
    status: 'Completed',
    order: 2,
    completedAt: getRelativeDate(-5),
  },
  {
    id: 'ms-ai-3',
    goalId: 'goal-ai-2',
    name: 'Multi-Agent Coordination & Reflection Patterns',
    description: 'Supervisor-worker patterns, debate/consensus, cyclic memory trees.',
    deadline: getRelativeDate(30),
    progress: 60,
    status: 'In Progress',
    order: 3,
  },
  {
    id: 'ms-ai-4',
    goalId: 'goal-ai-2',
    name: 'Deploy Production Agent Evaluation Framework',
    description: 'Automated trajectory scoring, latency/cost benchmarking, red-teaming safety.',
    deadline: getRelativeDate(85),
    progress: 15,
    status: 'In Progress',
    order: 4,
  },

  // Goal 3: Edge Computing
  {
    id: 'ms-edge-1',
    goalId: 'goal-edge-3',
    name: 'Architecture Design & Microkernel Benchmarks',
    description: 'Memory footprint budgeting under 512KB RAM on microcontroller targets.',
    deadline: getRelativeDate(-25),
    progress: 100,
    status: 'Completed',
    order: 1,
    completedAt: getRelativeDate(-25),
  },
  {
    id: 'ms-edge-2',
    goalId: 'goal-edge-3',
    name: 'C++ Core Runtime Quantization & SIMD Optimization',
    description: 'Int8 tensor arithmetic with NEON and RVV vector extensions.',
    deadline: getRelativeDate(35),
    progress: 50,
    status: 'In Progress',
    order: 2,
  },
  {
    id: 'ms-edge-3',
    goalId: 'goal-edge-3',
    name: 'Python Binding SDK & Model Exporter',
    description: 'ONNX to proprietary compact binary serialization tool.',
    deadline: getRelativeDate(80),
    progress: 0,
    status: 'Not Started',
    order: 3,
  },
  {
    id: 'ms-edge-4',
    goalId: 'goal-edge-3',
    name: 'Release v1.0 & Community Showcase',
    description: 'Documentation, benchmarks against TFLite Micro, public launch.',
    deadline: getRelativeDate(120),
    progress: 0,
    status: 'Not Started',
    order: 4,
  },
];

export const INITIAL_PROCESSES: Process[] = [
  {
    id: 'proc-1',
    name: 'Study Verilog: FSM Design & Timing Margins',
    description: 'Implement Mealy and Moore state machines with setup/hold margin checks.',
    category: 'Deep Work',
    priority: 'Critical',
    startDate: getTodayDateString(),
    deadline: `${getTodayDateString()}T10:00`,
    status: 'Completed',
    estimatedDuration: 90,
    elapsedSeconds: 5400,
    isTimerRunning: false,
    goalId: 'goal-vlsi-1',
    milestoneId: 'ms-vlsi-2',
    notes: 'Reviewed clock skew impacts and non-blocking assignment best practices in RTL.',
    recurrence: 'Daily',
    scheduledTime: '08:00',
    createdDate: getTodayDateString(),
    updatedDate: getTodayDateString(),
    completedAt: `${getTodayDateString()}T09:45:00.000Z`,
  },
  {
    id: 'proc-2',
    name: 'Review Static Timing Analysis (STA) Slack Reports',
    description: 'Inspect setup timing violations on critical paths and clock tree synthesis.',
    category: 'Engineering',
    priority: 'High',
    startDate: getTodayDateString(),
    deadline: `${getTodayDateString()}T12:00`,
    status: 'Completed',
    estimatedDuration: 60,
    elapsedSeconds: 3600,
    isTimerRunning: false,
    goalId: 'goal-vlsi-1',
    milestoneId: 'ms-vlsi-3',
    notes: 'Identified 2 high-fanout nets causing setup slack dip. Inserted buffer trees.',
    recurrence: 'Weekly',
    scheduledTime: '10:30',
    createdDate: getTodayDateString(),
    updatedDate: getTodayDateString(),
    completedAt: `${getTodayDateString()}T11:50:00.000Z`,
  },
  {
    id: 'proc-3',
    name: 'Develop Multi-Agent Coordination Protocol in Python',
    description: 'Build consensus broadcast channel and structured argument handoffs between LLM instances.',
    category: 'Coding',
    priority: 'High',
    startDate: getTodayDateString(),
    deadline: `${getTodayDateString()}T16:30`,
    status: 'In Progress',
    estimatedDuration: 120,
    elapsedSeconds: 2700,
    isTimerRunning: true,
    goalId: 'goal-ai-2',
    milestoneId: 'ms-ai-3',
    notes: 'Implemented supervisor agent router and message bus.',
    recurrence: 'Daily',
    scheduledTime: '14:00',
    createdDate: getTodayDateString(),
    updatedDate: getTodayDateString(),
  },
  {
    id: 'proc-4',
    name: 'Solve 2 Graph Algorithms on LeetCode',
    description: 'Practice Dijkstra and Topological Sort for algorithmic problem-solving speed.',
    category: 'Practice',
    priority: 'Medium',
    startDate: getTodayDateString(),
    deadline: `${getTodayDateString()}T18:00`,
    status: 'Not Started',
    estimatedDuration: 45,
    elapsedSeconds: 0,
    isTimerRunning: false,
    notes: 'Focus on clean C++ or Python implementations without memory leaks.',
    recurrence: 'Daily',
    scheduledTime: '17:00',
    createdDate: getTodayDateString(),
    updatedDate: getTodayDateString(),
  },
  {
    id: 'proc-5',
    name: 'Read Research Paper: Speculative Decoding in LLMs',
    description: 'Analyze draft models, verification phases, and inference latency speedups.',
    category: 'Research',
    priority: 'Medium',
    startDate: getTodayDateString(),
    deadline: `${getTodayDateString()}T20:30`,
    status: 'Not Started',
    estimatedDuration: 45,
    elapsedSeconds: 0,
    isTimerRunning: false,
    goalId: 'goal-ai-2',
    milestoneId: 'ms-ai-4',
    notes: 'Prepare concise summary notes on acceptance rate bounds.',
    recurrence: 'None',
    scheduledTime: '19:00',
    createdDate: getTodayDateString(),
    updatedDate: getTodayDateString(),
  },
  {
    id: 'proc-6',
    name: 'Daily Retrospective & Milestone Planning',
    description: 'Review today’s completed processes and calibrate tomorrow’s priorities.',
    category: 'Review',
    priority: 'Low',
    startDate: getTodayDateString(),
    deadline: `${getTodayDateString()}T22:00`,
    status: 'Not Started',
    estimatedDuration: 20,
    elapsedSeconds: 0,
    isTimerRunning: false,
    notes: 'Align tomorrow’s processes directly with VLSI and AI agent milestones.',
    recurrence: 'Daily',
    scheduledTime: '21:00',
    createdDate: getTodayDateString(),
    updatedDate: getTodayDateString(),
  },
];

export const INITIAL_HISTORY: ActivityHistory[] = [
  {
    id: 'act-1',
    type: 'process_completed',
    description: 'Completed process: "Study Verilog: FSM Design & Timing Margins" (+1.5% to VLSI Goal)',
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    relatedProcessId: 'proc-1',
    relatedGoalId: 'goal-vlsi-1',
  },
  {
    id: 'act-2',
    type: 'process_completed',
    description: 'Completed process: "Review Static Timing Analysis (STA) Slack Reports" (+1.0% to VLSI Goal)',
    date: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    relatedProcessId: 'proc-2',
    relatedGoalId: 'goal-vlsi-1',
  },
  {
    id: 'act-3',
    type: 'process_status_change',
    description: 'Started active timer on: "Develop Multi-Agent Coordination Protocol in Python"',
    date: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    relatedProcessId: 'proc-3',
    relatedGoalId: 'goal-ai-2',
  },
  {
    id: 'act-4',
    type: 'milestone_updated',
    description: 'Updated milestone "Master Verilog & SystemVerilog RTL" to 70% completion',
    date: getRelativeDate(-1) + 'T18:00:00.000Z',
    relatedGoalId: 'goal-vlsi-1',
  },
  {
    id: 'act-5',
    type: 'goal_created',
    description: 'Created new future goal: "Become a VLSI Engineer" with target 6 months',
    date: getRelativeDate(-45) + 'T09:00:00.000Z',
    relatedGoalId: 'goal-vlsi-1',
  },
];

export const INITIAL_SUGGESTIONS: SmartSuggestion[] = [
  {
    id: 'sug-1',
    type: 'link_process_to_goal',
    title: 'Link Unassigned Activity to Goal',
    description: 'You frequently work on "Solve 2 Graph Algorithms". Would you like to link this process to your "Become a VLSI Engineer" or "Master Autonomous AI Agents" goal?',
    processName: 'Solve 2 Graph Algorithms on LeetCode',
    goalId: 'goal-vlsi-1',
    goalName: 'Become a VLSI Engineer',
    processId: 'proc-4',
    status: 'pending',
    confidence: 88,
    createdAt: getTodayDateString(),
  },
  {
    id: 'sug-2',
    type: 'focus_milestone',
    title: 'Milestone Velocity Opportunity',
    description: 'Your milestone "Master Verilog & SystemVerilog RTL" is at 70%. Completing 2 more RTL processes will finalize this milestone ahead of schedule.',
    goalId: 'goal-vlsi-1',
    goalName: 'Become a VLSI Engineer',
    status: 'pending',
    confidence: 94,
    createdAt: getTodayDateString(),
  },
  {
    id: 'sug-3',
    type: 'optimize_consistency',
    title: 'Goal-Alignment Optimization',
    description: '80% of your completed tasks today directly advance your top goals. Keep this momentum to maintain your 90+ consistency score.',
    status: 'pending',
    confidence: 96,
    createdAt: getTodayDateString(),
  }
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Process In Progress',
    message: 'Active process: "Develop Multi-Agent Coordination Protocol in Python" is currently running (45m elapsed).',
    severity: 'info',
    relatedProcessId: 'proc-3',
    relatedGoalId: 'goal-ai-2',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    title: 'Upcoming Deadline Today',
    message: '"Solve 2 Graph Algorithms on LeetCode" is due by 18:00 today.',
    severity: 'warning',
    relatedProcessId: 'proc-4',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    title: 'Goal Attention Needed',
    message: 'Your goal "Build Open Source Edge Computing Framework" has had no new processes in 4 days and is marked At Risk.',
    severity: 'urgent',
    relatedGoalId: 'goal-edge-3',
    read: false,
    createdAt: new Date().toISOString(),
  }
];

// LocalStorage Helper functions
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load key ${key}`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save key ${key}`, e);
  }
}

export const StorageService = {
  hasOnboarded(): boolean {
    return localStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED) === 'true';
  },

  setOnboarded(value: boolean): void {
    localStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, value ? 'true' : 'false');
  },

  getUserName(): string {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
  },

  saveUserName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  },

  getProcesses(): Process[] {
    return loadFromStorage<Process[]>(STORAGE_KEYS.PROCESSES, []);
  },
  saveProcesses(processes: Process[]): void {
    saveToStorage(STORAGE_KEYS.PROCESSES, processes);
  },

  getGoals(): Goal[] {
    return loadFromStorage<Goal[]>(STORAGE_KEYS.GOALS, []);
  },
  saveGoals(goals: Goal[]): void {
    saveToStorage(STORAGE_KEYS.GOALS, goals);
  },

  getMilestones(): Milestone[] {
    return loadFromStorage<Milestone[]>(STORAGE_KEYS.MILESTONES, []);
  },
  saveMilestones(milestones: Milestone[]): void {
    saveToStorage(STORAGE_KEYS.MILESTONES, milestones);
  },

  getHistory(): ActivityHistory[] {
    return loadFromStorage<ActivityHistory[]>(STORAGE_KEYS.HISTORY, []);
  },
  saveHistory(history: ActivityHistory[]): void {
    saveToStorage(STORAGE_KEYS.HISTORY, history);
  },

  getSuggestions(): SmartSuggestion[] {
    return loadFromStorage<SmartSuggestion[]>(STORAGE_KEYS.SUGGESTIONS, []);
  },
  saveSuggestions(suggestions: SmartSuggestion[]): void {
    saveToStorage(STORAGE_KEYS.SUGGESTIONS, suggestions);
  },

  getReminders(): Reminder[] {
    return loadFromStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
  },
  saveReminders(reminders: Reminder[]): void {
    saveToStorage(STORAGE_KEYS.REMINDERS, reminders);
  },

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PROCESSES);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.MILESTONES);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SUGGESTIONS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
    localStorage.removeItem(STORAGE_KEYS.HAS_ONBOARDED);
  },

  exportAllData(): string {
    const backup = {
      processes: this.getProcesses(),
      goals: this.getGoals(),
      milestones: this.getMilestones(),
      history: this.getHistory(),
      suggestions: this.getSuggestions(),
      reminders: this.getReminders(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.processes) this.saveProcesses(data.processes);
      if (data.goals) this.saveGoals(data.goals);
      if (data.milestones) this.saveMilestones(data.milestones);
      if (data.history) this.saveHistory(data.history);
      if (data.suggestions) this.saveSuggestions(data.suggestions);
      if (data.reminders) this.saveReminders(data.reminders);
      return true;
    } catch (e) {
      console.error('Failed to parse import data', e);
      return false;
    }
  }
};

