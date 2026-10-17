import React from 'react';
import { Eye, Edit3, ArrowRight, Layers } from 'lucide-react';
import { Category } from '../../types';
import { StatusBadge } from './StatusBadge';

interface CategoryCardProps {
  category: Category;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onViewProducts: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onView,
  onEdit,
  onViewProducts,
}) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={`group bg-white rounded-card border border-border-light overflow-hidden shadow-card hover:shadow-md transition-all flex flex-col justify-between ${
        category.isArchived ? 'opacity-65 bg-slate-50/70' : ''
      }`}
    >
      <div className="relative aspect-16/9 w-full bg-surface-secondary overflow-hidden border-b border-border-light/60">
        {!imgError && category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink-muted bg-slate-100">
            <Layers className="w-8 h-8 stroke-[1.5] mb-1" />
            <span className="text-[11px]">No category image</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <StatusBadge status={category.isActive ? 'ACTIVE' : 'HIDDEN'} size="sm" />
          {category.isArchived && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-600 text-white rounded-md">
              Archived
            </span>
          )}
        </div>

        {category.parentName && (
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
            Sub of {category.parentName}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4
              onClick={() => onView(category)}
              className="text-base font-semibold text-ink-primary hover:text-brand-600 transition-colors cursor-pointer truncate"
              title={category.name}
            >
              {category.name}
            </h4>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 whitespace-nowrap">
              {category.directProductCount} {category.directProductCount === 1 ? 'product' : 'products'}
            </span>
          </div>

          <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed">
            {category.description || 'No description provided.'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border-light/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onView(category)}
              className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors"
              title="View Category Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="p-1.5 rounded-lg text-brand-700 hover:text-brand-800 hover:bg-brand-50 transition-colors"
              title="Edit Category"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onViewProducts(category)}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800 hover:underline"
          >
            <span>View Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
