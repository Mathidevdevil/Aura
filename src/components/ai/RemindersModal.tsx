import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { 
  Bell, 
  X, 
  CheckCheck, 
  ArrowRight 
} from 'lucide-react';

export const RemindersModal: React.FC = () => {
  const { 
    isRemindersOpen, 
    setRemindersOpen, 
    reminders, 
    markReminderRead, 
    clearReminders,
    setActiveTab,
    openGoalDetail 
  } = useTracker();

  if (!isRemindersOpen) return null;

  const handleAction = (rem: any) => {
    markReminderRead(rem.id);
    if (rem.relatedGoalId) {
      openGoalDetail(rem.relatedGoalId);
      setRemindersOpen(false);
    } else if (rem.relatedProcessId) {
      setActiveTab('processes');
      setRemindersOpen(false);
    }
  };

  const unreadCount = reminders.filter(r => !r.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={() => setRemindersOpen(false)}
      />

      <div className="relative w-full max-w-md bg-[var(--card)] border-2 border-[var(--ink)] rounded-[14px] shadow-[4px_4px_0_var(--ink)] z-10 flex flex-col max-h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-baseline justify-between px-5 py-4 border-b-2 border-[var(--ink)] bg-[var(--card)]">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[var(--ink)]">
              Reminders & Alerts
            </h3>
            <p className="font-hand text-base text-[var(--tomato-ink)] mt-0.5">
              {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {reminders.length > 0 && (
              <button
                onClick={clearReminders}
                className="planner-btn planner-btn-outline p-1.5 text-[var(--ink)]"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setRemindersOpen(false)}
              className="planner-btn planner-btn-outline p-1.5 text-[var(--ink)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reminders List */}
        <div className="overflow-y-auto p-4 divide-y divide-[var(--rule)]">
          {reminders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--muted)]">
              <Bell className="w-7 h-7 mx-auto mb-2 text-[var(--faint)]" />
              <p className="font-serif text-base text-[var(--ink)] font-semibold mb-0.5">No active alerts</p>
              <p className="font-hand text-base text-[var(--tomato-ink)]">You are completely caught up on your processes and goals.</p>
            </div>
          ) : (
            reminders.map((rem) => {
              const isUrgent = rem.severity === 'urgent';

              return (
                <div
                  key={rem.id}
                  className={`py-3 first:pt-1 last:pb-1 flex flex-col justify-between gap-2 ${
                    rem.read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full border border-[var(--ink)] ${
                          isUrgent ? 'bg-[var(--tomato)]' : 'bg-[var(--blue)]'
                        }`} />
                        <span className={`text-xs font-semibold ${
                          isUrgent ? 'text-[var(--tomato-ink)]' : 'text-[var(--ink)]'
                        }`}>
                          {rem.title}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted)] leading-relaxed pl-4">
                        {rem.message}
                      </p>
                    </div>

                    <span className="text-[11px] font-hand text-[var(--faint)] tabular-nums shrink-0">
                      {new Date(rem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pl-4 pt-1">
                    <button
                      onClick={() => handleAction(rem)}
                      className="text-xs font-semibold text-[var(--tomato-ink)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {!rem.read && (
                      <button
                        onClick={() => markReminderRead(rem.id)}
                        className="text-xs text-[var(--muted)] hover:text-[var(--ink)] underline font-medium"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
