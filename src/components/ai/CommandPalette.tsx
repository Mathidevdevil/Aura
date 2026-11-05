import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { 
  Search, 
  CornerDownLeft, 
  X, 
  Check, 
  ArrowRight 
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    executeNaturalLanguage 
  } = useTracker();

  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setFeedback(null);
    } else {
      setInput('');
      setFeedback(null);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const examplePrompts = [
    { text: "Add a process to study Verilog for 2 hours tomorrow", type: 'Process' },
    { text: "Create a goal to become a VLSI engineer within 12 months", type: 'Goal' },
    { text: "Add a milestone to complete my Verilog project", type: 'Milestone' },
    { text: "Mark today's Verilog practice as completed", type: 'Action' },
    { text: "Show me what I should focus on today", type: 'Advisor' },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setFeedback(null);

    setTimeout(() => {
      const res = executeNaturalLanguage(input);
      setIsProcessing(false);
      setFeedback({
        message: res.message,
        success: res.success,
      });

      if (res.success && res.action !== 'query_answer') {
        setTimeout(() => {
          setCommandPaletteOpen(false);
        }, 1200);
      }
    }, 250);
  };

  const handleSelectExample = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity" 
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[var(--card)] border-2 border-[var(--ink)] rounded-[14px] shadow-[4px_4px_0_var(--ink)] overflow-hidden z-10">
        
        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3.5 border-b-2 border-[var(--ink)] bg-[var(--card)]">
          <Search className="w-4 h-4 text-[var(--ink)] mr-3 shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type anything naturally... e.g. 'Add process to study Verilog for 2 hours tomorrow'"
            className="flex-1 bg-transparent text-sm font-sans text-[var(--ink)] placeholder-[var(--muted)] outline-none"
          />

          <div className="flex items-center gap-2 ml-2">
            {input.trim() && (
              <button
                type="submit"
                disabled={isProcessing}
                className="planner-btn planner-btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
              >
                <span>{isProcessing ? 'Processing...' : 'Run'}</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setCommandPaletteOpen(false)}
              className="planner-btn planner-btn-outline p-1.5 text-[var(--ink)] hover:bg-[var(--paper)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Feedback / Response */}
        {feedback && (
          <div className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-b-2 border-[var(--ink)] ${
            feedback.success 
              ? 'bg-[var(--green)]/15 text-[var(--green)]' 
              : 'bg-[var(--tomato)]/15 text-[var(--tomato-ink)]'
          }`}>
            {feedback.success ? <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" /> : <X className="w-3.5 h-3.5 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Example Commands */}
        <div className="p-4 bg-[var(--paper)] space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
              Natural Language Commands
            </span>
            <span className="font-hand text-base text-[var(--tomato-ink)]">
              click any example
            </span>
          </div>

          <div className="space-y-1.5">
            {examplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectExample(prompt.text)}
                className="w-full flex items-center justify-between p-2.5 text-left text-xs bg-[var(--card)] text-[var(--ink)] border-2 border-[var(--ink)] rounded-[8px] shadow-[2px_2px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group"
              >
                <span className="truncate pr-2 font-medium">
                  "{prompt.text}"
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-hand text-base text-[var(--tomato-ink)]">
                    {prompt.type}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[var(--ink)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[var(--card)] border-t-2 border-[var(--ink)] text-xs text-[var(--muted)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 rounded border-2 border-[var(--ink)] bg-[var(--paper)] text-[10px] font-bold text-[var(--ink)]">Enter</kbd> to execute</span>
            <span><kbd className="px-1.5 py-0.5 rounded border-2 border-[var(--ink)] bg-[var(--paper)] text-[10px] font-bold text-[var(--ink)]">ESC</kbd> to exit</span>
          </div>
          <span className="font-hand text-sm text-[var(--muted)]">Natural Language Parser</span>
        </div>

      </div>
    </div>
  );
};
