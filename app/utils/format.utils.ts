import { format, formatDistance } from 'date-fns';

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'SUI'): string {
  return `${price.toFixed(2)} ${currency}`;
}

/**
 * Format SUI balance with proper decimal precision
 * Fixes floating point precision errors (e.g., 2.8000000000000003 → 2.80)
 */
export function formatSuiBalance(balance: number | string | null | undefined): string {
  if (balance === null || balance === undefined) return '0.00';

  const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;

  if (isNaN(numBalance)) return '0.00';

  return numBalance.toFixed(2);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  return format(new Date(date), formatStr);
}

/**
 * Format date relative to now (e.g., "2 hours ago")
 */
export function formatDateRelative(date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

/**
 * Format wallet address (truncate middle)
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
}

/**
 * Format rating with stars
 */
export function formatRating(rating: number): string {
  const stars = Math.round(rating);
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return (value * 100).toFixed(decimals) + '%';
}
