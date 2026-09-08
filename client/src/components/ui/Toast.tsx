'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // এনিমেশনের জন্য সামান্য ডিলে
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // ৪ সেকেন্ড পর অটোমেটিক বন্ধ হয়ে যাবে
    const autoCloseTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Exit animation এর সময়
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [onClose]);

  return (
    <div 
      className={`fixed top-24 right-4 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${
        type === 'success' 
          ? 'bg-emerald-50 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
          : 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
      }`}
    >
      <FontAwesomeIcon 
        icon={type === 'success' ? faCheckCircle : faTimesCircle} 
        className={`text-xl ${type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} 
      />
      <p className="text-sm font-semibold font-bangla pr-2">{message}</p>
      <button 
        onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
        className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
}