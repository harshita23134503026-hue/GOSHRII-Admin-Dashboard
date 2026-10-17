import React from 'react';
import { DeliveryPartner, Order } from '../../types';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate, formatRelativeTime, maskPhone } from '../../utils/formatters';
import {
  Bike,
  Star,
  CheckCircle2,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RiderDetailsDrawerProps {
  rider: DeliveryPartner | null;
  activeOrder?: Order | null;
  riderHistoryOrders: Order[];
  isOpen: boolean;
  onClose: () => void;
}

export const RiderDetailsDrawer: React.FC<RiderDetailsDrawerProps> = ({
  rider,
  activeOrder,
  riderHistoryOrders,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  if (!rider) return null;

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={rider.name}
      subtitle={`Rider ID: ${rider.id} • ${rider.vehicleType.replace('_', ' ')}`}
      badge={<StatusBadge status={rider.status} />}
      maxWidth="md"
    >
      {/* Rider Performance Overview */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-surface-secondary rounded-lg border border-border-light text-center">
          <span className="text-ink-muted">Partner Rating</span>
          <div className="flex items-center justify-center gap-1 mt-1 font-bold text-base text-amber-600">
            <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
            <span>{rider.rating}</span>
          </div>
        </div>

        <div className="p-3 bg-surface-secondary rounded-lg border border-border-light text-center">
          <span className="text-ink-muted">Completed Today</span>
          <p className="text-base font-bold text-brand-700 mt-1">{rider.deliveriesToday}</p>
        </div>

        <div className="p-3 bg-surface-secondary rounded-lg border border-border-light text-center">
          <span className="text-ink-muted">Lifetime Runs</span>
          <p className="text-base font-bold text-ink-primary mt-1">{rider.totalDeliveries}</p>
        </div>
      </div>

      {/* Profile & Vehicle Coordinates */}
      <div className="bg-white p-4 rounded-lg border border-border-light shadow-card text-xs space-y-2">
        <h4 className="font-bold text-ink-secondary uppercase tracking-wider mb-2">
          Partner Fleet Information
        </h4>
        <div className="flex justify-between">
          <span className="text-ink-muted">Contact Phone:</span>
          <span className="font-mono font-medium text-ink-primary">{maskPhone(rider.phone)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Assigned Vehicle:</span>
          <span className="font-semibold text-ink-primary">{rider.vehicleType.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Operating Hub:</span>
          <span className="text-brand-700 font-medium">{rider.currentHub}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Last Active Dispatch:</span>
          <span className="text-ink-secondary">{formatRelativeTime(rider.lastActiveAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Fleet Onboarding:</span>
          <span className="text-ink-secondary">{formatDate(rider.joinedDate, false)}</span>
        </div>
      </div>

      {/* Currently Active Dispatched Order */}
      {activeOrder && (
        <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-blue-900 uppercase tracking-wider">
              Currently On Delivery
            </span>
            <span className="font-mono font-bold text-brand-700 bg-white px-2 py-0.5 rounded border">
              {activeOrder.id}
            </span>
          </div>

          <p className="font-semibold text-ink-primary">{activeOrder.customerName}</p>
          <p className="text-ink-secondary mt-0.5">
            Destination: {activeOrder.deliveryAddress.area}, {activeOrder.deliveryAddress.city}
          </p>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/orders?search=${activeOrder.id}`);
            }}
            className="mt-3 inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800"
          >
            <span>Open Order Manifest</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recent Dispatches by this rider */}
      <div className="bg-white p-4 rounded-lg border border-border-light shadow-card text-xs">
        <h4 className="font-bold text-ink-secondary uppercase tracking-wider mb-3">
          Completed Dispatches Today ({riderHistoryOrders.length})
        </h4>

        {riderHistoryOrders.length > 0 ? (
          <div className="space-y-2">
            {riderHistoryOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => {
                  onClose();
                  navigate(`/orders?search=${ord.id}`);
                }}
                className="p-2.5 rounded-lg border border-border-light hover:bg-surface-secondary/60 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-semibold text-brand-700">{ord.id}</span>
                  <p className="text-[11px] text-ink-muted">{ord.deliveryAddress.area}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={ord.orderStatus} size="sm" />
                  <p className="text-[10px] text-ink-muted mt-0.5">{formatDate(ord.orderDate)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-muted text-center py-2">No historical deliveries found in current batch.</p>
        )}
      </div>
    </DetailsDrawer>
  );
};
