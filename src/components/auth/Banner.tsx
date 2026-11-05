import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface BannerProps {
  type: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const Banner: React.FC<BannerProps> = ({
  type,
  title,
  message,
  onDismiss,
  className = '',
}) => {
  const styles = {
    error: {
      bg: 'bg-[var(--tomato)]/10 border-[var(--tomato)] text-[var(--tomato-ink)]',
      icon: <AlertCircle className="w-5 h-5 shrink-0 stroke-[2.5]" />,
    },
    success: {
      bg: 'bg-[var(--green)]/10 border-[var(--green)] text-[var(--green)]',
      icon: <CheckCircle2 className="w-5 h-5 shrink-0 stroke-[2.5]" />,
    },
    info: {
      bg: 'bg-[var(--blue)]/10 border-[var(--blue)] text-[var(--blue)]',
      icon: <Info className="w-5 h-5 shrink-0 stroke-[2.5]" />,
    },
  }[type];

  return (
    <div
      role="alert"
      className={`p-3.5 rounded-[8px] border-2 flex items-start gap-3 text-xs leading-relaxed ${styles.bg} ${className}`}
    >
      {styles.icon}
      <div className="flex-1 min-w-0">
        {title && <div className="font-bold text-sm mb-0.5">{title}</div>}
        <div className="font-medium text-[var(--ink)]">{message}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded text-current hover:opacity-75 transition-opacity"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

