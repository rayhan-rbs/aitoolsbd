'use client';

import ImageWithLoader from '@/components/ui/ImageWithLoader';
import Skeleton from '@/components/ui/Skeleton'; // 🔥 Skeleton ইম্পোর্ট করা হয়েছে
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faDownload, faCalendar, faTag, 
  faSpinner, faEye, faEdit, faTrash
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function SellerProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false, type: 'success', message: ''
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!user || !productId) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('seller_id', user.id) // শুধু নিজের প্রোডাক্ট দেখতে পারবে
        .single();

      if (error || !data) {
        setFeedback({ isOpen: true, type: 'error', message: 'প্রোডাক্ট খুঁজে পাওয়া যায়নি।' });
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId, user, router]);

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);

    const { error } = await supabase.from('products').delete().eq('id', product.id);

    if (error) {
      setFeedback({ isOpen: true, type: 'error', message: 'ডিলিট ব্যর্থ হয়েছে।' });
    } else {
      setFeedback({ isOpen: true, type: 'success', message: 'প্রোডাক্ট মুছে ফেলা হয়েছে।' });
      setTimeout(() => router.push('/dashboard'), 1500);
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  // 🔥 স্মার্ট Skeleton Loading UI (স্পিনারের বদলে পুরো লেআউটের ছায়া দেখাবে)
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Back Button Skeleton */}
          <Skeleton className="w-40 h-6" />

          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="w-64 h-8" />
              <Skeleton className="w-24 h-6" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-24 h-10 rounded-xl" />
              <Skeleton className="w-24 h-10 rounded-xl" />
            </div>
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview Image Skeleton */}
            <Skeleton className="w-full aspect-video rounded-2xl" />

            {/* Product Info Skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <Skeleton className="w-3/4 h-8" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="w-20 h-3" />
                      <Skeleton className="w-32 h-5" />
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Skeleton className="w-16 h-3 mb-2" />
                  <Skeleton className="w-32 h-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <Skeleton className="w-40 h-6" />
            <div className="space-y-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
            </div>
          </div>

          {/* File Link Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-48 h-10 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors font-bangla active:scale-95">
          <FontAwesomeIcon icon={faArrowLeft} /> ড্যাশবোর্ডে ফিরে যান
        </Link>

        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 font-bangla">
              প্রোডাক্ট বিস্তারিত
            </h1>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-bangla ${
              product.is_approved 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
            }`}>
              {product.is_approved ? '✓ অনুমোদিত' : '⏳ অপেক্ষমাণ'}
            </span>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard?edit=${product.id}`}>
              <Button variant="outline" size="sm" icon={faEdit} className="active:scale-95">এডিট</Button>
            </Link>
            <Button variant="outline" size="sm" icon={faTrash} onClick={() => setShowDeleteConfirm(true)} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 active:scale-95">
              ডিলিট
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Preview Image */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <ImageWithLoader
                src={product.preview_url || ''}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 font-bangla leading-snug">
              {product.title}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <FontAwesomeIcon icon={faTag} className="text-indigo-500" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">ক্যাটাগরি</p>
                  <p className="font-semibold text-slate-900 dark:text-white font-bangla">{product.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <FontAwesomeIcon icon={faDownload} className="text-emerald-500" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">মোট ডাউনলোড</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{product.download_count || 0} বার</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <FontAwesomeIcon icon={faCalendar} className="text-purple-500" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">যোগ করার তারিখ</p>
                  <p className="font-semibold text-slate-900 dark:text-white font-bangla">
                    {new Date(product.created_at).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-bangla">দাম</p>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ৳{product.price}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mt-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-bangla">
            বিস্তারিত বিবরণ
          </h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-bangla">
            {product.description || 'কোনো বিবরণ দেওয়া হয়নি।'}
          </p>
        </div>

        {/* File Link */}
        {product.file_url && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mt-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 font-bangla">
              আপলোড করা ফাইল
            </h3>
            <a 
              href={product.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95 font-bangla"
            >
              <FontAwesomeIcon icon={faEye} /> ফাইলটি দেখুন/ডাউনলোড করুন
            </a>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="প্রোডাক্ট মুছে ফেলুন" type="error" size="sm">
        <p className="text-slate-700 dark:text-slate-300 text-center mb-6 font-bangla">
          আপনি কি নিশ্চিত যে আপনি এই প্রোডাক্টটি স্থায়ীভাবে মুছে ফেলতে চান?
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setShowDeleteConfirm(false)} className="active:scale-95">না, রাখুন</Button>
          <Button variant="primary" fullWidth onClick={handleDelete} loading={isDeleting} className="bg-red-600 hover:bg-red-700 active:scale-95">হ্যাঁ, মুছে ফেলুন</Button>
        </div>
      </Modal>

      <Modal isOpen={feedback.isOpen} onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} title={feedback.type === 'success' ? 'সফল!' : 'ত্রুটি!'} type={feedback.type} size="sm">
        <p className="text-slate-700 dark:text-slate-300 text-center font-bangla">{feedback.message}</p>
      </Modal>
    </div>
  );
}