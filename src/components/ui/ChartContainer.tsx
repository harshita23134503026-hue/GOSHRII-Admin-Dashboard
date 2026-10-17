import React from 'react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  actionSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  actionSlot,
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-card border border-border-light p-4 sm:p-5 shadow-card flex flex-col justify-between ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-ink-primary tracking-tight">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-ink-secondary mt-0.5">{subtitle}</p>}
        </div>
        {actionSlot && <div className="shrink-0">{actionSlot}</div>}
      </div>

      <div className="w-full flex-1 min-h-[260px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
