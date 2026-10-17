import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface FormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const FormDrawer: React.FC<FormDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  onSubmit,
  submitLabel = 'Save Changes',
  isSubmitting = false,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="form-drawer-title">
      <div
        className="fixed inset-0 bg-ink-primary/30 backdrop-blur-xs transition-opacity"
        onClick={isSubmitting ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <form
          onSubmit={onSubmit}
          className={`w-screen ${widthClasses[maxWidth]} bg-white shadow-drawer flex flex-col`}
        >
          {/* Header */}
          <div className="p-5 border-b border-border-light flex items-start justify-between gap-4 bg-surface-secondary/40 shrink-0">
            <div>
              <h2 id="form-drawer-title" className="text-lg font-semibold text-ink-primary tracking-tight">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-ink-secondary mt-1">{subtitle}</p>}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close form drawer"
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors shrink-0 disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {children}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border-light bg-surface-secondary/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
