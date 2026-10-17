import React from 'react';
import { Calendar } from 'lucide-react';

export type DateRangePreset = 'today' | '7days' | '30days' | 'custom';

interface DateRangeFilterProps {
  selectedPreset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (start: string, end: string) => void;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedPreset,
  onPresetChange,
  customStartDate = '2026-10-01',
  customEndDate = '2026-10-09',
  onCustomDateChange,
  className = '',
}) => {
  const presets: { id: DateRangePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <div className="inline-flex p-1 bg-surface-secondary border border-border-light rounded-lg">
        {presets.map((p) => {
          const isActive = selectedPreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPresetChange(p.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                isActive
                  ? 'bg-white text-ink-primary shadow-xs font-semibold'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {selectedPreset === 'custom' && onCustomDateChange && (
        <div className="flex items-center gap-1.5 text-xs bg-white border border-border-light rounded-lg px-2.5 py-1">
          <Calendar className="w-3.5 h-3.5 text-ink-muted shrink-0" />
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
            className="text-xs text-ink-primary bg-transparent focus:outline-none"
          />
          <span className="text-ink-muted">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
            className="text-xs text-ink-primary bg-transparent focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
