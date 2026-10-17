import React, { useState } from 'react';
import { ParcelBooking, ParcelCourier, ParcelStatus } from '../../types';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate, maskPhone } from '../../utils/formatters';
import {
  Package,
  MapPin,
  User,
  Truck,
  CreditCard,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface ParcelDetailsDrawerProps {
  parcel: ParcelBooking | null;
  isOpen: boolean;
  onClose: () => void;
  availableCouriers: ParcelCourier[];
  onAssignCourier: (parcelId: string, courierId: string) => Promise<void>;
  onNavigateToTracking?: (trackingId: string) => void;
}

export const ParcelDetailsDrawer: React.FC<ParcelDetailsDrawerProps> = ({
  parcel,
  isOpen,
  onClose,
  availableCouriers,
  onAssignCourier,
  onNavigateToTracking,
}) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!parcel) return null;

  const isTerminal =
    parcel.status === 'DELIVERED' ||
    parcel.status === 'CANCELLED' ||
    parcel.status === 'RETURNED_TO_SENDER';

  const canAssignCourier =
    !isTerminal &&
    parcel.status !== 'IN_TRANSIT' &&
    parcel.status !== 'PICKED_UP';

  const handleCopyTrackingId = () => {
    navigator.clipboard.writeText(parcel.trackingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourierId) return;
    try {
      setIsSubmitting(true);
      await onAssignCourier(parcel.id, selectedCourierId);
      setShowAssignModal(false);
      setSelectedCourierId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const eligibleCouriers = availableCouriers.filter((c) => c.availability === 'AVAILABLE');

  const statusColor: Record<string, string> = {
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    PICKUP_FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
    DELIVERY_FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <>
      <DetailsDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={parcel.id}
        subtitle={`Created on ${formatDate(parcel.createdAt)}`}
        badge={<StatusBadge status={parcel.status} />}
        maxWidth="lg"
        footer={
          canAssignCourier ? (
            <div className="flex items-center justify-between w-full gap-3">
              {onNavigateToTracking && (
                <button
                  type="button"
                  onClick={() => onNavigateToTracking(parcel.trackingId)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-ink-primary bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Track Parcel
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-xs"
              >
                {parcel.assignedCourierId ? 'Reassign Courier' : 'Assign Courier'}
              </button>
            </div>
          ) : (
            onNavigateToTracking ? (
              <button
                type="button"
                onClick={() => onNavigateToTracking(parcel.trackingId)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-ink-primary bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Track Parcel
              </button>
            ) : undefined
          )
        }
      >
        <div className="space-y-6 text-sm">
          {/* Tracking ID Banner */}
          <div className="p-4 bg-brand-50/50 border border-brand-200/60 rounded-xl flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-brand-700 uppercase tracking-wider mb-1">
                Tracking ID
              </p>
              <p className="font-mono font-bold text-lg text-brand-600">{parcel.trackingId}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyTrackingId}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 bg-white border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Sender & Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-border-light rounded-xl p-4 bg-white space-y-2">
              <div className="flex items-center gap-2 text-ink-secondary">
                <User className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">Sender</span>
              </div>
              <div>
                <p className="font-medium text-ink-primary">{parcel.sender.name}</p>
                <p className="text-xs text-ink-secondary mt-0.5">
                  {maskPhone(parcel.sender.phone)}
                </p>
                <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                  {parcel.sender.address}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5">{parcel.sender.locality}</p>
                {parcel.sender.landmark && (
                  <p className="text-[11px] text-ink-muted">📍 {parcel.sender.landmark}</p>
                )}
                {parcel.sender.instructions && (
                  <p className="text-[11px] text-amber-700 mt-1 bg-amber-50 p-1.5 rounded">
                    Note: {parcel.sender.instructions}
                  </p>
                )}
              </div>
            </div>

            <div className="border border-border-light rounded-xl p-4 bg-white space-y-2">
              <div className="flex items-center gap-2 text-ink-secondary">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Recipient</span>
              </div>
              <div>
                <p className="font-medium text-ink-primary">{parcel.recipient.name}</p>
                <p className="text-xs text-ink-secondary mt-0.5">
                  {maskPhone(parcel.recipient.phone)}
                </p>
                <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                  {parcel.recipient.address}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5">{parcel.recipient.locality}</p>
                {parcel.recipient.landmark && (
                  <p className="text-[11px] text-ink-muted">📍 {parcel.recipient.landmark}</p>
                )}
                {parcel.recipient.instructions && (
                  <p className="text-[11px] text-amber-700 mt-1 bg-amber-50 p-1.5 rounded">
                    Note: {parcel.recipient.instructions}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Package Details & Courier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-border-light rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center gap-2 text-ink-secondary">
                <Package className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Package Info
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-ink-secondary">Category:</span>
                  <span className="ml-1.5 font-medium text-ink-primary">
                    {parcel.parcel.category}
                  </span>
                </div>
                <div>
                  <span className="text-ink-secondary">Description:</span>
                  <p className="text-ink-primary mt-0.5">{parcel.parcel.description}</p>
                </div>
                <div>
                  <span className="text-ink-secondary">Weight:</span>
                  <span className="ml-1.5 font-medium text-ink-primary">
                    {parcel.parcel.weightKg} kg
                  </span>
                </div>
                {parcel.parcel.dimensionsCm && (
                  <div>
                    <span className="text-ink-secondary">Dimensions:</span>
                    <span className="ml-1.5 font-medium text-ink-primary">
                      {parcel.parcel.dimensionsCm} cm
                    </span>
                  </div>
                )}
                {parcel.parcel.handlingNotes && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded">
                    ⚠ {parcel.parcel.handlingNotes}
                  </p>
                )}
              </div>
            </div>

            <div className="border border-border-light rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center gap-2 text-ink-secondary">
                <Truck className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Assigned Courier
                </span>
              </div>
              {parcel.assignedCourierName ? (
                <div className="space-y-1.5 text-xs">
                  <p className="font-medium text-ink-primary">{parcel.assignedCourierName}</p>
                  <p className="text-ink-secondary">
                    {maskPhone(parcel.assignedCourierPhone ?? '')}
                  </p>
                  <p className="text-ink-secondary">{parcel.assignedCourierVehicle}</p>
                </div>
              ) : (
                <div className="py-1">
                  <p className="text-xs text-amber-700 font-medium">No courier assigned yet</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Use "Assign Courier" to allocate a courier partner.
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-border-light space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-secondary">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-ink-primary">
                    {formatCurrency(parcel.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>Payment</span>
                  <span
                    className={`font-medium text-[11px] ${
                      parcel.paymentStatus === 'PAID'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {parcel.paymentStatus} · {parcel.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Timeline */}
          <div className="border border-border-light rounded-xl p-4 bg-white space-y-3">
            <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider block">
              Delivery Timeline
            </span>
            <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-light">
              {parcel.timeline.map((event, idx) => (
                <div key={idx} className="relative text-xs">
                  <span className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink-primary">
                      {event.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-ink-muted shrink-0">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  {event.location && (
                    <p className="text-[11px] text-ink-secondary mt-0.5">📍 {event.location}</p>
                  )}
                  {event.note && (
                    <p className="text-[11px] text-ink-muted mt-0.5">{event.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DetailsDrawer>

      {/* Assign Courier Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-border-light">
            <h3 className="text-base font-semibold text-ink-primary">
              Assign Courier to {parcel.id}
            </h3>
            <p className="text-xs text-ink-secondary mt-1">
              Only AVAILABLE courier partners are shown.
            </p>
            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-primary mb-1.5">
                  Available Couriers ({eligibleCouriers.length})
                </label>
                <select
                  value={selectedCourierId}
                  onChange={(e) => setSelectedCourierId(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
                >
                  <option value="">— Select a courier —</option>
                  {eligibleCouriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.vehicleType} · {c.currentArea} [★{c.rating.toFixed(1)}]
                    </option>
                  ))}
                </select>
                {eligibleCouriers.length === 0 && (
                  <p className="text-xs text-amber-700 mt-1.5">
                    No couriers currently AVAILABLE.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-border-light rounded-lg hover:bg-surface-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedCourierId || isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-40"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
