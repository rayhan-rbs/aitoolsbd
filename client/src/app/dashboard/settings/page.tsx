'use client';

import { useTranslation } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, faEye, faEyeSlash, faSpinner, faArrowLeft, 
  faUniversalAccess, faTextHeight, faAdjust, faLanguage,
  faPlus, faMinus, faRotateLeft
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  
  // 🔥 নতুন Accessibility States
  const [accessibility, setAccessibility] = useState({
    reduceMotion: false,
    highContrast: false,
    fontSize: 100,
    language: 'bn',
    dyslexiaFont: false,
    readingMode: false,
    textSpacing: 'normal',      // 🔥 নতুন যোগ করা হয়েছে
    simpleMode: false           // 🔥 নতুন যোগ করা হয়েছে
  });
  
  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ 
    isOpen: false, type: 'success', message: '' 
  });
  const { language, setLanguage } = useTranslation();

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  // 🔥 LocalStorage থেকে সেটিংস লোড করা
  useEffect(() => {
    const savedMotion = localStorage.getItem('reduceMotion');
    const savedContrast = localStorage.getItem('highContrast');
    const savedFontSize = localStorage.getItem('fontSize');
    const savedLanguage = localStorage.getItem('language');
    const savedDyslexia = localStorage.getItem('dyslexiaFont');      // 🔥 নতুন
    const savedReading = localStorage.getItem('readingMode');        // 🔥 নতুন
    const savedSpacing = localStorage.getItem('textSpacing');        // 🔥 নতুন
    const savedSimple = localStorage.getItem('simpleMode');

    const newAccessibility = { ...accessibility };
    
    if (savedMotion) {
      newAccessibility.reduceMotion = savedMotion === 'true';
      if (savedMotion === 'true') document.documentElement.classList.add('reduce-motion');
      else document.documentElement.classList.remove('reduce-motion');
    }
    if (savedContrast) {
      newAccessibility.highContrast = savedContrast === 'true';
      if (savedContrast === 'true') document.documentElement.classList.add('high-contrast');
      else document.documentElement.classList.remove('high-contrast');
    }
    if (savedFontSize) {
      newAccessibility.fontSize = Number(savedFontSize);
      document.documentElement.style.fontSize = `${savedFontSize}%`;
    }
    if (savedLanguage) {
      newAccessibility.language = savedLanguage;
      document.documentElement.lang = savedLanguage === 'bn' ? 'bn' : 'en';
    }

    // 🔥 নতুন অপশনগুলো লোড করা
    if (savedDyslexia) {
      newAccessibility.dyslexiaFont = savedDyslexia === 'true';
      if (savedDyslexia === 'true') document.documentElement.classList.add('dyslexia-friendly');
    }
    if (savedReading) {
      newAccessibility.readingMode = savedReading === 'true';
      if (savedReading === 'true') document.documentElement.classList.add('reading-mode');
    }
    if (savedSpacing) {
      newAccessibility.textSpacing = savedSpacing;
      document.documentElement.classList.add(`text-spacing-${savedSpacing}`);
    }
    if (savedSimple) {
      newAccessibility.simpleMode = savedSimple === 'true';
      if (savedSimple === 'true') document.documentElement.classList.add('simple-mode');
    }

    setAccessibility(newAccessibility);
  }, []);

  const handleAccessibilityChange = (key: string, value: any) => {
    setAccessibility(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(key, value.toString());

    if (key === 'reduceMotion') {
      value ? document.documentElement.classList.add('reduce-motion') : document.documentElement.classList.remove('reduce-motion');
    }
    if (key === 'highContrast') {
      value ? document.documentElement.classList.add('high-contrast') : document.documentElement.classList.remove('high-contrast');
    }
    if (key === 'fontSize') {
      document.documentElement.style.fontSize = `${value}%`;
    }
    if (key === 'language') {
      document.documentElement.lang = value === 'bn' ? 'bn' : 'en';
    }
    // 🔥 নতুন অপশনগুলোর জন্য
    if (key === 'dyslexiaFont') {
      value ? document.documentElement.classList.add('dyslexia-friendly') : document.documentElement.classList.remove('dyslexia-friendly');
    }
    if (key === 'readingMode') {
      value ? document.documentElement.classList.add('reading-mode') : document.documentElement.classList.remove('reading-mode');
    }
    if (key === 'textSpacing') {
      document.documentElement.classList.remove('text-spacing-compact', 'text-spacing-normal', 'text-spacing-comfortable');
      document.documentElement.classList.add(`text-spacing-${value}`);
    }
    if (key === 'simpleMode') {
      value ? document.documentElement.classList.add('simple-mode') : document.documentElement.classList.remove('simple-mode');
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(80, Math.min(150, accessibility.fontSize + delta));
    handleAccessibilityChange('fontSize', newSize);
  };

  const handleResetFontSize = () => {
    handleAccessibilityChange('fontSize', 100);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ isOpen: true, type: 'error', message: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setFeedback({ isOpen: true, type: 'error', message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      setFeedback({ isOpen: true, type: 'success', message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
    } finally {
      setSaving(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt("আপনার রেজিস্টার্ড ইমেইল দিন:");
    if (email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setFeedback({ isOpen: true, type: 'error', message: error.message });
      else setFeedback({ isOpen: true, type: 'success', message: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।' });
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-bangla">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">সেটিংস</h1>
            <p className="text-slate-600 dark:text-slate-400">অ্যাকাউন্ট নিরাপত্তা এবং অ্যাক্সেসিবিলিটি</p>
          </div>
        </div>

        {/* 🔐 Password Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FontAwesomeIcon icon={faLock} className="text-indigo-500" /> পাসওয়ার্ড পরিবর্তন করুন
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">নতুন পাসওয়ার্ড</label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} required minLength={6} className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bangla" placeholder="কমপক্ষে ৬ অক্ষর" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">পাসওয়ার্ড নিশ্চিত করুন</label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required minLength={6} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bangla" placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন" />
              </div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <Button type="submit" variant="primary" size="md" loading={saving}>পাসওয়ার্ড আপডেট করুন</Button>
              <button type="button" onClick={handleForgotPassword} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-bangla">পাসওয়ার্ড ভুলে গেছেন? রিসেট করুন</button>
            </div>
          </form>
        </div>

        {/* ♿ Accessibility Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FontAwesomeIcon icon={faUniversalAccess} className="text-indigo-500" /> অ্যাক্সেসিবিলিটি
          </h2>
          <div className="space-y-1">
            
            {/* 🔤 Font Size Control */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
                  <FontAwesomeIcon icon={faTextHeight} className="text-indigo-500 text-sm" /> টেক্সট সাইজ
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla mt-1">সাইটের সব টেক্সটের আকার বড় বা ছোট করুন।</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => handleFontSizeChange(-10)} className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors" title="ছোট করুন">
                  <FontAwesomeIcon icon={faMinus} className="text-sm text-slate-600 dark:text-slate-300" />
                </button>
                <span className="w-16 text-center font-bold text-slate-900 dark:text-white">{accessibility.fontSize}%</span>
                <button onClick={() => handleFontSizeChange(10)} className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors" title="বড় করুন">
                  <FontAwesomeIcon icon={faPlus} className="text-sm text-slate-600 dark:text-slate-300" />
                </button>
                <button onClick={handleResetFontSize} className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors ml-1" title="রিসেট">
                  <FontAwesomeIcon icon={faRotateLeft} className="text-sm text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* 🎨 High Contrast Mode */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
                  <FontAwesomeIcon icon={faAdjust} className="text-indigo-500 text-sm" /> হাই কন্ট্রাস্ট মোড
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla mt-1">টেক্সট এবং ব্যাকগ্রাউন্ডের কন্ট্রাস্ট বাড়ায়, পড়তে সুবিধা হয়।</p>
              </div>
              <button onClick={() => handleAccessibilityChange('highContrast', !accessibility.highContrast)} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ml-4 ${accessibility.highContrast ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${accessibility.highContrast ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* 🔥 Dyslexia-Friendly Font */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white font-bangla">
                  ডিসলেক্সিয়া-ফ্রেন্ডলি ফন্ট
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla mt-1">
                  পড়ার সমস্যা থাকলে এই ফন্টটি সাহায্য করবে।
                </p>
              </div>
              <button 
                onClick={() => handleAccessibilityChange('dyslexiaFont', !accessibility.dyslexiaFont)} 
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ml-4 ${
                  accessibility.dyslexiaFont ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle dyslexia-friendly font"
              >
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  accessibility.dyslexiaFont ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* 🔥 Reading Mode */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white font-bangla">
                  রিডিং মোড
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla mt-1">
                  টেক্সটের লাইন হাইলাইট করে পড়া সহজ করে।
                </p>
              </div>
              <button 
                onClick={() => handleAccessibilityChange('readingMode', !accessibility.readingMode)} 
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ml-4 ${
                  accessibility.readingMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle reading mode"
              >
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  accessibility.readingMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* 🔥 Text Spacing */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white font-bangla">
                  টেক্সট স্পেসিং
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla mt-1">
                  লাইন এবং অক্ষরের মধ্যকার দূরত্ব নিয়ন্ত্রণ করুন।
                </p>
              </div>
              <select 
                value={accessibility.textSpacing}
                onChange={(e) => handleAccessibilityChange('textSpacing', e.target.value)}
                className="ml-4 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla text-sm cursor-pointer"
                aria-label="Text spacing"
              >
                <option value="compact">সংকুচিত</option>
                <option value="normal">সাধারণ</option>
                <option value="comfortable">আরামদায়ক</option>
              </select>
            </div>

            {/* 🔥 Simple Mode (Cognitive Load Reduction) */}
            <div className="flex items-center justify-between py-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white font-bangla">
                  সিম্পল মোড
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla mt-1">
                  সব অ্যানিমেশন, ছায়া এবং ব্যাকগ্রাউন্ড ইফেক্ট বন্ধ করে দেয়।
                </p>
              </div>
              <button 
                onClick={() => handleAccessibilityChange('simpleMode', !accessibility.simpleMode)} 
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ml-4 ${
                  accessibility.simpleMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle simple mode"
              >
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  accessibility.simpleMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* 🎬 Reduce Motion */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white font-bangla">অ্যানিমেশন কমান (Reduce Motion)</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla mt-1">সাইটের সব ধরনের অ্যানিমেশন এবং ট্রানজিশন বন্ধ করে দেয়।</p>
              </div>
              <button onClick={() => handleAccessibilityChange('reduceMotion', !accessibility.reduceMotion)} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ml-4 ${accessibility.reduceMotion ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${accessibility.reduceMotion ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* 🌐 Language Preference */}
            <div className="flex items-center justify-between py-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
                  <FontAwesomeIcon icon={faLanguage} className="text-indigo-500 text-sm" /> ভাষা নির্বাচন
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla mt-1">সাইটের প্রাথমিক ভাষা পরিবর্তন করুন।</p>
              </div>
              <select 
                value={language} 
                onChange={(e) => {
                  const newLang = e.target.value as 'bn' | 'en';
                  setLanguage(newLang);
                  handleAccessibilityChange('language', newLang);
                }}
                className="ml-4 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla text-sm cursor-pointer"
              >
                <option value="bn">বাংলা</option>
                <option value="en">English</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      <Modal isOpen={feedback.isOpen} onClose={() => setFeedback(p => ({ ...p, isOpen: false }))} title={feedback.type === 'success' ? 'সফল!' : 'ত্রুটি!'} type={feedback.type} size="sm">
        <p className="text-slate-700 dark:text-slate-300 text-center font-bangla">{feedback.message}</p>
      </Modal>
    </div>
  );
}