import React from 'react';
import { VerificationHistoryEvent } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Upload,
  UserCheck,
} from 'lucide-react';

interface VerificationHistoryTimelineProps {
  history: VerificationHistoryEvent[];
}

export const VerificationHistoryTimeline: React.FC<VerificationHistoryTimelineProps> = ({
  history,
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-ink-muted bg-surface-secondary/40 rounded-xl border border-dashed border-border-light">
        <Clock className="w-5 h-5 mx-auto mb-1.5 opacity-40" />
        No audit history recorded yet for this partner.
      </div>
    );
  }

  const getActionConfig = (action: VerificationHistoryEvent['action']) => {
    switch (action) {
      case 'APPROVED':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 border-emerald-300',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'text-rose-600',
          bg: 'bg-rose-50 border-rose-300',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'EXPIRED':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bg: 'bg-red-50 border-red-300',
          badge: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'SUBMITTED':
      case 'RESUBMITTED':
        return {
          icon: Upload,
          color: 'text-blue-600',
          bg: 'bg-blue-50 border-blue-300',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      default:
        return {
          icon: Clock,
          color: 'text-slate-600',
          bg: 'bg-slate-50 border-slate-300',
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-light text-xs">
      {history.map((event, idx) => {
        const { icon: ActionIcon, color, bg, badge } = getActionConfig(event.action);

        return (
          <div key={event.id || idx} className="relative group">
            {/* Timeline Milestone Dot */}
            <span
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ring-4 ring-white ${bg}`}
            >
              <ActionIcon className={`w-3.5 h-3.5 ${color}`} />
            </span>

            <div className="bg-white rounded-xl border border-border-light p-3.5 shadow-2xs space-y-1.5 transition-colors hover:border-slate-300">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-primary">
                    {event.documentTitle}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${badge}`}
                  >
                    {event.action}
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted">
                  {formatDate(event.timestamp)}
                </span>
              </div>

              {event.reviewerName && (
                <div className="flex items-center gap-1.5 text-[11px] text-ink-secondary">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Reviewed by <strong className="text-ink-primary">{event.reviewerName}</strong>
                  </span>
                </div>
              )}

              {event.reason && (
                <div className="p-2 bg-rose-50/70 border border-rose-200/60 rounded-lg text-rose-900 mt-1">
                  <span className="font-semibold text-[11px] block">Reason:</span>
                  <p className="text-[11px] text-rose-800 leading-snug">{event.reason}</p>
                </div>
              )}

              {event.remarks && (
                <p className="text-[11px] text-ink-secondary italic mt-0.5">
                  "{event.remarks}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
