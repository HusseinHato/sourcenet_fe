'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Plus, MessageSquare, ChevronDown, Sparkles, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
}

interface ChatHistory {
    id: string;
    title: string;
    date: string;
}

export function AiChatWindow({ onClose }: { onClose: () => void }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: 'Hello! I am SourceNet AI. Ask me anything about SourceNet, DataPods, or how to get started!',
            timestamp: Date.now(),
        },
    ]);
    const [isDetailedMode, setIsDetailedMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');

        // Mock AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: "I'm currently a demo version. I can help you navigate the platform, but I don't have real-time knowledge yet. Try asking about 'publishing a DataPod' or 'buying data'.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
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
                    <div className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[#333]">
                        <span>Language</span>
                        <span className="text-white">English</span>
                        <ChevronDown className="w-4 h-4" />
                    </div>
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
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-6">History</h2>

                        <div className="space-y-4">
                            <div className="group cursor-pointer">
                                <p className="text-gray-400 text-sm group-hover:text-white transition-colors truncate">
                                    how to publish datapod
                                </p>
                            </div>
                            <div className="group cursor-pointer">
                                <p className="text-gray-400 text-sm group-hover:text-white transition-colors truncate">
                                    what is sourcenet
                                </p>
                            </div>
                            <div className="group cursor-pointer">
                                <p className="text-gray-400 text-sm group-hover:text-white transition-colors truncate">
                                    pricing models
                                </p>
                            </div>
                        </div>
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
                            onClick={() => setMessages([])}
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
                            <div className="grid grid-cols-1 gap-3 mt-8 w-full max-w-md">
                                <button className="p-3 bg-[#252525] hover:bg-[#333] rounded-xl text-left text-sm transition-colors border border-[#333]">
                                    What is SourceNet?
                                </button>
                                <button className="p-3 bg-[#252525] hover:bg-[#333] rounded-xl text-left text-sm transition-colors border border-[#333]">
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
                                        {msg.role === 'ai' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs font-medium text-blue-400">SourceNet AI</span>
                                            </div>
                                        )}
                                        <p className="leading-relaxed text-[15px]">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
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
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#333] hover:bg-[#444] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowUp className="w-4 h-4" />
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
