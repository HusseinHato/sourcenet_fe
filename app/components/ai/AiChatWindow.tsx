'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Plus, MessageSquare, ChevronDown, Sparkles, ArrowUp, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAiChat } from '@/app/hooks/useAiChat';
import { aiService } from '@/app/utils/ai.service';
import type { ConversationSummary, ChatContext } from '@/app/types/ai.types';

interface AiChatWindowProps {
    onClose: () => void;
    context?: ChatContext;
}

export function AiChatWindow({ onClose, context }: AiChatWindowProps) {
    const [input, setInput] = useState('');
    const [isDetailedMode, setIsDetailedMode] = useState(false);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        conversationId,
        isLoading,
        error,
        sendMessage,
        loadConversation,
        clearConversation,
    } = useAiChat();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load conversation history on mount
    useEffect(() => {
        loadConversationHistory();
    }, []);

    const loadConversationHistory = async () => {
        try {
            setLoadingConversations(true);
            const response = await aiService.getConversations({ limit: 50, sortBy: 'updatedAt', order: 'desc' });
            setConversations(response.data.conversations);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoadingConversations(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const message = input.trim();
        setInput('');
        await sendMessage(message, context);

        // Reload conversation history after sending a message
        loadConversationHistory();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleConversationClick = async (id: string) => {
        await loadConversation(id);
    };

    const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this conversation?')) return;

        try {
            await aiService.deleteConversation(id);
            setConversations((prev) => prev.filter((c) => c.id !== id));

            // If we deleted the current conversation, clear it
            if (conversationId === id) {
                clearConversation();
            }
        } catch (err) {
            console.error('Failed to delete conversation:', err);
        }
    };

    const handleNewChat = () => {
        clearConversation();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[900px] h-[600px] bg-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#333] z-50 font-sans text-white"
        >
            {/* Header */}
            <div className="h-16 border-b border-[#333] flex items-center justify-between px-6 bg-[#1A1A1A]">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <Image
                            src="/sourcenet.png"
                            alt="SourceNet AI"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Ask SourceNet AI</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#333] rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-[#141414] border-r border-[#333] flex flex-col">
                    <div className="p-4 flex-1 overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">History</h2>

                        {loadingConversations ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="text-gray-500 text-sm">No conversations yet</p>
                        ) : (
                            <div className="space-y-2">
                                {conversations.map((conversation) => (
                                    <div
                                        key={conversation.id}
                                        onClick={() => handleConversationClick(conversation.id)}
                                        className={`group cursor-pointer p-2 rounded-lg hover:bg-[#252525] transition-colors ${conversationId === conversation.id ? 'bg-[#252525]' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {conversation.title}
                                                </p>
                                                <p className="text-gray-500 text-xs truncate mt-1">
                                                    {conversation.messageCount} messages
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333] rounded transition-all"
                                            >
                                                <Trash2 className="w-3 h-3 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-auto p-4 border-t border-[#333]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium">Detailed Mode</span>
                            <button
                                onClick={() => setIsDetailedMode(!isDetailedMode)}
                                className={`w-10 h-5 rounded-full relative transition-colors ${isDetailedMode ? 'bg-blue-600' : 'bg-[#333]'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isDetailedMode ? 'left-6' : 'left-1'
                                        }`}
                                />
                            </button>
                        </div>
                        <button
                            onClick={handleNewChat}
                            className="w-full py-2.5 bg-[#333] hover:bg-[#444] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Start New Chat
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-[#1A1A1A] relative">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-20 h-20 bg-[#252525] rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-[#333]">
                                <Image
                                    src="/sourcenet.png"
                                    alt="SourceNet AI"
                                    width={48}
                                    height={48}
                                    className="object-contain opacity-80"
                                />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Ask me anything about SourceNet!</h3>
                            <p className="text-gray-400 text-sm mb-8">
                                I can help you with DataPods, marketplace, and platform features.
                            </p>
                            <div className="grid grid-cols-1 gap-3 mt-4 w-full max-w-md">
                                <button
                                    onClick={() => {
                                        setInput('What is SourceNet?');
                                    }}
                                    className="p-3 bg-[#252525] hover:bg-[#333] rounded-xl text-left text-sm transition-colors border border-[#333]"
                                >
                                    What is SourceNet?
                                </button>
                                <button
                                    onClick={() => {
                                        setInput('How do I get started with SourceNet?');
                                    }}
                                    className="p-3 bg-[#252525] hover:bg-[#333] rounded-xl text-left text-sm transition-colors border border-[#333]"
                                >
                                    How do I get started with SourceNet?
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'user'
                                            ? 'bg-[#333] text-white'
                                            : 'bg-transparent text-gray-200'
                                            }`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs font-medium text-blue-400">SourceNet AI</span>
                                            </div>
                                        )}
                                        <p className="leading-relaxed text-[15px] whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-transparent rounded-2xl px-5 py-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-blue-400" />
                                            <span className="text-xs font-medium text-blue-400">SourceNet AI</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="mx-6 mb-2 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-[#333] bg-[#1A1A1A]">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything about SourceNet!"
                                className="w-full bg-[#252525] border border-[#333] rounded-xl py-4 pl-5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#333] hover:bg-[#444] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowUp className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-600 mt-3">
                            SourceNet AI can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
