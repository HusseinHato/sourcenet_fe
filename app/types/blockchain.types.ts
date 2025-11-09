// Blockchain transaction types
export interface Transaction {
  hash: string;
  from: string;
  to?: string;
  amount?: number;
  data?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  gasUsed?: number;
}

// Sui-specific types
export interface SuiTransaction {
  digest: string;
  effects: {
    status: {
      status: 'success' | 'failure';
    };
  };
}

// Wallet types
export interface Wallet {
  address: string;
  publicKey: string;
  balance: number;
}

// Signer types
export interface Signer {
  address: string;
  sign(message: string): Promise<string>;
  signTransaction(tx: any): Promise<string>;
}

// ZKLogin types
export interface ZKLoginCredential {
  jwt: string;
  ephemeralPublicKey: string;
  ephemeralSignature: string;
  userSalt: string;
  proofPoints: string;
}

export interface ZKLoginSession {
  address: string;
  jwt: string;
  ephemeralPublicKey: string;
  ephemeralPrivateKey: string;
  userSalt: string;
  expiresAt: number;
}

// DataPod blockchain types
export interface DataPodOnChain {
  id: string;
  seller: string;
  title: string;
  price: number;
  fileHash: string;
  blobId: string;
  status: 'active' | 'delisted';
  rating: number;
  purchaseCount: number;
}

// Purchase escrow types
export interface PurchaseEscrow {
  id: string;
  buyer: string;
  seller: string;
  dataPodId: string;
  amount: number;
  status: 'locked' | 'released' | 'refunded';
  createdAt: number;
  completedAt?: number;
}
