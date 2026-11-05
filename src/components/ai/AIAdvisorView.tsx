import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { AIEngine } from '../../services/aiEngine';
import { 
  Send, 
  ArrowRight 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  highlights?: string[];
  suggestedAction?: {
    label: string;
    type: 'navigate_timeline' | 'navigate_goals' | 'navigate_deadlines' | 'start_process';
    targetId?: string;
  };
  timestamp: string;
}

export const AIAdvisorView: React.FC = () => {
  const { 
    processes, 
    goals, 
    milestones, 
    consistencyMetrics, 
    startProcess, 
    setActiveTab 
  } = useTracker();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'ai',
      text: "Hello Mathi. I am your personal advisor, grounded directly in your stored processes, milestones, and deadlines. What would you like to review today?",
      highlights: [
        `${processes.length} processes cataloged`,
        `${goals.length} future goals tracked`,
        `Consistency score: ${consistencyMetrics.score}/100`,
      ],
      timestamp: 'Just now',
    }
  ]);

  const quickQuestions = [
    'What should I work on today?',
    'Am I on track for my goal?',
    'Which milestone should I focus on?',
    'Why am I falling behind?',
    'What should I complete this week?',
    'How much progress have I made?',
    'Which daily processes are helping my main goal?',
  ];

  const handleSend = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    setTimeout(() => {
      const response = AIEngine.answerGoalAdvisorQuery(
        queryText,
        processes,
        goals,
        milestones,
        consistencyMetrics
      );

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: response.answer,
        highlights: response.highlights,
        suggestedAction: response.suggestedAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 200);
  };

  const handleAction = (action?: ChatMessage['suggestedAction']) => {
    if (!action) return;
    if (action.type === 'navigate_timeline') setActiveTab('timeline');
    if (action.type === 'navigate_goals') setActiveTab('goals');
    if (action.type === 'navigate_deadlines') setActiveTab('deadlines');
    if (action.type === 'start_process' && action.targetId) {
      startProcess(action.targetId);
      setActiveTab('timeline');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="pb-2">
        <h1 className="font-fraunces font-semibold text-[36px] sm:text-[42px] text-[var(--ink)] tracking-tight leading-tight">
          AI Goal Advisor
        </h1>
        <p className="text-[14px] text-[var(--muted)] mt-1">
          Query your data directly to receive factual, data-driven answers regarding your processes and goal progress.
        </p>
      </div>

      {/* Suggested Inquiries */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider mr-1">Inquire:</span>
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="text-xs px-2.5 py-1 rounded-[6px] border border-[var(--ink)] bg-[var(--card)] hover:bg-[var(--paper)] text-[var(--ink)] transition-colors font-medium shadow-[1px_1px_0_var(--ink)]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Stream Card */}
      <div className="planner-card flex flex-col h-[560px]">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-[10px] p-4 text-[14px] leading-relaxed border-2 border-[var(--ink)] ${
                    isUser
                      ? 'bg-[var(--card)] text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]'
                      : 'bg-[var(--paper)] text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Highlights Bullet Tags */}
                  {msg.highlights && msg.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--rule)]">
                      {msg.highlights.map((h, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-[9999px] bg-[var(--card)] border border-[var(--ink)] text-[12px] text-[var(--muted)] tabular-nums"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Action Button */}
                  {msg.suggestedAction && (
                    <div className="mt-3 pt-2">
                      <button
                        onClick={() => handleAction(msg.suggestedAction)}
                        className="planner-btn btn-primary text-xs py-1 px-3"
                      >
                        <span>{msg.suggestedAction.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <span className="block text-[11px] text-[var(--faint)] mt-2 text-right tabular-nums font-sans">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t-2 border-[var(--ink)] bg-[var(--card)] rounded-b-[12px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask questions about your goals, milestones, or current processes..."
              className="flex-1 px-3.5 py-2 rounded-[8px] bg-[var(--paper)] border-2 border-[var(--ink)] text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="planner-btn btn-primary"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
