import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '../common/Modal';
import { api } from '../../utils/api.client';
import { Loader2, AlertCircle, Check, Wallet, Copy } from 'lucide-react';
import { useZKLogin } from '../../hooks/useZKLogin';
import { savePrivateKey } from '../../utils/keyStorage';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { motion } from 'framer-motion';

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
    const router = useRouter();
    const { executeTransaction: executeZkTransaction, isLoading: isZkLoading, address: zkAddress } = useZKLogin();
    const currentAccount = useCurrentAccount();
    const { mutate: signAndExecuteTransaction, isPending: isWeb3Loading } = useSignAndExecuteTransaction();

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [purchaseRequestId, setPurchaseRequestId] = useState<string | null>(null);
    const [keyCopied, setKeyCopied] = useState(false);

    const handlePurchase = async () => {
        setIsProcessing(true);
        setError('');
        setStep('processing');

        try {
            // Sponsor address provided by user
            const sponsorAddress = '0xfd772cf73b7234594c34edf10650fcd71040e90566ce63b53c7434ac79c4461a';

            const handleSuccess = async (digest: string) => {
                // 2. Notify Backend on Success
                try {
                    const response = await api.createPurchase({
                        datapod_id: datapod.datapodId,
                        payment_tx_digest: digest,
                    });

                    if (response.data && response.data.private_key) {
                        const privateKeyValue = response.data.private_key;
                        const purchaseId = response.data.purchase_request_id || response.data.id;

                        setPrivateKey(privateKeyValue);
                        setPurchaseRequestId(purchaseId);

                        // Auto-save private key to localStorage
                        if (purchaseId) {
                            savePrivateKey(purchaseId, privateKeyValue);
                            console.log('Private key auto-saved to localStorage for purchase:', purchaseId);
                        }
                    }

                    setStep('success');
                } catch (apiErr: any) {
                    console.error('Backend notification failed:', apiErr);
                    setError('Payment successful but failed to update order status. Please contact support.');
                    setStep('confirm');
                }
            };

            if (currentAccount) {
                // --- Web3 Wallet Flow ---
                const tx = new Transaction();
                const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(Number(datapod.price_sui) * 1_000_000_000)]);
                tx.transferObjects([coin], tx.pure.address(sponsorAddress));

                signAndExecuteTransaction(
                    {
                        transaction: tx as any,
                    },
                    {
                        onSuccess: (result) => handleSuccess(result.digest),
                        onError: (err) => {
                            console.error('Web3 Purchase failed:', err);
                            setError(err.message || 'Failed to complete purchase with wallet');
                            setStep('confirm');
                        },
                    }
                );
            } else if (zkAddress) {
                // --- ZK Login Flow ---
                await executeZkTransaction(sponsorAddress, datapod.price_sui, handleSuccess);
            } else {
                throw new Error('Wallet not connected. Please login first.');
            }
        } catch (err: any) {
            console.error('Purchase failed:', err);
            setError(err.message || 'Failed to complete purchase');
            setStep('confirm');
        } finally {
            // Only stop processing if we are not waiting for the Web3 mutation callback
            // For ZK login, executeZkTransaction awaits, so we can stop here.
            // For Web3, signAndExecuteTransaction is async but the callback handles the next steps.
            // We'll let the callbacks manage the state or rely on isWeb3Loading if needed, 
            // but since we setStep('processing'), we should be careful.
            // Actually, for Web3, signAndExecuteTransaction returns immediately (void), so we shouldn't set isProcessing to false immediately if we want to show the spinner.
            // However, isWeb3Loading from the hook will be true.
            if (!currentAccount) {
                setIsProcessing(false);
            }
        }
    };

    const handleCopyKey = () => {
        if (privateKey) {
            navigator.clipboard.writeText(privateKey);
            setKeyCopied(true);
            setTimeout(() => setKeyCopied(false), 2000);
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
                            <motion.button
                                onClick={handlePurchase}
                                disabled={isProcessing || isZkLoading || isWeb3Loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#353535] rounded-lg hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md transition-all"
                            >
                                {isProcessing || isZkLoading || isWeb3Loading ? (
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
                            </motion.button>
                        </div>
                    </>
                )}

                {step === 'processing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 space-y-4"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            <Loader2 className="h-12 w-12 text-[#353535] mx-auto" />
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-bold text-[#353535]">Processing Transaction</h3>
                            <p className="text-sm text-[#919191] mt-1">Please wait while we confirm your payment...</p>
                        </div>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8 space-y-6"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            className="h-16 w-16 bg-[#353535] rounded-full flex items-center justify-center mx-auto shadow-lg"
                        >
                            <Check className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-bold text-[#353535]">Purchase Successful!</h3>
                            <p className="text-sm text-[#919191] mt-2">Your datapod is now available for download.</p>
                        </div>

                        {privateKey && (
                            <div className="bg-[#F5F5F5] border border-[#CECECE] rounded-xl p-5 text-left space-y-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-[#353535] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-[#353535] mb-1">
                                            Private Key Auto-Saved
                                        </h4>
                                        <p className="text-xs text-[#919191] leading-relaxed">
                                            Your decryption key has been automatically saved. You can download your datapod immediately without entering the key manually.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="bg-white border border-[#E5E5E5] rounded-lg p-3 font-mono text-xs break-all text-[#353535] select-all pr-12">
                                        {privateKey}
                                    </div>
                                    <motion.button
                                        onClick={handleCopyKey}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="absolute right-2 top-2 p-2 rounded-lg bg-[#F5F5F5] hover:bg-[#EAEAEA] transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {keyCopied ? (
                                            <Check className="h-4 w-4 text-[#353535]" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-[#919191]" />
                                        )}
                                    </motion.button>
                                </div>

                                <p className="text-xs text-[#919191] italic">
                                    💡 Tip: You can also copy this key for backup purposes.
                                </p>
                            </div>
                        )}

                        <motion.button
                            onClick={() => {
                                onSuccess();
                                onClose();
                                router.push('/buyer');
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-4 py-3 text-sm font-bold text-white bg-[#353535] rounded-xl hover:bg-[#2a2a2a] shadow-lg transition-all"
                        >
                            Go to My Purchases
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </Modal>
    );
};
