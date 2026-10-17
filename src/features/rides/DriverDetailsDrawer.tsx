import React from 'react';
import { RideDriver, RideBooking } from '../../types';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { formatCurrency, formatDate, maskPhone } from '../../utils/formatters';
import {
  Car,
  User,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Navigation,
} from 'lucide-react';

interface DriverDetailsDrawerProps {
  driver: RideDriver | null;
  isOpen: boolean;
  onClose: () => void;
  driverRides: RideBooking[];
  onSelectRide?: (ride: RideBooking) => void;
}

export const DriverDetailsDrawer: React.FC<DriverDetailsDrawerProps> = ({
  driver,
  isOpen,
  onClose,
  driverRides,
  onSelectRide,
}) => {
  if (!driver) return null;

  const availabilityBadgeClass = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ON_TRIP: 'bg-sky-50 text-sky-700 border-sky-200',
    OFFLINE: 'bg-slate-100 text-slate-600 border-slate-200',
  }[driver.availability] ?? 'bg-slate-100 text-slate-600 border-slate-200';

  const accountStatusClass =
    driver.accountStatus === 'ACTIVE'
      ? 'text-emerald-700'
      : driver.accountStatus === 'SUSPENDED'
      ? 'text-rose-700'
      : 'text-amber-700';

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={driver.name}
      subtitle={`Driver Partner ID: ${driver.id}`}
      badge={
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${availabilityBadgeClass}`}
        >
          {driver.availability.replace('_', ' ')}
        </span>
      }
      maxWidth="lg"
    >
      <div className="space-y-6 text-sm">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-surface-secondary/60 rounded-xl border border-border-light text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-semibold text-sm text-ink-primary">
                {driver.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary">Rating</p>
          </div>

          <div className="p-3 bg-surface-secondary/60 rounded-xl border border-border-light text-center">
            <p className="font-semibold text-sm text-ink-primary">{driver.completedRides}</p>
            <p className="text-[11px] text-ink-secondary">Completed</p>
          </div>

          <div className="p-3 bg-surface-secondary/60 rounded-xl border border-border-light text-center">
            <p className="font-semibold text-sm text-ink-primary">{driver.cancelledRides}</p>
            <p className="text-[11px] text-ink-secondary">Cancelled</p>
          </div>

          <div className="p-3 bg-surface-secondary/60 rounded-xl border border-border-light text-center">
            <p className="font-semibold text-sm text-brand-600">
              {formatCurrency(driver.totalEarnings)}
            </p>
            <p className="text-[11px] text-ink-secondary">Earnings</p>
          </div>
        </div>

        {/* Contact & Credentials */}
        <div className="border border-border-light rounded-xl p-4 bg-white space-y-3">
          <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider block">
            Profile & Credentials
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-ink-secondary">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{maskPhone(driver.phone)}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-secondary">
              <Navigation className="w-3.5 h-3.5 text-slate-400" />
              <span>Current: {driver.currentLocationName}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-secondary">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined {formatDate(driver.joinedDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-secondary">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last active: {formatDate(driver.lastActiveAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className={`font-medium text-xs ${accountStatusClass}`}>
                Account: {driver.accountStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="border border-border-light rounded-xl p-4 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-4 h-4 text-brand-600" />
              Vehicle Details
            </span>
            <span className="text-xs font-medium px-2 py-0.5 bg-surface-subtle border border-border-light rounded text-ink-secondary">
              {driver.vehicleCategory}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <p className="text-ink-secondary">Model</p>
              <p className="font-medium text-ink-primary mt-0.5">{driver.vehicleModel}</p>
            </div>
            <div>
              <p className="text-ink-secondary">Registration Plate</p>
              <p className="font-mono font-medium text-ink-primary mt-0.5">
                {driver.registrationNumber}
              </p>
            </div>
            <div>
              <p className="text-ink-secondary">Total Rides (All-time)</p>
              <p className="font-medium text-ink-primary mt-0.5">{driver.totalRides}</p>
            </div>
          </div>
        </div>

        {/* Assigned Trip History */}
        <div className="border border-border-light rounded-xl p-4 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              Assigned Trips ({driverRides.length})
            </span>
          </div>

          {driverRides.length === 0 ? (
            <p className="text-xs text-ink-muted py-2">
              No rides have been assigned to this driver yet.
            </p>
          ) : (
            <div className="divide-y divide-border-light">
              {driverRides.slice(0, 5).map((ride) => (
                <div
                  key={ride.id}
                  onClick={() => onSelectRide && onSelectRide(ride)}
                  className="py-2.5 flex items-center justify-between hover:bg-surface-secondary/50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-brand-600">
                        {ride.id}
                      </span>
                      <span className="text-[11px] text-ink-secondary truncate">
                        {ride.pickupArea} → {ride.destinationArea}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      {formatDate(ride.bookingTime)} · {ride.estimatedDistanceKm} km
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-ink-primary">
                      {formatCurrency(ride.finalFare ?? ride.estimatedFare)}
                    </p>
                    <span className="text-[10px] text-ink-muted capitalize">
                      {ride.rideStatus.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DetailsDrawer>
  );
};
