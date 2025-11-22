'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Send, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { genAddressSeed, getZkLoginSignature, generateNonce, getExtendedEphemeralPublicKey } from '@mysten/sui/zklogin';
import { jwtToAddress } from '@mysten/sui/zklogin';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { getUserSalt } from '@/app/utils/zklogin.utils';
import { useUserStore } from '../../store/userStore';

export default function WalletPage() {
    const router = useRouter();
    const { user } = useUserStore();
    const [balance, setBalance] = useState<string>('0');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [digest, setDigest] = useState<string | null>(null);

    // Initialize Sui Client
    const rpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('testnet');
    const client = new SuiClient({ url: rpcUrl });
    // dApp-kit wallet hooks (for Web3 wallet users)
    const currentAccount = useCurrentAccount();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    useEffect(() => {
        const initWallet = async () => {
            setIsLoading(true);
            try {
                const jwt = localStorage.getItem('zklogin_jwt');

                // If user is logged in via ZK Login
                if (jwt) {
                    const salt = getUserSalt();
                    const derivedAddress = jwtToAddress(jwt, salt);
                    setAddress(derivedAddress);
                    await fetchBalance(derivedAddress);
                } else if (currentAccount?.address) {
                    // If a Web3 wallet is connected via dApp Kit
                    setAddress(currentAccount.address);
                    await fetchBalance(currentAccount.address);
                } else if (user?.address) {
                    // Fallback for other auth methods
                    setAddress(user.address);
                    await fetchBalance(user.address);

                    // Warn if ZK Login credentials are missing but we have a user session
                    // This happens if session is restored but local JWT is missing
                    console.warn('User session exists but ZK Login JWT is missing');
                    setStatus({
                        type: 'error',
                        message: 'Transaction credentials missing. Please re-login to send funds.'
                    });
                } else {
                    setStatus({ type: 'error', message: 'Wallet credentials not found. Please login.' });
                }
            } catch (error) {
                console.error('Wallet init error:', error);
                setStatus({ type: 'error', message: 'Failed to initialize wallet.' });
            } finally {
                setIsLoading(false);
            }
        };

        initWallet();
    }, [user, currentAccount]);

    const fetchBalance = async (addr: string) => {
        try {
            const coins = await client.getCoins({ owner: addr });
            const totalBalance = coins.data.reduce((acc, coin) => acc + BigInt(coin.balance), BigInt(0));
            const suiBalance = Number(totalBalance) / 1_000_000_000;
            setBalance(suiBalance.toFixed(4));
        } catch (error) {
            console.error('Fetch balance error:', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setStatus({ type: 'info', message: 'Preparing transaction...' });
        setDigest(null);

        try {
            const jwt = localStorage.getItem('zklogin_jwt');
            const ephemeralKeyPairStr = localStorage.getItem('zklogin_ephemeral_keypair');
            const randomness = localStorage.getItem('zklogin_randomness');
            const maxEpoch = localStorage.getItem('zklogin_max_epoch');
            const salt = getUserSalt();

            console.log('handleSend: JWT from storage:', jwt ? 'Found' : 'Missing');

            if (!jwt && currentAccount?.address) {
                // Build a simple transfer transaction block  
                setStatus({ type: 'info', message: 'Waiting for wallet approval...' });

                // Create TX using the Sui SDK transaction directly (compatible with wallet)
                const tx = new Transaction();
                const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(Number(amount) * 1_000_000_000)]);
                tx.transferObjects([coin], tx.pure.address(recipient));

                // Use wallet to sign and execute (handles everything including RPC call)
                // Cast to 'any' to bypass version mismatch between @mysten/sui and dapp-kit bundled version
                await new Promise<void>((resolve, reject) => {
                    signAndExecuteTransaction(
                        {
                            transaction: tx as any,
                        } as any,
                        {
                            onSuccess: async (result: any) => {
                                try {
                                    // Log result to understand structure
                                    console.log('signAndExecuteTransaction result:', result);

                                    // Handle both possible response structures
                                    const isSuccess = result?.effects?.status?.status === 'success' ||
                                        result?.status === 'success' ||
                                        result?.digest;

                                    if (isSuccess) {
                                        setStatus({ type: 'success', message: 'Transaction successful!' });
                                        setDigest(result.digest || result?.digest);
                                        setAmount('');
                                        setRecipient('');
                                        await fetchBalance(currentAccount.address);
                                        resolve();
                                    } else {
                                        const errorMsg = result?.effects?.status?.error || 'Transaction status unknown';
                                        throw new Error(`Transaction failed: ${errorMsg}`);
                                    }
                                } catch (err) {
                                    reject(err);
                                }
                            },
                            onError: (err: any) => {
                                console.error('Wallet transaction error:', err);
                                reject(err);
                            },
                        }
                    );
                });
                return; // Exit after Web3 wallet transaction completes
            }

            if (!jwt) {
                console.error('JWT is missing. Storage keys:', Object.keys(localStorage));
                throw new Error('Missing JWT. Please re-login.');
            }
            if (!ephemeralKeyPairStr) throw new Error('Missing Ephemeral Key. Please re-login.');
            if (!randomness) throw new Error('Missing Randomness. Please re-login.');
            if (!maxEpoch) throw new Error('Missing Max Epoch. Please re-login.');

            // Reconstruct Keypair
            const parsedKeyPair = JSON.parse(ephemeralKeyPairStr);

            if (!parsedKeyPair.secretKey) {
                throw new Error('Ephemeral private key missing. Please re-login.');
            }

            let secretKeyBytes: Uint8Array;

            // Handle case where secretKey is an array of characters (Bech32 string split)
            // or a raw Bech32 string
            if (Array.isArray(parsedKeyPair.secretKey) && typeof parsedKeyPair.secretKey[0] === 'string') {
                const bech32SecretKey = parsedKeyPair.secretKey.join('');
                const { secretKey } = decodeSuiPrivateKey(bech32SecretKey);
                secretKeyBytes = secretKey;
            } else if (typeof parsedKeyPair.secretKey === 'string') {
                const { secretKey } = decodeSuiPrivateKey(parsedKeyPair.secretKey);
                secretKeyBytes = secretKey;
            } else {
                // Assume it's a standard byte array (number[])
                secretKeyBytes = new Uint8Array(parsedKeyPair.secretKey);
            }

            const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(secretKeyBytes);

            // 1. Generate ZK Proof
            setStatus({ type: 'info', message: 'Generating ZK Proof (this may take a moment)...' });

            // Note: In a real app, you should use a dedicated Prover Service.
            // For Devnet/Testnet with non-whitelisted Client IDs, use the dev prover.
            const proverUrl = process.env.NEXT_PUBLIC_PROVER_URL || 'https://prover-dev.mystenlabs.com/v1';
            console.log('Using Prover URL:', proverUrl);

            // Ensure maxEpoch is a number for the Prover
            const maxEpochNum = Number(maxEpoch);

            // Use the extended ephemeral public key for the Prover
            const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey());

            // Helper to convert Base64 to BigInt string (required for Prover)
            const base64ToBigInt = (b64: string): string => {
                if (/^\d+$/.test(b64)) return b64; // Already BigInt string
                try {
                    const bin = atob(b64);
                    let hex = "0x";
                    for (let i = 0; i < bin.length; i++) {
                        hex += bin.charCodeAt(i).toString(16).padStart(2, "0");
                    }
                    return BigInt(hex).toString();
                } catch (e) {
                    console.error('Error converting Base64 to BigInt:', e);
                    return b64; // Fallback
                }
            };

            const extendedEphemeralPublicKeyBigInt = base64ToBigInt(extendedEphemeralPublicKey);

            console.log('Prover Inputs:', {
                maxEpoch: maxEpochNum,
                randomness,
                extendedEphemeralPublicKey: extendedEphemeralPublicKeyBigInt
            });

            const proofResponse = await fetch(proverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jwt,
                    extendedEphemeralPublicKey: extendedEphemeralPublicKeyBigInt,
                    maxEpoch: maxEpochNum,
                    jwtRandomness: randomness,
                    salt,
                    keyClaimName: "sub"
                })
            });

            if (!proofResponse.ok) {
                const errText = await proofResponse.text();
                throw new Error(`Prover failed: ${errText}`);
            }

            const zkProof = await proofResponse.json();

            // 2. Construct Transaction
            setStatus({ type: 'info', message: 'Building transaction...' });
            const tx = new Transaction();
            const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(Number(amount) * 1_000_000_000)]);
            tx.transferObjects([coin], tx.pure.address(recipient));
            tx.setSender(address!);

            // 3. Sign and Execute
            setStatus({ type: 'info', message: 'Signing and executing...' });

            const { bytes, signature: userSignature } = await tx.sign({
                client,
                signer: ephemeralKeyPair
            });

            // 1. Decode JWT to get sub and aud
            const decodedJwt = JSON.parse(atob(jwt.split('.')[1]));
            console.log('Decoded JWT:', decodedJwt);

            // DIAGNOSTIC: Verify Nonce
            const expectedNonce = generateNonce(
                ephemeralKeyPair.getPublicKey(),
                maxEpochNum,
                randomness
            );
            console.log('Nonce Check:', {
                jwtNonce: decodedJwt.nonce,
                expectedNonce: expectedNonce,
                match: decodedJwt.nonce === expectedNonce
            });

            // DIAGNOSTIC: Verify Address
            const derivedAddress = jwtToAddress(jwt, BigInt(salt));
            console.log('Address Check:', {
                currentAddress: address,
                derivedAddress: derivedAddress,
                match: address === derivedAddress
            });

            if (decodedJwt.nonce !== expectedNonce) {
                throw new Error('Nonce mismatch! Your login session is invalid. Please re-login.');
            }
            if (address !== derivedAddress) {
                throw new Error('Address mismatch! Your stored salt does not match your address. Please re-login.');
            }

            // 2. Generate addressSeed
            const addressSeed = genAddressSeed(
                BigInt(salt),
                "sub",
                decodedJwt.sub,
                decodedJwt.aud
            ).toString();

            console.log('Final ZK Signature Inputs:', {
                maxEpoch: maxEpochNum,
                userSignature,
                addressSeed,
                zkProofKeys: Object.keys(zkProof || {}),
                salt: BigInt(salt).toString()
            });

            const zkLoginSignature = getZkLoginSignature({
                inputs: {
                    ...zkProof,
                    addressSeed,
                },
                maxEpoch: maxEpochNum, // Use number consistently
                userSignature,
            });

            const result = await client.executeTransactionBlock({
                transactionBlock: bytes,
                signature: zkLoginSignature,
                options: {
                    showEffects: true,
                },
            });

            if (result.effects?.status.status === 'success') {
                setStatus({ type: 'success', message: 'Transaction successful!' });
                setDigest(result.digest);
                setAmount('');
                setRecipient('');
                fetchBalance(address!);
            } else {
                throw new Error(`Transaction failed: ${result.effects?.status.error}`);
            }

        } catch (error: any) {
            console.error('Send error:', error);
            setStatus({ type: 'error', message: error.message || 'Transaction failed' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FAFAFA] pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#474747] rounded-lg">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Wallet</h1>
                    </div>
                    <p className="text-gray-500">Manage your SourceNet assets and transactions</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Balance Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Balance</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-4xl font-bold text-gray-900">{isLoading ? '...' : balance}</h2>
                                <span className="text-xl font-medium text-gray-400">SUI</span>
                            </div>
                            {address && (
                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full w-fit">
                                    <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(address)}
                                        className="hover:text-gray-900 transition-colors"
                                        title="Copy Address"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => address && fetchBalance(address)}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Send Form */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Send size={18} />
                            Send / Withdraw
                        </h3>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSend} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recipient Address
                                </label>
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#474747] focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (SUI)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.000000001"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#474747] focus:border-transparent outline-none transition-all pr-16"
                                        required
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
                                        SUI
                                    </div>
                                </div>
                            </div>

                            {status && (
                                <div className={`p-4 rounded-lg flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700' :
                                    status.type === 'success' ? 'bg-green-50 text-green-700' :
                                        'bg-blue-50 text-blue-700'
                                    }`}>
                                    {status.type === 'error' ? <AlertCircle size={20} className="shrink-0 mt-0.5" /> :
                                        status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> :
                                            <Loader2 size={20} className="shrink-0 mt-0.5 animate-spin" />}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{status.message}</p>
                                        {digest && (
                                            <a
                                                href={`https://suiscan.xyz/testnet/tx/${digest}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs underline mt-1 inline-flex items-center gap-1 hover:opacity-80"
                                            >
                                                View on Explorer <ExternalLink size={10} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSending || !address}
                                className="w-full bg-[#474747] text-white py-3 rounded-lg font-semibold hover:bg-[#353535] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Send Coins <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
