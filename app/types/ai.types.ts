// AI Chat API Types

export interface ChatContext {
    dataPodId?: string;
    page?: string;
}

export interface ChatRequest {
    message: string;
    conversationId?: string;
    context?: ChatContext;
}

export interface ChatResponse {
    success: true;
    data: {
        conversationId: string;
        message: string;
        timestamp: string;
        tokens: {
            total: number;
        };
    };
}

export interface ConversationSummary {
    id: string;
    title: string;
    lastMessage: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
}

export interface ConversationsResponse {
    success: true;
    data: {
        conversations: ConversationSummary[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface ConversationDetail {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages: Message[];
}

export interface ConversationResponse {
    success: true;
    data: {
        conversation: ConversationDetail;
    };
}

export interface DeleteResponse {
    success: true;
    message: string;
}

export interface ErrorResponse {
    error: {
        code: string;
        message: string;
    };
}
