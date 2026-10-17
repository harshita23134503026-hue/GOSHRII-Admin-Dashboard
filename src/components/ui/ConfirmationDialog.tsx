import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const iconVariants = {
    danger: <AlertCircle className="w-6 h-6 text-red-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <Info className="w-6 h-6 text-brand-600" />,
  };

  const btnVariants = {
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/20',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/20',
    info: 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500/20',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="fixed inset-0 bg-ink-primary/40 backdrop-blur-xs transition-opacity"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 overflow-hidden text-left border border-border-light z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-full bg-surface-subtle shrink-0">
            {iconVariants[variant]}
          </div>
          <div className="flex-1">
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-ink-primary">
              {title}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-ink-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 ${btnVariants[variant]}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
