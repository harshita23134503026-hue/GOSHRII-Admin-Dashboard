import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ParcelBooking } from '../../types';
import { formatCurrency, formatDate, maskPhone } from '../../utils/formatters';
import {
  Search,
  Package,
  MapPin,
  User,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Navigation,
  Copy,
} from 'lucide-react';

export const ParcelTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ParcelBooking | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-trigger search if URL has ?q= param
  useEffect(() => {
    const urlQ = searchParams.get('q');
    if (urlQ && urlQ.trim()) {
      setInputValue(urlQ);
      setQuery(urlQ);
      handleSearch(urlQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (searchTerm?: string) => {
    const term = (searchTerm ?? inputValue).trim();
    if (!term) return;
    setIsSearching(true);
    setNotFound(false);
    setResult(null);
    try {
      const parcel = await adminService.getParcelByTrackingId(term);
      if (parcel) {
        setResult(parcel);
        setQuery(term);
        setSearchParams({ q: term });
      } else {
        setNotFound(true);
        setQuery(term);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyTrackingId = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.trackingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Status icons per state
  const statusIcon = (status: string) => {
    if (status === 'DELIVERED') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (status === 'CANCELLED' || status === 'DELIVERY_FAILED' || status === 'PICKUP_FAILED')
      return <XCircle className="w-4 h-4 text-rose-600" />;
    if (status === 'IN_TRANSIT' || status === 'PICKED_UP')
      return <Truck className="w-4 h-4 text-sky-600" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parcel Tracking Console"
        description="Real-time tracking for local point-to-point delivery bookings"
      />

      {/* Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-border-light shadow-2xs">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-medium text-ink-primary mb-2">
            Enter Tracking ID or Booking ID
          </p>
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (notFound) setNotFound(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. GOSH-TRK-7411 or PRC-8101"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white placeholder:text-ink-muted"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching || !inputValue.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-40 shadow-xs"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isSearching ? 'Searching…' : 'Track'}
            </button>
          </div>

          {/* Quick-Access Demo Tracking IDs */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-ink-secondary">
            <span>Try demo IDs:</span>
            {['GOSH-TRK-7411', 'GOSH-TRK-7412', 'GOSH-TRK-7413'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setInputValue(id);
                  handleSearch(id);
                }}
                className="font-mono text-brand-600 hover:text-brand-700 hover:underline"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Not Found State */}
      {notFound && !isSearching && (
        <EmptyState
          title="Parcel Not Found"
          description={`No parcel booking found for "${query}". Please check the tracking ID or booking ID and try again.`}
        />
      )}

      {/* Results — Two Column Layout */}
      {result && !isSearching && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column — Booking Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tracking ID Card */}
            <div className="bg-white rounded-xl border border-border-light shadow-2xs p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-brand-50 rounded-lg">
                    <Package className="w-4 h-4 text-brand-600" />
                  </div>
                  <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
                    Parcel Information
                  </span>
                </div>
                <StatusBadge status={result.status} />
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-[11px] text-ink-secondary uppercase tracking-wider mb-0.5">
                    Tracking ID
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-brand-600">
                      {result.trackingId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTrackingId}
                      className="text-ink-muted hover:text-brand-600 transition-colors"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-ink-muted mt-0.5">Booking ID: {result.id}</p>
                </div>

                <div className="pt-2 border-t border-border-light">
                  <div className="flex justify-between text-ink-secondary mb-1">
                    <span>Category</span>
                    <span className="font-medium text-ink-primary">{result.parcel.category}</span>
                  </div>
                  <div className="flex justify-between text-ink-secondary mb-1">
                    <span>Weight</span>
                    <span className="font-medium text-ink-primary">{result.parcel.weightKg} kg</span>
                  </div>
                  <div className="flex justify-between text-ink-secondary mb-1">
                    <span>Created At</span>
                    <span className="font-medium text-ink-primary">
                      {formatDate(result.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Card */}
            <div className="bg-white rounded-xl border border-border-light shadow-2xs p-4">
              <p className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-3">
                Delivery Route
              </p>
              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-light">
                {/* Sender (Pickup) */}
                <div className="relative text-xs">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white" />
                  <p className="font-semibold text-ink-primary">{result.sender.locality}</p>
                  <p className="text-ink-secondary mt-0.5">{result.sender.address}</p>
                  <p className="text-ink-primary font-medium mt-0.5">{result.sender.name}</p>
                  <p className="text-ink-muted">{maskPhone(result.sender.phone)}</p>
                </div>
                {/* Recipient (Dropoff) */}
                <div className="relative text-xs">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-white" />
                  <p className="font-semibold text-ink-primary">{result.recipient.locality}</p>
                  <p className="text-ink-secondary mt-0.5">{result.recipient.address}</p>
                  <p className="text-ink-primary font-medium mt-0.5">{result.recipient.name}</p>
                  <p className="text-ink-muted">{maskPhone(result.recipient.phone)}</p>
                </div>
              </div>
            </div>

            {/* Courier & Payment */}
            <div className="bg-white rounded-xl border border-border-light shadow-2xs p-4 space-y-3 text-xs">
              <p className="font-semibold text-ink-primary uppercase tracking-wider text-[11px]">
                Courier & Payment
              </p>
              {result.assignedCourierName ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-ink-secondary">
                    <Truck className="w-3.5 h-3.5 text-brand-600" />
                    <span className="font-medium text-ink-primary">{result.assignedCourierName}</span>
                  </div>
                  <p className="text-ink-secondary pl-5">
                    {maskPhone(result.assignedCourierPhone ?? '')}
                  </p>
                  <p className="text-ink-secondary pl-5">{result.assignedCourierVehicle}</p>
                </div>
              ) : (
                <p className="text-amber-700 font-medium">No courier assigned yet.</p>
              )}
              <div className="pt-2 border-t border-border-light space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Delivery Fee</span>
                  <span className="font-semibold text-ink-primary">
                    {formatCurrency(result.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Payment</span>
                  <span
                    className={`font-medium ${
                      result.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {result.paymentStatus} · {result.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Tracking Timeline */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-border-light shadow-2xs p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-ink-primary">Delivery Timeline</p>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Complete chronological audit trail for this shipment
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {statusIcon(result.status)}
                  <span className="text-xs font-medium text-ink-primary capitalize">
                    {result.status.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Visual timeline */}
              <div className="relative">
                {result.timeline.map((event, idx) => {
                  const isLast = idx === result.timeline.length - 1;
                  const isDone = idx < result.timeline.length - 1;
                  const isFailed =
                    event.status === 'PICKUP_FAILED' || event.status === 'DELIVERY_FAILED';

                  return (
                    <div key={idx} className="flex gap-4 pb-5 last:pb-0 relative">
                      {/* Vertical connector */}
                      {!isLast && (
                        <div className="absolute left-[17px] top-7 bottom-0 w-0.5 bg-border-light" />
                      )}

                      {/* Status circle */}
                      <div
                        className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 relative z-10 border-2 ${
                          isLast && !isFailed
                            ? 'bg-brand-500 border-brand-500 text-white'
                            : isFailed
                            ? 'bg-rose-50 border-rose-400 text-rose-600'
                            : 'bg-white border-border-light text-ink-muted'
                        }`}
                        style={{ width: '34px', height: '34px' }}
                      >
                        {statusIcon(event.status)}
                      </div>

                      {/* Event content */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-xs font-semibold ${
                              isLast ? 'text-brand-700' : 'text-ink-primary'
                            }`}
                          >
                            {event.status.replace(/_/g, ' ')}
                          </p>
                          <span className="text-[11px] text-ink-muted shrink-0">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        {event.location && (
                          <p className="text-[11px] text-ink-secondary mt-0.5 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            {event.location}
                          </p>
                        )}
                        {event.note && (
                          <p className="text-[11px] text-ink-muted mt-0.5">{event.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Future "Expected Delivery" step if not yet delivered */}
                {result.status !== 'DELIVERED' &&
                  result.status !== 'CANCELLED' &&
                  result.status !== 'RETURNED_TO_SENDER' &&
                  result.status !== 'DELIVERY_FAILED' && (
                    <div className="flex gap-4 pt-1 border-t border-dashed border-border-light mt-3">
                      <div
                        className="w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 bg-surface-subtle border-2 border-dashed border-border-light text-ink-muted"
                        style={{ width: '34px', height: '34px' }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-xs font-medium text-ink-muted">
                          Delivered (Estimated)
                        </p>
                        <p className="text-[11px] text-ink-muted mt-0.5">
                          Pending — same-day delivery for local point-to-point
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Idle empty state */}
      {!result && !notFound && !isSearching && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-surface-subtle rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-ink-muted" />
          </div>
          <p className="text-sm font-medium text-ink-primary">Track Any Parcel</p>
          <p className="text-xs text-ink-secondary mt-1.5 max-w-sm mx-auto">
            Enter a GOSH-TRK tracking ID or PRC booking ID above to see the real-time delivery
            status, courier info, and full timeline.
          </p>
        </div>
      )}
    </div>
  );
};
