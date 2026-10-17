import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PromotionalOffer, Category, OfferDiscountType, OfferStatus } from '../../types';
import { FormDrawer } from '../../components/ui/FormDrawer';

const offerSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.coerce.number().positive('Discount value must be greater than 0'),
  targetType: z.enum(['ALL', 'CATEGORY', 'PRODUCT']),
  targetId: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum(['ACTIVE', 'SCHEDULED', 'EXPIRED', 'DISABLED']),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialOffer?: PromotionalOffer | null;
  onSubmit: (data: OfferFormData) => Promise<void>;
}

export const OfferFormDrawer: React.FC<OfferFormDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  initialOffer,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: '',
      code: '',
      type: 'PERCENTAGE',
      discountValue: 10,
      targetType: 'CATEGORY',
      targetId: categories[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (initialOffer) {
      reset({
        title: initialOffer.title,
        code: initialOffer.code || '',
        type: initialOffer.type,
        discountValue: initialOffer.discountValue,
        targetType: initialOffer.targetType,
        targetId: initialOffer.targetId || '',
        startDate: initialOffer.startDate.split('T')[0],
        endDate: initialOffer.endDate.split('T')[0],
        status: initialOffer.status,
      });
    } else {
      reset({
        title: '',
        code: `OFFER${Math.floor(10 + Math.random() * 90)}`,
        type: 'PERCENTAGE',
        discountValue: 15,
        targetType: 'CATEGORY',
        targetId: categories[0]?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'ACTIVE',
      });
    }
  }, [initialOffer, reset, categories]);

  const targetTypeWatch = watch('targetType');
  const discountTypeWatch = watch('type');

  const handleFormSubmit = async (data: OfferFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialOffer ? 'Edit Promotional Offer' : 'Create Promotional Offer'}
      subtitle="Configure quick-commerce discount campaign"
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={initialOffer ? 'Update Campaign' : 'Launch Campaign'}
      isSubmitting={isSubmitting}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-primary mb-1">
            Offer Campaign Title *
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="e.g. Weekend Staples 15% Off"
            className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {errors.title && <p className="text-[11px] text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Promo Code *
            </label>
            <input
              type="text"
              {...register('code')}
              placeholder="e.g. WEEKEND15"
              className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            {errors.code && <p className="text-[11px] text-red-600 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Status *
            </label>
            <select
              {...register('status')}
              className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg"
            >
              <option value="ACTIVE">Active (Live)</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="DISABLED">Disabled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Discount Mode *
            </label>
            <select
              {...register('type')}
              className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Rupee Amount (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Discount Value {discountTypeWatch === 'PERCENTAGE' ? '(%)' : '(₹)'} *
            </label>
            <input
              type="number"
              step="any"
              {...register('discountValue')}
              className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg font-semibold"
            />
            {errors.discountValue && (
              <p className="text-[11px] text-red-600 mt-1">{errors.discountValue.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Applicable Scope *
            </label>
            <select
              {...register('targetType')}
              className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg"
            >
              <option value="CATEGORY">Specific Category</option>
              <option value="ALL">Entire Dark Store Catalog</option>
            </select>
          </div>

          {targetTypeWatch === 'CATEGORY' && (
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Target Category *
              </label>
              <select
                {...register('targetId')}
                className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Start Date *
            </label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              End Date *
            </label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg"
            />
          </div>
        </div>
      </div>
    </FormDrawer>
  );
};
