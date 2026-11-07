import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { VerificationDocument } from '../../types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';

interface DocumentReviewDialogProps {
  document: VerificationDocument | null;
  partnerId: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmit: (params: {
    partnerId: string;
    documentId: string;
    decision: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    internalRemarks?: string;
    reviewerName: string;
  }) => Promise<void>;
}

const COMMON_REJECTION_REASONS = [
  'Blurry or unreadable document scan. Details cannot be confirmed.',
  'Document expired or validity period has lapsed.',
  'Name mismatch with partner registration profile.',
  'Document cut off — edges, QR code, or security emblems missing.',
  'Back side of document missing or unreadable.',
  'Invalid document type uploaded.',
  'Suspected alteration or forged document.',
  'Other custom operational reason',
];

export const DocumentReviewDialog: React.FC<DocumentReviewDialogProps> = ({
  document,
  partnerId,
  isOpen,
  onClose,
  onReviewSubmit,
}) => {
  const [action, setAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [selectedReason, setSelectedReason] = useState(COMMON_REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [internalRemarks, setInternalRemarks] = useState('');
  const [reviewerName, setReviewerName] = useState('Shriya Verma (Ops Lead)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !document) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalRejectionReason =
        action === 'REJECTED'
          ? selectedReason === 'Other custom operational reason'
            ? customReason.trim() || 'Document rejected by reviewer.'
            : selectedReason
          : undefined;

      await onReviewSubmit({
        partnerId,
        documentId: document.id,
        decision: action,
        rejectionReason: finalRejectionReason,
        internalRemarks: internalRemarks.trim() || undefined,
        reviewerName,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialog = (
    <div
      className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-xs animate-in fade-in duration-150"
      style={{ zIndex: 9999 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 overflow-hidden text-left border border-border-light">
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              action === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {action === 'APPROVED' ? (
              <FileCheck2 className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-ink-primary">
              Review Document: {document.name}
            </h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Partner ID: <strong className="text-ink-primary">{partnerId}</strong>
              {document.documentNumberMasked && (
                <> • Document No: <strong className="font-mono">{document.documentNumberMasked}</strong></>
              )}
            </p>
          </div>
        </div>

        {/* Action Toggle Switch */}
        <div className="grid grid-cols-2 p-1 bg-surface-secondary rounded-xl border border-border-light mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAction('APPROVED')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              action === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve Document
          </button>

          <button
            type="button"
            onClick={() => setAction('REJECTED')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              action === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Reject Document
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {action === 'APPROVED' ? (
            /* Approval Form View */
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2.5 text-emerald-900">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Document Verification Confirmation</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                By approving this document, you confirm that the scan has been visually inspected,
                the masked identifiers match company records, and the document is valid under
                GOSHRII compliance standards.
              </p>
            </div>
          ) : (
            /* Rejection Form View */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                  Select Reason for Rejection *
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                >
                  {COMMON_REJECTION_REASONS.map((reason, i) => (
                    <option key={i} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {selectedReason === 'Other custom operational reason' && (
                <div>
                  <label className="block text-xs font-medium text-ink-primary mb-1">
                    Specific Rejection Reason *
                  </label>
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    required
                    placeholder="Provide exact instructions on what the partner needs to fix..."
                    className="w-full text-xs p-2.5 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Internal Remarks */}
          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1">
              Internal Audit Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={internalRemarks}
              onChange={(e) => setInternalRemarks(e.target.value)}
              placeholder="e.g. Cross-verified with UIDAI offline XML / Parivahan SARATHI database..."
              className="w-full text-xs p-2.5 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
            />
          </div>

          {/* Reviewer Signature */}
          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1">
              Reviewer Name / Admin Signature *
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
            />
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-3 border-t border-border-light flex items-center justify-end gap-2.5">
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
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm disabled:opacity-40 ${
                action === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {action === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(dialog, window.document.body);
};
