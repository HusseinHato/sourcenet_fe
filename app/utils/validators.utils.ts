/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate price (must be positive number)
 */
export function validatePrice(price: number | string): boolean {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && num > 0;
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(sizeInBytes: number, maxSizeInMB: number = 100): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes;
}

/**
 * Validate wallet address format
 */
export function validateAddress(address: string): boolean {
  // Sui addresses are typically 64 hex characters or 0x prefixed
  const addressRegex = /^(0x)?[0-9a-fA-F]{64}$/;
  return addressRegex.test(address);
}

/**
 * Validate title (non-empty, reasonable length)
 */
export function validateTitle(title: string, minLength: number = 3, maxLength: number = 200): boolean {
  return title.length >= minLength && title.length <= maxLength;
}

/**
 * Validate description
 */
export function validateDescription(description: string, minLength: number = 10, maxLength: number = 5000): boolean {
  return description.length >= minLength && description.length <= maxLength;
}

/**
 * Validate category
 */
export function validateCategory(category: string, validCategories: string[]): boolean {
  return validCategories.includes(category);
}

/**
 * Validate rating (1-5)
 */
export function validateRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

/**
 * Validate review comment
 */
export function validateReviewComment(comment: string, minLength: number = 5, maxLength: number = 1000): boolean {
  return comment.length >= minLength && comment.length <= maxLength;
}

/**
 * Validate hash format (SHA-256 hex string)
 */
export function validateHash(hash: string): boolean {
  // SHA-256 produces 64 hex characters
  const hashRegex = /^[0-9a-fA-F]{64}$/;
  return hashRegex.test(hash);
}
