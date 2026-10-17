import React, { useState } from 'react';
import { RideBooking, RideDriver, RideStatus } from '../../types';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate, maskPhone } from '../../utils/formatters';
import {
  MapPin,
  Clock,
  User,
  Car,
  CreditCard,
  XCircle,
  Loader2,
  ShieldAlert,
  Navigation,
} from 'lucide-react';

interface RideDetailsDrawerProps {
  ride: RideBooking | null;
  isOpen: boolean;
  onClose: () => void;
  availableDrivers: RideDriver[];
  onAssignDriver: (rideId: string, driverId: string) => Promise<void>;
  onCancelRide: (rideId: string, reason: string) => Promise<void>;
}

export const RideDetailsDrawer: React.FC<RideDetailsDrawerProps> = ({
  ride,
  isOpen,
  onClose,
  availableDrivers,
  onAssignDriver,
  onCancelRide,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!ride) return null;

  const isTerminal = ride.rideStatus === 'RIDE_COMPLETED' || ride.rideStatus === 'CANCELLED';
  const canAssign = !isTerminal && ride.rideStatus !== 'RIDE_STARTED' && ride.rideStatus !== 'RIDE_COMPLETED';

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId) return;
    try {
      setIsSubmitting(true);
      await onAssignDriver(ride.id, selectedDriverId);
      setShowAssignModal(false);
      setSelectedDriverId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = async () => {
    const finalReason =
      cancelReason === 'Other'
        ? customCancelReason.trim() || 'Admin cancellation'
        : cancelReason;
    try {
      setIsSubmitting(true);
      await onCancelRide(ride.id, finalReason);
      setShowCancelModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableForAssignment = availableDrivers.filter(
    (d) => d.availability === 'AVAILABLE' && d.accountStatus === 'ACTIVE'
  );

  // Derive display values
  const fare = ride.finalFare ?? ride.estimatedFare;
  const platformFee = Math.round(fare * 0.15);
  const driverPayout = fare - platformFee;

  return (
    <>
      <DetailsDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={`Ride ${ride.id}`}
        subtitle={`Booked on ${formatDate(ride.bookingTime)}`}
        badge={<StatusBadge status={ride.rideStatus} />}
        maxWidth="lg"
        footer={
          !isTerminal ? (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="px-3.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
              >
                Cancel Ride
              </button>
              {canAssign && (
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="px-4 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-xs"
                >
                  {ride.assignedDriverId ? 'Reassign Driver' : 'Assign Driver'}
                </button>
              )}
            </div>
          ) : undefined
        }
      >
        <div className="space-y-6 text-sm">
          {/* Cancellation notice */}
          {ride.rideStatus === 'CANCELLED' && ride.cancellationReason && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-xs">This ride was cancelled</p>
                <p className="text-xs text-rose-700 mt-0.5">
                  Reason: {ride.cancellationReason}
                </p>
              </div>
            </div>
          )}

          {/* Service & Route */}
          <div className="bg-surface-secondary/60 rounded-xl p-4 border border-border-light space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
                Service Details
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-white border border-border-light rounded-md text-ink-secondary">
                {ride.vehicleCategory} • {ride.bookingType}
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-light">
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white" />
                <p className="text-xs font-semibold text-ink-primary">{ride.pickupArea}</p>
                <p className="text-xs text-ink-secondary mt-0.5">{ride.pickupAddress}</p>
              </div>
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-white" />
                <p className="text-xs font-semibold text-ink-primary">{ride.destinationArea}</p>
                <p className="text-xs text-ink-secondary mt-0.5">{ride.destinationAddress}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border-light flex items-center justify-between text-xs text-ink-secondary">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand-600" />
                <span>
                  Distance:{' '}
                  <strong className="text-ink-primary">{ride.estimatedDistanceKm} km</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Est.:{' '}
                  <strong className="text-ink-primary">
                    {ride.estimatedDurationMinutes} mins
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Passenger & Driver Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-border-light rounded-xl p-4 bg-white space-y-2">
              <div className="flex items-center gap-2 text-ink-secondary">
                <User className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">Passenger</span>
              </div>
              <div>
                <p className="font-medium text-ink-primary">{ride.passengerName}</p>
                <p className="text-xs text-ink-secondary mt-0.5">
                  {maskPhone(ride.passengerPhone)}
                </p>
              </div>
            </div>

            <div className="border border-border-light rounded-xl p-4 bg-white space-y-2">
              <div className="flex items-center gap-2 text-ink-secondary">
                <Car className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Assigned Driver
                </span>
              </div>
              {ride.assignedDriverName ? (
                <div>
                  <p className="font-medium text-ink-primary">{ride.assignedDriverName}</p>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    {ride.assignedDriverPhone ? maskPhone(ride.assignedDriverPhone) : '—'}
                  </p>
                  {ride.assignedVehicleReg && (
                    <span className="inline-block mt-1 font-mono text-[11px] bg-surface-subtle px-2 py-0.5 rounded border border-border-light font-medium text-ink-primary">
                      {ride.assignedVehicleReg}
                    </span>
                  )}
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {ride.assignedVehicleModel}
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  <p className="text-xs text-amber-700 font-medium">
                    Searching for available driver…
                  </p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    No driver assigned yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fare & Payment */}
          <div className="border border-border-light rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-border-light pb-2.5">
              <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-brand-600" />
                Fare & Payment
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  ride.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : ride.paymentStatus === 'FAILED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {ride.paymentStatus} • {ride.paymentMethod}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-ink-secondary">
                <span>Estimated Fare</span>
                <span className="font-medium text-ink-primary">
                  {formatCurrency(ride.estimatedFare)}
                </span>
              </div>
              {ride.finalFare && ride.finalFare !== ride.estimatedFare && (
                <div className="flex justify-between text-ink-secondary">
                  <span>Final Fare (billed)</span>
                  <span className="font-medium text-ink-primary">
                    {formatCurrency(ride.finalFare)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-ink-secondary">
                <span>Platform Commission (15%)</span>
                <span className="font-medium text-ink-primary">
                  {formatCurrency(platformFee)}
                </span>
              </div>
              <div className="flex justify-between text-ink-secondary">
                <span>Driver Net Payout</span>
                <span className="font-medium text-ink-primary">
                  {formatCurrency(driverPayout)}
                </span>
              </div>
              <div className="pt-2 border-t border-border-light flex justify-between font-semibold text-sm text-ink-primary">
                <span>Total Collected</span>
                <span className="text-brand-600">{formatCurrency(fare)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border border-border-light rounded-xl p-4 bg-white space-y-3">
            <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider block">
              Trip Audit Log
            </span>
            <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-light">
              {ride.timeline.map((event, idx) => (
                <div key={idx} className="relative text-xs">
                  <span className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink-primary">
                      {(event.status as string).replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-ink-muted">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  {event.note && (
                    <p className="text-[11px] text-ink-secondary mt-0.5">{event.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DetailsDrawer>

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-border-light">
            <h3 className="text-base font-semibold text-ink-primary">
              Assign Driver to {ride.id}
            </h3>
            <p className="text-xs text-ink-secondary mt-1">
              Only ACTIVE & AVAILABLE drivers are shown. Assigning will mark the driver ON_TRIP.
            </p>
            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-primary mb-1.5">
                  Available Drivers ({availableForAssignment.length})
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
                >
                  <option value="">— Select a driver —</option>
                  {availableForAssignment.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.vehicleCategory} · {d.vehicleModel} ·{' '}
                      {d.registrationNumber} [★{d.rating.toFixed(1)}]
                    </option>
                  ))}
                </select>
                {availableForAssignment.length === 0 && (
                  <p className="text-xs text-amber-700 mt-1.5">
                    No drivers currently AVAILABLE. Check fleet status.
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
                  disabled={!selectedDriverId || isSubmitting}
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

      {/* Cancel Ride Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-border-light">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 rounded-full text-rose-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink-primary">
                  Cancel Ride {ride.id}?
                </h3>
                <p className="text-xs text-ink-secondary mt-1">
                  This immediately cancels the booking and frees up any assigned driver.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium text-ink-primary">
                Cancellation Reason
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
              >
                <option value="Customer requested cancellation">
                  Customer requested cancellation
                </option>
                <option value="No driver accepted the trip">
                  No driver accepted the trip in time
                </option>
                <option value="Driver vehicle breakdown">
                  Driver vehicle breakdown / technical issue
                </option>
                <option value="Fare dispute or incorrect pickup">
                  Fare dispute / incorrect pickup location
                </option>
                <option value="Operational dispatch emergency">
                  Operational dispatch emergency
                </option>
                <option value="Other">Other (custom reason)</option>
              </select>
              {cancelReason === 'Other' && (
                <textarea
                  rows={2}
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  placeholder="Enter custom reason…"
                  className="w-full text-xs p-2.5 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              )}
            </div>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isSubmitting}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-border-light rounded-lg hover:bg-surface-subtle"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-40"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
