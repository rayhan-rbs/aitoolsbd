'use client';

import ImageWithLoader from '@/components/ui/ImageWithLoader';
import Skeleton from '@/components/ui/Skeleton'; // 🔥 Skeleton ইম্পোর্ট করা হয়েছে
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxOpen, 
  faDownload, 
  faSpinner, 
  faCalendar, 
  faClock, 
  faCheckCircle, 
  faExclamationTriangle,
  faHourglassHalf,
  faTimesCircle,
  faReceipt,
  faMagnifyingGlass,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Link from 'next/link';

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
          placeholder="প্রোডাক্ট, ক্যাটাগরি বা স্ট্যাটাস দিয়ে সার্চ করুন..." 
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

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 সার্চ ও পেজিনেশন স্টেট
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products:product_id (title, price, preview_url, file_url, category, download_count)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  // 🔥 ফিল্টারিং এবং পেজিনেশন লজিক
  const filteredOrders = orders.filter(order => 
    order.products?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.products?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.payment_method?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDownload = async (order: any) => {
    if (!order.products?.file_url || order.status !== 'completed') return;
    
    const newCount = (order.current_downloads || 0) + 1;
    
    try {
      await supabase.from('orders').update({ current_downloads: newCount }).eq('id', order.id);
      await supabase.from('products').update({ download_count: (order.products.download_count || 0) + 1 }).eq('id', order.product_id);
      
      setOrders(prev => prev.map(o => 
        o.id === order.id 
          ? { 
              ...o, 
              current_downloads: newCount,
              products: { ...o.products, download_count: (o.products.download_count || 0) + 1 }
            } 
          : o
      ));
      
      window.open(order.products.file_url, '_blank');
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const isLinkValid = (order: any) => {
    if (order.status !== 'completed') return false;
    const isTimeValid = new Date(order.link_expires_at) > new Date();
    const isLimitValid = (order.current_downloads || 0) < (order.max_downloads || 3);
    return isTimeValid && isLimitValid;
  };

  const formatExpiry = (expiresAt: string) => {
    return new Date(expiresAt).toLocaleString('bn-BD', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  };

  const getPaymentBadge = (method: string) => {
    const m = method.toLowerCase();
    if (m === 'bkash') return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800';
    if (m === 'nagad') return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
    if (m === 'rocket') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    if (m === 'paypal') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold font-bangla border border-emerald-200 dark:border-emerald-800">
            <FontAwesomeIcon icon={faCheckCircle} className="w-3.5" />
            সম্পন্ন
          </span>
        );
      case 'pending_verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold font-bangla border border-amber-200 dark:border-amber-800">
            <FontAwesomeIcon icon={faHourglassHalf} className="w-3.5 animate-pulse" />
            যাচাই হচ্ছে
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold font-bangla border border-red-200 dark:border-red-800">
            <FontAwesomeIcon icon={faTimesCircle} className="w-3.5" />
            বাতিল
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-full text-xs font-bold font-bangla border border-slate-200 dark:border-slate-700">
            {status}
          </span>
        );
    }
  };

  // 🔥 স্মার্ট Skeleton Loading UI (স্পিনারের বদলে পুরো লেআউটের ছায়া দেখাবে)
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="w-64 h-8" />
              <Skeleton className="w-96 h-4" />
            </div>
            <Skeleton className="w-40 h-10" />
          </div>

          {/* List Container Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            {/* Search & Pagination Skeleton */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <Skeleton className="w-full sm:w-80 h-10" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-9 h-9" />
                <Skeleton className="w-24 h-9" />
                <Skeleton className="w-9 h-9" />
              </div>
            </div>

            {/* Order Cards Skeleton (৩টি ডামি কার্ড দেখাবে) */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col lg:flex-row gap-6 items-start">
                  {/* Image Skeleton */}
                  <Skeleton className="w-full lg:w-40 h-40 rounded-xl flex-shrink-0" />
                  
                  {/* Info Skeleton */}
                  <div className="flex-1 min-w-0 space-y-4 w-full">
                    <div className="flex justify-between">
                      <Skeleton className="w-3/4 h-6" />
                      <Skeleton className="w-24 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="w-20 h-6" />
                      <Skeleton className="w-16 h-6" />
                      <Skeleton className="w-24 h-6" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="w-16 h-3" />
                          <Skeleton className="w-24 h-4" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="w-16 h-3" />
                          <Skeleton className="w-24 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button Skeleton */}
                  <div className="w-full lg:w-auto flex-shrink-0">
                    <Skeleton className="w-full lg:w-32 h-10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 font-bangla">
              আমার কেনা প্রোডাক্ট
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-bangla">
              আপনার কেনা সকল প্রোডাক্ট এখান থেকে নিরাপদে ডাউনলোড করুন
            </p>
          </div>
          <Link href="/products" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2 transition-colors font-bangla active:scale-95">
            <FontAwesomeIcon icon={faBoxOpen} className="text-sm" />
            নতুন প্রোডাক্ট খুঁজুন
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FontAwesomeIcon icon={faReceipt} className="text-3xl text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-bangla">আপনার কোনো অর্ডার নেই</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-bangla max-w-md mx-auto">
              আপনি এখনও কোনো প্রোডাক্ট কিনেননি। আমাদের প্রিমিয়াম কালেকশন থেকে আপনার পছন্দের টুলটি বেছে নিন।
            </p>
            <Link href="/products">
              <Button variant="primary" size="md" className="active:scale-95">প্রোডাক্ট ব্রাউজ করুন</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            
            {/* 🔥 সার্চ ও পেজিনেশন সবার উপরে রাখা হয়েছে */}
            <SearchAndPagination 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />

            {/* 🔥 কন্ডিশনাল রেন্ডারিং: সার্চ রেজাল্ট ০ হলেও সার্চ বক্স দেখা যাবে */}
            {paginatedOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <FontAwesomeIcon icon={faReceipt} className="text-2xl text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-bangla">কোনো ম্যাচিং অর্ডার পাওয়া যায়নি</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bangla">আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।</p>
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedOrders.map((order) => {
                  const isValid = isLinkValid(order);
                  
                  return (
                    <div 
                      key={order.id} 
                      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                        order.status === 'cancelled' 
                          ? 'border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10' 
                          : order.status === 'pending_verification'
                          ? 'border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row gap-6 items-start">
                        
                        {/* ১. ইমেজ সেকশন (ImageWithLoader ইতিমধ্যেই Preloader সাপোর্ট করে) */}
                        <div className="w-full lg:w-40 flex-shrink-0">
                          <ImageWithLoader
                            src={order.products?.preview_url || ''}
                            alt={order.products?.title || 'Product'}
                            className="w-full h-40 object-cover rounded-xl border border-slate-100 dark:border-slate-700"
                          />
                        </div>

                        {/* ২. ইনফরমেশন সেকশন */}
                        <div className="flex-1 min-w-0 space-y-4 w-full">
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bangla leading-snug truncate" title={order.products?.title}>
                                {order.products?.title}
                              </h3>
                              <div className="flex-shrink-0">
                                {renderStatusBadge(order.status)}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold font-bangla border border-indigo-100 dark:border-indigo-800">
                                {order.products?.category}
                              </span>
                              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                                ৳{order.products?.price}
                              </span>
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold border capitalize font-bangla ${getPaymentBadge(order.payment_method)}`}>
                                {order.payment_method === 'bkash' ? 'bKash' : order.payment_method === 'nagad' ? 'Nagad' : order.payment_method === 'rocket' ? 'Rocket' : order.payment_method === 'paypal' ? 'PayPal' : order.payment_method}
                              </span>
                            </div>
                          </div>

                          {/* ডিটেইলড ইনফো গ্রিড */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 flex-shrink-0">
                                <FontAwesomeIcon icon={faCalendar} className="text-slate-500 dark:text-slate-400 w-4" />
                              </div>
                              <div>
                                <span className="block text-xs text-slate-500 dark:text-slate-400 font-bangla">ক্রয়ের তারিখ</span>
                                <span className="font-bold text-slate-900 dark:text-white font-bangla">
                                  {new Date(order.created_at).toLocaleDateString('bn-BD')}
                                </span>
                              </div>
                            </div>
                            
                            {order.status === 'completed' && (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 flex-shrink-0">
                                    <FontAwesomeIcon icon={faClock} className="text-slate-500 dark:text-slate-400 w-4" />
                                  </div>
                                  <div>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-bangla">মেয়াদ শেষ</span>
                                    <span className={`font-bold font-bangla ${isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {formatExpiry(order.link_expires_at)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 sm:col-span-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 flex-shrink-0">
                                    <FontAwesomeIcon icon={isValid ? faCheckCircle : faExclamationTriangle} className={isValid ? 'text-emerald-500 w-4' : 'text-amber-500 w-4'} />
                                  </div>
                                  <span className="text-slate-700 dark:text-slate-300 font-bangla">
                                    ডাউনলোড সীমা: <span className="font-black text-slate-900 dark:text-white">{order.current_downloads || 0}</span> / {order.max_downloads || 3} বার ব্যবহৃত
                                  </span>
                                </div>
                              </>
                            )}

                            {order.status === 'pending_verification' && (
                              <div className="flex items-start gap-3 sm:col-span-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                  <FontAwesomeIcon icon={faHourglassHalf} className="text-amber-600 dark:text-amber-400 w-4 animate-pulse" />
                                </div>
                                <span className="text-amber-800 dark:text-amber-300 font-bangla text-sm leading-relaxed">
                                  অ্যাডমিন আপনার পেমেন্ট যাচাই করার পর ডাউনলোড লিংক সক্রিয় হবে। সাধারণত এটি ২৪ ঘন্টার মধ্যে সম্পন্ন হয়।
                                </span>
                              </div>
                            )}

                            {order.status === 'cancelled' && (
                              <div className="flex items-start gap-3 sm:col-span-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                  <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 dark:text-red-400 w-4" />
                                </div>
                                <span className="text-red-800 dark:text-red-300 font-bangla text-sm leading-relaxed">
                                  এই অর্ডারটি বাতিল করা হয়েছে। পেমেন্ট যাচাই করা হয়নি বা TrxID ভুল ছিল। প্রয়োজনে সাপোর্টে যোগাযোগ করুন।
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ৩. অ্যাকশন বাটন সেকশন */}
                        <div className="flex flex-row sm:flex-col lg:flex-col gap-3 w-full lg:w-auto flex-shrink-0 lg:pt-2">
                          {order.status === 'completed' && (
                            <>
                              <Button
                                variant={isValid ? "primary" : "outline"}
                                size="md"
                                icon={faDownload}
                                onClick={() => isValid && handleDownload(order)}
                                disabled={!isValid}
                                className={`flex-1 sm:flex-none justify-center font-bold active:scale-95 ${isValid ? 'shadow-lg shadow-indigo-500/20' : ''}`}
                              >
                                {isValid ? 'ডাউনলোড' : 'মেয়াদ শেষ'}
                              </Button>
                              
                              {!isValid && (
                                <p className="text-xs text-red-500 text-center sm:text-right font-bangla px-2 font-medium">
                                  লিংকটি আর সক্রিয় নেই
                                </p>
                              )}
                            </>
                          )}

                          {order.status === 'pending_verification' && (
                            <div className="flex-1 sm:flex-none w-full">
                              <Button
                                variant="outline"
                                size="md"
                                icon={faHourglassHalf}
                                disabled
                                className="flex-1 justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 font-bold w-full"
                              >
                                যাচাই অপেক্ষায়
                              </Button>
                            </div>
                          )}

                          {order.status === 'cancelled' && (
                            <div className="flex-1 sm:flex-none w-full">
                              <Button
                                variant="outline"
                                size="md"
                                icon={faTimesCircle}
                                disabled
                                className="flex-1 justify-center bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 font-bold w-full"
                              >
                                বাতিল
                              </Button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}