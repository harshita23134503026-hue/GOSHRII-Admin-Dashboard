import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  count?: number;
  totalCount?: number;
  label?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search records...',
  count,
  totalCount,
  label = 'records',
  rightSlot,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-card border border-border-light shadow-card ${className}`}
    >
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-sm bg-surface-secondary border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary placeholder:text-ink-muted transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary p-0.5 rounded transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
        {count !== undefined && (
          <span className="text-xs text-ink-secondary whitespace-nowrap">
            Showing <strong className="text-ink-primary">{count}</strong>
            {totalCount !== undefined ? ` of ${totalCount}` : ''} {label}
          </span>
        )}
        {rightSlot}
      </div>
    </div>
  );
};
