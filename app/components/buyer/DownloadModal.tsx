'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { apiClient } from '../../utils/api.client';
import { Download, AlertCircle, Loader2, FileText, Lock } from 'lucide-react';
import { decryptFile } from '../../utils/encryption';
import { motion, AnimatePresence } from 'framer-motion';

interface DownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchaseId: string;
    purchaseTitle: string;
    fileName?: string;
}

// Helper function to determine file extension
function getFileExtension(mimeType: string, originalName: string): string {
    // Try to get extension from original filename
    const match = originalName.match(/\.([^.]+)$/);
    if (match) return match[1];

    // Fallback to MIME type mapping
    const mimeMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'application/pdf': 'pdf',
        'application/json': 'json',
        'text/plain': 'txt',
        'text/csv': 'csv',
        'application/zip': 'zip',
        'application/x-zip-compressed': 'zip',
    };

    return mimeMap[mimeType] || 'bin';
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
    isOpen,
    onClose,
    purchaseId,
    purchaseTitle,
    fileName
}) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [manualKey, setManualKey] = useState('');

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            setError(null);

            // 1. Retrieve Private Key
            let storedKey = localStorage.getItem(`sk_${purchaseId}`);

            // If not in local storage and not manually provided, ask for it
            if (!storedKey) {
                if (!manualKey) {
                    setShowKeyInput(true);
                    setIsDownloading(false);
                    // Don't set error yet, just show the input
                    return;
                }
                storedKey = manualKey;
            }

            // 2. Get Download URL & Metadata
            const urlRes = await apiClient.get(`/buyer/purchase/${purchaseId}/download-url`);
            let { proxy_url, decryption_key, file_metadata } = urlRes.data.data;

            console.log('=== DEBUG: Download Info ===');
            console.log('Proxy URL:', proxy_url);
            console.log('Decryption Key (metadata):', decryption_key);
            console.log('File Metadata:', file_metadata);

            // Convert absolute localhost URLs to relative URLs to avoid CORS
            // Remove the full base URL (http://localhost:3001/api) to get just the endpoint path
            if (proxy_url.includes('localhost:3001')) {
                proxy_url = proxy_url.replace(/http:\/\/localhost:3001\/api/, '');
            }

            // 3. Fetch Encrypted Blob
            const blobRes = await apiClient.get(proxy_url, {
                responseType: 'arraybuffer',
            });
            const encryptedArrayBuffer = blobRes.data;

            console.log('Encrypted file size:', encryptedArrayBuffer.byteLength, 'bytes');

            setIsDownloading(false);
            setIsDecrypting(true);

            // 4. Decrypt Data
            console.log('Starting decryption...');
            const decryptedBuffer = await decryptFile(
                encryptedArrayBuffer,
                decryption_key,
                storedKey
            );

            console.log('Decrypted file size:', decryptedBuffer.byteLength, 'bytes');

            // 5. Determine file extension from metadata
            const extension = getFileExtension(
                file_metadata?.mimeType || 'application/octet-stream',
                file_metadata?.originalName || 'download'
            );

            // 6. Trigger Browser Download with correct MIME type
            const blob = new Blob([decryptedBuffer], {
                type: file_metadata?.mimeType || 'application/octet-stream'
            });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `${file_metadata?.title || fileName || 'datapod'}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            setIsDecrypting(false);
            onClose();

        } catch (err: unknown) {
            console.error('Download failed:', err);
            setIsDownloading(false);
            setIsDecrypting(false);
            const errorMessage = err instanceof Error ? err.message : "Download failed. Please try again.";
            setError(errorMessage);
        }
    };

    const resetState = () => {
        setIsDownloading(false);
        setIsDecrypting(false);
        setError(null);
        setShowKeyInput(false);
        setManualKey('');
    };

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            resetState();
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Download Data Pod" size="md">
            <div className="space-y-6">
                {/* Icon Section */}
                <div className="flex justify-center">
                    <motion.div
                        className="flex items-center justify-center h-16 w-16 rounded-full bg-[#F5F5F5] border border-[#E5E5E5]"
                        animate={isDecrypting ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1, repeat: isDecrypting ? Infinity : 0 }}
                    >
                        <AnimatePresence mode="wait">
                            {isDecrypting ? (
                                <motion.div
                                    key="lock"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                >
                                    <Lock className="h-7 w-7 text-[#353535]" />
                                </motion.div>
                            ) : isDownloading ? (
                                <motion.div
                                    key="loader"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1, rotate: 360 }}
                                    exit={{ scale: 0 }}
                                    transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
                                >
                                    <Loader2 className="h-7 w-7 text-[#353535]" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="file"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <FileText className="h-7 w-7 text-[#353535]" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Title & Status */}
                <div className="text-center">
                    <h3 className="text-lg font-bold text-[#353535]">{purchaseTitle}</h3>
                    <motion.p
                        key={isDownloading ? 'downloading' : isDecrypting ? 'decrypting' : 'ready'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-[#919191] mt-2"
                    >
                        {isDownloading && 'Downloading encrypted file...'}
                        {isDecrypting && 'Decrypting your data securely...'}
                        {!isDownloading && !isDecrypting && !error && !showKeyInput && 'Your file is ready to be securely downloaded.'}
                        {showKeyInput && !isDownloading && !isDecrypting && 'Please enter your decryption key to proceed.'}
                    </motion.p>
                </div>

                {/* Manual Key Input */}
                <AnimatePresence>
                    {showKeyInput && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-2">
                                <label htmlFor="manualKey" className="block text-sm font-bold text-[#353535]">
                                    Decryption Key
                                </label>
                                <textarea
                                    id="manualKey"
                                    rows={3}
                                    className="w-full px-4 py-3 text-sm border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#353535] focus:border-transparent bg-[#F5F5F5] text-[#353535] placeholder-[#919191] transition-all"
                                    placeholder="Paste your private key here..."
                                    value={manualKey}
                                    onChange={(e) => setManualKey(e.target.value)}
                                />
                                <p className="text-xs text-[#919191] flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    This key was provided when you purchased the Data Pod.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-xl bg-red-50 border border-red-200 p-4"
                        >
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-bold text-red-800">Error</h3>
                                    <p className="mt-1 text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <motion.button
                        type="button"
                        onClick={handleDownload}
                        disabled={isDownloading || isDecrypting}
                        whileHover={!isDownloading && !isDecrypting ? { scale: 1.02 } : {}}
                        whileTap={!isDownloading && !isDecrypting ? { scale: 0.98 } : {}}
                        className={`w-full inline-flex justify-center items-center rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all ${isDownloading || isDecrypting
                                ? 'bg-[#919191] cursor-not-allowed'
                                : 'bg-[#353535] hover:bg-[#2a2a2a]'
                            }`}
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                Downloading...
                            </>
                        ) : isDecrypting ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                Decrypting...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-5 w-5" />
                                {showKeyInput ? 'Decrypt & Download' : 'Download Now'}
                            </>
                        )}
                    </motion.button>

                    {!isDownloading && !isDecrypting && (
                        <motion.button
                            type="button"
                            onClick={onClose}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full inline-flex justify-center rounded-xl border border-[#E5E5E5] px-6 py-3 bg-white text-sm font-medium text-[#474747] hover:bg-[#F5F5F5] transition-all"
                        >
                            Cancel
                        </motion.button>
                    )}
                </div>
            </div>
        </Modal>
    );
};
