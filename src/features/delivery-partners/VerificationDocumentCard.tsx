import React from 'react';
import { VerificationDocument } from '../../types';
import { VerificationStatusBadge } from './VerificationStatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Layers,
  FileCheck2,
  FileX2,
} from 'lucide-react';

interface VerificationDocumentCardProps {
  document: VerificationDocument;
  onView: (doc: VerificationDocument) => void;
  onReview: (doc: VerificationDocument) => void;
}

export const VerificationDocumentCard: React.FC<VerificationDocumentCardProps> = ({
  document,
  onView,
  onReview,
}) => {
  const isExpired = document.isExpired || (document.expiryDate && new Date(document.expiryDate) < new Date());
  const isMissing = document.status === 'MISSING';

  return (
    <div
      className={`bg-white rounded-xl border transition-all shadow-2xs flex flex-col justify-between ${
        document.status === 'REJECTED'
          ? 'border-rose-200 hover:border-rose-300'
          : document.status === 'EXPIRED' || isExpired
          ? 'border-red-200 hover:border-red-300'
          : document.status === 'VERIFIED'
          ? 'border-emerald-200/80 hover:border-emerald-300'
          : isMissing
          ? 'border-dashed border-slate-300 bg-surface-secondary/40'
          : 'border-border-light hover:border-slate-300'
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Top Header: Title & Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-semibold text-xs sm:text-sm text-ink-primary truncate">
                {document.name}
              </h4>
              {document.hasBackSide && (
                <span
                  title="Document includes front and back side scans"
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded"
                >
                  <Layers className="w-2.5 h-2.5" />
                  2 Sides
                </span>
              )}
              {document.isRequired && (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                  Mandatory
                </span>
              )}
            </div>

            {document.documentNumberMasked && (
              <p className="font-mono text-xs text-ink-secondary mt-1">
                ID: <span className="font-semibold text-ink-primary">{document.documentNumberMasked}</span>
              </p>
            )}
          </div>

          <VerificationStatusBadge status={document.status} size="sm" />
        </div>

        {/* Thumbnail Preview or Empty State Box */}
        <div className="relative group rounded-lg overflow-hidden border border-border-light bg-surface-secondary/60 h-28 flex items-center justify-center">
          {isMissing ? (
            <div className="text-center p-3 text-ink-muted">
              <FileText className="w-8 h-8 mx-auto mb-1 opacity-40" />
              <p className="text-[11px] font-medium">Document Not Submitted</p>
              <p className="text-[10px] text-ink-muted mt-0.5">Partner has not uploaded this file yet</p>
            </div>
          ) : (
            <>
              {/* Image thumbnail */}
              {document.frontUrl ? (
                <img
                  src={document.frontUrl}
                  alt={document.name}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stylized SVG card
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}

              {/* Overlay with Quick View button */}
              <div className="absolute inset-0 bg-ink-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                <button
                  type="button"
                  onClick={() => onView(document)}
                  className="px-3 py-1.5 bg-white text-ink-primary rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-surface-subtle"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Inspect Scan
                </button>
              </div>

              {/* Format pill */}
              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[10px] uppercase backdrop-blur-xs">
                {document.fileType}
              </div>
            </>
          )}
        </div>

        {/* Metadata Strip: Submitted and Expiry */}
        {!isMissing && (
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-ink-muted block">Submitted</span>
              <span className="font-medium text-ink-secondary">
                {document.submittedAt ? formatDate(document.submittedAt, false) : '—'}
              </span>
            </div>

            {document.expiryDate ? (
              <div>
                <span className="text-ink-muted block">Valid Until</span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    isExpired ? 'text-rose-600' : 'text-ink-secondary'
                  }`}
                >
                  {isExpired && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
                  {formatDate(document.expiryDate, false)}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-ink-muted block">Validity</span>
                <span className="text-ink-secondary font-medium">Non-Expiring ID</span>
              </div>
            )}
          </div>
        )}

        {/* Rejection notice if rejected */}
        {document.status === 'REJECTED' && document.rejectionReason && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-0.5">
            <div className="flex items-center gap-1 font-semibold text-rose-700">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              Rejection Reason:
            </div>
            <p className="text-[11px] text-rose-800 leading-snug">{document.rejectionReason}</p>
          </div>
        )}

        {/* Expiry Warning Callout */}
        {isExpired && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="text-[11px] font-medium">Document validity has expired. Requires renewal.</span>
          </div>
        )}

        {/* Verified audit stamp if verified */}
        {document.status === 'VERIFIED' && document.verifiedBy && (
          <div className="text-[11px] text-emerald-800 bg-emerald-50/70 border border-emerald-200/70 rounded-lg p-2 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              Verified by <strong className="font-semibold">{document.verifiedBy}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t border-border-light bg-surface-secondary/50 rounded-b-xl flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onView(document)}
          disabled={isMissing}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-primary bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors disabled:opacity-40"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          View Document
        </button>

        <button
          type="button"
          onClick={() => onReview(document)}
          disabled={isMissing}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-2xs disabled:opacity-40 ${
            document.status === 'VERIFIED'
              ? 'text-slate-700 bg-white border border-border-light hover:bg-surface-subtle'
              : 'text-white bg-brand-500 hover:bg-brand-600'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          {document.status === 'VERIFIED' ? 'Re-Review' : 'Review Document'}
        </button>
      </div>
    </div>
  );
};
