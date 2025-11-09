import { sha256 } from 'js-sha256';
import { encode as base64Encode, decode as base64Decode } from 'js-base64';

/**
 * Generate X25519 keypair for encryption
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  // Using TweetNaCl for X25519 keypair generation
  const nacl = await import('tweetnacl');
  const keyPair = nacl.box.keyPair();

  return {
    publicKey: base64Encode(String.fromCharCode(...keyPair.publicKey)),
    privateKey: base64Encode(String.fromCharCode(...keyPair.secretKey)),
  };
}

/**
 * Compute SHA-256 hash of data
 */
export function computeHash(data: string | ArrayBuffer): string {
  if (typeof data === 'string') {
    return sha256(data);
  }
  // For ArrayBuffer, convert to string
  const view = new Uint8Array(data);
  return sha256(String.fromCharCode(...view));
}

/**
 * Compute SHA-256 hash of a file
 */
export async function computeFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const hash = computeHash(e.target?.result as ArrayBuffer);
        resolve(hash);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Encrypt data using AES-256-GCM with ephemeral key
 * Returns: { encryptedData, ephemeralKey, nonce, tag }
 */
export async function encryptData(
  data: ArrayBuffer,
  publicKey: string
): Promise<{
  encryptedData: string;
  encryptedEphemeralKey: string;
  nonce: string;
  tag: string;
}> {
  const nacl = await import('tweetnacl');
  const CryptoJS = await import('crypto-js');

  // Generate ephemeral keypair
  const ephemeralKeyPair = nacl.box.keyPair();
  const ephemeralPublicKey = ephemeralKeyPair.publicKey;
  const ephemeralPrivateKey = ephemeralKeyPair.secretKey;

  // Decode recipient's public key
  const recipientPublicKey = new Uint8Array(
    base64Decode(publicKey).split('').map((c) => c.charCodeAt(0))
  );

  // Generate shared secret using X25519
  const sharedSecret = nacl.box.before(recipientPublicKey, ephemeralPrivateKey);

  // Generate random nonce
  const nonce = nacl.randomBytes(24);

  // Encrypt data with shared secret
  const dataView = new Uint8Array(data);
  const encrypted = nacl.box.after(dataView, nonce, sharedSecret);

  // Extract tag (last 16 bytes of encrypted data in GCM mode)
  const tag = encrypted.slice(-16);
  const encryptedData = encrypted.slice(0, -16);

  return {
    encryptedData: base64Encode(String.fromCharCode(...encryptedData)),
    encryptedEphemeralKey: base64Encode(String.fromCharCode(...ephemeralPublicKey)),
    nonce: base64Encode(String.fromCharCode(...nonce)),
    tag: base64Encode(String.fromCharCode(...tag)),
  };
}

/**
 * Decrypt data using X25519 and AES-256-GCM
 */
export async function decryptData(
  encryptedData: string,
  encryptedEphemeralKey: string,
  nonce: string,
  tag: string,
  privateKey: string
): Promise<ArrayBuffer> {
  const nacl = await import('tweetnacl');

  // Decode all inputs
  const encryptedDataBytes = new Uint8Array(
    base64Decode(encryptedData).split('').map((c) => c.charCodeAt(0))
  );
  const ephemeralPublicKey = new Uint8Array(
    base64Decode(encryptedEphemeralKey).split('').map((c) => c.charCodeAt(0))
  );
  const nonceBytes = new Uint8Array(base64Decode(nonce).split('').map((c) => c.charCodeAt(0)));
  const tagBytes = new Uint8Array(base64Decode(tag).split('').map((c) => c.charCodeAt(0)));
  const privateKeyBytes = new Uint8Array(
    base64Decode(privateKey).split('').map((c) => c.charCodeAt(0))
  );

  // Generate shared secret
  const sharedSecret = nacl.box.before(ephemeralPublicKey, privateKeyBytes);

  // Combine encrypted data with tag
  const ciphertext = new Uint8Array([...encryptedDataBytes, ...tagBytes]);

  // Decrypt
  const decrypted = nacl.box.open.after(ciphertext, nonceBytes, sharedSecret);

  if (!decrypted) {
    throw new Error('Decryption failed: authentication tag verification failed');
  }

  return decrypted.buffer;
}

/**
 * Verify file hash
 */
export function verifyHash(data: ArrayBuffer, expectedHash: string): boolean {
  const computedHash = computeHash(data);
  return computedHash === expectedHash;
}

/**
 * Generate random bytes
 */
export async function generateRandomBytes(length: number): Promise<Uint8Array> {
  const nacl = await import('tweetnacl');
  return nacl.randomBytes(length);
}
