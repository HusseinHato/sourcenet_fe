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
        datapodId: string;
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
    const [privateKey, setPrivateKey] = useState<string | null>(null);

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
                    const response = await api.createPurchase({
                        datapod_id: datapod.datapodId,
                        payment_tx_digest: digest,
                    });

                    if (response.data && response.data.private_key) {
                        setPrivateKey(response.data.private_key);
                    }

                    setStep('success');
                    // Do not auto-close, user needs to see the private key
                } catch (apiErr: any) {
                    console.error('Backend notification failed:', apiErr);
                    // Transaction succeeded but backend update failed
                    setError('Payment successful but failed to update order status. Please contact support.');
                    setStep('confirm');
                }
            });
        } catch (err: any) {
            console.error('Purchase failed:', err);
            setError(err.message || 'Failed to complete purchase');
            setStep('confirm');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Purchase">
            <div className="space-y-6">
                {step === 'confirm' && (
                    <>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Item</span>
                                <span className="font-medium text-gray-900">{datapod.title}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Price</span>
                                <span className="font-medium text-gray-900">{datapod.price_sui} SUI</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Seller</span>
                                <span className="font-medium text-gray-900">{datapod.seller_name}</span>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePurchase}
                                disabled={isProcessing || isTxLoading}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing || isTxLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="h-4 w-4" />
                                        Confirm Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}

                {step === 'processing' && (
                    <div className="text-center py-8 space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Processing Transaction</h3>
                            <p className="text-sm text-gray-500 mt-1">Please wait while we confirm your payment...</p>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center py-8 space-y-6">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Purchase Successful!</h3>
                            <p className="text-sm text-gray-500 mt-1">Your datapod is now available.</p>
                        </div>

                        {privateKey && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                                <h4 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    IMPORTANT: Save this Key
                                </h4>
                                <p className="text-xs text-yellow-700 mb-3">
                                    This private key is required to decrypt and access your datapod. We do not store this key. If you lose it, you lose access to the data.
                                </p>
                                <div className="bg-white border border-yellow-200 rounded p-2 font-mono text-xs break-all text-gray-800 select-all">
                                    {privateKey}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                onSuccess();
                                onClose();
                            }}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
