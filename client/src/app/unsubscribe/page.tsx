'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeOpenText, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setMessage('ভুল লিংক। কোনো ইমেইল পাওয়া যায়নি।');
      return;
    }

    const handleUnsubscribe = async () => {
      try {
        const response = await fetch('/api/newsletter/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: decodeURIComponent(email) }),
        });

        if (response.ok) {
          setStatus('success');
          setMessage('আপনাকে সফলভাবে আনসাবস্ক্রাইব করা হয়েছে। ভবিষ্যতে আর কোনো ইমেইল পাবেন না।');
        } else {
          setStatus('error');
          setMessage('আনসাবস্ক্রাইব করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        }
      } catch (err) {
        setStatus('error');
        setMessage('সার্ভার এরর।');
      }
    };

    handleUnsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <FontAwesomeIcon icon={faSpinner} className="text-5xl text-indigo-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-bangla">প্রক্রিয়াধীন...</h2>
            <p className="text-slate-600 dark:text-slate-400 font-bangla">অনুগ্রহ করে অপেক্ষা করুন।</p>
          </>
        )}

        {status === 'success' && (
          <>
            <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-emerald-500 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-bangla">আনসাবস্ক্রাইব সফল!</h2>
            <p className="text-slate-600 dark:text-slate-400 font-bangla mb-6">{message}</p>
            <Link href="/" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors font-bangla">
              হোম পেজে ফিরে যান
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-6xl text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-bangla">ত্রুটি হয়েছে!</h2>
            <p className="text-slate-600 dark:text-slate-400 font-bangla mb-6">{message}</p>
            <Link href="/" className="inline-block px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-bangla">
              হোম পেজে ফিরে যান
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-600 animate-spin" /></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}