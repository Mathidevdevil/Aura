import React, { forwardRef } from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  id,
  label,
  error,
  helperText,
  className = '',
  required,
  ...props
}, ref) => {
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
      </div>

      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`w-full px-3.5 py-2.5 rounded-[8px] bg-[var(--paper)] border-2 text-sm font-medium text-[var(--ink)] placeholder-[var(--faint)] transition-colors focus:outline-none focus:ring-0 ${
          error 
            ? 'border-[var(--tomato)] bg-[var(--tomato)]/5' 
            : 'border-[var(--ink)] focus:border-[var(--blue)]'
        } ${className}`}
        {...props}
      />

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

TextField.displayName = 'TextField';

