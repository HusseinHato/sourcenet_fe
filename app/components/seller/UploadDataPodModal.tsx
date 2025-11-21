'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../utils/api.client';
import { Upload, Check, AlertCircle, Loader2 } from 'lucide-react';

interface UploadDataPodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const UploadDataPodModal: React.FC<UploadDataPodModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'publishing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title || !category || !price) {
            setErrorMessage('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setStatus('uploading');

        try {
            // Step 1: Upload
            const uploadResponse = await api.uploadData(file, {
                title,
                description,
                category,
                price_sui: parseFloat(price),
            });

            const uploadId = uploadResponse.data.upload_id; // Adjust based on actual response structure

            // Step 2: Publish
            setStatus('publishing');
            await api.publishDataPod(uploadId);

            setStatus('success');
            setTimeout(() => {
                onSuccess();
                onClose();
                resetForm();
            }, 2000);
        } catch (error: any) {
            console.error('Upload failed:', error);
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Failed to upload and publish data pod');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setTitle('');
        setDescription('');
        setCategory('');
        setPrice('');
        setStatus('idle');
        setErrorMessage('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload New Data Pod" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data File</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                            {file ? (
                                <div className="flex items-center justify-center gap-2 text-green-600">
                                    <Check size={24} />
                                    <span className="text-sm font-medium">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="text-xs text-red-500 hover:text-red-700 ml-2"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-[#474747] hover:text-opacity-80 focus-within:outline-none"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">CSV, JSON, or Parquet up to 50MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Metadata Inputs */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#474747] focus:ring-[#474747] sm:text-sm p-2 border"
                            placeholder="e.g., E-commerce Transaction Data 2024"
                            required
                        />
                    </div>

                    <div className="col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#474747] focus:ring-[#474747] sm:text-sm p-2 border"
                            placeholder="Describe the contents and potential use cases..."
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#474747] focus:ring-[#474747] sm:text-sm p-2 border"
                            required
                        >
                            <option value="">Select a category</option>
                            <option value="AI/ML">AI/ML</option>
                            <option value="Finance">Finance</option>
                            <option value="E-commerce">E-commerce</option>
                            <option value="Social">Social Media</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Price (SUI)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                id="price"
                                min="0"
                                step="0.1"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="block w-full pl-7 rounded-md border-gray-300 focus:border-[#474747] focus:ring-[#474747] sm:text-sm p-2 border"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                {status === 'error' && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Upload failed</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{errorMessage}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>Your data pod has been uploaded and published.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                        type="submit"
                        disabled={isLoading || status === 'success'}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${isLoading || status === 'success'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#474747] hover:opacity-90 focus:ring-[#474747]'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                {status === 'uploading' ? 'Uploading...' : 'Publishing...'}
                            </>
                        ) : status === 'success' ? (
                            'Published'
                        ) : (
                            'Upload & Publish'
                        )}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#474747] sm:mt-0 sm:col-start-1 sm:text-sm"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};
