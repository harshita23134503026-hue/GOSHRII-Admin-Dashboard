import React from 'react';
import { DeliveryPartner } from '../../types';
import { VerificationStatusBadge } from './VerificationStatusBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate, maskPhone, maskEmail } from '../../utils/formatters';
import { Bike, Calendar, Mail, MapPin, Phone, ShieldCheck, Zap } from 'lucide-react';

interface PartnerProfileHeaderProps {
  partner: DeliveryPartner;
}

export const PartnerProfileHeader: React.FC<PartnerProfileHeaderProps> = ({ partner }) => {
  const getVehicleLabel = () => {
    switch (partner.vehicleType) {
      case 'EV_SCOOTER':
        return { label: 'EV Scooter', icon: Zap };
      case 'BIKE':
        return { label: 'Motorbike', icon: Bike };
      case 'CYCLE':
        return { label: 'Bicycle (Non-Motorized)', icon: Bike };
      default:
        return { label: partner.vehicleType, icon: Bike };
    }
  };

  const { label: vehicleLabel, icon: VehicleIcon } = getVehicleLabel();

  return (
    <div className="bg-white rounded-xl border border-border-light p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Profile Photo */}
          <div className="relative">
            {partner.profilePhotoUrl ? (
              <img
                src={partner.profilePhotoUrl}
                alt={partner.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-border-light"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xl shadow-sm">
                {partner.name.charAt(0)}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                partner.status === 'AVAILABLE'
                  ? 'bg-emerald-500'
                  : partner.status === 'ON_DELIVERY'
                  ? 'bg-blue-500'
                  : 'bg-slate-400'
              }`}
              title={`Status: ${partner.status}`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-bold text-ink-primary tracking-tight">{partner.name}</h3>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-surface-subtle border border-border-light rounded text-ink-secondary">
                {partner.id}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-ink-secondary flex-wrap">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {maskPhone(partner.phone)}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {maskEmail(partner.email || `${partner.id}@goshrii-fleet.in`)}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status Banner Badge */}
        <div className="flex flex-col sm:items-end gap-1.5 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border-light">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
            KYC Verification
          </span>
          <VerificationStatusBadge status={partner.verificationStatus} size="lg" />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border-light text-xs">
        <div className="space-y-0.5">
          <span className="text-[11px] text-ink-muted flex items-center gap-1">
            <VehicleIcon className="w-3 h-3 text-brand-600" />
            Vehicle Fleet Tier
          </span>
          <p className="font-semibold text-ink-primary">{vehicleLabel}</p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] text-ink-muted">Registration Plate</span>
          <p className="font-mono font-medium text-ink-primary">
            {partner.vehicleRegistrationNumber || (partner.vehicleType === 'CYCLE' ? 'Not Applicable (Bicycle)' : 'Pending RC')}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] text-ink-muted flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Onboarded Date
          </span>
          <p className="font-medium text-ink-primary">{formatDate(partner.joinedDate, false)}</p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] text-ink-muted flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            Dark Store Hub
          </span>
          <p className="font-medium text-brand-700 truncate">{partner.currentHub}</p>
        </div>
      </div>
    </div>
  );
};
