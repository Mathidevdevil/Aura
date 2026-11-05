import React, { useState, useRef, useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Plus, 
  Menu, 
  Bell, 
  User, 
  Settings, 
  LogOut 
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { 
    theme, 
    toggleTheme, 
    openProcessModal, 
    openGoalModal, 
    setRemindersOpen, 
    unreadRemindersCount 
  } = useTracker();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsAccountOpen(false);
    await logout();
    navigate('/login');
  };

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="w-full flex items-center justify-between gap-4 py-4 px-4 md-custom:px-10 border-b border-[var(--rule)] md-custom:border-b-0">
      
      {/* Mobile-only menu toggle & wordmark (< 860px) */}
      <div className="flex items-center gap-3 md-custom:hidden">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="planner-btn btn-icon w-9 h-9"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-1.5 font-fraunces italic font-semibold text-2xl text-[var(--ink)]">
          <span>Aura</span>
          <span className="text-[var(--tomato)] text-lg not-italic font-bold leading-none">✱</span>
        </div>
      </div>

      {/* Right-aligned Top Tools Row */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        
        {/* Real Notification Bell (ONLY shown if unread count > 0) */}
        {unreadRemindersCount > 0 && (
          <button
            onClick={() => setRemindersOpen(true)}
            className="planner-btn btn-icon w-10 h-10 relative"
            title={`${unreadRemindersCount} unread notifications`}
            aria-label={`${unreadRemindersCount} unread notifications`}
          >
            <Bell className="w-4 h-4 text-[var(--tomato)]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--tomato)]" />
          </button>
        )}

        {/* Theme Toggle (Square Icon Button) */}
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

        {/* "Add goal" (Secondary Button) */}
        <button
          onClick={() => openGoalModal()}
          className="planner-btn btn-secondary hidden sm:inline-flex"
        >
          Add goal
        </button>

        {/* "Add process" (Primary Button) */}
        <button
          onClick={() => openProcessModal()}
          className="planner-btn btn-primary"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add process</span>
        </button>

        {/* Account Menu Dropdown */}
        {user && (
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="w-10 h-10 rounded-full border-2 border-[var(--ink)] bg-[var(--card)] text-[var(--ink)] font-bold text-xs flex items-center justify-center hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all shadow-[2px_2px_0_var(--ink)]"
              aria-label="Account menu"
              aria-expanded={isAccountOpen}
            >
              {initials}
            </button>

            {isAccountOpen && (
              <div 
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-[10px] bg-[var(--card)] border-2 border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] py-2 z-50 text-xs text-[var(--ink)]"
              >
                {/* User info */}
                <div className="px-3.5 py-2 border-b border-[var(--rule)]">
                  <div className="font-bold text-sm truncate">{user.name}</div>
                  <div className="text-[11px] text-[var(--muted)] truncate">{user.email}</div>
                </div>

                <Link
                  to="/settings/account"
                  onClick={() => setIsAccountOpen(false)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[var(--paper)] transition-colors"
                  role="menuitem"
                >
                  <Settings className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>Account Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-[var(--tomato-ink)] hover:bg-[var(--tomato)]/10 transition-colors text-left font-semibold border-t border-[var(--rule)]"
                  role="menuitem"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
