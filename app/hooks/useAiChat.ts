import { useState, useCallback } from 'react';
import { aiService } from '@/app/utils/ai.service';
import type { Message, ChatContext } from '@/app/types/ai.types';

export function useAiChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(
        async (message: string, context?: ChatContext) => {
            setIsLoading(true);
            setError(null);

            // Add user message optimistically
            const userMessage: Message = {
                id: `temp-${Date.now()}`,
                role: 'user',
                content: message,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMessage]);

            try {
                const response = await aiService.sendMessage({
                    message,
                    conversationId: conversationId || undefined,
                    context,
                });

                // Update conversation ID if this is a new conversation
                if (!conversationId) {
                    setConversationId(response.data.conversationId);
                }

                // Add AI response
                const aiMessage: Message = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: response.data.timestamp,
                };
                setMessages((prev) => [...prev, aiMessage]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to send message');
                // Remove optimistic user message on error
                setMessages((prev) => prev.slice(0, -1));
            } finally {
                setIsLoading(false);
            }
        },
        [conversationId]
    );

    const loadConversation = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await aiService.getConversation(id);
            setConversationId(id);
            setMessages(response.data.conversation.messages);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load conversation');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearConversation = useCallback(() => {
        setMessages([]);
        setConversationId(null);
        setError(null);
    }, []);

    return {
        messages,
        conversationId,
        isLoading,
        error,
        sendMessage,
        loadConversation,
        clearConversation,
    };
}
