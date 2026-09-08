'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, faShoppingBag, faSpinner, faArrowLeft, 
  faMagnifyingGlass, faChevronLeft, faChevronRight 
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import ImageWithLoader from '@/components/ui/ImageWithLoader';
import Skeleton from '@/components/ui/Skeleton'; // 🔥 Skeleton ইম্পোর্ট করা হয়েছে

export const dynamic = 'force-dynamic';

// 🔥 রিউজেবল সার্চ ও পেজিনেশন কম্পোনেন্ট
interface SearchAndPaginationProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

function SearchAndPagination({ searchQuery, setSearchQuery, totalPages, currentPage, onPageChange }: SearchAndPaginationProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="relative w-full sm:w-80">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="প্রোডাক্টের নাম দিয়ে সার্চ করুন..." 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); onPageChange(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bangla text-sm transition-all"
        />
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400 font-bangla px-2">
            পৃষ্ঠা {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function BuyerDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  // 🔥 Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchBuyerData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select(`
            *,
            products:product_id (id, title, preview_url, price, category, file_url)
          `)
          .eq('buyer_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (!error && ordersData) {
          setPurchasedProducts(ordersData);
          const spent = ordersData.reduce((acc, curr) => acc + Number(curr.final_amount || curr.amount), 0);
          setTotalSpent(spent);
        }
      } catch (error) {
        console.error('Fetch buyer data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerData();
  }, [user]);

  // 🔥 Filtering and Pagination Logic
  const filteredProducts = purchasedProducts.filter(order => 
    order.products?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🔥 স্মুথ Skeleton Loading UI (স্পিনারের বদলে)
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-48 h-8" />
              <Skeleton className="w-64 h-4" />
            </div>
          </div>
          
          {/* Stats Card Skeleton */}
          <Skeleton className="w-full h-32 rounded-2xl" />
          
          {/* List Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <Skeleton className="w-64 h-6 mb-6" />
            <div className="mb-6 flex justify-between">
              <Skeleton className="w-80 h-10" />
              <Skeleton className="w-32 h-10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <Skeleton className="w-full h-5" />
                    <Skeleton className="w-32 h-4" />
                    <div className="flex justify-between pt-4">
                      <Skeleton className="w-20 h-6" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-bangla">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors active:scale-95">
            <FontAwesomeIcon icon={faArrowLeft} className="text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">ক্রেতা ড্যাশবোর্ড</h1>
            <p className="text-slate-600 dark:text-slate-400">আপনার কেনাকাটা এবং খরচের বিবরণ</p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faWallet} className="text-2xl" />
            </div>
            <div>
              <p className="text-indigo-100 text-sm font-medium">মোট খরচ (আজ পর্যন্ত)</p>
              <p className="text-3xl font-black">৳{totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Purchased Products List with Search & Pagination */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FontAwesomeIcon icon={faShoppingBag} className="text-indigo-500" />
            আপনার কেনা প্রোডাক্টসমূহ
          </h2>

          <SearchAndPagination 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {paginatedProducts.length === 0 ? (
            <div className="p-12 text-center">
              <FontAwesomeIcon icon={faShoppingBag} className="text-4xl text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {purchasedProducts.length === 0 ? 'আপনি এখনও কিছু কেনেননি' : 'কোনো ম্যাচিং প্রোডাক্ট পাওয়া যায়নি'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {purchasedProducts.length === 0 ? 'আমাদের প্রিমিয়াম কালেকশন থেকে আপনার পছন্দের টুলটি বেছে নিন।' : 'আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।'}
              </p>
              {purchasedProducts.length === 0 && (
                <Link href="/products">
                  <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all active:scale-95">
                    প্রোডাক্ট ব্রাউজ করুন
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedProducts.map((order) => (
                <div key={order.id} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex gap-4 hover:shadow-md transition-all hover:-translate-y-0.5">
                  {/* 🔥 এখানে ImageWithLoader ব্যবহার করা হয়েছে যাতে Preloader কাজ করে */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <ImageWithLoader 
                      src={order.products?.preview_url || ''} 
                      alt={order.products?.title || 'Product'} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1" title={order.products?.title}>
                        {order.products?.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        ক্রয়ের তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                        ৳{Number(order.final_amount || order.amount).toFixed(2)}
                      </span>
                      <Link href={`/products/${order.product_id}`} className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
                        বিস্তারিত দেখুন <FontAwesomeIcon icon={faArrowLeft} className="rotate-180 text-[10px]" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}