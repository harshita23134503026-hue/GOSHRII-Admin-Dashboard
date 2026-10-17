import React from 'react';
import { PackageOpen, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Try adjusting your search query or active filter settings.',
  icon: Icon = PackageOpen,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-card border border-dashed border-border-light ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-surface-secondary border border-border-light flex items-center justify-center text-ink-muted mb-3">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="text-base font-semibold text-ink-primary mb-1">{title}</h4>
      <p className="text-sm text-ink-secondary max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
