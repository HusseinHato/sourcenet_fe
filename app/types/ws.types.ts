// WebSocket message types
export interface WSMessage {
  type: string;
  payload: any;
  timestamp: number;
}

// WebSocket event types
export interface WSDataPodPublished {
  type: 'datapod.published';
  payload: {
    dataPodId: string;
    sellerId: string;
    title: string;
    price: number;
  };
}

export interface WSPurchaseCompleted {
  type: 'purchase.completed';
  payload: {
    purchaseId: string;
    dataPodId: string;
    buyerId: string;
    sellerId: string;
    blobId: string;
  };
}

export interface WSReviewAdded {
  type: 'review.added';
  payload: {
    dataPodId: string;
    rating: number;
    comment: string;
  };
}

export interface WSPriceUpdated {
  type: 'price.updated';
  payload: {
    dataPodId: string;
    oldPrice: number;
    newPrice: number;
  };
}

export interface WSConnectionStatus {
  type: 'connection.status';
  payload: {
    status: 'connected' | 'disconnected' | 'reconnecting';
    timestamp: number;
  };
}

export type WSEvent =
  | WSDataPodPublished
  | WSPurchaseCompleted
  | WSReviewAdded
  | WSPriceUpdated
  | WSConnectionStatus;

// WebSocket subscription types
export interface WSSubscription {
  event: string;
  callback: (data: any) => void;
}

export interface WSConnection {
  url: string;
  isConnected: boolean;
  isReconnecting: boolean;
  messageQueue: WSMessage[];
  subscriptions: Map<string, Set<(data: any) => void>>;
}
