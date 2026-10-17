import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category } from '../../types';
import { FormDrawer } from '../../components/ui/FormDrawer';
import { Upload } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  imageUrl: z.string().min(1, 'Category image URL is required'),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialCategory?: Category | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
}

export const CategoryFormDrawer: React.FC<CategoryFormDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategory,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: null,
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialCategory) {
      reset({
        name: initialCategory.name,
        slug: initialCategory.slug,
        description: initialCategory.description,
        parentId: initialCategory.parentId || null,
        imageUrl: initialCategory.imageUrl,
        isActive: initialCategory.isActive,
      });
      setPreviewUrl(initialCategory.imageUrl);
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        parentId: null,
        imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      });
      setPreviewUrl('https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80');
    }
  }, [initialCategory, reset]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eligible parent options (cannot be itself)
  const parentOptions = categories.filter(
    (c) => !initialCategory || c.id !== initialCategory.id
  );

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialCategory ? 'Edit Category' : 'Create Category'}
      subtitle="Organize product catalog into searchable taxonomies"
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={initialCategory ? 'Update Category' : 'Create Category'}
      isSubmitting={isSubmitting}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Category Name *
          </label>
          <input
            type="text"
            {...register('name')}
            onChange={(e) => {
              setValue('name', e.target.value);
              if (!initialCategory) {
                setValue('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }
            }}
            placeholder="e.g. Organic Dairy & Milk"
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Slug *
          </label>
          <input
            type="text"
            {...register('slug')}
            placeholder="e.g. organic-dairy"
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {errors.slug && <p className="text-[11px] text-red-600 mt-1">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Parent Category (Optional)
          </label>
          <select
            {...register('parentId')}
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">None (Top-Level Category)</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Description
          </label>
          <textarea
            rows={3}
            {...register('description')}
            placeholder="Brief scope of products in this category..."
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Category Image URL *
          </label>
          <input
            type="url"
            {...register('imageUrl')}
            onChange={(e) => {
              setValue('imageUrl', e.target.value);
              setPreviewUrl(e.target.value);
            }}
            placeholder="https://images.unsplash.com/..."
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {errors.imageUrl && (
            <p className="text-[11px] text-red-600 mt-1">{errors.imageUrl.message}</p>
          )}

          {previewUrl && (
            <div className="mt-2.5 flex items-center gap-3 p-2 bg-surface-secondary border border-border-light rounded-lg">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-12 h-12 object-cover rounded border"
                onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
              />
              <span className="text-xs text-ink-muted">Category banner preview</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="catActive"
            {...register('isActive')}
            className="w-4 h-4 text-brand-600 rounded border-border-light focus:ring-brand-500"
          />
          <label htmlFor="catActive" className="text-xs font-medium text-ink-primary">
            Active category (visible in consumer navigation)
          </label>
        </div>
      </div>
    </FormDrawer>
  );
};
