/**
 * Shared Indian quick-commerce formatting utilities
 * Currency: INR (₹), Timezone: Asia/Kolkata
 */

export const formatCurrency = (amount: number, showDecimals = false): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (
  dateInput: string | number | Date,
  includeTime = true
): string => {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(date.getTime())) return 'Invalid date';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }
      : {}),
  };

  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

export const formatTimeOnly = (dateInput: string | number | Date): string => {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(date.getTime())) return '--:--';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const formatRelativeTime = (dateInput: string | number | Date): string => {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return formatDate(date, false);
};

export const formatQuantity = (qty: number, unit?: string): string => {
  const formattedNumber = new Intl.NumberFormat('en-IN').format(qty);
  return unit ? `${formattedNumber} ${unit}` : formattedNumber;
};

export const formatPercentage = (val: number): string => {
  return `${Math.round(val)}%`;
};

export const maskPhone = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length < 10) return phone;
  // Format as +91 98*** **421
  const last3 = cleaned.slice(-3);
  const first2 = cleaned.slice(-10, -8);
  return `+91 ${first2}*** **${last3}`;
};

export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  const maskedLocal = `${local[0]}***${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
};
