import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../utils/api.client';
import { Loader2, AlertCircle, Check, Wallet } from 'lucide-react';
import { useZKLogin } from '../../hooks/useZKLogin';

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    datapod: {
        id: string;
        title: string;
        price_sui: number;
        seller_name: string;
    };
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, onSuccess, datapod }) => {
    const { executeTransaction, isLoading: isTxLoading, address } = useZKLogin();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

    const handlePurchase = async () => {
        setIsProcessing(true);
        setError('');
        setStep('processing');

        try {
            if (!address) {
                throw new Error('Wallet not connected. Please login first.');
            }

            // 1. Execute SUI Transaction
            // Sponsor address provided by user
            const sponsorAddress = '0xfd772cf73b7234594c34edf10650fcd71040e90566ce63b53c7434ac79c4461a';

            await executeTransaction(sponsorAddress, datapod.price_sui, async (digest) => {
                // 2. Notify Backend on Success
                try {
                    await api.createPurchase({
                        datapod_id: datapod.id,
                        buyer_address: address,
                        buyer_public_key: address, // Using address as public key for now as it's required by API
                    });

                    setStep('success');
                    setTimeout(() => {
                        onSuccess();
                        onClose();
                        setStep('confirm');
                    }, 2000);
                } catch (apiErr: any) {
                    console.error('Backend notification failed:', apiErr);
                    // Transaction succeeded but backend update failed
                    // We should probably show a specific error or handle this case
                    setError('Payment successful but failed to update order status. Please contact support.');
                    setStep('confirm');
                }
            });

        } catch (err: any) {
            console.error('Purchase failed:', err);
            setError(err.message || 'Transaction failed. Please try again.');
            setStep('confirm');
        } finally {
            setIsProcessing(false);
        }
    };

    const isLoading = isProcessing || isTxLoading;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Purchase" size="md">
            {step === 'confirm' && (
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Item Details</h4>
                        <p className="text-lg font-semibold text-gray-900">{datapod.title}</p>
                        <p className="text-sm text-gray-600">Sold by {datapod.seller_name}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <span className="text-base font-medium text-gray-900">Total Price</span>
                        <span className="text-2xl font-bold text-gray-900">{datapod.price_sui} SUI</span>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Purchase failed</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#474747]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handlePurchase}
                            disabled={isLoading || !address}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-[#474747] border border-transparent rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#474747] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Confirm Payment
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {step === 'processing' && (
                <div className="text-center py-8">
                    <Loader2 className="animate-spin mx-auto h-12 w-12 text-[#474747] mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Processing Transaction</h3>
                    <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your purchase on the blockchain...</p>
                </div>
            )}

            {step === 'success' && (
                <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Purchase Successful!</h3>
                    <p className="text-sm text-gray-500 mt-2">You can now download this data pod from your dashboard.</p>
                </div>
            )}
        </Modal>
    );
};
