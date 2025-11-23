'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { AiChatWindow } from './AiChatWindow';
import type { ChatContext } from '@/app/types/ai.types';

interface AiChatWidgetProps {
    context?: ChatContext;
}

export function AiChatWidget({ context }: AiChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <AnimatePresence>
                {isOpen && <AiChatWindow onClose={() => setIsOpen(false)} context={context} />}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-[#1A1A1A] rounded-full shadow-2xl flex items-center justify-center border border-[#333] z-40 group hover:border-[#555] transition-all"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#333] to-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 w-8 h-8">
                        <Image
                            src="/sourcenet.png"
                            alt="Ask AI"
                            fill
                            className="object-contain invert brightness-0 invert-100"
                        />
                    </div>
                </motion.button>
            )}
        </>
    );
}
