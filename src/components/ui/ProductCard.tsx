import React from 'react';
import { Eye, Edit3, Archive, ImageOff } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onArchive?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  onEdit,
  onArchive,
}) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={`group bg-white rounded-card border border-border-light overflow-hidden shadow-card hover:shadow-md transition-all flex flex-col justify-between ${
        product.isArchived ? 'opacity-65 bg-slate-50/70' : ''
      }`}
    >
      {/* Top Image Section */}
      <div className="relative aspect-4/3 w-full bg-surface-secondary overflow-hidden border-b border-border-light/60">
        {!imgError && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink-muted bg-slate-100">
            <ImageOff className="w-8 h-8 stroke-[1.5] mb-1" />
            <span className="text-[11px]">No image preview</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          <StatusBadge status={product.stockStatus} size="sm" />
          {!product.isActive && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-white rounded-md">
              Hidden
            </span>
          )}
          {product.isArchived && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-600 text-white rounded-md">
              Archived
            </span>
          )}
        </div>

        {product.discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-emerald-700 text-white font-bold text-[11px] px-2 py-0.5 rounded-full shadow-xs">
            {product.discountPercent}% OFF
          </div>
        )}

        {/* Pack Size Overlay */}
        <div className="absolute bottom-2 left-2.5 bg-white/90 backdrop-blur-xs text-ink-primary font-medium text-[11px] px-2 py-0.5 rounded shadow-xs">
          {product.packSize}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-ink-secondary mb-1">
            <span className="font-medium text-brand-700 uppercase tracking-wider truncate max-w-[140px]">
              {product.brand}
            </span>
            <span className="font-mono text-ink-muted">{product.sku}</span>
          </div>

          <h4
            className="text-sm font-semibold text-ink-primary line-clamp-2 leading-snug hover:text-brand-600 transition-colors cursor-pointer"
            onClick={() => onView(product)}
            title={product.name}
          >
            {product.name}
          </h4>

          <p className="text-[11px] text-ink-muted mt-1 truncate">
            {product.categoryName}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border-light/60">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-base font-bold text-ink-primary">
                {formatCurrency(product.sellingPrice)}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-xs text-ink-muted line-through ml-1.5 font-normal">
                  {formatCurrency(product.mrp)}
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-ink-primary">
                {product.availableQuantity}
              </span>
              <span className="text-[11px] text-ink-muted ml-1">in stock</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => onView(product)}
              className="inline-flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium text-slate-700 bg-surface-subtle hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-ink-secondary" />
              View
            </button>
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="inline-flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-brand-600" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
