/**
 * ZKLogin utility functions for managing user salt and address derivation
 */

const ZKLOGIN_SALT_KEY = 'zklogin_user_salt';

/**
 * Get or create user salt from localStorage
 * User salt is used to derive the Sui address from JWT
 * It should be persistent across sessions for the same user
 * @returns User salt as a number (BigInt-compatible)
 */
export function getUserSalt(): string {
  let salt = localStorage.getItem(ZKLOGIN_SALT_KEY);
  
  // Validate salt format - must be a valid decimal string
  if (salt && !isValidDecimalString(salt)) {
    console.warn('Invalid user salt format detected, regenerating...', salt);
    salt = null;
  }
  
  if (!salt) {
    // Generate a new random salt if not exists or invalid
    salt = generateRandomSalt();
    localStorage.setItem(ZKLOGIN_SALT_KEY, salt);
    console.log('Generated new user salt');
  }
  
  return salt;
}

/**
 * Check if a string is a valid decimal number
 * @param value String to validate
 * @returns true if valid decimal string
 */
function isValidDecimalString(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  // Check if it's a valid decimal number (no hex characters like a-f at the start)
  try {
    // Try to convert to BigInt - if it fails, it's invalid
    BigInt(value);
    // Also check it doesn't look like hex (contains a-f characters)
    return !/^[0-9a-f]+$/.test(value) || /^[0-9]+$/.test(value);
  } catch {
    return false;
  }
}

/**
 * Generate a random salt for ZKLogin
 * User salt must be a string representation of a number (for BigInt conversion)
 * @returns Random salt as string number
 */
function generateRandomSalt(): string {
  // Generate a random 16-byte value and convert to decimal string
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Convert bytes to BigInt, then to string
  let bigIntValue = BigInt(0);
  for (let i = 0; i < array.length; i++) {
    bigIntValue = (bigIntValue << BigInt(8)) | BigInt(array[i]);
  }
  
  return bigIntValue.toString();
}

/**
 * Clear user salt from localStorage
 * Call this when user logs out
 */
export function clearUserSalt(): void {
  localStorage.removeItem(ZKLOGIN_SALT_KEY);
}
