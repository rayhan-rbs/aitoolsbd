'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhone, faEnvelope, faSave, faSpinner, faArrowLeft, faCamera } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', phone: '', bio: '', avatar_url: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false, type: 'success', message: ''
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from('profiles').select('name, phone, bio, avatar_url').eq('id', user.id).single();
        if (!error && data) {
          setFormData({ 
            name: data.name || '', 
            phone: data.phone || '', 
            bio: data.bio || '', 
            avatar_url: data.avatar_url || '' 
          });
          if (data.avatar_url) setAvatarPreview(data.avatar_url);
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      let finalAvatarUrl = formData.avatar_url;

      // 🔥 নতুন ছবি আপলোড করা
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        // পুরনো ছবি ডিলিট করা (ঐচ্ছিক, কিন্তু ভালো প্র্যাকটিস)
        if (formData.avatar_url) {
          const oldFileName = formData.avatar_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from('avatars').remove([oldFileName]).catch(() => {});
          }
        }

        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalAvatarUrl = publicUrl;
      }

      // 🔥 প্রোফাইল এবং Auth ডেটা আপডেট করা
      await supabase.auth.updateUser({ data: { name: formData.name, avatar_url: finalAvatarUrl } });
      
      const { error } = await supabase.from('profiles').update({ 
        name: formData.name, 
        phone: formData.phone, 
        bio: formData.bio, 
        avatar_url: finalAvatarUrl 
      }).eq('id', user.id);

      if (error) throw error;

      setFormData(prev => ({ ...prev, avatar_url: finalAvatarUrl }));
      setFeedback({ isOpen: true, type: 'success', message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' });
      
      // Navbar রিফ্রেশ করার জন্য পেজ রিলোড (অথবা Context ব্যবহার করতে পারেন)
      window.location.reload(); 
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'আপডেট ব্যর্থ হয়েছে।' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-bangla">প্রোফাইল লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-bangla">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">আমার প্রোফাইল</h1>
            <p className="text-slate-600 dark:text-slate-400">আপনার ব্যক্তিগত তথ্য এবং ছবি পরিচালনা করুন</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 🔥 Avatar Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="relative group">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900/50 shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white dark:border-slate-900"
                >
                  <FontAwesomeIcon icon={faCamera} className="text-sm" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.name || 'User'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-1 font-bangla">
                  প্রোফাইল ছবি পরিবর্তন করুন
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">পুরো নাম</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bangla" placeholder="আপনার নাম" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">মোবাইল নম্বর</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bangla" placeholder="01XXXXXXXXX" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">ইমেইল (পরিবর্তনযোগ্য নয়)</label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={user?.email || ''} disabled className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed font-bangla" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">বায়ো / পরিচিতি (ঐচ্ছিক)</label>
              <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none font-bangla" placeholder="আপনার সম্পর্কে সংক্ষেপে লিখুন..." />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="md" icon={faSave} loading={saving}>পরিবর্তন সেভ করুন</Button>
            </div>
          </form>
        </div>
      </div>

      <Modal isOpen={feedback.isOpen} onClose={() => setFeedback(p => ({ ...p, isOpen: false }))} title={feedback.type === 'success' ? 'সফল!' : 'ত্রুটি!'} type={feedback.type} size="sm">
        <p className="text-slate-700 dark:text-slate-300 text-center font-bangla">{feedback.message}</p>
      </Modal>
    </div>
  );
}