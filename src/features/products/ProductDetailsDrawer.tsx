import React from 'react';
import { Product } from '../../types';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Edit3, Boxes, Archive, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductDetailsDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
}

export const ProductDetailsDrawer: React.FC<ProductDetailsDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onArchive,
}) => {
  const navigate = useNavigate();
  if (!product) return null;

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`SKU: ${product.sku} • Brand: ${product.brand}`}
      badge={<StatusBadge status={product.stockStatus} />}
      footer={
        <>
          <button
            type="button"
            onClick={() => onArchive(product)}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
          >
            <Archive className="w-3.5 h-3.5 text-ink-muted" />
            {product.isArchived ? 'Restore Product' : 'Archive Product'}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/inventory?search=${encodeURIComponent(product.sku)}`);
            }}
            className="px-3.5 py-2 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Boxes className="w-3.5 h-3.5 text-brand-600" />
            Adjust Stock
          </button>
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="px-4 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Product
          </button>
        </>
      }
    >
      {/* Product Image Banner */}
      <div className="relative aspect-16/9 w-full bg-surface-secondary rounded-lg overflow-hidden border border-border-light">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
            {product.discountPercent}% DISCOUNT
          </div>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-surface-secondary/60 p-3.5 rounded-lg border border-border-light text-xs leading-relaxed text-ink-secondary">
          <p className="font-semibold text-ink-primary mb-1">About Item</p>
          {product.description}
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="bg-white rounded-lg border border-border-light p-4 shadow-card">
        <h4 className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-3">
          Pricing & Unit Details
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-ink-muted">Selling Price</p>
            <p className="text-base font-bold text-ink-primary mt-0.5">
              {formatCurrency(product.sellingPrice)}
            </p>
          </div>
          <div>
            <p className="text-ink-muted">MRP</p>
            <p className="text-sm font-medium text-ink-secondary mt-0.5 line-through">
              {formatCurrency(product.mrp)}
            </p>
          </div>
          <div>
            <p className="text-ink-muted">Pack / Unit Size</p>
            <p className="text-sm font-semibold text-ink-primary mt-0.5">
              {product.packSize}
            </p>
          </div>
          <div>
            <p className="text-ink-muted">Category</p>
            <p className="text-xs font-semibold text-brand-700 mt-0.5 truncate">
              {product.categoryName}
            </p>
          </div>
        </div>
      </div>

      {/* Stock Health */}
      <div className="bg-white rounded-lg border border-border-light p-4 shadow-card">
        <h4 className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-3">
          Dark Store Inventory Status
        </h4>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-surface-secondary rounded-lg">
            <p className="text-ink-muted">Available to Sell</p>
            <p className="text-xl font-bold text-ink-primary mt-1">
              {product.availableQuantity}
            </p>
          </div>
          <div className="p-3 bg-surface-secondary rounded-lg">
            <p className="text-ink-muted">Reserved in Orders</p>
            <p className="text-xl font-bold text-ink-primary mt-1">
              {product.reservedQuantity}
            </p>
          </div>
          <div className="p-3 bg-surface-secondary rounded-lg">
            <p className="text-ink-muted">Low-Stock Alert at</p>
            <p className="text-xl font-bold text-amber-700 mt-1">
              {product.lowStockThreshold}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-2 pt-2 border-t border-border-light text-[11px] text-ink-muted">
        <div className="flex justify-between">
          <span>Catalog Visibility:</span>
          <span className="font-semibold text-ink-primary">
            {product.isActive ? 'Active (Public)' : 'Hidden'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Created on:</span>
          <span className="text-ink-secondary">{formatDate(product.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Catalog Update:</span>
          <span className="text-ink-secondary">{formatDate(product.updatedAt)}</span>
        </div>
      </div>
    </DetailsDrawer>
  );
};
