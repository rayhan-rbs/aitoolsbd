'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false, type: 'success', message: ''
  });

  // পেজ লোড হলে Supabase অটোমেটিক URL-এর hash (#access_token=...) থেকে রিকভারি সেশনটি চিনে নেয়।
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // যদি সেশন না থাকে, তার মানে লিংকটি মেয়াদোত্তীর্ণ বা অবৈধ। 
      // তবে আমরা ইউজারকে ফর্ম সাবমিট করতে দেব, সাবমিট করলেই Supabase এরর দিলে ধরা পড়বে।
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setFeedback({ isOpen: true, type: 'error', message: 'পাসওয়ার্ডের দৈর্ঘ্য কমপক্ষে ৬ অক্ষর হতে হবে!' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ isOpen: true, type: 'error', message: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না!' });
      return;
    }

    setLoading(true);
    try {
      // 🔥 Supabase-এর মাধ্যমে পাসওয়ার্ড আপডেট করা
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      setFeedback({ 
        isOpen: true, 
        type: 'success', 
        message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! আপনাকে লগইন পেজে নিয়ে যাওয়া হচ্ছে...' 
      });
      
      // ২ সেকেন্ড পর হোম পেজে রিডাইরেক্ট করা
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error: any) {
      setFeedback({ 
        isOpen: true, 
        type: 'error', 
        message: error.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। লিংকটি হয়তো মেয়াদোত্তীর্ণ হয়েছে।' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 pt-20">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center font-bangla">নতুন পাসওয়ার্ড সেট করুন</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6 font-bangla">আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড দিন।</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 font-bangla">নতুন পাসওয়ার্ড</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                minLength={6} 
                placeholder="••••••••" 
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bangla" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 font-bangla">পাসওয়ার্ড নিশ্চিত করুন</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                minLength={6} 
                placeholder="••••••••" 
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bangla" 
              />
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} className="mt-4">
            পাসওয়ার্ড আপডেট করুন
          </Button>
        </form>
      </div>

      <Modal 
        isOpen={feedback.isOpen} 
        onClose={() => setFeedback(p => ({ ...p, isOpen: false }))} 
        title={feedback.type === 'success' ? 'সফল!' : 'ত্রুটি!'} 
        type={feedback.type} 
        size="sm"
      >
        <p className="text-slate-700 dark:text-slate-300 text-center font-bangla">{feedback.message}</p>
      </Modal>
    </div>
  );
}