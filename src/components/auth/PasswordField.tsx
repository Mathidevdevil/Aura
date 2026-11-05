import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
  rightAction?: React.ReactNode;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(({
  id,
  label,
  error,
  helperText,
  rightAction,
  className = '',
  required,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-baseline justify-between">
        <label 
          htmlFor={id} 
          className="text-xs uppercase tracking-[0.08em] font-semibold text-[var(--ink)] select-none"
        >
          {label} {required && <span className="text-[var(--tomato)]" aria-hidden="true">*</span>}
        </label>
        {rightAction}
      </div>

      <div className="relative flex items-center">
        <input
          ref={ref}
          id={id}
          type={showPassword ? 'text' : 'password'}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full pl-3.5 pr-11 py-2.5 rounded-[8px] bg-[var(--paper)] border-2 text-sm font-medium text-[var(--ink)] placeholder-[var(--faint)] transition-colors focus:outline-none focus:ring-0 ${
            error 
              ? 'border-[var(--tomato)] bg-[var(--tomato)]/5' 
              : 'border-[var(--ink)] focus:border-[var(--blue)]'
          } ${className}`}
          {...props}
        />

        <button
          type="button"
          tabIndex={0}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 p-1.5 text-[var(--muted)] hover:text-[var(--ink)] transition-colors rounded-[4px]"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-[var(--tomato-ink)] font-semibold flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-[var(--muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

PasswordField.displayName = 'PasswordField';

