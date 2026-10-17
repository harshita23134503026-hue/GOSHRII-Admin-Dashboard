import React from 'react';
import { PartnerVerificationStatus, VerificationDocumentStatus } from '../../types';
import { CheckCircle2, Clock, XCircle, AlertTriangle, FileQuestion } from 'lucide-react';

interface VerificationStatusBadgeProps {
  status: PartnerVerificationStatus | VerificationDocumentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const getConfig = () => {
    switch (status) {
      case 'VERIFIED':
        return {
          label: 'Verified',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'PENDING_REVIEW':
        return {
          label: 'Pending Review',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: Clock,
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: XCircle,
        };
      case 'EXPIRED':
        return {
          label: 'Expired',
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500',
          icon: AlertTriangle,
        };
      case 'INCOMPLETE':
        return {
          label: 'Incomplete',
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          icon: FileQuestion,
        };
      case 'MISSING':
        return {
          label: 'Missing Document',
          bg: 'bg-slate-50 text-slate-500 border-slate-200 border-dashed',
          dot: 'bg-slate-300',
          icon: FileQuestion,
        };
      default:
        return {
          label: (status as string).replace(/_/g, ' '),
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          icon: Clock,
        };
    }
  };

  const { label, bg, dot, icon: Icon } = getConfig();

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide whitespace-nowrap shadow-2xs ${bg} ${sizeStyles} ${className}`}
    >
      {showIcon ? (
        <Icon className={`${iconSizes} shrink-0`} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      )}
      <span>{label}</span>
    </span>
  );
};
