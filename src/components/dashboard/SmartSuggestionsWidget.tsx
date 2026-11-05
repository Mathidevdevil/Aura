import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Check, X } from 'lucide-react';

export const SmartSuggestionsWidget: React.FC = () => {
  const { suggestions, acceptSuggestion, rejectSuggestion } = useTracker();

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  if (pendingSuggestions.length === 0) return null;

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] rounded-[8px] p-6">
      
      {/* Header */}
      <div className="flex items-baseline justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="font-serif text-lg text-[var(--text)] font-normal">
            Suggested Optimizations
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Patterns identified across your processes and milestones.
          </p>
        </div>

        <span className="text-xs text-[var(--muted)] tabular-nums">
          {pendingSuggestions.length} pending
        </span>
      </div>

      {/* Suggestion Items */}
      <div className="divide-y divide-[var(--border)]">
        {pendingSuggestions.map((sug) => (
          <div
            key={sug.id}
            className="py-4 first:pt-4 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text)]">
                  {sug.title}
                </span>
                <span className="text-[11px] text-[var(--accent)] tabular-nums">
                  {sug.confidence}% confidence
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {sug.description}
              </p>
            </div>

            {/* Accept / Reject Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => acceptSuggestion(sug.id)}
                className="btn-primary text-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>

              <button
                onClick={() => rejectSuggestion(sug.id)}
                className="btn-secondary text-xs"
                title="Dismiss suggestion"
              >
                <X className="w-3.5 h-3.5" />
                <span>Dismiss</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
