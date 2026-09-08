'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'bn' | 'en';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  bn: {
    // Navbar
    'nav.products': 'প্রোডাক্ট',
    'nav.sellers': 'বিক্রেতা হোন',
    'nav.profile': 'প্রোফাইল',
    'nav.settings': 'সেটিংস',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.orders': 'আমার অর্ডার',
    'nav.admin': 'অ্যাডমিন প্যানেল',
    'nav.logout': 'লগআউট',
    'nav.login': 'লগইন করুন',
    'nav.register': 'রেজিস্টার করুন',
    
    // Footer
    'footer.description': 'বাংলাদেশের সবচেয়ে বিশ্বস্ত প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস।',
    'footer.quickLinks': 'দ্রুত লিংক',
    'footer.allProducts': 'সকল প্রোডাক্ট',
    'footer.becomeSeller': 'বিক্রেতা হোন',
    'footer.support': 'সাপোর্ট ও নীতিমালা',
    'footer.privacy': 'গোপনীয়তা নীতি',
    'footer.terms': 'শর্তাবলী',
    'footer.refund': 'রিফান্ড পলিসি',
    'footer.contact': 'যোগাযোগ করুন',
    'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।',
    'footer.madeWith': '❤️ দিয়ে বাংলাদেশে তৈরি',
    
    // Common
    'common.loading': 'লোড হচ্ছে...',
    'common.save': 'সেভ করুন',
    'common.cancel': 'বাতিল',
    'common.delete': 'মুছে ফেলুন',
    'common.edit': 'এডিট করুন',
  },
  en: {
    // Navbar
    'nav.products': 'Products',
    'nav.sellers': 'Become a Seller',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.dashboard': 'Dashboard',
    'nav.orders': 'My Orders',
    'nav.admin': 'Admin Panel',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Register',
    
    // Footer
    'footer.description': 'Bangladesh\'s most trusted premium digital marketplace.',
    'footer.quickLinks': 'Quick Links',
    'footer.allProducts': 'All Products',
    'footer.becomeSeller': 'Become a Seller',
    'footer.support': 'Support & Policies',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.refund': 'Refund Policy',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All rights reserved.',
    'footer.madeWith': 'Made with ❤️ in Bangladesh',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  }
};

const LanguageContext = createContext<TranslationContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bn');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'bn' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}