'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faTrash, 
  faSpinner, 
  faShoppingCart,
  faStar,
  faDownload,
  faSearch,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import ImageWithLoader from '@/components/ui/ImageWithLoader';

// 🔥 রিউজেবল সার্চ ও পেজিনেশন কম্পোনেন্ট (মেইন ফাংশনের বাইরে, যাতে ফোকাস লস না হয়)
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
        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="প্রোডাক্টের নাম বা ক্যাটাগরি দিয়ে সার্চ করুন..." 
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

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // 🔥 Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // প্রতি পেজে ৬টি প্রোডাক্ট দেখাবে

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('wishlists')
          .select(`
            *,
            products:product_id (id, title, price, preview_url, category, download_count, average_rating)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setWishlist(data);
        }
      } catch (error) {
        console.error('Fetch wishlist error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    if (!user) return;
    setRemovingId(wishlistId);

    try {
      await supabase.from('wishlists').delete().eq('id', wishlistId);
      setWishlist(prev => prev.filter(w => w.id !== wishlistId));
    } catch (error) {
      console.error('Remove error:', error);
    } finally {
      setRemovingId(null);
    }
  };

  // 🔥 ফিল্টারিং এবং পেজিনেশন লজিক
  const filteredWishlist = wishlist.filter(item => 
    item.products?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.products?.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWishlist.length / itemsPerPage) || 1;
  const paginatedWishlist = filteredWishlist.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-bangla">Wishlist লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-bangla">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
            আমার Wishlist ❤️
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            আপনি যে প্রোডাক্টগুলো পরে কিনতে চান
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faHeart} className="text-3xl text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">আপনার wishlist খালি</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              আপনি এখনও কোনো প্রোডাক্ট wishlist-এ যোগ করেননি। আমাদের প্রিমিয়াম কালেকশন থেকে পছন্দের প্রোডাক্ট সেভ করুন।
            </p>
            <Link href="/products">
              <Button variant="primary" size="md" icon={faShoppingCart}>প্রোডাক্ট ব্রাউজ করুন</Button>
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
            {paginatedWishlist.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <FontAwesomeIcon icon={faSearch} className="text-2xl text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-bangla">কোনো ম্যাচিং প্রোডাক্ট পাওয়া যায়নি</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bangla">আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedWishlist.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <Link href={`/products/${item.products.id}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <ImageWithLoader
                          src={item.products.preview_url || ''}
                          alt={item.products.title}
                          className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-xs font-bold text-indigo-700 dark:text-indigo-300 rounded-full shadow-sm">
                            {item.products.category}
                          </span>
                        </div>
                        {item.products.average_rating > 0 && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-yellow-400/90 backdrop-blur-md text-slate-900 rounded-full shadow-sm text-xs font-bold">
                            <FontAwesomeIcon icon={faStar} className="text-slate-900 text-[10px]" />
                            {item.products.average_rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-5">
                      <Link href={`/products/${item.products.id}`}>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 leading-snug text-base min-h-[3rem]">
                          {item.products.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                          <FontAwesomeIcon icon={faDownload} className="text-indigo-500 dark:text-indigo-400" />
                          <span className="font-bold text-slate-700 dark:text-slate-300">{item.products.download_count || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          ৳{item.products.price}
                        </span>
                        <button 
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          disabled={removingId === item.id}
                          className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center transition-all disabled:opacity-50"
                          title="Wishlist থেকে মুছুন"
                        >
                          <FontAwesomeIcon icon={removingId === item.id ? faSpinner : faTrash} className={removingId === item.id ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}