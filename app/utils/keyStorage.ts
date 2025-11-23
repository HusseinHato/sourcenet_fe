/**
 * Utility functions for managing private key storage in localStorage
 * Keys are stored with format: sk_{purchaseId}
 */

const KEY_PREFIX = 'sk_';

/**
 * Save a private key to localStorage
 */
export function savePrivateKey(purchaseId: string, privateKey: string): void {
    try {
        localStorage.setItem(`${KEY_PREFIX}${purchaseId}`, privateKey);
    } catch (error) {
        console.error('Failed to save private key to localStorage:', error);
    }
}

/**
 * Retrieve a private key from localStorage
 */
export function getPrivateKey(purchaseId: string): string | null {
    try {
        return localStorage.getItem(`${KEY_PREFIX}${purchaseId}`);
    } catch (error) {
        console.error('Failed to retrieve private key from localStorage:', error);
        return null;
    }
}

/**
 * Remove a private key from localStorage
 */
export function removePrivateKey(purchaseId: string): void {
    try {
        localStorage.removeItem(`${KEY_PREFIX}${purchaseId}`);
    } catch (error) {
        console.error('Failed to remove private key from localStorage:', error);
    }
}

/**
 * Check if a private key exists in localStorage
 */
export function hasPrivateKey(purchaseId: string): boolean {
    try {
        return localStorage.getItem(`${KEY_PREFIX}${purchaseId}`) !== null;
    } catch (error) {
        console.error('Failed to check private key in localStorage:', error);
        return false;
    }
}
