import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate, maskPhone } from '../../utils/formatters';
import {
  MapPin,
  Clock,
  User,
  Bike,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceStatus: (orderId: string, nextStatus: OrderStatus, note?: string) => Promise<void>;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onAdvanceStatus,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [note, setNote] = useState('');

  if (!order) return null;

  // Determine eligible next statuses according to state machine
  const getNextPermittedStatuses = (current: OrderStatus): OrderStatus[] => {
    switch (current) {
      case 'PLACED':
        return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['PICKING', 'CANCELLED'];
      case 'PICKING':
        return ['PACKED', 'CANCELLED'];
      case 'PACKED':
        return ['OUT_FOR_DELIVERY', 'CANCELLED'];
      case 'OUT_FOR_DELIVERY':
        return ['DELIVERED'];
      default:
        return [];
    }
  };

  const permittedNext = getNextPermittedStatuses(order.orderStatus);

  const handleStatusChange = async (targetStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      await onAdvanceStatus(order.id, targetStatus, note || undefined);
      setNote('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${order.id}`}
      subtitle={`Placed ${formatDate(order.orderDate)}`}
      badge={<StatusBadge status={order.orderStatus} />}
      maxWidth="lg"
      footer={
        permittedNext.length > 0 ? (
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-2">
              {permittedNext.includes('CANCELLED') && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('CANCELLED')}
                  className="px-3.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 disabled:opacity-40"
                >
                  Cancel Order
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {permittedNext
                .filter((s) => s !== 'CANCELLED')
                .map((nextSt) => {
                  const labels: Record<OrderStatus, string> = {
                    PLACED: 'Mark Placed',
                    CONFIRMED: 'Confirm & Send to Picking',
                    PICKING: 'Assign to Picking Bag',
                    PACKED: 'Mark Packed & Ready',
                    OUT_FOR_DELIVERY: 'Dispatch with Rider',
                    DELIVERED: 'Confirm Delivery to Customer',
                    CANCELLED: 'Cancel',
                  };
                  return (
                    <button
                      key={nextSt}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(nextSt)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors disabled:opacity-40"
                    >
                      {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{labels[nextSt] || nextSt}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-ink-muted">
            Order lifecycle concluded ({order.orderStatus}). No further state transitions permitted.
          </p>
        )
      }
    >
      {/* Customer & Address Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Customer Box */}
        <div className="bg-white p-4 rounded-lg border border-border-light shadow-card text-xs">
          <div className="flex items-center gap-2 font-bold text-ink-primary uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5 text-brand-600" />
            <span>Customer Details</span>
          </div>
          <p className="font-semibold text-sm text-ink-primary">{order.customerName}</p>
          <p className="text-ink-secondary mt-0.5">{order.customerEmail}</p>
          <p className="text-ink-secondary mt-0.5">{maskPhone(order.customerPhone)}</p>
        </div>

        {/* Address Box */}
        <div className="bg-white p-4 rounded-lg border border-border-light shadow-card text-xs">
          <div className="flex items-center gap-2 font-bold text-ink-primary uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>Delivery Destination</span>
          </div>
          <p className="text-ink-primary font-medium">{order.deliveryAddress.street}</p>
          <p className="text-ink-secondary">{order.deliveryAddress.area}</p>
          <p className="text-ink-secondary">
            {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
          </p>
          {order.deliveryAddress.landmark && (
            <p className="text-brand-700 mt-1 font-medium">
              Landmark: {order.deliveryAddress.landmark}
            </p>
          )}
        </div>
      </div>

      {/* Assigned Delivery Partner (if applicable) */}
      {order.deliveryPartnerName && (
        <div className="bg-brand-50/50 p-3.5 rounded-lg border border-brand-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 text-brand-800 rounded-lg">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <p className="text-ink-muted text-[11px]">Assigned Delivery Rider</p>
              <p className="font-semibold text-ink-primary">{order.deliveryPartnerName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-ink-secondary font-mono">{order.deliveryPartnerPhone}</p>
            <p className="text-[11px] text-emerald-700 font-medium">
              Estimated: {order.estimatedDeliveryMinutes || 8} mins
            </p>
          </div>
        </div>
      )}

      {/* Ordered Products Breakdown */}
      <div className="bg-white rounded-lg border border-border-light overflow-hidden shadow-card">
        <div className="p-3 bg-surface-secondary border-b border-border-light font-semibold text-xs text-ink-primary">
          Order Items ({order.items.length})
        </div>
        <div className="divide-y divide-border-light/60">
          {order.items.map((item, idx) => (
            <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-10 h-10 rounded object-cover border shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-ink-primary truncate">{item.productName}</p>
                  <p className="text-[11px] text-ink-muted">
                    {item.packSize} • Qty: <strong>{item.quantity}</strong> × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-ink-primary">{formatCurrency(item.totalPrice)}</p>
                <p className="text-[10px] text-ink-muted">Historical recorded</p>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Bill Receipt */}
        <div className="p-4 bg-surface-secondary/50 border-t border-border-light text-xs space-y-2">
          <div className="flex justify-between text-ink-secondary">
            <span>Item Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Promotional Discount:</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-ink-secondary">
            <span>Delivery Fee:</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-ink-primary pt-2 border-t border-border-light">
            <span>Total Payable:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-ink-muted">
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Paid via {order.paymentMethod}
            </span>
            <StatusBadge status={order.paymentStatus} size="sm" />
          </div>
        </div>
      </div>

      {/* Fulfillment State Machine Timeline */}
      <div className="bg-white p-4 rounded-lg border border-border-light shadow-card text-xs">
        <h4 className="font-bold text-ink-secondary uppercase tracking-wider mb-4">
          Fulfillment Timeline Audit
        </h4>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {order.timeline.map((evt, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge status={evt.status} size="sm" />
                <span className="text-[11px] text-ink-muted">{formatDate(evt.timestamp)}</span>
              </div>
              {evt.note && <p className="text-ink-secondary mt-1 text-[11px]">{evt.note}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Refund Information (Read-only as required) */}
      {order.refundInfo && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <p className="font-bold text-ink-secondary uppercase tracking-wider mb-1">
            Refund Status (Read-Only)
          </p>
          <div className="flex items-center justify-between mt-2">
            <span>Status: <strong>{order.refundInfo.status}</strong></span>
            <span>Amount: <strong>{formatCurrency(order.refundInfo.amount)}</strong></span>
          </div>
          <p className="text-ink-secondary text-[11px] mt-1">Reason: {order.refundInfo.reason}</p>
        </div>
      )}
    </DetailsDrawer>
  );
};
