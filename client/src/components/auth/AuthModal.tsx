'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Toast from '../ui/Toast'; // 🔥 Toast ইম্পোর্ট করা হয়েছে
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faPhone, faEye, faEyeSlash, faGift } from '@fortawesome/free-solid-svg-icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 🔥 URL থেকে রেফারেল কোড ক্যাপচার করা (যদি থাকে)
  const refCode = searchParams.get('ref')?.toUpperCase() || '';

  // 🔥 Feedback Modal এর বদলে Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setPhone('');
  };

  // 🔥 Google Sign In Handler
  const handleGoogleSignIn = async () => {
    if (loading) return; // 🔥 ডাবল ক্লিক প্রতিরোধ
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback` 
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setToast({ message: error.message || 'Google লগইন ব্যর্থ হয়েছে।', type: 'error' });
      setLoading(false);
    }
  };

  // 🔥 Forgot Password Handler
  const handleForgotPassword = async () => {
    if (loading) return; // 🔥 ডাবল ক্লিক প্রতিরোধ

    if (!email) {
      setToast({ message: 'অনুগ্রহ করে প্রথমে আপনার ইমেইলটি ইনপুট বক্সে লিখুন।', type: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      setToast({ message: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'রিসেট লিংক পাঠাতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Main Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return; // 🔥 ডাবল ক্লিক প্রতিরোধ (সবচেয়ে গুরুত্বপূর্ণ)

    if (password.length < 6) {
      setToast({ message: 'পাসওয়ার্ডের দৈর্ঘ্য কমপক্ষে ৬ অক্ষর হতে হবে!', type: 'error' });
      return; 
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setToast({ message: 'সফলভাবে লগইন হয়েছে!', type: 'success' });
        setTimeout(() => { onClose(); resetForm(); }, 1500);
      } else {
        // ১. প্রথমে ইউজার রেজিস্টার করা
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email, 
          password,
          options: { 
            data: { 
              name, 
              phone,
              referral_code: refCode || null
            } 
          }
        });
        
        if (signUpError) throw signUpError;

        // ২. 🔥 যদি রেফারেল কোড থাকে, তবে রেফারার-এর ID খুঁজে বের করে প্রোফাইলে সেভ করা
        if (authData?.user && refCode) {
          const { data: referrer } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', refCode)
            .single();

          if (referrer) {
            await supabase
              .from('profiles')
              .update({ referred_by: referrer.id })
              .eq('id', authData.user.id);
          }
        }

        setToast({ message: 'রেজিস্ট্রেশন সফল! ইমেইল ভেরিফিকেশন লিংক আপনার ইমেইলে পাঠানো হয়েছে।', type: 'success' });
        setTimeout(() => { onClose(); resetForm(); }, 2000);
      }
    } catch (error: any) {
      setToast({ message: error.message || 'ত্রুটি হয়েছে।', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ইনপুট ফিল্ডের জন্য কমন স্টাইল
  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 transition-all outline-none font-bangla";

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setMode('login')}
            disabled={loading} // 🔥 লোডিং অবস্থায় ট্যাব চেঞ্জ বন্ধ
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all font-bangla disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'login' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            লগইন
          </button>
          <button
            onClick={() => setMode('register')}
            disabled={loading} // 🔥 লোডিং অবস্থায় ট্যাব চেঞ্জ বন্ধ
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all font-bangla disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'register' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            রেজিস্টার
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-bangla">
          {mode === 'login' ? 'স্বাগতম!' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-bangla">
          {mode === 'login' ? 'আপনার AI টুলস অ্যাক্সেস করতে লগইন করুন' : 'বাংলাদেশের প্রথম AI মার্কেটপ্লেসে যোগ দিন'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              {refCode && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 flex items-center gap-3">
                  <FontAwesomeIcon icon={faGift} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold font-bangla">
                    রেফারেল কোড প্রয়োগ হয়েছে: <span className="font-mono font-bold">{refCode}</span>
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 font-bangla">পুরো নাম</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="আপনার নাম" className={inputClass} disabled={loading} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 font-bangla">মোবাইল নম্বর</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faPhone} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="01XXX-XXXXXX" className={inputClass} disabled={loading} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 font-bangla">ইমেইল অ্যাড্রেস</label>
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className={inputClass} disabled={loading} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 font-bangla">পাসওয়ার্ড</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className={`${inputClass} pr-11`} disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" disabled={loading}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            
            {mode === 'login' && (
              <div className="flex justify-end mt-2">
                <button 
                  type="button" 
                  onClick={handleForgotPassword} 
                  disabled={loading}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors font-bangla disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
            )}
          </div>

          <div className="pt-2">
            {/* 🔥 এখানে disabled={loading} যোগ করা হয়েছে */}
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              size="lg" 
              loading={loading}
              disabled={loading}
            >
              {mode === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
            </Button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 font-bangla">অথবা</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bangla disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Google দিয়ে চালিয়ে যান
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 font-bangla">
          {mode === 'login' ? 'অ্যাকাউন্ট নেই? ' : 'আগে থেকে অ্যাকাউন্ট আছে? '}
          <button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
            disabled={loading}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'login' ? 'রেজিস্টার করুন' : 'লগইন করুন'}
          </button>
        </p>
      </Modal>

      {/* 🔥 Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}