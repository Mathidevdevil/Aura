import React from 'react';
import { Check, Dot } from 'lucide-react';
import { authCopy } from '../../i18n/auth.en';

export interface PasswordRuleState {
  hasLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecialOrMixed: boolean;
  score: number; // 0 - 4
}

export function evaluatePasswordStrength(password: string): PasswordRuleState {
  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialOrMixed = (/[^a-zA-Z0-9]/.test(password)) || (/[a-z]/.test(password) && /[A-Z]/.test(password));

  let score = 0;
  if (hasLength) score++;
  if (hasLetter) score++;
  if (hasNumber) score++;
  if (hasSpecialOrMixed) score++;

  return {
    hasLength,
    hasLetter,
    hasNumber,
    hasSpecialOrMixed,
    score: Math.min(score, 4),
  };
}

interface StrengthMeterProps {
  password: string;
}

export const StrengthMeter: React.FC<StrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const { hasLength, hasLetter, hasNumber, hasSpecialOrMixed, score } = evaluatePasswordStrength(password);

  const labels = [
    authCopy.strength.veryWeak,
    authCopy.strength.weak,
    authCopy.strength.medium,
    authCopy.strength.strong,
    authCopy.strength.veryStrong,
  ];

  // Visual color for strength
  const getBarColorClass = (index: number) => {
    if (index >= score) return 'bg-[var(--rule)]';
    if (score <= 1) return 'bg-[var(--tomato)]';
    if (score === 2) return 'bg-[var(--marker)]';
    if (score === 3) return 'bg-[var(--blue)]';
    return 'bg-[var(--green)]';
  };

  return (
    <div className="space-y-2 pt-1" aria-live="polite">
      
      {/* 4-segment visual bar */}
      <div className="flex items-center gap-1.5 h-2 w-full">
        {[0, 1, 2, 3].map((segmentIndex) => (
          <div
            key={segmentIndex}
            className={`h-full flex-1 rounded-full border border-[var(--ink)] transition-colors ${getBarColorClass(segmentIndex)}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--muted)]">Password strength:</span>
        <span className="font-semibold text-[var(--ink)] font-sans">
          {labels[score]}
        </span>
      </div>

      {/* Live rule checklist */}
      <ul className="space-y-1 pt-1 text-xs text-[var(--muted)]" aria-label="Password requirements">
        <li className={`flex items-center gap-1.5 ${hasLength ? 'text-[var(--green)] font-semibold' : ''}`}>
          {hasLength ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Dot className="w-3.5 h-3.5" />}
          <span>{authCopy.strength.ruleLength}</span>
        </li>
        <li className={`flex items-center gap-1.5 ${hasLetter ? 'text-[var(--green)] font-semibold' : ''}`}>
          {hasLetter ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Dot className="w-3.5 h-3.5" />}
          <span>{authCopy.strength.ruleLetter}</span>
        </li>
        <li className={`flex items-center gap-1.5 ${hasNumber ? 'text-[var(--green)] font-semibold' : ''}`}>
          {hasNumber ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Dot className="w-3.5 h-3.5" />}
          <span>{authCopy.strength.ruleNumber}</span>
        </li>
        <li className={`flex items-center gap-1.5 ${hasSpecialOrMixed ? 'text-[var(--green)] font-semibold' : ''}`}>
          {hasSpecialOrMixed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Dot className="w-3.5 h-3.5" />}
          <span>{authCopy.strength.ruleSpecial}</span>
        </li>
      </ul>

    </div>
  );
};
