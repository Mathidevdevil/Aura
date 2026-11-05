import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Sparkles, BookOpen, ArrowRight, Check } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const { isOnboardingOpen, completeOnboarding, userName } = useTracker();
  const [nameInput, setNameInput] = useState(userName || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOnboardingOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOnboardingOpen]);

  if (!isOnboardingOpen) return null;

  const handleStartFresh = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding(nameInput.trim() || 'Mathi', false);
  };

  const handleLoadDemo = () => {
    completeOnboarding(nameInput.trim() || 'Mathi', true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-none">
      
      {/* Modal Card */}
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="welcome-heading"
        className="planner-card max-w-lg w-full p-6 sm:p-8 bg-[var(--card)] border-2 border-[var(--ink)] rounded-[14px] shadow-[6px_6px_0_var(--ink)] relative space-y-6"
      >
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 font-fraunces italic font-semibold text-3xl sm:text-4xl text-[var(--ink)] leading-none select-none">
            <span>Welcome to Aura</span>
            <span className="text-[var(--tomato)] text-2xl not-italic font-bold">✱</span>
          </div>

          <div className="font-caveat font-bold text-xl sm:text-2xl text-[var(--tomato-ink)]">
            your personal process & future goal tracker
          </div>
        </div>

        {/* Philosophy Note */}
        <div className="bg-[var(--paper)] border-2 border-[var(--ink)] rounded-[10px] p-4 text-[13.5px] leading-relaxed text-[var(--ink)]">
          <p className="font-medium">
            Designed like a tactile notebook planner around one daily question:
          </p>
          <p className="font-fraunces italic text-base text-[var(--tomato-ink)] mt-1.5">
            "What am I doing today, and how is today's work helping me achieve my future goals?"
          </p>
        </div>

        {/* Name Input Form */}
        <form onSubmit={handleStartFresh} className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label 
                htmlFor="user-name-input"
                className="text-xs uppercase tracking-[0.08em] font-semibold text-[var(--ink)]"
              >
                What should we call you?
              </label>
              <span className="font-caveat font-bold text-base text-[var(--muted)]">
                ✎ your notebook greeting
              </span>
            </div>

            <input
              id="user-name-input"
              ref={inputRef}
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Mathi, Alex, Sarah..."
              className="w-full px-4 py-2.5 rounded-[10px] bg-[var(--paper)] border-2 border-[var(--ink)] text-sm font-medium text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none"
            />
          </div>

          {/* Action Choice: Start Fresh vs Demo Roadmap */}
          <div className="space-y-3 pt-2">
            
            {/* Primary Choice: Start with Clean Slate */}
            <button
              type="submit"
              className="planner-btn btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span className="font-bold">Start Fresh (Empty Planner)</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11.5px] text-center text-[var(--muted)]">
              Recommended for your real goals: 100% clean canvas ready for your custom processes.
            </p>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[var(--rule)]"></div>
              <span className="flex-shrink mx-3 text-[11px] font-caveat font-bold text-[var(--faint)]">or</span>
              <div className="flex-grow border-t border-[var(--rule)]"></div>
            </div>

            {/* Secondary Choice: Explore with Sample Data */}
            <button
              type="button"
              onClick={handleLoadDemo}
              className="planner-btn btn-secondary w-full py-2.5 text-xs text-[var(--ink)] flex items-center justify-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
              <span>Explore with Sample Roadmap (VLSI & AI Demo Data)</span>
            </button>

          </div>
        </form>

      </div>
    </div>
  );
};

