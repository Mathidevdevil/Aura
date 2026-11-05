export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ProcessStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Paused' | 'Overdue';

export type RecurrenceType = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Custom';

export type GoalCategory = 
  | 'Career Goal'
  | 'Learning Goal'
  | 'Project Goal'
  | 'Certification Goal'
  | 'Academic Goal'
  | 'Personal Development Goal'
  | 'Other';

export type GoalStatus = 'Not Started' | 'In Progress' | 'On Track' | 'At Risk' | 'Behind Schedule' | 'Completed';

export type MilestoneStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Process {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: PriorityLevel;
  startDate: string; // YYYY-MM-DD
  deadline: string;  // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  status: ProcessStatus;
  estimatedDuration: number; // in minutes
  elapsedSeconds?: number;
  isTimerRunning?: boolean;
  goalId?: string; // Optional linked goal ID
  milestoneId?: string; // Optional specific milestone ID
  notes: string;
  recurrence: RecurrenceType;
  createdDate: string;
  updatedDate: string;
  completedAt?: string;
  scheduledTime?: string; // e.g. "08:00", "14:30" for timeline view
}

export interface Milestone {
  id: string;
  goalId: string;
  name: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  progress: number; // 0 - 100
  status: MilestoneStatus;
  order: number;
  completedAt?: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  priority: PriorityLevel;
  startDate: string;
  targetDate: string;
  progress: number; // 0 - 100
  status: GoalStatus;
  notes: string;
  createdDate: string;
  updatedDate: string;
}

export interface ActivityHistory {
  id: string;
  type: 
    | 'process_created'
    | 'process_completed'
    | 'process_edited'
    | 'process_status_change'
    | 'process_deleted'
    | 'goal_created'
    | 'goal_updated'
    | 'milestone_completed'
    | 'milestone_updated'
    | 'deadline_changed'
    | 'ai_suggestion_applied';
  description: string;
  date: string; // ISO string
  relatedProcessId?: string;
  relatedGoalId?: string;
}

export interface SmartSuggestion {
  id: string;
  type: 'link_process_to_goal' | 'focus_milestone' | 'reschedule_overdue' | 'optimize_consistency';
  title: string;
  description: string;
  processName?: string;
  goalId?: string;
  goalName?: string;
  processId?: string;
  status: 'pending' | 'accepted' | 'rejected';
  confidence: number;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  relatedProcessId?: string;
  relatedGoalId?: string;
  read: boolean;
  createdAt: string;
}

export interface ConsistencyMetrics {
  score: number; // 0 - 100
  rating: 'Exceptional' | 'Strong' | 'Moderate' | 'Needs Attention';
  breakdown: {
    processCompletionRate: number; // 0-100
    goalAlignmentRatio: number; // 0-100 (% of processes tied to future goals)
    deadlineSuccessRate: number; // 0-100
    streakDays: number;
    missedProcessesCount: number;
  };
  explanation: string;
  recommendations: string[];
}

export interface AIDailySummary {
  processesCompleted: number;
  processesPending: number;
  processesOverdue: number;
  deadlinesCount: number;
  goalRelatedActivitiesCount: number;
  completionPercentage: number;
  aiInsight: string;
  nextFocus: string;
  highlightCategory: string;
}

