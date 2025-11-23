'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { apiClient } from '../../utils/api.client';
import { Download, AlertCircle, Loader2, FileText, Lock } from 'lucide-react';
import { decryptFile } from '../../utils/encryption';

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
            <div className="space-y-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    {isDecrypting ? (
                        <Lock className="h-6 w-6 text-blue-600 animate-pulse" />
                    ) : (
                        <FileText className="h-6 w-6 text-blue-600" />
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-medium text-gray-900">{purchaseTitle}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {isDownloading && 'Downloading encrypted file...'}
                        {isDecrypting && 'Decrypting your data securely...'}
                        {!isDownloading && !isDecrypting && !error && !showKeyInput && 'Your file is ready to be securely downloaded.'}
                        {showKeyInput && !isDownloading && !isDecrypting && 'Please enter your decryption key to proceed.'}
                    </p>
                </div>

                {showKeyInput && (
                    <div className="text-left">
                        <label htmlFor="manualKey" className="block text-sm font-medium text-gray-700">
                            Decryption Key
                        </label>
                        <div className="mt-1">
                            <textarea
                                id="manualKey"
                                rows={3}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                placeholder="Paste your private key here..."
                                value={manualKey}
                                onChange={(e) => setManualKey(e.target.value)}
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            This key was provided to you when you purchased the Data Pod.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="rounded-md bg-red-50 p-4 text-left">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-5 sm:mt-6">
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isDownloading || isDecrypting}
                        className={`w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:text-sm ${isDownloading || isDecrypting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#474747] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#474747]'
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
                    </button>

                    {!isDownloading && !isDecrypting && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#474747] sm:text-sm"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};
