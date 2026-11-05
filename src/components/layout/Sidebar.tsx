import React from 'react';
import { useTracker, NavigationTab } from '../../context/TrackerContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    processes, 
    goals, 
    consistencyMetrics,
    loadDemoData,
    clearToFreshSlate,
    setIsOnboardingOpen,
    userName
  } = useTracker();

  const navigate = useNavigate();
  const location = useLocation();

  // Badges calculations from real data
  const pendingProcessesCount = processes.filter(p => p.status === 'In Progress' || p.status === 'Not Started').length;
  const activeGoalsCount = goals.filter(g => g.status !== 'Completed').length;
  const overdueCount = processes.filter(p => p.status === 'Overdue').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'processes', label: 'My Processes', count: pendingProcessesCount },
    { id: 'timeline', label: 'Daily Timeline' },
    { id: 'goals', label: 'Future Goals', count: activeGoalsCount },
    { id: 'deadlines', label: 'Deadlines', count: overdueCount > 0 ? overdueCount : undefined },
    { id: 'calendar', label: 'Calendar' },
    { id: 'analytics', label: 'Progress Analytics' },
    { id: 'advisor', label: 'AI Goal Advisor' },
    { id: 'history', label: 'Activity History' },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (location.pathname !== '/') {
      navigate('/');
    }
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarInner = (
    <div className="flex flex-col h-full justify-between p-6 bg-[var(--paper)]">
      
      {/* Top: Wordmark & Navigation */}
      <div>
        {/* "Aura" wordmark in Fraunces italic 32px with small tomato asterisk */}
        <div className="flex items-center justify-between pb-8 pt-1">
          <div className="flex items-center gap-1.5 font-fraunces italic font-semibold text-[32px] text-[var(--ink)] leading-none select-none">
            <span>Aura</span>
            <span className="text-[var(--tomato)] text-xl not-italic font-bold">✱</span>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md-custom:hidden p-1.5 rounded-[6px] text-[var(--ink)] hover:bg-[var(--rule)]"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Semantic Navigation: Plain text nav links, no icon boxes */}
        <nav aria-label="Main Navigation">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className="w-full text-left py-1.5 flex items-baseline justify-between group transition-colors"
                  >
                    <span 
                      className={`text-[15px] font-sans ${
                        isActive 
                          ? 'nav-active-marker text-[var(--ink)] font-bold' 
                          : 'text-[var(--muted)] hover:text-[var(--ink)] font-normal'
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Counts in Caveat 20px, --tomato-ink */}
                    {item.count !== undefined && item.count > 0 && (
                      <span className="font-caveat font-bold text-[20px] text-[var(--tomato-ink)] leading-none">
                        {item.count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom: Rotated (-1.5deg) Caveat note from live data */}
      <div className="pt-6 border-t border-[var(--rule)] space-y-3">
        <div 
          onClick={() => handleNavClick('analytics')}
          className="cursor-pointer font-caveat font-bold text-[20px] text-[var(--ink)] transform -rotate-[1.5deg] leading-tight hover:text-[var(--tomato)] transition-colors select-none"
        >
          {processes.length === 0 && goals.length === 0
            ? "clean slate. ready to plan."
            : `consistency ${consistencyMetrics.score} out of 100. keep going.`}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[var(--faint)] pt-1">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="hover:text-[var(--ink)] underline transition-colors"
          >
            {userName ? `Hi, ${userName}` : 'Setup'}
          </button>

          {processes.length === 0 && goals.length === 0 ? (
            <button
              onClick={loadDemoData}
              className="text-[var(--tomato-ink)] font-semibold hover:underline"
            >
              + Load demo
            </button>
          ) : (
            <button
              onClick={clearToFreshSlate}
              className="hover:text-[var(--tomato-ink)] hover:underline"
              title="Clear all tasks and goals to start fresh"
            >
              Clean slate
            </button>
          )}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (250px, sticky, 2px ink right border, paper background) */}
      <aside 
        className="hidden md-custom:block w-[250px] shrink-0 sticky top-0 h-screen border-r-2 border-[var(--ink)] bg-[var(--paper)] z-20 overflow-y-auto"
      >
        {sidebarInner}
      </aside>

      {/* Mobile Drawer Overlay (< 860px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md-custom:hidden flex">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={onCloseMobile}
          />
          <div className="relative w-[270px] max-w-[85vw] bg-[var(--paper)] border-r-2 border-[var(--ink)] h-full shadow-2xl z-10">
            {sidebarInner}
          </div>
        </div>
      )}
    </>
  );
};
