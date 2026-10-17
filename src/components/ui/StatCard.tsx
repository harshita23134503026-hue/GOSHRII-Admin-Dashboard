import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  icon?: LucideIcon;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default',
  className = '',
  onClick,
}) => {
  const borderVariants = {
    default: 'border-border-light hover:border-slate-300',
    warning: 'border-amber-200 bg-amber-50/30',
    danger: 'border-red-200 bg-red-50/30',
    success: 'border-brand-100 bg-brand-50/20',
  };

  const iconVariants = {
    default: 'text-ink-secondary bg-surface-subtle',
    warning: 'text-amber-700 bg-amber-100',
    danger: 'text-red-700 bg-red-100',
    success: 'text-brand-600 bg-brand-50',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-card border p-4 sm:p-5 transition-all shadow-card ${borderVariants[variant]} ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-secondary uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-semibold text-ink-primary mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg shrink-0 ${iconVariants[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
          {trend && (
            <span
              className={`inline-flex items-center font-medium ${
                trend.isPositive ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
              )}
              {trend.value}%
            </span>
          )}
          {subtitle && <span className="text-ink-secondary">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
