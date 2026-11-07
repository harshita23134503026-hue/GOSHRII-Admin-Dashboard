import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VerificationDocument } from '../../types';
import { VerificationStatusBadge } from './VerificationStatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileText,
  ShieldAlert,
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface DocumentPreviewModalProps {
  document: VerificationDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onReview?: (doc: VerificationDocument) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onReview,
}) => {
  const [activeSide, setActiveSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  // Reset transforms whenever opening or changing document
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(100);
      setRotation(0);
      setActiveSide('FRONT');
    }
  }, [isOpen, document]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      window.document.body.style.overflow = 'hidden';
    } else {
      window.document.body.style.overflow = '';
    }
    return () => {
      window.document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !document) return null;

  const currentUrl = activeSide === 'FRONT' ? document.frontUrl : document.backUrl || document.frontUrl;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(100);
    setRotation(0);
  };

  const modal = (
    <div
      className="fixed inset-0 z-60 overflow-hidden flex items-center justify-center p-2 sm:p-4 bg-ink-primary/75 backdrop-blur-xs animate-in fade-in duration-150"
      style={{ zIndex: 9999 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border-light">
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 border-b border-border-light flex items-center justify-between gap-4 bg-surface-secondary/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-brand-50 text-brand-700 rounded-lg shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-ink-primary tracking-tight truncate">
                  {document.name}
                </h3>
                <VerificationStatusBadge status={document.status} size="sm" />
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-secondary mt-0.5 flex-wrap">
                {document.documentNumberMasked && (
                  <span className="font-mono">
                    ID: <strong>{document.documentNumberMasked}</strong>
                  </span>
                )}
                {document.expiryDate && (
                  <span>
                    Valid Until: <strong>{formatDate(document.expiryDate, false)}</strong>
                  </span>
                )}
                <span>Format: {document.fileType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onReview && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReview(document);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-2xs transition-colors"
              >
                Review Document
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close document preview"
              className="p-2 text-ink-muted hover:text-ink-primary hover:bg-surface-subtle rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Toolbar: Front/Back Selector & Zoom/Rotate Actions */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-border-light bg-white flex items-center justify-between gap-3 flex-wrap shrink-0">
          {/* Side Selector (Front vs Back) */}
          {document.hasBackSide ? (
            <div className="inline-flex rounded-lg p-0.5 bg-surface-secondary border border-border-light text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setActiveSide('FRONT');
                  handleReset();
                }}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeSide === 'FRONT'
                    ? 'bg-white text-ink-primary shadow-xs font-semibold'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Front Side
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSide('BACK');
                  handleReset();
                }}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeSide === 'BACK'
                    ? 'bg-white text-ink-primary shadow-xs font-semibold'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Back Side
              </button>
            </div>
          ) : (
            <span className="text-xs text-ink-muted">Single-page document preview</span>
          )}

          {/* Transformation Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              title="Zoom Out"
              className="p-1.5 rounded-lg border border-border-light text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary disabled:opacity-40 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs text-ink-primary font-medium w-12 text-center">
              {zoomLevel}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 250}
              title="Zoom In"
              className="p-1.5 rounded-lg border border-border-light text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary disabled:opacity-40 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-border-light mx-1" />

            <button
              type="button"
              onClick={handleRotate}
              title="Rotate 90° Clockwise"
              className="p-1.5 rounded-lg border border-border-light text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Fit to Screen / Reset View"
              className="p-1.5 rounded-lg border border-border-light text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary transition-colors text-xs font-medium flex items-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fit</span>
            </button>
          </div>
        </div>

        {/* Document Inspection Stage */}
        <div className="flex-1 bg-slate-900/90 relative overflow-auto p-6 flex items-center justify-center select-none">
          {/* Security Watermark Backdrop */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 select-none text-white text-5xl font-black rotate-[-25deg] tracking-widest text-center">
            GOSHRII CONFIDENTIAL KYC
          </div>

          <div
            className="transition-transform duration-200 ease-out origin-center flex items-center justify-center max-w-full max-h-full"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
            }}
          >
            {currentUrl ? (
              <div className="bg-white p-3 rounded-xl shadow-2xl border border-white/20 max-w-2xl relative">
                <img
                  src={currentUrl}
                  alt={`${document.name} - ${activeSide}`}
                  className="rounded-lg max-h-[62vh] max-w-full object-contain block mx-auto"
                />

                {/* Synthetic Government ID Card Emblem Watermark Overlay */}
                <div className="absolute top-6 right-6 pointer-events-none px-2 py-1 bg-black/40 text-white rounded text-[10px] font-mono tracking-wider backdrop-blur-xs">
                  {document.type} • {activeSide}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 max-w-md text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-ink-primary text-sm">Document Scan Available</h4>
                <p className="text-xs text-ink-secondary">
                  The binary file for {document.name} ({activeSide.toLowerCase()}) is registered in the GOSHRII secure KYC store.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Audit Bar */}
        <div className="p-3 sm:px-6 border-t border-border-light bg-surface-secondary/70 flex items-center justify-between text-xs text-ink-secondary shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="text-[11px] text-ink-muted hidden sm:inline">
              Sensitive KYC Identity Document — Antigravity Protected Administrative Viewer
            </span>
          </div>

          <div className="flex items-center gap-3">
            {document.status === 'REJECTED' && (
              <span className="text-rose-700 font-medium">Status: Rejected</span>
            )}
            {document.status === 'VERIFIED' && (
              <span className="text-emerald-700 font-medium">Status: Verified & Signed</span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-border-light rounded-lg hover:bg-surface-subtle"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, window.document.body);
};
