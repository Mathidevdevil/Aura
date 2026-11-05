import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Sun, Moon, CheckCircle2, ArrowRight } from 'lucide-react';
import { authCopy } from '../../i18n/auth.en';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { theme, toggleTheme } = useTracker();

  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      
      {/* Top Header Row */}
      <header className="w-full flex items-center justify-between py-3 px-4 sm:px-6 md:px-12 border-b-2 border-[var(--ink)] bg-[var(--paper)]">
        <div className="flex items-center gap-1.5 font-fraunces italic font-semibold text-2xl sm:text-3xl text-[var(--ink)] leading-none select-none">
          <span>{authCopy.common.appName}</span>
          <span className="text-[var(--tomato)] text-2xl not-italic font-bold">✱</span>
        </div>

        {/* Theme Toggle (Square button) */}
        <button
          onClick={toggleTheme}
          className="planner-btn btn-icon w-10 h-10"
          title={theme === 'dark' ? 'Switch to daylight paper' : 'Switch to night paper'}
          aria-label={theme === 'dark' ? 'Switch to daylight paper' : 'Switch to night paper'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[var(--tomato)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--ink)]" />
          )}
        </button>
      </header>

      {/* Main Two-Column Layout (under 960px: story panel hidden) */}
      <main className="flex-1 flex w-full max-w-7xl mx-auto items-stretch">
        
        {/* Left: Story Panel (hidden < 960px) */}
        <aside 
          aria-label="Aura Philosophy"
          className="hidden min-[960px]:flex flex-col justify-between w-[46%] p-12 border-r-2 border-[var(--ink)] bg-[var(--card)] relative"
        >
          <div className="space-y-8">
            <div className="inline-block px-3 py-1 rounded-full border border-[var(--ink)] bg-[var(--paper)] text-xs font-semibold uppercase tracking-wider text-[var(--tomato-ink)]">
              Paper-and-Ink Planner
            </div>

            {/* Hand-lettered Quote */}
            <div className="space-y-3">
              <blockquote className="font-fraunces font-semibold text-[32px] lg:text-[38px] text-[var(--ink)] leading-[1.18] tracking-[-0.02em]">
                {authCopy.story.quote}
              </blockquote>
              <div className="font-caveat font-bold text-2xl text-[var(--tomato-ink)]">
                — {authCopy.story.attribution}
              </div>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-5 pt-6 border-t-2 border-[var(--rule)]">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border-2 border-[var(--ink)] bg-[var(--green)] flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--ink)]">
                    {authCopy.story.feature1Title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    {authCopy.story.feature1Text}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border-2 border-[var(--ink)] bg-[var(--blue)] flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--ink)]">
                    {authCopy.story.feature2Title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    {authCopy.story.feature2Text}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border-2 border-[var(--ink)] bg-[var(--marker)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--ink)]">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--ink)]">
                    {authCopy.story.feature3Title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    {authCopy.story.feature3Text}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Sticky Note */}
          <div className="sticky-note p-4 mt-8">
            <div className="font-caveat font-bold text-xl text-[var(--ink)] leading-none mb-1">
              note to self
            </div>
            <p className="font-sans text-xs text-[var(--ink)] leading-relaxed">
              No financial data, no transaction tracking, no ads. Just pure focus on what you achieve today and tomorrow.
            </p>
          </div>
        </aside>

        {/* Right: Auth Form Container */}
        <section 
          aria-label={title}
          className="flex-1 flex flex-col justify-center p-3.5 sm:p-8 lg:p-16 max-w-xl mx-auto w-full"
        >
          <div className="planner-card p-4 sm:p-8 lg:p-10 bg-[var(--card)] border-2 border-[var(--ink)] rounded-[14px] shadow-[3px_3px_0_var(--ink)] sm:shadow-[6px_6px_0_var(--ink)] space-y-5 sm:space-y-6">
            
            {/* Header */}
            <div>
              <h1 className="font-fraunces font-semibold text-[26px] sm:text-[36px] text-[var(--ink)] tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[13px] sm:text-[14px] text-[var(--muted)] mt-1 sm:mt-1.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Content */}
            {children}

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[var(--muted)] border-t border-[var(--rule)]">
        <span>© {new Date().getFullYear()} Aura Tracker. Hand-crafted paper-and-ink architecture.</span>
      </footer>

    </div>
  );
};

