'use client';

import { useEffect, useRef, useCallback } from 'react';
import { WSEvent, WSMessage } from '@/app/types/ws.types';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: WSEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  autoReconnect = true,
  reconnectInterval = 3000,
}: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const messageQueueRef = useRef<WSMessage[]>([]);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        onConnect?.();

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const msg = messageQueueRef.current.shift();
          if (msg && ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(msg));
          }
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          onMessage?.(data);

          // Trigger subscribed callbacks
          const callbacks = subscriptionsRef.current.get(data.type);
          callbacks?.forEach((cb) => cb(data.payload));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        onDisconnect?.();

        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      if (autoReconnect) {
        reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
      }
    }
  }, [url, onMessage, onConnect, onDisconnect, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const send = useCallback((message: WSMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      messageQueueRef.current.push(message);
    }
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!subscriptionsRef.current.has(event)) {
      subscriptionsRef.current.set(event, new Set());
    }
    subscriptionsRef.current.get(event)?.add(callback);

    return () => {
      subscriptionsRef.current.get(event)?.delete(callback);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: ws.current?.readyState === WebSocket.OPEN,
    send,
    subscribe,
    disconnect,
  };
}
