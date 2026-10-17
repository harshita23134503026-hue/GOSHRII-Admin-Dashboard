import React from 'react';
import { Customer, Order } from '../../types';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate, maskEmail, maskPhone } from '../../utils/formatters';
import {
  User,
  ShoppingBag,
  MapPin,
  Calendar,
  LifeBuoy,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerProfileDrawerProps {
  customer: Customer | null;
  customerOrders: Order[];
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (order: Order) => void;
}

export const CustomerProfileDrawer: React.FC<CustomerProfileDrawerProps> = ({
  customer,
  customerOrders,
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const navigate = useNavigate();
  if (!customer) return null;

  const aov = customer.totalOrders > 0 ? customer.totalSpend / customer.totalOrders : 0;

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={customer.name}
      subtitle={`Customer ID: ${customer.id} • Member since ${formatDate(customer.joinedDate, false)}`}
      badge={<StatusBadge status={customer.status} />}
      maxWidth="md"
    >
      {/* Privacy Notice Banner */}
      <div className="p-3 bg-surface-secondary border border-border-light rounded-lg text-[11px] text-ink-muted">
        Customer personally identifiable information (PII) is masked by default in compliance with digital privacy standards.
      </div>

      {/* Basic Profile Box */}
      <div className="bg-white p-4 rounded-lg border border-border-light shadow-card text-xs space-y-2">
        <h4 className="font-bold text-ink-secondary uppercase tracking-wider mb-2">
          Contact Coordinates
        </h4>
        <div className="flex justify-between">
          <span className="text-ink-muted">Masked Phone:</span>
          <span className="font-semibold text-ink-primary font-mono">{maskPhone(customer.phone)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Masked Email:</span>
          <span className="font-medium text-ink-primary">{maskEmail(customer.email)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Account Status:</span>
          <span className="font-semibold text-emerald-700">{customer.status}</span>
        </div>
      </div>

      {/* Purchase Summary Metrics */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-surface-secondary rounded-lg border border-border-light">
          <span className="text-ink-muted">Total Orders</span>
          <p className="text-xl font-bold text-ink-primary mt-1">{customer.totalOrders}</p>
        </div>
        <div className="p-3 bg-surface-secondary rounded-lg border border-border-light">
          <span className="text-ink-muted">Lifetime Spend</span>
          <p className="text-base font-bold text-brand-700 mt-1">
            {formatCurrency(customer.totalSpend)}
          </p>
        </div>
        <div className="p-3 bg-surface-secondary rounded-lg border border-border-light">
          <span className="text-ink-muted">Average Order</span>
          <p className="text-base font-semibold text-ink-primary mt-1">{formatCurrency(aov)}</p>
        </div>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="bg-white p-4 rounded-lg border border-border-light shadow-card text-xs">
        <h4 className="font-bold text-ink-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-600" />
          <span>Saved Delivery Addresses ({customer.addresses.length})</span>
        </h4>
        <div className="space-y-2.5">
          {customer.addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-2.5 rounded-lg border border-border-light bg-surface-secondary/40 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-ink-primary">{addr.tag}</span>
                {addr.isDefault && (
                  <span className="text-[10px] bg-brand-50 text-brand-700 font-semibold px-1.5 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>
              <p className="text-ink-secondary">{addr.fullAddress}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order History with Linked Orders */}
      <div className="bg-white p-4 rounded-lg border border-border-light shadow-card text-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
            <span>Recent Quick-Commerce Orders ({customerOrders.length})</span>
          </h4>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/orders?search=${encodeURIComponent(customer.name)}`);
            }}
            className="text-brand-700 hover:text-brand-800 font-medium text-[11px]"
          >
            All in Orders →
          </button>
        </div>

        {customerOrders.length > 0 ? (
          <div className="space-y-2">
            {customerOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => {
                  onClose();
                  navigate(`/orders?search=${ord.id}`);
                }}
                className="p-2.5 rounded-lg border border-border-light hover:border-slate-300 hover:bg-surface-secondary/50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-700">{ord.id}</span>
                    <StatusBadge status={ord.orderStatus} size="sm" />
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {formatDate(ord.orderDate)} • {ord.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ink-primary">{formatCurrency(ord.totalAmount)}</p>
                  <span className="text-[10px] text-brand-700 font-medium">View receipt →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-muted text-center py-3">No orders found for this customer.</p>
        )}
      </div>

      {/* Support Tickets */}
      <div className="p-3 bg-surface-secondary border border-border-light rounded-lg flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-ink-secondary" />
          <span className="text-ink-secondary">Linked Support Inquiries:</span>
        </div>
        <span className="font-semibold text-ink-primary">
          {customer.supportTicketsCount} tickets logged
        </span>
      </div>
    </DetailsDrawer>
  );
};
