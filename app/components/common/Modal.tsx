'use client';

import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop with blur animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#474747]/40 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 border border-[#E5E5E5] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-[#F5F5F5]/30 pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-[#E5E5E5]">
              {title && <h2 className="text-xl font-bold text-[#353535]">{title}</h2>}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-[#919191] hover:text-[#353535] transition-colors p-1 rounded-lg hover:bg-[#F5F5F5]"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="relative p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
