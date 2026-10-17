import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load records',
  message = 'An unexpected error occurred while communicating with the service.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`p-6 sm:p-8 bg-white rounded-card border border-red-200 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3">
        <AlertTriangle className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-ink-primary mb-1">{title}</h3>
      <p className="text-sm text-ink-secondary max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-surface-subtle hover:bg-slate-200 rounded-lg transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
};
