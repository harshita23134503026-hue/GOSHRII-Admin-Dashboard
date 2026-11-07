import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, CreateStoreInput } from '../../types';
import { FormDrawer } from '../../components/ui/FormDrawer';
import {
  Store as StoreIcon,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

const storeSchema = z
  .object({
    storeName: z.string().min(2, 'Store name must be at least 2 characters'),
    userName: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: z.string().min(10, 'Please enter a valid phone number (at least 10 digits)'),
    location: z.string().min(3, 'Location address is required'),
    city: z.string().min(2, 'City is required'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    operatingHours: z.string().optional(),
    category: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type StoreFormData = z.infer<typeof storeSchema>;

interface StoreFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStoreInput) => Promise<void>;
  storeToEdit?: Store | null;
  isSubmitting?: boolean;
}

export const StoreFormDrawer: React.FC<StoreFormDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  storeToEdit,
  isSubmitting = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      storeName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      location: '',
      city: 'Bengaluru',
      status: 'ACTIVE',
      operatingHours: '07:00 AM - 11:00 PM',
      category: 'Grocery & Daily Essentials',
    },
  });

  useEffect(() => {
    if (storeToEdit) {
      reset({
        storeName: storeToEdit.storeName,
        userName: storeToEdit.userName,
        email: storeToEdit.email,
        password: storeToEdit.password || '',
        confirmPassword: storeToEdit.password || '',
        phone: storeToEdit.phone,
        location: storeToEdit.location,
        city: storeToEdit.city || 'Bengaluru',
        status: storeToEdit.status,
        operatingHours: storeToEdit.operatingHours || '07:00 AM - 11:00 PM',
        category: storeToEdit.category || 'Grocery & Daily Essentials',
      });
    } else {
      reset({
        storeName: '',
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: '',
        city: 'Bengaluru',
        status: 'ACTIVE',
        operatingHours: '07:00 AM - 11:00 PM',
        category: 'Grocery & Daily Essentials',
      });
    }
  }, [storeToEdit, reset, isOpen]);

  const handleFormSubmit = async (data: StoreFormData) => {
    await onSubmit({
      storeName: data.storeName,
      userName: data.userName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phone: data.phone,
      location: data.location,
      city: data.city,
      status: data.status,
      operatingHours: data.operatingHours,
      category: data.category,
    });
  };

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={storeToEdit ? `Edit Store — ${storeToEdit.storeName}` : 'Register New Store'}
      subtitle={
        storeToEdit
          ? `Update account coordinates and authentication credentials for Store #${storeToEdit.id}`
          : 'Create a new merchant store account with manager login credentials and fulfillment coordinates.'
      }
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={storeToEdit ? 'Save Changes' : 'Create Store'}
      isSubmitting={isSubmitting}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Store Name */}
        <div>
          <label className="block font-semibold text-ink-primary mb-1">
            Store Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <StoreIcon className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Koramangala Commerce Hub"
              {...register('storeName')}
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-surface-secondary border rounded-lg text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:bg-white outline-none transition-all ${
                errors.storeName
                  ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500'
                  : 'border-border-light focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
          </div>
          {errors.storeName && (
            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {errors.storeName.message}
            </p>
          )}
        </div>

        {/* User Name & Phone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              User Name (Manager Handle) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. store_mgr_blr"
                {...register('userName')}
                className={`w-full pl-9 pr-3.5 py-2 text-xs bg-surface-secondary border rounded-lg text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:bg-white outline-none transition-all ${
                  errors.userName
                    ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500'
                    : 'border-border-light focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
            </div>
            {errors.userName && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.userName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. +91 98450 22341"
                {...register('phone')}
                className={`w-full pl-9 pr-3.5 py-2 text-xs bg-surface-secondary border rounded-lg text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:bg-white outline-none transition-all ${
                  errors.phone
                    ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500'
                    : 'border-border-light focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold text-ink-primary mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="e.g. store@goshrii.in"
              {...register('email')}
              className={`w-full pl-9 pr-3.5 py-2 text-xs bg-surface-secondary border rounded-lg text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:bg-white outline-none transition-all ${
                errors.email
                  ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500'
                  : 'border-border-light focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                {...register('password')}
                className={`w-full pl-9 pr-9 py-2 text-xs bg-surface-secondary border rounded-lg text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:bg-white outline-none transition-all ${
                  errors.password
                    ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500'
                    : 'border-border-light focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                {...register('confirmPassword')}
                className={`w-full pl-9 pr-9 py-2 text-xs bg-surface-secondary border rounded-lg text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:bg-white outline-none transition-all ${
                  errors.confirmPassword
                    ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500'
                    : 'border-border-light focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Location & City */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block font-semibold text-ink-primary mb-1">
              Location / Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. 80 Feet Rd, 4th Block, Koramangala"
                {...register('location')}
                className={`w-full pl-9 pr-3.5 py-2 text-xs bg-surface-secondary border rounded-lg text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:bg-white outline-none transition-all ${
                  errors.location
                    ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500'
                    : 'border-border-light focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
            </div>
            {errors.location && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">City</label>
            <input
              type="text"
              placeholder="Bengaluru"
              {...register('city')}
              className="w-full px-3.5 py-2 text-xs bg-surface-secondary border border-border-light rounded-lg text-ink-primary focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        {/* Status & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-ink-primary mb-1">Account Status</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 text-xs bg-surface-secondary border border-border-light rounded-lg text-ink-primary focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">Store Category</label>
            <input
              type="text"
              placeholder="e.g. Grocery & Daily Needs"
              {...register('category')}
              className="w-full px-3.5 py-2 text-xs bg-surface-secondary border border-border-light rounded-lg text-ink-primary focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </FormDrawer>
  );
};

