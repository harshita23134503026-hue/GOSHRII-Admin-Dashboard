import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { FormDrawer } from '../../components/ui/FormDrawer';
import { ParcelBooking, ParcelCategory, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Package, CheckCircle2 } from 'lucide-react';

interface AddParcelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (parcel: ParcelBooking) => void;
}

const CATEGORIES: ParcelCategory[] = [
  'DOCUMENTS',
  'CLOTHING',
  'ELECTRONICS',
  'HOUSEHOLD',
  'FOOD_GIFTS',
  'OTHER',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'CASH_ON_DELIVERY',
  'CREDIT_CARD',
  'NET_BANKING',
];

export const AddParcelDrawer: React.FC<AddParcelDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdParcel, setCreatedParcel] = useState<ParcelBooking | null>(null);

  // Form state
  const [form, setForm] = useState({
    // Sender
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    senderLocality: '',
    senderLandmark: '',
    senderInstructions: '',
    // Recipient
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientLocality: '',
    recipientLandmark: '',
    recipientInstructions: '',
    // Parcel
    category: 'DOCUMENTS' as ParcelCategory,
    description: '',
    weightKg: '0.5',
    dimensionsCm: '',
    handlingNotes: '',
    // Booking
    paymentMethod: 'UPI' as PaymentMethod,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const weightKg = parseFloat(form.weightKg) || 0.5;
  // Deterministic fee: ₹80 base + ₹25/kg, rounded to nearest 5
  const deliveryFee = Math.ceil((80 + weightKg * 25) / 5) * 5;

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.senderName.trim()) errs.senderName = 'Sender name is required';
    if (!form.senderPhone.trim()) errs.senderPhone = 'Sender phone is required';
    if (!form.senderAddress.trim()) errs.senderAddress = 'Sender address is required';
    if (!form.senderLocality.trim()) errs.senderLocality = 'Sender locality is required';
    if (!form.recipientName.trim()) errs.recipientName = 'Recipient name is required';
    if (!form.recipientPhone.trim()) errs.recipientPhone = 'Recipient phone is required';
    if (!form.recipientAddress.trim()) errs.recipientAddress = 'Recipient address is required';
    if (!form.recipientLocality.trim()) errs.recipientLocality = 'Recipient locality is required';
    if (!form.description.trim()) errs.description = 'Package description is required';
    const w = parseFloat(form.weightKg);
    if (isNaN(w) || w <= 0) errs.weightKg = 'Enter a valid weight in kg';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep('review');
  };

  const handleConfirmCreate = async () => {
    setIsSubmitting(true);
    try {
      const data: Omit<ParcelBooking, 'id' | 'trackingId' | 'status' | 'createdAt' | 'timeline'> =
        {
          sender: {
            name: form.senderName.trim(),
            phone: form.senderPhone.trim(),
            address: form.senderAddress.trim(),
            locality: form.senderLocality.trim(),
            landmark: form.senderLandmark.trim() || undefined,
            instructions: form.senderInstructions.trim() || undefined,
          },
          recipient: {
            name: form.recipientName.trim(),
            phone: form.recipientPhone.trim(),
            address: form.recipientAddress.trim(),
            locality: form.recipientLocality.trim(),
            landmark: form.recipientLandmark.trim() || undefined,
            instructions: form.recipientInstructions.trim() || undefined,
          },
          parcel: {
            category: form.category,
            description: form.description.trim(),
            weightKg,
            dimensionsCm: form.dimensionsCm.trim() || undefined,
            handlingNotes: form.handlingNotes.trim() || undefined,
          },
          deliveryType: 'LOCAL_POINT_TO_POINT',
          deliveryFee,
          paymentMethod: form.paymentMethod,
          paymentStatus: 'PENDING',
        };

      const created = await adminService.createParcelBooking(data);
      setCreatedParcel(created);
      setStep('success');
      onSuccess(created);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setForm({
      senderName: '', senderPhone: '', senderAddress: '', senderLocality: '',
      senderLandmark: '', senderInstructions: '',
      recipientName: '', recipientPhone: '', recipientAddress: '', recipientLocality: '',
      recipientLandmark: '', recipientInstructions: '',
      category: 'DOCUMENTS', description: '', weightKg: '0.5',
      dimensionsCm: '', handlingNotes: '', paymentMethod: 'UPI',
    });
    setErrors({});
    setCreatedParcel(null);
    onClose();
  };

  // Shared input class
  const inputCls = (field: string) =>
    `w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white ${
      errors[field]
        ? 'border-rose-400 focus:ring-rose-400/20'
        : 'border-border-light'
    }`;

  const labelCls = 'block text-xs font-medium text-ink-primary mb-1';
  const errorMsg = (field: string) =>
    errors[field] ? (
      <p className="text-[11px] text-rose-600 mt-0.5">{errors[field]}</p>
    ) : null;

  // ============================================================
  // STEP: SUCCESS
  // ============================================================
  if (step === 'success' && createdParcel) {
    return (
      <div
        className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? '' : 'hidden'}`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-ink-primary/30 backdrop-blur-xs"
          onClick={handleClose}
          aria-hidden="true"
        />
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-xl bg-white shadow-drawer flex flex-col">
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink-primary">
                    Parcel Booking Created!
                  </h3>
                  <p className="text-sm text-ink-secondary mt-2">
                    The booking has been registered and is awaiting courier assignment.
                  </p>
                </div>

                <div className="p-4 bg-brand-50 border border-brand-200/60 rounded-xl text-left">
                  <p className="text-[11px] font-medium text-brand-700 uppercase tracking-wider mb-1">
                    Tracking ID
                  </p>
                  <p className="font-mono font-bold text-lg text-brand-600">
                    {createdParcel.trackingId}
                  </p>
                  <p className="text-xs text-ink-secondary mt-1">
                    Booking ID: {createdParcel.id}
                  </p>
                  <p className="text-xs font-medium text-ink-primary mt-2">
                    Delivery Fee: {formatCurrency(createdParcel.deliveryFee)} · {createdParcel.paymentMethod}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
                >
                  Done — Return to Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STEP: REVIEW
  // ============================================================
  if (step === 'review') {
    return (
      <div
        className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? '' : 'hidden'}`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-ink-primary/30 backdrop-blur-xs"
          onClick={() => setStep('form')}
          aria-hidden="true"
        />
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-xl bg-white shadow-drawer flex flex-col">
            <div className="p-5 border-b border-border-light flex items-center justify-between bg-surface-secondary/40">
              <div>
                <h2 className="text-lg font-semibold text-ink-primary">Review Booking</h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Confirm details before creating the parcel booking
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Route Summary */}
              <div className="p-4 bg-surface-secondary/50 rounded-xl border border-border-light space-y-2">
                <div>
                  <p className="text-ink-secondary">From (Sender)</p>
                  <p className="font-semibold text-ink-primary">
                    {form.senderName} · {form.senderLocality}
                  </p>
                  <p className="text-ink-secondary">{form.senderAddress}</p>
                </div>
                <div className="flex items-center gap-2 text-ink-muted py-1">
                  <div className="flex-1 border-t border-dashed border-border-light" />
                  <Package className="w-4 h-4" />
                  <div className="flex-1 border-t border-dashed border-border-light" />
                </div>
                <div>
                  <p className="text-ink-secondary">To (Recipient)</p>
                  <p className="font-semibold text-ink-primary">
                    {form.recipientName} · {form.recipientLocality}
                  </p>
                  <p className="text-ink-secondary">{form.recipientAddress}</p>
                </div>
              </div>

              {/* Parcel Info */}
              <div className="p-4 bg-white rounded-xl border border-border-light space-y-1.5">
                <p className="font-semibold text-ink-primary mb-2">Package Details</p>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Category</span>
                  <span className="font-medium text-ink-primary">{form.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Description</span>
                  <span className="font-medium text-ink-primary">{form.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Weight</span>
                  <span className="font-medium text-ink-primary">{weightKg} kg</span>
                </div>
                {form.dimensionsCm && (
                  <div className="flex justify-between">
                    <span className="text-ink-secondary">Dimensions</span>
                    <span className="font-medium text-ink-primary">{form.dimensionsCm} cm</span>
                  </div>
                )}
              </div>

              {/* Fee Calculation */}
              <div className="p-4 bg-brand-50/40 border border-brand-200/50 rounded-xl space-y-2">
                <p className="font-semibold text-ink-primary mb-1">Fare Breakdown</p>
                <div className="flex justify-between text-ink-secondary">
                  <span>Base Handling Fee</span>
                  <span>{formatCurrency(80)}</span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>Weight Charge ({weightKg} kg × ₹25)</span>
                  <span>{formatCurrency(weightKg * 25)}</span>
                </div>
                <div className="pt-1.5 border-t border-brand-200/50 flex justify-between font-bold text-sm text-brand-700">
                  <span>Total Delivery Fee</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <p className="text-[11px] text-ink-muted">
                  Payment: {form.paymentMethod}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-border-light bg-surface-secondary/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-border-light rounded-lg hover:bg-surface-subtle"
              >
                Edit Details
              </button>
              <button
                type="button"
                onClick={handleConfirmCreate}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50"
              >
                {isSubmitting && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                Confirm & Create Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STEP: FORM
  // ============================================================
  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title="New Parcel Booking"
      subtitle="Create a local point-to-point parcel delivery for a sender"
      onSubmit={handleReview}
      submitLabel="Review & Continue →"
      isSubmitting={false}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Sender Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider border-b border-border-light pb-2">
            Sender Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input
                type="text"
                value={form.senderName}
                onChange={(e) => updateField('senderName', e.target.value)}
                placeholder="Dr. Suresh Rao"
                className={inputCls('senderName')}
              />
              {errorMsg('senderName')}
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <input
                type="tel"
                value={form.senderPhone}
                onChange={(e) => updateField('senderPhone', e.target.value)}
                placeholder="+91 98450 00000"
                className={inputCls('senderPhone')}
              />
              {errorMsg('senderPhone')}
            </div>
          </div>
          <div>
            <label className={labelCls}>Street Address *</label>
            <input
              type="text"
              value={form.senderAddress}
              onChange={(e) => updateField('senderAddress', e.target.value)}
              placeholder="Shop 4, 17th Cross, HSR Layout"
              className={inputCls('senderAddress')}
            />
            {errorMsg('senderAddress')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Locality / Area *</label>
              <input
                type="text"
                value={form.senderLocality}
                onChange={(e) => updateField('senderLocality', e.target.value)}
                placeholder="HSR Layout Sector 3"
                className={inputCls('senderLocality')}
              />
              {errorMsg('senderLocality')}
            </div>
            <div>
              <label className={labelCls}>Landmark</label>
              <input
                type="text"
                value={form.senderLandmark}
                onChange={(e) => updateField('senderLandmark', e.target.value)}
                placeholder="Near BDA Complex"
                className={inputCls('senderLandmark')}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Pickup Instructions</label>
            <input
              type="text"
              value={form.senderInstructions}
              onChange={(e) => updateField('senderInstructions', e.target.value)}
              placeholder="Collect from 2nd floor reception"
              className={inputCls('senderInstructions')}
            />
          </div>
        </div>

        {/* Recipient Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider border-b border-border-light pb-2">
            Recipient Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input
                type="text"
                value={form.recipientName}
                onChange={(e) => updateField('recipientName', e.target.value)}
                placeholder="Divya Shenoy"
                className={inputCls('recipientName')}
              />
              {errorMsg('recipientName')}
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <input
                type="tel"
                value={form.recipientPhone}
                onChange={(e) => updateField('recipientPhone', e.target.value)}
                placeholder="+91 97410 00000"
                className={inputCls('recipientPhone')}
              />
              {errorMsg('recipientPhone')}
            </div>
          </div>
          <div>
            <label className={labelCls}>Delivery Address *</label>
            <input
              type="text"
              value={form.recipientAddress}
              onChange={(e) => updateField('recipientAddress', e.target.value)}
              placeholder="Flat 402, Rainbow Residency, 5th Cross"
              className={inputCls('recipientAddress')}
            />
            {errorMsg('recipientAddress')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Locality / Area *</label>
              <input
                type="text"
                value={form.recipientLocality}
                onChange={(e) => updateField('recipientLocality', e.target.value)}
                placeholder="Koramangala 6th Block"
                className={inputCls('recipientLocality')}
              />
              {errorMsg('recipientLocality')}
            </div>
            <div>
              <label className={labelCls}>Landmark</label>
              <input
                type="text"
                value={form.recipientLandmark}
                onChange={(e) => updateField('recipientLandmark', e.target.value)}
                placeholder="Behind Bethany High School"
                className={inputCls('recipientLandmark')}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Delivery Instructions</label>
            <input
              type="text"
              value={form.recipientInstructions}
              onChange={(e) => updateField('recipientInstructions', e.target.value)}
              placeholder="Leave at door if not home"
              className={inputCls('recipientInstructions')}
            />
          </div>
        </div>

        {/* Parcel Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider border-b border-border-light pb-2">
            Package Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Category *</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className={inputCls('category')}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Weight (kg) *</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={form.weightKg}
                onChange={(e) => updateField('weightKg', e.target.value)}
                className={inputCls('weightKg')}
              />
              {errorMsg('weightKg')}
            </div>
          </div>
          <div>
            <label className={labelCls}>Contents Description *</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Tailored silk saree (1 item)"
              className={inputCls('description')}
            />
            {errorMsg('description')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Dimensions (L×W×H cm)</label>
              <input
                type="text"
                value={form.dimensionsCm}
                onChange={(e) => updateField('dimensionsCm', e.target.value)}
                placeholder="40×30×10"
                className={inputCls('dimensionsCm')}
              />
            </div>
            <div>
              <label className={labelCls}>Handling Notes</label>
              <input
                type="text"
                value={form.handlingNotes}
                onChange={(e) => updateField('handlingNotes', e.target.value)}
                placeholder="Fragile. Keep dry."
                className={inputCls('handlingNotes')}
              />
            </div>
          </div>
        </div>

        {/* Payment & Fee */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider border-b border-border-light pb-2">
            Payment
          </h3>
          <div>
            <label className={labelCls}>Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => updateField('paymentMethod', e.target.value)}
              className={inputCls('paymentMethod')}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 bg-surface-secondary/60 border border-border-light rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-ink-secondary">
              <span>Base Fee</span>
              <span>{formatCurrency(80)}</span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>Weight ({weightKg} kg × ₹25)</span>
              <span>{formatCurrency(weightKg * 25)}</span>
            </div>
            <div className="pt-1.5 border-t border-border-light flex justify-between font-bold text-sm text-brand-600">
              <span>Delivery Fee</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
          </div>
        </div>
      </div>
    </FormDrawer>
  );
};
