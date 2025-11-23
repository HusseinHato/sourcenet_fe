
import nacl from 'tweetnacl';
import { decode as decodeBase64 } from '@stablelib/base64';

export async function decryptFile(
    encryptedFileBuffer: ArrayBuffer,
    metadataJson: string,
    buyerPrivateKeyB64: string
) {
    const metadata = JSON.parse(metadataJson);

    // --- Step 1: Decrypt the Ephemeral AES Key ---
    // The 'encryptedEphemeralKey' field contains: [EphemeralPublicKey (32)] + [EncryptedAESKey] + [Nonce (24)]
    const combinedBuffer = decodeBase64(metadata.encryptedEphemeralKey);

    const ephemeralPublicKey = combinedBuffer.slice(0, 32);
    const encryptedAesKey = combinedBuffer.slice(32, -24);
    const nonce = combinedBuffer.slice(-24);
    const buyerPrivateKey = decodeBase64(buyerPrivateKeyB64);
    // Use tweetnacl to open the box
    const aesKey = nacl.box.open(
        encryptedAesKey,
        nonce,
        ephemeralPublicKey,
        buyerPrivateKey
    );
    if (!aesKey) throw new Error('Failed to decrypt AES key');
    // --- Step 2: Decrypt the File Content (AES-256-GCM) ---
    // Use Web Crypto API for performance
    const key = await window.crypto.subtle.importKey(
        "raw",
        aesKey as unknown as BufferSource, // Cast to satisfy TS
        "AES-GCM",
        true,
        ["decrypt"]
    );
    const iv = decodeBase64(metadata.nonce); // 12 bytes
    const tag = decodeBase64(metadata.tag); // 16 bytes
    const ciphertext = new Uint8Array(encryptedFileBuffer);

    // Web Crypto API expects Tag appended to Ciphertext
    const encryptedDataWithTag = new Uint8Array(ciphertext.length + tag.length);
    encryptedDataWithTag.set(ciphertext);
    encryptedDataWithTag.set(tag, ciphertext.length);
    const decryptedContent = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv as unknown as BufferSource,
        },
        key,
        encryptedDataWithTag as unknown as BufferSource
    );
    return decryptedContent;
}
