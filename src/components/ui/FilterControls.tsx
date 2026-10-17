import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (val: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-ink-secondary whitespace-nowrap font-medium">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs bg-white border border-border-light rounded-md px-2.5 py-1.5 text-ink-primary font-medium hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-secondary/70 border border-border-light rounded-lg text-xs">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-ink-secondary font-medium mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>
        {children}
      </div>

      {hasActiveFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium py-1 px-2 rounded hover:bg-rose-50 transition-colors ml-auto"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Filters
        </button>
      )}
    </div>
  );
};
