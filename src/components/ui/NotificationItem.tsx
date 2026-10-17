import React from 'react';
import { AlertCircle, AlertTriangle, Info, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OperationalAlert } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface NotificationItemProps {
  alert: OperationalAlert;
  onDismiss?: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ alert, onDismiss }) => {
  const iconMap = {
    error: <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />,
  };

  const bgMap = {
    error: 'bg-red-50/50 hover:bg-red-50 border-red-100',
    warning: 'bg-amber-50/50 hover:bg-amber-50 border-amber-100',
    info: 'bg-brand-50/30 hover:bg-brand-50/60 border-brand-100',
  };

  return (
    <div
      className={`p-3 rounded-lg border text-xs transition-colors flex items-start gap-2.5 ${bgMap[alert.severity]} ${
        alert.isRead ? 'opacity-75' : ''
      }`}
    >
      {iconMap[alert.severity]}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="font-semibold text-ink-primary truncate">{alert.title}</p>
          <span className="text-[10px] text-ink-muted whitespace-nowrap">
            {formatRelativeTime(alert.timestamp)}
          </span>
        </div>
        <p className="text-ink-secondary mt-0.5 line-clamp-2 leading-relaxed">
          {alert.description}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <Link
            to={alert.linkTo}
            onClick={() => onDismiss?.(alert.id)}
            className="inline-flex items-center gap-0.5 font-medium text-brand-700 hover:text-brand-800 hover:underline"
          >
            Review issue
            <ArrowUpRight className="w-3 h-3" />
          </Link>
          {!alert.isRead && onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(alert.id)}
              className="text-[11px] text-ink-muted hover:text-ink-secondary"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
