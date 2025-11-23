import { apiClient } from './api.client';
import type {
    ChatRequest,
    ChatResponse,
    ConversationsResponse,
    ConversationResponse,
    DeleteResponse,
    ErrorResponse,
} from '@/app/types/ai.types';

class AiService {
    /**
     * Send a message to the AI and receive a response
     */
    async sendMessage(request: ChatRequest): Promise<ChatResponse> {
        try {
            const response = await apiClient.post<ChatResponse>('/ai/chat', request);
            return response.data;
        } catch (error: any) {
            const errorResponse: ErrorResponse = error.response?.data;
            throw new Error(errorResponse?.error?.message || 'Failed to send message');
        }
    }

    /**
     * Get paginated list of user's conversations
     */
    async getConversations(params?: {
        page?: number;
        limit?: number;
        sortBy?: 'createdAt' | 'updatedAt';
        order?: 'asc' | 'desc';
    }): Promise<ConversationsResponse> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.set('page', params.page.toString());
            if (params?.limit) queryParams.set('limit', params.limit.toString());
            if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
            if (params?.order) queryParams.set('order', params.order);

            const query = queryParams.toString();
            const response = await apiClient.get<ConversationsResponse>(
                `/ai/conversations${query ? `?${query}` : ''}`
            );
            return response.data;
        } catch (error: any) {
            const errorResponse: ErrorResponse = error.response?.data;
            throw new Error(errorResponse?.error?.message || 'Failed to fetch conversations');
        }
    }

    /**
     * Get a single conversation with all messages
     */
    async getConversation(id: string): Promise<ConversationResponse> {
        try {
            const response = await apiClient.get<ConversationResponse>(`/ai/conversations/${id}`);
            return response.data;
        } catch (error: any) {
            const errorResponse: ErrorResponse = error.response?.data;
            throw new Error(errorResponse?.error?.message || 'Failed to fetch conversation');
        }
    }

    /**
     * Delete a conversation and all its messages
     */
    async deleteConversation(id: string): Promise<DeleteResponse> {
        try {
            const response = await apiClient.delete<DeleteResponse>(`/ai/conversations/${id}`);
            return response.data;
        } catch (error: any) {
            const errorResponse: ErrorResponse = error.response?.data;
            throw new Error(errorResponse?.error?.message || 'Failed to delete conversation');
        }
    }
}

// Export singleton instance
export const aiService = new AiService();
