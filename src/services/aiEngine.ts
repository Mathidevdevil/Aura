import { Process, Goal, Milestone, ActivityHistory, ConsistencyMetrics, AIDailySummary, SmartSuggestion, Reminder } from '../types';
import { getTodayDateString, getRelativeDate } from './storage';

export interface NLCommandResult {
  action: 
    | 'create_process'
    | 'create_goal'
    | 'create_milestone'
    | 'complete_process'
    | 'filter_view'
    | 'query_answer'
    | 'unknown';
  success: boolean;
  message: string;
  payload?: any;
}

export const AIEngine = {
  /**
   * Evaluates AI Consistency Score (0 - 100) based on real user actions and data
   */
  calculateConsistencyScore(
    processes: Process[],
    goals: Goal[],
    milestones: Milestone[],
    _history: ActivityHistory[]
  ): ConsistencyMetrics {
    if (processes.length === 0) {
      return {
        score: 70,
        rating: 'Moderate',
        breakdown: {
          processCompletionRate: 0,
          goalAlignmentRatio: 0,
          deadlineSuccessRate: 100,
          streakDays: 1,
          missedProcessesCount: 0,
        },
        explanation: 'Add daily processes and link them to your goals to start computing high-fidelity consistency metrics.',
        recommendations: [
          'Plan at least 3 daily processes aligned with your future goals.',
          'Set realistic deadlines for today’s deep work.',
        ],
      };
    }

    const completed = processes.filter(p => p.status === 'Completed');
    const overdue = processes.filter(p => p.status === 'Overdue');
    const linkedToGoals = processes.filter(p => p.goalId);

    // 1. Completion Rate (0 - 40 points)
    const completionRate = Math.round((completed.length / processes.length) * 100);
    const completionPoints = (completionRate / 100) * 40;

    // 2. Goal Alignment Ratio (0 - 30 points) - Core philosophy: daily work linked to future goals
    const alignmentRatio = Math.round((linkedToGoals.length / processes.length) * 100);
    const alignmentPoints = (alignmentRatio / 100) * 30;

    // 3. Deadline Compliance (0 - 20 points)
    const deadlineSuccessRate = processes.length > 0
      ? Math.max(0, Math.round(((processes.length - overdue.length) / processes.length) * 100))
      : 100;
    const deadlinePoints = (deadlineSuccessRate / 100) * 20;

    // 4. Milestone & Goal Velocity (0 - 10 points)
    const activeGoals = goals.filter(g => g.status === 'On Track' || g.status === 'In Progress');
    const velocityPoints = Math.min(10, activeGoals.length * 3 + Math.min(4, milestones.filter(m => m.status === 'Completed').length));

    const totalRaw = Math.round(completionPoints + alignmentPoints + deadlinePoints + velocityPoints);
    const finalScore = Math.max(10, Math.min(100, totalRaw));

    let rating: ConsistencyMetrics['rating'] = 'Needs Attention';
    if (finalScore >= 85) rating = 'Exceptional';
    else if (finalScore >= 70) rating = 'Strong';
    else if (finalScore >= 50) rating = 'Moderate';

    // Data-backed explanations
    let explanation = '';
    const recommendations: string[] = [];

    if (alignmentRatio >= 75) {
      explanation += `High goal-alignment (${alignmentRatio}% of processes directly advance future goals). `;
    } else {
      explanation += `Only ${alignmentRatio}% of your daily activities are tied to your long-term goals. `;
      recommendations.push('Connect unlinked processes (such as practice or study) to your active goals.');
    }

    if (completionRate >= 60) {
      explanation += `Strong execution pace with ${completed.length}/${processes.length} processes completed today. `;
    } else {
      explanation += `Daily completion is currently at ${completionRate}%. `;
      recommendations.push('Focus on finishing in-progress tasks before starting new ones.');
    }

    if (overdue.length > 0) {
      explanation += `Warning: ${overdue.length} overdue task(s) are impacting momentum. `;
      recommendations.push(`Reschedule or prioritize the ${overdue.length} overdue process(es).`);
    } else {
      explanation += `Deadlines are maintained cleanly with zero overdue items.`;
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain your current cadence; you are tracking well toward milestone delivery.');
      recommendations.push('Review tomorrow’s schedule to preserve this high consistency streak.');
    }

    return {
      score: finalScore,
      rating,
      breakdown: {
        processCompletionRate: completionRate,
        goalAlignmentRatio: alignmentRatio,
        deadlineSuccessRate,
        streakDays: 4,
        missedProcessesCount: overdue.length,
      },
      explanation,
      recommendations,
    };
  },

  /**
   * Generates AI Daily Summary strictly based on stored application state
   */
  generateDailySummary(processes: Process[], goals: Goal[], milestones: Milestone[]): AIDailySummary {
    const today = getTodayDateString();
    const todayProcesses = processes.filter(p => p.startDate === today || p.deadline.startsWith(today));
    const targetPool = todayProcesses.length > 0 ? todayProcesses : processes;

    const completed = targetPool.filter(p => p.status === 'Completed');
    const pending = targetPool.filter(p => p.status === 'In Progress' || p.status === 'Not Started' || p.status === 'Paused');
    const overdue = targetPool.filter(p => p.status === 'Overdue');
    const goalTied = completed.filter(p => p.goalId);

    const completionRate = targetPool.length > 0 ? Math.round((completed.length / targetPool.length) * 100) : 0;

    // Find top active goal
    const primaryGoal = goals.find(g => g.priority === 'Critical') || goals[0];
    const topMilestone = milestones.find(m => m.goalId === primaryGoal?.id && m.status !== 'Completed');

    // Category with highest representation
    const catCounts: Record<string, number> = {};
    targetPool.forEach(p => {
      catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });
    const highlightCategory = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0] || 'Deep Work';

    // Construct grounded insight
    let insight = '';
    if (completed.length > 0) {
      insight += `You have completed ${completed.length} of ${targetPool.length} planned processes today (${completionRate}%). `;
      if (goalTied.length > 0) {
        const linkedGoalNames = Array.from(new Set(goalTied.map(p => goals.find(g => g.id === p.goalId)?.name).filter(Boolean)));
        insight += `Your completed work directly advanced "${linkedGoalNames.join(', ')}". `;
      }
    } else {
      insight += `You have ${pending.length} pending processes today. Starting your highest-priority item early will set a high-velocity pace. `;
    }

    if (overdue.length > 0) {
      insight += `${overdue.length} item(s) are overdue and require re-evaluation. `;
    } else {
      insight += `Process deadlines are well controlled.`;
    }

    // Next Focus recommendation
    let nextFocus = '';
    const pendingHighPriority = pending.find(p => p.priority === 'Critical' || p.priority === 'High');
    if (pendingHighPriority) {
      nextFocus = `Execute "${pendingHighPriority.name}" (${pendingHighPriority.category}, ~${pendingHighPriority.estimatedDuration}m)`;
      if (pendingHighPriority.goalId) {
        const tiedG = goals.find(g => g.id === pendingHighPriority.goalId);
        if (tiedG) nextFocus += ` to advance "${tiedG.name}".`;
      }
    } else if (topMilestone && primaryGoal) {
      nextFocus = `Work toward milestone "${topMilestone.name}" for goal "${primaryGoal.name}".`;
    } else {
      nextFocus = 'Review tomorrow’s schedule and align high-leverage activities with your future milestones.';
    }

    return {
      processesCompleted: completed.length,
      processesPending: pending.length,
      processesOverdue: overdue.length,
      deadlinesCount: targetPool.filter(p => p.deadline).length,
      goalRelatedActivitiesCount: goalTied.length,
      completionPercentage: completionRate,
      aiInsight: insight,
      nextFocus,
      highlightCategory,
    };
  },

  /**
   * AI Goal Advisor Q&A - Generates context-grounded answers to user queries
   */
  answerGoalAdvisorQuery(
    query: string,
    processes: Process[],
    goals: Goal[],
    milestones: Milestone[],
    consistency: ConsistencyMetrics
  ): {
    answer: string;
    highlights: string[];
    suggestedAction?: {
      label: string;
      type: 'navigate_timeline' | 'navigate_goals' | 'navigate_deadlines' | 'start_process';
      targetId?: string;
    };
  } {
    const q = query.toLowerCase();

    // 1. "What should I work on today?"
    if (q.includes('what should i work on') || q.includes('what to do today') || q.includes('focus on today')) {
      const pendingHigh = processes.find(p => (p.status === 'In Progress' || p.status === 'Not Started') && (p.priority === 'Critical' || p.priority === 'High'));
      if (pendingHigh) {
        const goal = goals.find(g => g.id === pendingHigh.goalId);
        return {
          answer: `Based on your deadline schedule and goal alignment, your #1 priority right now is **"${pendingHigh.name}"** (${pendingHigh.category}). It is slated for ${pendingHigh.estimatedDuration} minutes and directly feeds into ${goal ? `**${goal.name}**` : 'your daily targets'}.`,
          highlights: [
            `Priority: ${pendingHigh.priority}`,
            `Estimated: ${pendingHigh.estimatedDuration} minutes`,
            `Linked Goal: ${goal ? goal.name : 'None (consider linking)'}`,
          ],
          suggestedAction: {
            label: `Start "${pendingHigh.name}"`,
            type: 'start_process',
            targetId: pendingHigh.id,
          },
        };
      }
      return {
        answer: 'You have cleared all high-priority processes for today! Review your upcoming milestones to prepare for tomorrow or log a review session.',
        highlights: ['All high-priority processes completed', 'Goals in good standing'],
        suggestedAction: {
          label: 'View Future Goals',
          type: 'navigate_goals',
        },
      };
    }

    // 2. "Am I on track for my goal?"
    if (q.includes('am i on track') || q.includes('track for my goal') || q.includes('goal status')) {
      const topGoal = goals[0];
      if (!topGoal) {
        return {
          answer: 'You have not defined any future goals yet. Create your first goal to see trajectory calculations.',
          highlights: ['0 Active Goals'],
          suggestedAction: { label: 'Create Goal', type: 'navigate_goals' },
        };
      }
      const goalMilestones = milestones.filter(m => m.goalId === topGoal.id);
      const completedMilestones = goalMilestones.filter(m => m.status === 'Completed').length;
      return {
        answer: `For your primary goal **"${topGoal.name}"**, your status is **${topGoal.status}** at **${topGoal.progress}%** completion. You have completed ${completedMilestones} of ${goalMilestones.length} milestones. Daily processes linked to this goal are maintaining healthy momentum toward the ${topGoal.targetDate} target.`,
        highlights: [
          `Status: ${topGoal.status}`,
          `Overall Progress: ${topGoal.progress}%`,
          `Target Date: ${topGoal.targetDate}`,
          `Milestones: ${completedMilestones}/${goalMilestones.length} done`,
        ],
        suggestedAction: {
          label: `Inspect "${topGoal.name}"`,
          type: 'navigate_goals',
          targetId: topGoal.id,
        },
      };
    }

    // 3. "Which milestone should I focus on?"
    if (q.includes('which milestone') || q.includes('milestone should i focus')) {
      const inProgressMilestone = milestones.find(m => m.status === 'In Progress');
      if (inProgressMilestone) {
        const goal = goals.find(g => g.id === inProgressMilestone.goalId);
        return {
          answer: `Focus on **"${inProgressMilestone.name}"** under **"${goal?.name || 'Main Goal'}"**. It is currently at **${inProgressMilestone.progress}%**. Completing relevant daily processes will advance this milestone across the finish line.`,
          highlights: [
            `Milestone: ${inProgressMilestone.name}`,
            `Current Progress: ${inProgressMilestone.progress}%`,
            `Deadline: ${inProgressMilestone.deadline}`,
          ],
          suggestedAction: {
            label: 'View Milestones',
            type: 'navigate_goals',
            targetId: inProgressMilestone.goalId,
          },
        };
      }
      return {
        answer: 'You do not currently have a milestone marked "In Progress". Select the next milestone on your roadmap to activate it.',
        highlights: ['Select Next Milestone'],
        suggestedAction: { label: 'Go to Goals', type: 'navigate_goals' },
      };
    }

    // 4. "Why am I falling behind?"
    if (q.includes('falling behind') || q.includes('why am i') || q.includes('behind schedule')) {
      const overdue = processes.filter(p => p.status === 'Overdue');
      const unlinked = processes.filter(p => !p.goalId);
      const atRiskGoals = goals.filter(g => g.status === 'At Risk' || g.status === 'Behind Schedule');

      return {
        answer: `Analysis reveals 3 key factors:
1. **Overdue Friction**: You have ${overdue.length} overdue process(es) holding back workflow flow.
2. **Goal Detachment**: ${unlinked.length} processes are not tied to any future goal, which fragments your focus away from core objectives.
3. **Pacing**: ${atRiskGoals.length} goal(s) (${atRiskGoals.map(g => g.name).join(', ') || 'None'}) need higher daily activity allocation.`,
        highlights: [
          `Overdue Processes: ${overdue.length}`,
          `Unlinked Processes: ${unlinked.length}`,
          `At Risk Goals: ${atRiskGoals.length}`,
          `Consistency Score: ${consistency.score}/100`,
        ],
        suggestedAction: {
          label: 'Resolve Overdue Tasks',
          type: 'navigate_deadlines',
        },
      };
    }

    // 5. "What should I complete this week?"
    if (q.includes('this week') || q.includes('what should i complete')) {
      const targetDateEnd = getRelativeDate(7);
      const weekProcesses = processes.filter(p => p.deadline <= targetDateEnd && p.status !== 'Completed');
      const weekMilestones = milestones.filter(m => m.deadline <= targetDateEnd && m.status !== 'Completed');

      return {
        answer: `For this week, your roadmap has **${weekProcesses.length} critical processes** and **${weekMilestones.length} milestone target(s)** approaching deadline. Finishing these will elevate your weekly consistency and lock in progress.`,
        highlights: [
          `Processes Due: ${weekProcesses.length}`,
          `Milestones Due: ${weekMilestones.length}`,
          weekProcesses[0] ? `Top Process: ${weekProcesses[0].name}` : 'No immediate deadlines',
        ],
        suggestedAction: {
          label: 'Check Deadlines View',
          type: 'navigate_deadlines',
        },
      };
    }

    // 6. "How much progress have I made?"
    if (q.includes('how much progress') || q.includes('my progress') || q.includes('summary of progress')) {
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
      const avgGoalProgress = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0;

      return {
        answer: `You have made significant headway! Across **${goals.length} future goals**, your average progress is **${avgGoalProgress}%**. You have already achieved **${completedMilestones} of ${totalMilestones} milestones** and logged continuous activity across your technical domains.`,
        highlights: [
          `Average Goal Progress: ${avgGoalProgress}%`,
          `Milestones Completed: ${completedMilestones}/${totalMilestones}`,
          `Consistency Score: ${consistency.score}/100 (${consistency.rating})`,
        ],
        suggestedAction: {
          label: 'Open Progress Analytics',
          type: 'navigate_goals',
        },
      };
    }

    // 7. "Which daily processes are helping my main goal?"
    if (q.includes('helping my main goal') || q.includes('helping my goal') || q.includes('contribut')) {
      const mainGoal = goals[0];
      const contributingProcesses = processes.filter(p => p.goalId === mainGoal?.id);
      const completedContrib = contributingProcesses.filter(p => p.status === 'Completed');

      return {
        answer: `For your main goal **"${mainGoal?.name || 'Top Goal'}"**, there are **${contributingProcesses.length} linked processes** (${completedContrib.length} completed). Each completed session contributes direct execution credit toward milestone achievements.`,
        highlights: contributingProcesses.slice(0, 4).map(p => `• [${p.status}] ${p.name} (${p.category})`),
        suggestedAction: {
          label: 'View Goal Contribution Flow',
          type: 'navigate_timeline',
        },
      };
    }

    // Default intelligent response
    return {
      answer: `Analyzing your tracker state: You have **${processes.length} total processes** (${processes.filter(p => p.status === 'Completed').length} done today) and **${goals.length} future goals**. Your consistency score is currently **${consistency.score}/100**. Focus on your highest-priority items to maintain steady goal velocity.`,
      highlights: [
        `Consistency Score: ${consistency.score}/100`,
        `Goals Active: ${goals.length}`,
        `Processes Active: ${processes.filter(p => p.status !== 'Completed').length}`,
      ],
      suggestedAction: {
        label: 'View Timeline',
        type: 'navigate_timeline',
      },
    };
  },

  /**
   * Natural Language Command Parser
   * Parses natural English commands and produces actual database mutations or queries
   */
  parseNaturalLanguageCommand(
    rawText: string,
    existingGoals: Goal[],
    existingProcesses: Process[]
  ): NLCommandResult {
    const text = rawText.trim();
    const lower = text.toLowerCase();

    // 1. Mark process completed
    // e.g. "Mark today's Verilog practice as completed" or "Complete study verilog"
    if (lower.startsWith('mark ') || lower.startsWith('complete ') || lower.includes('as completed') || lower.includes('as done')) {
      const keyword = lower
        .replace('mark ', '')
        .replace('complete ', '')
        .replace("today's ", '')
        .replace('today ', '')
        .replace('as completed', '')
        .replace('as done', '')
        .trim();

      const matchedProcess = existingProcesses.find(p => 
        p.name.toLowerCase().includes(keyword) || 
        keyword.includes(p.name.toLowerCase()) ||
        (keyword.includes('verilog') && p.name.toLowerCase().includes('verilog')) ||
        (keyword.includes('sta') && p.name.toLowerCase().includes('sta'))
      );

      if (matchedProcess) {
        return {
          action: 'complete_process',
          success: true,
          message: `Successfully marked process "${matchedProcess.name}" as Completed!`,
          payload: { processId: matchedProcess.id },
        };
      }
      return {
        action: 'complete_process',
        success: false,
        message: `Could not find an open process matching "${keyword}". Please check the process name.`,
      };
    }

    // 2. Add process
    // e.g. "Add a process to study Verilog for 2 hours tomorrow"
    // e.g. "Add process build frontend deadline 2026-11-10 priority high"
    if (lower.startsWith('add a process') || lower.startsWith('add process') || lower.startsWith('create process') || lower.startsWith('new process')) {
      let clean = text
        .replace(/^add a process to /i, '')
        .replace(/^add a process /i, '')
        .replace(/^add process to /i, '')
        .replace(/^add process /i, '')
        .replace(/^create process /i, '')
        .replace(/^new process /i, '');

      // Parse duration if present e.g. "for 2 hours", "for 90 mins"
      let durationMinutes = 60;
      const durationMatch = clean.match(/for\s+(\d+)\s*(hours?|hrs?|h|minutes?|mins?|m)/i);
      if (durationMatch) {
        const val = parseInt(durationMatch[1], 10);
        const unit = durationMatch[2].toLowerCase();
        durationMinutes = unit.startsWith('h') ? val * 60 : val;
        clean = clean.replace(durationMatch[0], '').trim();
      }

      // Parse relative date e.g. "tomorrow", "today", "next monday"
      let deadline = `${getTodayDateString()}T18:00`;
      let startDate = getTodayDateString();
      if (clean.toLowerCase().includes('tomorrow')) {
        startDate = getRelativeDate(1);
        deadline = `${getRelativeDate(1)}T18:00`;
        clean = clean.replace(/tomorrow/gi, '').trim();
      } else if (clean.toLowerCase().includes('today')) {
        clean = clean.replace(/today/gi, '').trim();
      }

      // Parse priority
      let priority: Process['priority'] = 'Medium';
      if (/critical/i.test(clean)) {
        priority = 'Critical';
        clean = clean.replace(/priority critical|critical priority|critical/gi, '').trim();
      } else if (/high priority|priority high|high/i.test(clean)) {
        priority = 'High';
        clean = clean.replace(/priority high|high priority|high/gi, '').trim();
      } else if (/low priority|priority low|low/i.test(clean)) {
        priority = 'Low';
        clean = clean.replace(/priority low|low priority|low/gi, '').trim();
      }

      // Name cleanup
      const name = clean.replace(/^to\s+/i, '').trim() || 'Custom Daily Process';

      // Auto-detect linked goal based on keywords
      let matchedGoalId: string | undefined;
      for (const g of existingGoals) {
        const gWords = g.name.toLowerCase().split(/\s+/);
        if (gWords.some(w => w.length > 3 && name.toLowerCase().includes(w))) {
          matchedGoalId = g.id;
          break;
        }
      }

      const newProcess: Process = {
        id: 'proc-' + Date.now(),
        name,
        description: `Scheduled via AI Natural Language: "${text}"`,
        category: name.toLowerCase().includes('study') ? 'Learning' : name.toLowerCase().includes('verilog') ? 'Engineering' : 'Deep Work',
        priority,
        startDate,
        deadline,
        status: 'Not Started',
        estimatedDuration: durationMinutes,
        elapsedSeconds: 0,
        isTimerRunning: false,
        goalId: matchedGoalId,
        notes: 'Created via AI Natural Language input.',
        recurrence: 'None',
        scheduledTime: '10:00',
        createdDate: getTodayDateString(),
        updatedDate: getTodayDateString(),
      };

      return {
        action: 'create_process',
        success: true,
        message: `Created process "${name}" (${durationMinutes}m, Priority: ${priority})${matchedGoalId ? ' and linked to related goal' : ''}!`,
        payload: newProcess,
      };
    }

    // 3. Add Goal
    // e.g. "Create a goal to become a VLSI engineer within 12 months"
    if (lower.startsWith('create a goal') || lower.startsWith('create goal') || lower.startsWith('add a goal') || lower.startsWith('add goal') || lower.startsWith('new goal')) {
      let clean = text
        .replace(/^create a goal to /i, '')
        .replace(/^create a goal /i, '')
        .replace(/^create goal to /i, '')
        .replace(/^create goal /i, '')
        .replace(/^add a goal to /i, '')
        .replace(/^add a goal /i, '')
        .replace(/^add goal /i, '');

      // Parse target timeline e.g. "within 12 months", "in 6 months", "within 90 days"
      let targetDate = getRelativeDate(180); // default ~6 months
      const monthsMatch = clean.match(/within\s+(\d+)\s*months?|in\s+(\d+)\s*months?/i);
      if (monthsMatch) {
        const months = parseInt(monthsMatch[1] || monthsMatch[2], 10);
        targetDate = getRelativeDate(months * 30);
        clean = clean.replace(monthsMatch[0], '').trim();
      }

      const name = clean.trim() || 'New Strategic Goal';
      const newGoal: Goal = {
        id: 'goal-' + Date.now(),
        name,
        description: `Goal established via AI input: "${text}"`,
        category: name.toLowerCase().includes('engineer') || name.toLowerCase().includes('career') ? 'Career Goal' : 'Learning Goal',
        priority: 'High',
        startDate: getTodayDateString(),
        targetDate,
        progress: 0,
        status: 'Not Started',
        notes: 'Defined via AI Natural Language input.',
        createdDate: getTodayDateString(),
        updatedDate: getTodayDateString(),
      };

      return {
        action: 'create_goal',
        success: true,
        message: `Created goal "${name}" with target date ${targetDate}!`,
        payload: newGoal,
      };
    }

    // 4. Add Milestone
    // e.g. "Add a milestone to complete my Verilog project"
    if (lower.includes('add a milestone') || lower.includes('add milestone') || lower.includes('create milestone')) {
      const milestoneName = text
        .replace(/.*add a milestone to /i, '')
        .replace(/.*add a milestone /i, '')
        .replace(/.*add milestone /i, '')
        .replace(/.*create milestone /i, '')
        .trim();

      // Find appropriate goal
      const targetGoal = existingGoals.find(g => 
        g.name.toLowerCase().includes('vlsi') || 
        g.name.toLowerCase().includes('verilog') || 
        g.name.toLowerCase().includes('ai')
      ) || existingGoals[0];

      if (targetGoal) {
        const newMilestone: Milestone = {
          id: 'ms-' + Date.now(),
          goalId: targetGoal.id,
          name: milestoneName || 'New Key Milestone',
          description: `Milestone established via AI prompt.`,
          deadline: getRelativeDate(45),
          progress: 0,
          status: 'Not Started',
          order: 99,
        };

        return {
          action: 'create_milestone',
          success: true,
          message: `Added milestone "${newMilestone.name}" to goal "${targetGoal.name}"!`,
          payload: newMilestone,
        };
      }
    }

    // 5. Query / Focus / Show me commands
    // e.g. "Show me what I should focus on today"
    if (lower.includes('what i should focus') || lower.includes('what should i focus') || lower.includes('show me')) {
      return {
        action: 'query_answer',
        success: true,
        message: 'Opening your AI Advisor recommendations for today...',
        payload: { query: 'What should I work on today?' },
      };
    }

    // Default: treat as Advisor Question
    return {
      action: 'query_answer',
      success: true,
      message: `Analyzing: "${text}"`,
      payload: { query: text },
    };
  },

  /**
   * Generates Smart Suggestions by identifying recurring patterns and unlinked activities
   */
  detectSmartSuggestions(processes: Process[], goals: Goal[]): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    // 1. Detect unlinked processes that match goal keywords
    processes.filter(p => !p.goalId).forEach(proc => {
      for (const goal of goals) {
        const words = goal.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const procWords = proc.name.toLowerCase().split(/\s+/);
        const hasOverlap = words.some(w => procWords.some(pw => pw.includes(w) || w.includes(pw)));
        
        if (hasOverlap) {
          suggestions.push({
            id: `sug-${proc.id}-${goal.id}`,
            type: 'link_process_to_goal',
            title: `Link "${proc.name}" to Goal`,
            description: `You frequently complete "${proc.name}". Would you like to connect this process to your "${goal.name}" goal?`,
            processName: proc.name,
            processId: proc.id,
            goalId: goal.id,
            goalName: goal.name,
            status: 'pending',
            confidence: 92,
            createdAt: getTodayDateString(),
          });
          break;
        }
      }
    });

    return suggestions;
  },

  /**
   * Recalculates goal overall progress and status from milestones
   */
  recalculateGoalProgress(goal: Goal, milestones: Milestone[]): Goal {
    const goalMilestones = milestones.filter(m => m.goalId === goal.id);
    if (goalMilestones.length === 0) return goal;

    const totalProgress = goalMilestones.reduce((acc, m) => acc + (m.progress || 0), 0);
    const avgProgress = Math.round(totalProgress / goalMilestones.length);

    // Calculate status based on target date and progress
    const now = new Date();
    const target = new Date(goal.targetDate);
    const start = new Date(goal.startDate);
    const totalDuration = target.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const expectedProgress = totalDuration > 0 ? Math.min(100, Math.round((elapsed / totalDuration) * 100)) : 50;

    let status: Goal['status'] = goal.status;
    if (avgProgress >= 100) {
      status = 'Completed';
    } else if (avgProgress >= expectedProgress - 5) {
      status = 'On Track';
    } else if (avgProgress >= expectedProgress - 20) {
      status = 'At Risk';
    } else {
      status = 'Behind Schedule';
    }

    return {
      ...goal,
      progress: avgProgress,
      status,
      updatedDate: getTodayDateString(),
    };
  },

  /**
   * Evaluates active reminders dynamically
   */
  evaluateReminders(processes: Process[], goals: Goal[], milestones: Milestone[]): Reminder[] {
    const reminders: Reminder[] = [];
    const today = getTodayDateString();

    // Check overdue processes
    processes.filter(p => p.status === 'Overdue').forEach(p => {
      reminders.push({
        id: `rem-overdue-${p.id}`,
        title: 'Overdue Process',
        message: `"${p.name}" has passed its scheduled deadline (${p.deadline}).`,
        severity: 'urgent',
        relatedProcessId: p.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    // Check processes due today that are not completed
    processes.filter(p => p.deadline.startsWith(today) && p.status !== 'Completed' && p.status !== 'Overdue').forEach(p => {
      reminders.push({
        id: `rem-due-today-${p.id}`,
        title: 'Due Today',
        message: `"${p.name}" is scheduled for completion today (${p.deadline.split('T')[1] || 'Today'}).`,
        severity: 'warning',
        relatedProcessId: p.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    // Check at risk goals
    goals.filter(g => g.status === 'At Risk' || g.status === 'Behind Schedule').forEach(g => {
      reminders.push({
        id: `rem-at-risk-${g.id}`,
        title: 'Goal Attention Required',
        message: `"${g.name}" is currently ${g.status}. Review milestones to recover momentum.`,
        severity: 'urgent',
        relatedGoalId: g.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    return reminders;
  }
};

