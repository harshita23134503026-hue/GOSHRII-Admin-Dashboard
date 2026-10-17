import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, Category } from '../../types';
import { FormDrawer } from '../../components/ui/FormDrawer';
import { Upload, Image as ImageIcon } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters').toUpperCase(),
  brand: z.string().min(2, 'Brand is required'),
  categoryId: z.string().min(1, 'Category must be selected'),
  packSize: z.string().min(1, 'Pack size is required (e.g. 500 g, 1 L)'),
  description: z.string().optional(),
  mrp: z.coerce.number().positive('MRP must be greater than 0'),
  sellingPrice: z.coerce.number().positive('Selling price must be greater than 0'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.coerce.number().int().min(1, 'Low-stock threshold must be at least 1'),
  isActive: z.boolean(),
  imageUrl: z.string().min(1, 'Image URL or mock upload is required'),
}).refine((data) => data.sellingPrice <= data.mrp, {
  message: 'Selling price cannot exceed MRP',
  path: ['sellingPrice'],
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialProduct?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export const ProductFormDrawer: React.FC<ProductFormDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  initialProduct,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(initialProduct?.imageUrl || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialProduct?.name || '',
      sku: initialProduct?.sku || '',
      brand: initialProduct?.brand || '',
      categoryId: initialProduct?.categoryId || (categories[0]?.id || ''),
      packSize: initialProduct?.packSize || '',
      description: initialProduct?.description || '',
      mrp: initialProduct?.mrp || 100,
      sellingPrice: initialProduct?.sellingPrice || 85,
      stockQuantity: initialProduct?.stockQuantity !== undefined ? initialProduct.stockQuantity : 25,
      lowStockThreshold: initialProduct?.lowStockThreshold || 10,
      isActive: initialProduct?.isActive !== undefined ? initialProduct.isActive : true,
      imageUrl: initialProduct?.imageUrl || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    },
  });

  // Re-sync when editing a different product
  React.useEffect(() => {
    if (initialProduct) {
      reset({
        name: initialProduct.name,
        sku: initialProduct.sku,
        brand: initialProduct.brand,
        categoryId: initialProduct.categoryId,
        packSize: initialProduct.packSize,
        description: initialProduct.description,
        mrp: initialProduct.mrp,
        sellingPrice: initialProduct.sellingPrice,
        stockQuantity: initialProduct.stockQuantity,
        lowStockThreshold: initialProduct.lowStockThreshold,
        isActive: initialProduct.isActive,
        imageUrl: initialProduct.imageUrl,
      });
      setPreviewUrl(initialProduct.imageUrl);
    } else {
      reset({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        brand: '',
        categoryId: categories[0]?.id || '',
        packSize: '',
        description: '',
        mrp: 100,
        sellingPrice: 85,
        stockQuantity: 20,
        lowStockThreshold: 10,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      });
      setPreviewUrl('https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80');
    }
  }, [initialProduct, reset, categories]);

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setValue('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const mrpWatch = watch('mrp');
  const sellingWatch = watch('sellingPrice');
  const calculatedDiscount =
    mrpWatch > 0 && sellingWatch <= mrpWatch
      ? Math.round(((mrpWatch - sellingWatch) / mrpWatch) * 100)
      : 0;

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? 'Edit Product Catalog Entry' : 'Add New Product'}
      subtitle={initialProduct ? `Updating SKU ${initialProduct.sku}` : 'Create a fresh quick-commerce product listing'}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={initialProduct ? 'Save Changes' : 'Create Product'}
      isSubmitting={isSubmitting}
      maxWidth="lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Product Name *
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="e.g. Amul Taaza Homogenised Toned Milk"
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Brand *
          </label>
          <input
            type="text"
            {...register('brand')}
            placeholder="e.g. Amul, ITC, FarmFresh"
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {errors.brand && <p className="text-[11px] text-red-600 mt-1">{errors.brand.message}</p>}
        </div>

        {/* SKU */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            SKU Code *
          </label>
          <input
            type="text"
            {...register('sku')}
            placeholder="e.g. DAI-AML-001"
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {errors.sku && <p className="text-[11px] text-red-600 mt-1">{errors.sku.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Category *
          </label>
          <select
            {...register('categoryId')}
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-[11px] text-red-600 mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Pack Size / Unit */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Pack Size / Unit *
          </label>
          <input
            type="text"
            {...register('packSize')}
            placeholder="e.g. 500 g, 1 L, Pack of 6"
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {errors.packSize && (
            <p className="text-[11px] text-red-600 mt-1">{errors.packSize.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Description
          </label>
          <textarea
            rows={2}
            {...register('description')}
            placeholder="Key product attributes, ingredients, storage instructions..."
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Pricing Box */}
        <div className="sm:col-span-2 p-3.5 bg-surface-secondary/60 border border-border-light rounded-lg space-y-3">
          <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
            Pricing Configuration (INR)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                MRP (₹) *
              </label>
              <input
                type="number"
                step="any"
                {...register('mrp')}
                className="w-full text-xs p-2 bg-white border border-border-light rounded-md font-semibold"
              />
              {errors.mrp && <p className="text-[11px] text-red-600 mt-1">{errors.mrp.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="any"
                {...register('sellingPrice')}
                className="w-full text-xs p-2 bg-white border border-border-light rounded-md font-semibold text-brand-700"
              />
              {errors.sellingPrice && (
                <p className="text-[11px] text-red-600 mt-1">{errors.sellingPrice.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Calculated Discount
              </label>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-bold text-emerald-800 text-center">
                {calculatedDiscount}% OFF
              </div>
            </div>
          </div>
        </div>

        {/* Stock & Thresholds */}
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Initial Stock Quantity *
          </label>
          <input
            type="number"
            {...register('stockQuantity')}
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg font-semibold"
          />
          {errors.stockQuantity && (
            <p className="text-[11px] text-red-600 mt-1">{errors.stockQuantity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Low-Stock Threshold *
          </label>
          <input
            type="number"
            {...register('lowStockThreshold')}
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg font-semibold"
          />
          {errors.lowStockThreshold && (
            <p className="text-[11px] text-red-600 mt-1">{errors.lowStockThreshold.message}</p>
          )}
        </div>

        {/* Visibility */}
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="productIsActive"
            {...register('isActive')}
            className="w-4 h-4 text-brand-600 rounded border-border-light focus:ring-brand-500"
          />
          <label htmlFor="productIsActive" className="text-xs font-medium text-ink-primary">
            Active in catalog (visible to dark store dispatch and order app)
          </label>
        </div>

        {/* Image URL & Mock Local Upload */}
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-xs font-semibold text-ink-primary">
            Product Image *
          </label>
          <input
            type="url"
            {...register('imageUrl')}
            onChange={(e) => {
              setValue('imageUrl', e.target.value);
              setPreviewUrl(e.target.value);
            }}
            placeholder="Paste image URL (https://...)"
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />

          <div className="flex items-center gap-4 pt-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-subtle hover:bg-slate-200 text-ink-primary rounded-md text-xs font-medium cursor-pointer transition-colors border border-border-light">
              <Upload className="w-3.5 h-3.5" />
              <span>Or Choose Local File (Mock Preview)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-ink-muted">
              Image is saved in local prototype state only.
            </span>
          </div>

          {previewUrl && (
            <div className="mt-2 flex items-center gap-3 p-2 bg-surface-secondary border border-border-light rounded-lg">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-md border"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink-primary">Selected Image Preview</p>
                <p className="text-[11px] text-ink-muted truncate max-w-sm">{previewUrl}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </FormDrawer>
  );
};
