'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../utils/api.client';
import { Download, Check, AlertCircle, Loader2, FileText } from 'lucide-react';

interface DownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchaseId: string;
    purchaseTitle: string;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, purchaseId, purchaseTitle }) => {
    const [status, setStatus] = useState<'idle' | 'fetching' | 'ready' | 'error'>('idle');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen && purchaseId) {
            fetchDownloadUrl();
        } else {
            resetState();
        }
    }, [isOpen, purchaseId]);

    const fetchDownloadUrl = async () => {
        setStatus('fetching');
        try {
            const response = await api.getDownloadUrl(purchaseId);
            // Assuming response.data.url contains the signed URL or direct download link
            // Adjust based on actual API response
            const url = response.data.url || response.data.downloadUrl;
            setDownloadUrl(url);
            setStatus('ready');
        } catch (error: any) {
            console.error('Failed to get download URL:', error);
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Failed to generate download link');
        }
    };

    const handleDownload = () => {
        if (downloadUrl) {
            window.open(downloadUrl, '_blank');
            onClose();
        }
    };

    const resetState = () => {
        setStatus('idle');
        setDownloadUrl(null);
        setErrorMessage('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Download Data Pod" size="md">
            <div className="space-y-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                </div>

                <div>
                    <h3 className="text-lg font-medium text-gray-900">{purchaseTitle}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {status === 'fetching' && 'Preparing your download...'}
                        {status === 'ready' && 'Your file is ready to download.'}
                        {status === 'error' && 'There was an issue preparing your download.'}
                    </p>
                </div>

                {status === 'fetching' && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-[#474747]" size={32} />
                    </div>
                )}

                {status === 'error' && (
                    <div className="rounded-md bg-red-50 p-4 text-left">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{errorMessage}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-5 sm:mt-6">
                    {status === 'ready' ? (
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#474747] text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#474747] sm:text-sm"
                        >
                            <Download className="mr-2 h-5 w-5" />
                            Download Now
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#474747] sm:text-sm"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};
