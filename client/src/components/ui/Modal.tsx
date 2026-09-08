'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheckCircle, faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: 'success' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ 
  isOpen, onClose, title, children, type = 'info', size = 'md' 
}: ModalProps) {
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  const typeStyles = {
    success: {
      icon: faCheckCircle,
      iconColor: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    error: {
      icon: faExclamationCircle,
      iconColor: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800'
    },
    info: {
      icon: faInfoCircle,
      iconColor: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      border: 'border-indigo-200 dark:border-indigo-800'
    }
  };

  const t = typeStyles[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`pointer-events-auto w-full ${sizeClasses[size]} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden`}
            >
              {title && (
                <div className={`flex items-center justify-between px-6 py-4 border-b ${t.border}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center`}>
                      <FontAwesomeIcon icon={t.icon} className={`text-xl ${t.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-bangla">{title}</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
                  </button>
                </div>
              )}
              
              <div className="px-6 py-5">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}