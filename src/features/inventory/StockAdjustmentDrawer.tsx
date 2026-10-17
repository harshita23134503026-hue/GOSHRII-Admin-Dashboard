import React, { useState } from 'react';
import { Product } from '../../types';
import { FormDrawer } from '../../components/ui/FormDrawer';
import { formatQuantity } from '../../utils/formatters';
import { Plus, Minus, Hash, AlertCircle } from 'lucide-react';

interface StockAdjustmentDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: {
    productId: string;
    type: 'ADD' | 'REMOVE' | 'SET';
    amount: number;
    reason: string;
  }) => Promise<void>;
}

export const StockAdjustmentDrawer: React.FC<StockAdjustmentDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'REMOVE' | 'SET'>('ADD');
  const [amount, setAmount] = useState<number>(10);
  const [reason, setReason] = useState<string>('Replenishment delivery batch');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customReason, setCustomReason] = useState('');

  if (!product) return null;

  const currentStock = product.stockQuantity;
  let proposedStock = currentStock;

  if (adjustmentType === 'ADD') {
    proposedStock = currentStock + (Number(amount) || 0);
  } else if (adjustmentType === 'REMOVE') {
    proposedStock = Math.max(0, currentStock - (Number(amount) || 0));
  } else if (adjustmentType === 'SET') {
    proposedStock = Math.max(0, Number(amount) || 0);
  }

  const isInvalidRemoval = adjustmentType === 'REMOVE' && amount > currentStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 && adjustmentType !== 'SET') return;
    if (isInvalidRemoval) return;

    const finalReason = reason === 'Other' ? customReason || 'Manual adjustment' : reason;

    try {
      setIsSubmitting(true);
      await onConfirm({
        productId: product.id,
        type: adjustmentType,
        amount: Number(amount),
        reason: finalReason,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Dark Store Stock"
      subtitle={`${product.name} (${product.sku})`}
      onSubmit={handleSubmit}
      submitLabel="Apply Stock Adjustment"
      isSubmitting={isSubmitting}
      maxWidth="md"
    >
      {/* Product Summary Header */}
      <div className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg border border-border-light">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-12 h-12 rounded object-cover border shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-xs text-ink-primary truncate">{product.name}</p>
          <p className="text-[11px] text-ink-muted">
            {product.packSize} • Current Total: <strong>{product.stockQuantity}</strong> (Reserved:{' '}
            {product.reservedQuantity})
          </p>
        </div>
      </div>

      {/* Adjustment Mode Selection */}
      <div>
        <label className="block text-xs font-semibold text-ink-primary mb-2">
          Select Adjustment Action *
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setAdjustmentType('ADD')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${
              adjustmentType === 'ADD'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                : 'bg-white border-border-light text-slate-700 hover:bg-surface-secondary'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            Add Stock
          </button>

          <button
            type="button"
            onClick={() => setAdjustmentType('REMOVE')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${
              adjustmentType === 'REMOVE'
                ? 'bg-red-50 border-red-500 text-red-800 shadow-xs'
                : 'bg-white border-border-light text-slate-700 hover:bg-surface-secondary'
            }`}
          >
            <Minus className="w-4 h-4 text-red-600" />
            Remove Stock
          </button>

          <button
            type="button"
            onClick={() => setAdjustmentType('SET')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${
              adjustmentType === 'SET'
                ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                : 'bg-white border-border-light text-slate-700 hover:bg-surface-secondary'
            }`}
          >
            <Hash className="w-4 h-4 text-blue-600" />
            Set Exact
          </button>
        </div>
      </div>

      {/* Units Input */}
      <div>
        <label className="block text-xs font-semibold text-ink-primary mb-1">
          {adjustmentType === 'SET' ? 'New Exact Physical Stock Quantity *' : 'Units to Adjust *'}
        </label>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-full text-base font-bold p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        {isInvalidRemoval && (
          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Cannot remove more units ({amount}) than currently available ({currentStock}).
          </p>
        )}
      </div>

      {/* Stock Impact Comparison */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <p className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-2">
          Calculated Stock Impact
        </p>
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-ink-muted">Current Stock:</span>
            <p className="text-sm font-semibold text-ink-primary">{currentStock} units</p>
          </div>
          <span className="text-base text-ink-muted">→</span>
          <div className="text-right">
            <span className="text-ink-muted">Proposed Stock:</span>
            <p
              className={`text-sm font-bold ${
                proposedStock <= product.lowStockThreshold
                  ? 'text-amber-700'
                  : 'text-brand-700'
              }`}
            >
              {proposedStock} units
            </p>
          </div>
        </div>
      </div>

      {/* Reason for Adjustment */}
      <div>
        <label className="block text-xs font-semibold text-ink-primary mb-1">
          Audit Reason *
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="Replenishment delivery batch">Replenishment supplier batch received</option>
          <option value="Damage / Expiry disposal">Damaged or expired items written off</option>
          <option value="Audit Discrepancy reconciled">Dark store physical inventory count discrepancy</option>
          <option value="Customer Return Restocked">Customer return inspected & restocked</option>
          <option value="Other">Other (enter manual reason)</option>
        </select>

        {reason === 'Other' && (
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Specify reason for audit..."
            className="w-full text-xs p-2.5 mt-2 bg-white border border-border-light rounded-lg"
          />
        )}
      </div>

      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
        <strong>Audit Trail Notice:</strong> Every adjustment is recorded in the dark store compliance ledger with your acting admin credential (Shriya Verma).
      </div>
    </FormDrawer>
  );
};
