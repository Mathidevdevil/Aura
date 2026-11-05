import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div 
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[var(--card)] border-2 border-[var(--ink)] rounded-[10px] shadow-[4px_4px_0_var(--ink)] text-xs text-[var(--ink)] animate-in slide-in-from-bottom-3 duration-200"
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-[var(--green)] stroke-[2.5]" />
      ) : (
        <AlertCircle className="w-4 h-4 text-[var(--tomato)] stroke-[2.5]" />
      )}
      <span className="font-medium pr-2">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded text-[var(--muted)] hover:text-[var(--ink)]"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

