import React, { useState } from 'react';
import { Store } from '../../types';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Store as StoreIcon,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Clock,
  ShoppingBag,
  TrendingUp,
  Edit,
  Power,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

interface StoreProfileDrawerProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (store: Store) => void;
  onToggleStatus: (storeId: string) => Promise<void>;
  onDelete: (storeId: string) => Promise<void>;
}

export const StoreProfileDrawer: React.FC<StoreProfileDrawerProps> = ({
  store,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!store) return null;

  const handleToggle = async () => {
    setIsProcessing(true);
    try {
      await onToggleStatus(store.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsProcessing(true);
    try {
      await onDelete(store.id);
      setIsDeleteDialogOpen(false);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <DetailsDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={store.storeName}
        subtitle={`Store ID: ${store.id} • Registered ${formatDate(store.createdAt, false)}`}
        badge={<StatusBadge status={store.status} />}
        maxWidth="md"
      >
        {/* Compliance / Privacy banner */}
        <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-lg text-xs text-brand-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              Store credentials and operating locations are synchronized across multi-service dispatch.
            </span>
          </div>
        </div>

        {/* Basic Coordinates Box */}
        <div className="bg-white p-4 rounded-lg border border-border-light shadow-card text-xs space-y-2.5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-ink-secondary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <StoreIcon className="w-3.5 h-3.5 text-brand-600" />
              <span>Store Contact & Location</span>
            </h4>
            <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {store.category || 'Retail Store'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-border-light/60">
            <span className="text-ink-muted">Store Name:</span>
            <span className="font-semibold text-ink-primary">{store.storeName}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-border-light/60">
            <span className="text-ink-muted">Location / Address:</span>
            <span className="font-medium text-ink-primary flex items-center gap-1 text-right max-w-[240px]">
              <MapPin className="w-3.5 h-3.5 text-ink-muted shrink-0" />
              {store.location}, {store.city}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-border-light/60">
            <span className="text-ink-muted">Contact Phone:</span>
            <span className="font-mono font-medium text-ink-primary flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-ink-muted" />
              {store.phone}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-ink-muted">Operating Hours:</span>
            <span className="text-ink-primary flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-ink-muted" />
              {store.operatingHours || '07:00 AM - 11:00 PM'}
            </span>
          </div>
        </div>

        {/* Manager Login & Credentials Card */}
        <div className="bg-white p-4 rounded-lg border border-border-light shadow-card text-xs space-y-2.5">
          <h4 className="font-bold text-ink-secondary uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-brand-600" />
            <span>Store Manager Credentials</span>
          </h4>

          <div className="flex justify-between items-center py-1 border-b border-border-light/60">
            <span className="text-ink-muted">Manager Username:</span>
            <span className="font-mono font-semibold text-brand-800 bg-brand-50 px-2 py-0.5 rounded">
              @{store.userName}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-border-light/60">
            <span className="text-ink-muted">Login Email:</span>
            <span className="font-medium text-ink-primary flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-ink-muted" />
              {store.email}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-ink-muted">Account Password:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-primary">
                {showPassword ? store.password || 'store@2024' : '••••••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-secondary transition-colors"
                title={showPassword ? 'Hide password' : 'View password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Performance & Fulfillment Summary */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-surface-secondary rounded-lg border border-border-light">
            <div className="flex items-center gap-1.5 text-ink-muted mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
              <span>Orders Fulfilled</span>
            </div>
            <p className="text-xl font-bold text-ink-primary">
              {(store.totalOrders || 0).toLocaleString()}
            </p>
          </div>

          <div className="p-3 bg-surface-secondary rounded-lg border border-border-light">
            <div className="flex items-center gap-1.5 text-ink-muted mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lifetime Revenue</span>
            </div>
            <p className="text-xl font-bold text-brand-700">
              {formatCurrency(store.totalRevenue || 0)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(store);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Store Details
          </button>

          <button
            type="button"
            onClick={handleToggle}
            disabled={isProcessing}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              store.status === 'ACTIVE'
                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {store.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            title="Delete Store"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </DetailsDrawer>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Store"
        description={`Are you sure you want to remove "${store.storeName}" (${store.id})? This action cannot be undone.`}
        confirmLabel="Delete Store"
        variant="danger"
        isLoading={isProcessing}
      />
    </>
  );
};
