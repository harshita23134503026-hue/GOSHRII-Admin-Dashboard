import React, { useState } from 'react';
import { DeliveryPartner, VerificationDocument, Order } from '../../types';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { VerificationStatusBadge } from './VerificationStatusBadge';
import { PartnerProfileHeader } from './PartnerProfileHeader';
import { VerificationDocumentCard } from './VerificationDocumentCard';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { DocumentReviewDialog } from './DocumentReviewDialog';
import { VerificationHistoryTimeline } from './VerificationHistoryTimeline';
import { formatDate, formatRelativeTime, maskPhone } from '../../utils/formatters';
import {
  FileText,
  User,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Star,
  ExternalLink,
  ShieldCheck,
  Bike,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PartnerVerificationDrawerProps {
  partner: DeliveryPartner | null;
  isOpen: boolean;
  onClose: () => void;
  activeOrder?: Order | null;
  partnerOrders?: Order[];
  onReviewDocument: (params: {
    partnerId: string;
    documentId: string;
    decision: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    internalRemarks?: string;
    reviewerName: string;
  }) => Promise<void>;
}

export const PartnerVerificationDrawer: React.FC<PartnerVerificationDrawerProps> = ({
  partner,
  isOpen,
  onClose,
  activeOrder,
  partnerOrders = [],
  onReviewDocument,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'PROFILE'>('DOCUMENTS');
  const [documentFilter, setDocumentFilter] = useState<'ALL' | 'PENDING' | 'REJECTED'>('ALL');

  // Preview & Review modal state
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);
  const [reviewDoc, setReviewDoc] = useState<VerificationDocument | null>(null);

  if (!partner) return null;

  const documents = partner.documents || [];

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    if (documentFilter === 'PENDING') return doc.status === 'PENDING_REVIEW';
    if (documentFilter === 'REJECTED') return doc.status === 'REJECTED';
    return true;
  });

  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;
  const pendingCount = documents.filter((d) => d.status === 'PENDING_REVIEW').length;
  const rejectedCount = documents.filter((d) => d.status === 'REJECTED').length;
  const expiredCount = documents.filter((d) => d.status === 'EXPIRED' || d.isExpired).length;

  return (
    <>
      <DetailsDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={partner.name}
        subtitle={`Partner ID: ${partner.id} • ${partner.vehicleType.replace('_', ' ')}`}
        badge={<VerificationStatusBadge status={partner.verificationStatus} size="sm" />}
        maxWidth="xl"
      >
        <div className="space-y-6">
          {/* Top Profile Header */}
          <PartnerProfileHeader partner={partner} />

          {/* Navigation Tabs */}
          <div className="border-b border-border-light flex items-center gap-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('DOCUMENTS')}
              className={`pb-3 relative flex items-center gap-1.5 transition-colors ${
                activeTab === 'DOCUMENTS'
                  ? 'text-brand-700 border-b-2 border-brand-500 font-bold'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Verification Documents</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-surface-subtle border border-border-light text-ink-secondary">
                {documents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PROFILE')}
              className={`pb-3 relative flex items-center gap-1.5 transition-colors ${
                activeTab === 'PROFILE'
                  ? 'text-brand-700 border-b-2 border-brand-500 font-bold'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Partner Performance & Profile</span>
            </button>
          </div>

          {/* TAB 1: VERIFICATION DOCUMENTS */}
          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-6">
              {/* Document Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl text-center">
                  <span className="text-[11px] text-emerald-800 font-medium">Verified</span>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">{verifiedCount}</p>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-center">
                  <span className="text-[11px] text-amber-800 font-medium">Pending Review</span>
                  <p className="text-xl font-bold text-amber-700 mt-0.5">{pendingCount}</p>
                </div>

                <div className="p-3 bg-rose-50/50 border border-rose-200/60 rounded-xl text-center">
                  <span className="text-[11px] text-rose-800 font-medium">Rejected</span>
                  <p className="text-xl font-bold text-rose-700 mt-0.5">{rejectedCount}</p>
                </div>

                <div className="p-3 bg-red-50/50 border border-red-200/60 rounded-xl text-center">
                  <span className="text-[11px] text-red-800 font-medium">Expired</span>
                  <p className="text-xl font-bold text-red-700 mt-0.5">{expiredCount}</p>
                </div>
              </div>

              {/* Document Sub-filter */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                    Submitted Documents ({documents.length})
                  </h4>
                  {partner.vehicleType === 'CYCLE' && (
                    <span className="text-[11px] text-ink-muted bg-surface-subtle px-2 py-0.5 rounded border">
                      Bicycle Partner (Motorized docs exempt)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setDocumentFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      documentFilter === 'ALL'
                        ? 'bg-ink-primary text-white'
                        : 'bg-white text-ink-secondary border border-border-light hover:bg-surface-subtle'
                    }`}
                  >
                    All ({documents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentFilter('PENDING')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      documentFilter === 'PENDING'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentFilter('REJECTED')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      documentFilter === 'REJECTED'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    Rejected ({rejectedCount})
                  </button>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDocuments.map((doc) => (
                  <VerificationDocumentCard
                    key={doc.id}
                    document={doc}
                    onView={(d) => setPreviewDoc(d)}
                    onReview={(d) => setReviewDoc(d)}
                  />
                ))}
              </div>

              {/* Verification Audit Timeline */}
              <div className="pt-4 border-t border-border-light space-y-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-brand-600" />
                  <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                    Verification History & Decision Log
                  </h4>
                </div>
                <VerificationHistoryTimeline history={partner.verificationHistory || []} />
              </div>
            </div>
          )}

          {/* TAB 2: PARTNER PERFORMANCE & PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-6 text-xs">
              {/* Performance Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-surface-secondary/70 rounded-xl border border-border-light text-center">
                  <span className="text-ink-muted">Partner Rating</span>
                  <div className="flex items-center justify-center gap-1 mt-1 font-bold text-base text-amber-600">
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                    <span>{partner.rating}</span>
                  </div>
                </div>

                <div className="p-3 bg-surface-secondary/70 rounded-xl border border-border-light text-center">
                  <span className="text-ink-muted">Completed Today</span>
                  <p className="text-base font-bold text-brand-700 mt-1">
                    {partner.deliveriesToday}
                  </p>
                </div>

                <div className="p-3 bg-surface-secondary/70 rounded-xl border border-border-light text-center">
                  <span className="text-ink-muted">Lifetime Deliveries</span>
                  <p className="text-base font-bold text-ink-primary mt-1">
                    {partner.totalDeliveries}
                  </p>
                </div>
              </div>

              {/* Active Delivery Order */}
              {activeOrder && (
                <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
                      Currently Out For Delivery
                    </span>
                    <span className="font-mono font-bold text-brand-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      {activeOrder.id}
                    </span>
                  </div>
                  <p className="text-ink-secondary">
                    Delivery to: <strong>{activeOrder.customerName}</strong> ({activeOrder.deliveryAddress.area})
                  </p>
                </div>
              )}

              {/* Recent Orders Log */}
              <div className="bg-white rounded-xl border border-border-light p-4 space-y-3">
                <h4 className="font-bold text-ink-primary uppercase tracking-wider text-[11px]">
                  Recent Dispatched Orders ({partnerOrders.length})
                </h4>

                {partnerOrders.length === 0 ? (
                  <p className="text-ink-muted py-2">No completed order records for this shift.</p>
                ) : (
                  <div className="divide-y divide-border-light">
                    {partnerOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-semibold text-brand-700">{order.id}</span>
                          <p className="text-ink-muted text-[11px]">
                            {order.customerName} • {order.deliveryAddress.area}
                          </p>
                        </div>
                        <span className="text-ink-secondary font-medium">
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DetailsDrawer>

      {/* Document Fullscreen Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        onReview={(d) => setReviewDoc(d)}
      />

      {/* Document Review & Approval Dialog */}
      <DocumentReviewDialog
        document={reviewDoc}
        partnerId={partner.id}
        isOpen={Boolean(reviewDoc)}
        onClose={() => setReviewDoc(null)}
        onReviewSubmit={onReviewDocument}
      />
    </>
  );
};
