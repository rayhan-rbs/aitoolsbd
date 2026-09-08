'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGhost, 
  faHome, 
  faSearch, 
  faArrowRight 
} from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-4 transition-colors duration-300 font-bangla">
      
      {/* Background Decorative Elements (আপনার হোম পেজের মতো) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="text-center max-w-2xl mx-auto relative z-10">
        
        {/* Animated Icon */}
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-xl animate-ping" />
          <div className="relative w-32 h-32 mx-auto bg-white dark:bg-slate-900 rounded-full border-4 border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shadow-2xl">
            <FontAwesomeIcon 
              icon={faGhost} 
              className="text-6xl text-indigo-600 dark:text-indigo-400 animate-bounce" 
            />
          </div>
        </div>

        {/* 404 Heading */}
        <h1 className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-4 tracking-tighter">
          ৪০৪
        </h1>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
          উপস! পেজটি খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-lg mx-auto">
          আপনি যে লিংকে ক্লিক করেছেন তা হয়তো মুছে ফেলা হয়েছে, নাম পরিবর্তন করা হয়েছে, অথবা এটি কখনও বিদ্যমান ছিল না।
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button variant="primary" size="lg" icon={faHome} className="shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40">
              হোম পেজে ফিরে যান
            </Button>
          </Link>
          
          <Link href="/products">
            <Button variant="outline" size="lg" icon={faSearch} className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 group">
              প্রোডাক্ট ব্রাউজ করুন
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Fun Footer Note */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-500 flex items-center justify-center gap-2">
            <span>সমস্যাটি যদি স্থায়ী হয়, তবে</span>
            <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              সাপোর্ট টিমের সাথে যোগাযোগ করুন
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}