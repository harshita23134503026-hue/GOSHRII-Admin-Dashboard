import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { FormDrawer } from '../../components/ui/FormDrawer';
import { formatCurrency } from '../../utils/formatters';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface EditPriceDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: {
    productId: string;
    newMrp: number;
    newSellingPrice: number;
    reason: string;
  }) => Promise<void>;
}

export const EditPriceDrawer: React.FC<EditPriceDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [newMrp, setNewMrp] = useState<number>(0);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(0);
  const [reason, setReason] = useState<string>('Vendor price revision');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setNewMrp(product.mrp);
      setNewSellingPrice(product.sellingPrice);
      setReason('Vendor price revision');
    }
  }, [product]);

  if (!product) return null;

  const isInvalid = newSellingPrice > newMrp;
  const newDiscount =
    newMrp > 0 && newSellingPrice <= newMrp
      ? Math.round(((newMrp - newSellingPrice) / newMrp) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSellingPrice <= 0 || newMrp <= 0 || isInvalid) return;

    try {
      setIsSubmitting(true);
      await onConfirm({
        productId: product.id,
        newMrp: Number(newMrp),
        newSellingPrice: Number(newSellingPrice),
        reason,
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
      title="Edit Product Price"
      subtitle={`${product.name} (${product.sku})`}
      onSubmit={handleSubmit}
      submitLabel="Apply Price Change"
      isSubmitting={isSubmitting}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Item Summary */}
        <div className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg border border-border-light">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-12 h-12 rounded object-cover border shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-ink-primary truncate">{product.name}</p>
            <p className="text-[11px] text-ink-muted">
              Current: <strong>{formatCurrency(product.sellingPrice)}</strong> (MRP:{' '}
              {formatCurrency(product.mrp)}) • {product.discountPercent}% OFF
            </p>
          </div>
        </div>

        {/* Input Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              New MRP (₹) *
            </label>
            <input
              type="number"
              step="any"
              min="1"
              value={newMrp}
              onChange={(e) => setNewMrp(Number(e.target.value) || 0)}
              className="w-full text-sm font-semibold p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              New Selling Price (₹) *
            </label>
            <input
              type="number"
              step="any"
              min="1"
              value={newSellingPrice}
              onChange={(e) => setNewSellingPrice(Number(e.target.value) || 0)}
              className="w-full text-sm font-bold text-brand-700 p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {isInvalid && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Selling price cannot exceed the Maximum Retail Price (MRP).</span>
          </div>
        )}

        {/* Price Comparison Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-2">
            Old vs New Price Comparison
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-ink-muted">Previous Selling:</span>
              <p className="text-sm font-semibold text-ink-primary line-through mt-0.5">
                {formatCurrency(product.sellingPrice)}
              </p>
            </div>
            <div>
              <span className="text-ink-muted">New Selling:</span>
              <p className="text-base font-bold text-brand-700 mt-0.5">
                {formatCurrency(newSellingPrice)}
              </p>
            </div>
            <div>
              <span className="text-ink-muted">Customer Discount:</span>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {newDiscount}% OFF
              </p>
            </div>
          </div>
        </div>

        {/* Revision Reason */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Reason for Price Revision *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="Vendor price revision">Supplier / vendor procurement price change</option>
            <option value="Competitive matching">Competitive quick-commerce pricing match</option>
            <option value="Seasonal promotional discount">Festive or seasonal discount campaign</option>
            <option value="Near-expiry markdown">Short shelf-life flash markdown</option>
            <option value="Correction of catalog error">Correction of incorrect data entry</option>
          </select>
        </div>

        <div className="p-3 bg-brand-50/60 border border-brand-100 rounded-lg text-[11px] text-brand-900 leading-relaxed">
          Historical orders placed prior to this revision retain their recorded checkout prices.
        </div>
      </div>
    </FormDrawer>
  );
};
