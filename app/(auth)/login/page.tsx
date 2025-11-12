'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/common/Button';
import { LogIn } from 'lucide-react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleZKLogin = async () => {
    try {
      setIsLoading(true);
      
      // Get ZKLogin configuration from environment
      const clientId = process.env.NEXT_PUBLIC_ZKLOGIN_CLIENT_ID;
      const redirectUrl = process.env.NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL;
      const suiRpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('devnet');

      if (!clientId || !redirectUrl) {
        alert('ZKLogin is not properly configured. Please check environment variables.');
        return;
      }

      // Step 1: Generate ephemeral key pair
      const ephemeralKeyPair = new Ed25519Keypair();
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();

      // Step 2: Get current epoch from Sui network
      const suiClient = new SuiClient({ url: suiRpcUrl });
      const { epoch } = await suiClient.getLatestSuiSystemState();
      const maxEpoch = Number(epoch) + 2; // Ephemeral key valid for 2 epochs

      // Step 3: Generate nonce and randomness
      const randomness = generateRandomness();
      const nonce = generateNonce(ephemeralPublicKey, maxEpoch, randomness);

      // Step 4: Store ephemeral key pair, randomness, and max epoch in sessionStorage for callback
      sessionStorage.setItem('zklogin_ephemeral_keypair', JSON.stringify({
        publicKey: ephemeralPublicKey.toBase64(),
      }));
      sessionStorage.setItem('zklogin_randomness', randomness);
      sessionStorage.setItem('zklogin_max_epoch', maxEpoch.toString());

      // Step 5: Construct Google OAuth URL with nonce
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.append('client_id', clientId);
      googleAuthUrl.searchParams.append('redirect_uri', redirectUrl);
      googleAuthUrl.searchParams.append('response_type', 'id_token');
      googleAuthUrl.searchParams.append('scope', 'openid email profile');
      googleAuthUrl.searchParams.append('nonce', nonce);

      // Redirect to Google OAuth
      window.location.href = googleAuthUrl.toString();
    } catch (err) {
      console.error('ZKLogin error:', err);
      alert('Failed to initiate ZKLogin. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DataMarket</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* ZKLogin Button */}
        <div className="space-y-4">
          <Button 
            size="lg" 
            isLoading={isLoading} 
            onClick={handleZKLogin}
            className="w-full gap-2"
          >
            <LogIn size={20} />
            Sign in with Google (ZKLogin)
          </Button>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">What is ZKLogin?</h3>
          <p className="text-sm text-gray-600">
            ZKLogin is a privacy-preserving authentication method that uses zero-knowledge proofs. Sign in with your Google account without revealing your identity to the blockchain.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>
        </p>
      </div>
    </main>
  );
}
