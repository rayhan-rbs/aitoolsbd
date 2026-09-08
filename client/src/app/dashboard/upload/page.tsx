'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faImage, 
  faFile, 
  faArrowLeft,
  faCheckCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

const categories = [
  'AI Prompt', 
  'AI Template', 
  'AI Automation', 
  'ChatGPT Tools', 
  'Gemini Tools', 
  'Canva Template', 
  'Excel Automation', 
  'PHP Script', 
  'WordPress Plugin', 
  'AI Agent'
];

export default function UploadPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'AI Prompt',
    price: ''
  });
  const [productFile, setProductFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setPreviewUrl('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setFeedback({ isOpen: true, type: 'error', message: 'প্রথমে লগইন করুন।' });
      return;
    }

    if (!productFile) {
      setFeedback({ isOpen: true, type: 'error', message: 'প্রোডাক্ট ফাইল আপলোড করুন।' });
      return;
    }

    if (!formData.title || !formData.description || !formData.price) {
      setFeedback({ isOpen: true, type: 'error', message: 'সব ফিল্ড পূরণ করুন।' });
      return;
    }

    setUploading(true);

    try {
      // ১. Supabase Storage-এ ফাইল আপলোড
      const fileExt = productFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: fileData, error: fileError } = await supabase.storage
        .from('products')
        .upload(fileName, productFile);

      if (fileError) throw fileError;

      // ২. Preview Image আপলোড (যদি থাকে)
      let previewImageUrl = '';
      if (previewImage) {
        const imgExt = previewImage.name.split('.').pop();
        const imgName = `${user.id}/preview-${Date.now()}.${imgExt}`;
        
        const { data: imgData, error: imgError } = await supabase.storage
          .from('products')
          .upload(imgName, previewImage);

        if (imgError) throw imgError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(imgName);
        
        previewImageUrl = publicUrl;
      }

      // ৩. প্রোডাক্ট ডেটাবেসে সেভ
      const { data: { publicUrl: filePublicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('products').insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        file_url: filePublicUrl,
        preview_url: previewImageUrl,
        seller_id: user.id,
        is_approved: false
      });

      if (dbError) throw dbError;

      setFeedback({ 
        isOpen: true, 
        type: 'success', 
        message: 'প্রোডাক্ট সফলভাবে আপলোড হয়েছে! অ্যাডমিনের অনুমোদনের পর এটি লাইভ হবে।' 
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setFeedback({ 
        isOpen: true, 
        type: 'error', 
        message: error.message || 'আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' 
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors font-bangla">
            <FontAwesomeIcon icon={faArrowLeft} />
            ড্যাশবোর্ডে ফিরে যান
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 font-bangla">
            নতুন প্রোডাক্ট আপলোড করুন
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-bangla">
            আপনার ডিজিটাল প্রোডাক্ট হাজার হাজার মানুষের কাছে পৌঁছে দিন
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">
              প্রোডাক্টের নাম *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="যেমন: 1000+ Bangla ChatGPT Prompts"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none font-bangla"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">
              বিস্তারিত বিবরণ *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন..."
              required
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none font-bangla"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">
                ক্যাটাগরি *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none font-bangla"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">
                দাম (৳) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="99"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none font-bangla"
              />
            </div>
          </div>

          {/* Preview Image */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">
              প্রিভিউ ইমেজ (ঐচ্ছিক)
            </label>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-all"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full py-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center gap-3"
              >
                <FontAwesomeIcon icon={faImage} className="text-3xl text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400 font-bangla">ইমেজ আপলোড করতে ক্লিক করুন</span>
              </button>
            )}
          </div>

          {/* Product File */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">
              প্রোডাক্ট ফাইল *
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            {productFile ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 dark:text-emerald-400 text-xl" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{productFile.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{(productFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProductFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-700"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center gap-3"
              >
                <FontAwesomeIcon icon={faUpload} className="text-3xl text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400 font-bangla">ZIP, PDF, বা অন্য ফাইল আপলোড করুন</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 font-bangla">সর্বোচ্চ 50MB</span>
              </button>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" fullWidth>
                বাতিল
              </Button>
            </Link>
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              loading={uploading}
              icon={faUpload}
            >
              {uploading ? 'আপলোড হচ্ছে...' : 'প্রোডাক্ট আপলোড করুন'}
            </Button>
          </div>
        </form>
      </div>

      {/* Feedback Modal */}
      <Modal 
        isOpen={feedback.isOpen} 
        onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} 
        title={feedback.type === 'success' ? 'সফল!' : 'ত্রুটি!'}
        type={feedback.type}
        size="sm"
      >
        <p className="text-slate-700 dark:text-slate-300 text-center font-bangla">{feedback.message}</p>
      </Modal>
    </div>
  );
}