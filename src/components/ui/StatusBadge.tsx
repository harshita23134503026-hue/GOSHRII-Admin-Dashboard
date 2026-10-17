import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      // Stock Statuses
      case 'IN_STOCK':
        return { label: 'In Stock', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'LOW_STOCK':
        return { label: 'Low Stock', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'OUT_OF_STOCK':
        return { label: 'Out of Stock', bg: 'bg-red-50 text-red-700 border-red-200' };

      // Grocery Order Statuses
      case 'PLACED':
        return { label: 'Placed', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'CONFIRMED':
        return { label: 'Confirmed', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'PICKING':
        return { label: 'Picking', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'PACKED':
        return { label: 'Packed', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Out for Delivery', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'DELIVERED':
        return { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'CANCELLED':
        return { label: 'Cancelled', bg: 'bg-slate-100 text-slate-600 border-slate-200' };

      // Ride Booking Statuses
      case 'REQUESTED':
        return { label: 'Requested', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'SEARCHING_DRIVER':
        return { label: 'Searching Driver', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'DRIVER_ASSIGNED':
        return { label: 'Driver Assigned', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'DRIVER_ARRIVING':
        return { label: 'Driver Arriving', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'RIDE_STARTED':
        return { label: 'Ongoing Trip', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'RIDE_COMPLETED':
        return { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

      // Parcel Delivery Statuses
      case 'CREATED':
        return { label: 'Booking Created', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'COURIER_ASSIGNED':
        return { label: 'Courier Assigned', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'PICKUP_IN_PROGRESS':
        return { label: 'Pickup in Progress', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'PICKED_UP':
        return { label: 'Parcel Picked Up', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'IN_TRANSIT':
        return { label: 'In Transit', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'PICKUP_FAILED':
        return { label: 'Pickup Failed', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'DELIVERY_FAILED':
        return { label: 'Delivery Failed', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'RETURN_REQUESTED':
        return { label: 'Return Requested', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'RETURNING_TO_SENDER':
        return { label: 'Returning to Sender', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'RETURNED_TO_SENDER':
        return { label: 'Returned to Sender', bg: 'bg-slate-100 text-slate-700 border-slate-300' };

      // Payment Statuses
      case 'PAID':
        return { label: 'Paid', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PENDING':
        return { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'FAILED':
        return { label: 'Failed', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'REFUNDED':
        return { label: 'Refunded', bg: 'bg-purple-50 text-purple-700 border-purple-200' };

      // Partner / Driver Availability Statuses
      case 'AVAILABLE':
        return { label: 'Available', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'ON_DELIVERY':
      case 'ON_TRIP':
      case 'BUSY':
        return { label: 'On Trip / Busy', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'OFFLINE':
        return { label: 'Offline', bg: 'bg-slate-100 text-slate-500 border-slate-200' };

      // Visibility / General Statuses
      case 'ACTIVE':
        return { label: 'Active', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'HIDDEN':
        return { label: 'Hidden', bg: 'bg-slate-100 text-slate-500 border-slate-200' };
      case 'ARCHIVED':
        return { label: 'Archived', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'SCHEDULED':
        return { label: 'Scheduled', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'EXPIRED':
        return { label: 'Expired', bg: 'bg-slate-100 text-slate-500 border-slate-200' };
      case 'DISABLED':
        return { label: 'Disabled', bg: 'bg-slate-100 text-slate-400 border-slate-200' };

      default:
        return { label: status.replace(/_/g, ' '), bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  const { label, bg } = getBadgeConfig();
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide whitespace-nowrap ${bg} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 bg-current opacity-70" />
      {label}
    </span>
  );
};
