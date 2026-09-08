'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, faFilter, faArrowRight, faDownload, faStar, 
  faChevronLeft, faChevronRight, faRotateLeft, faTag, faMoneyBillWave,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import ImageWithLoader from '@/components/ui/ImageWithLoader';
import Button from '@/components/ui/Button';

const categories = ['All', 'AI Prompt', 'Canva Template', 'WordPress Plugin', 'AI Automation', 'ChatGPT Tools', 'Gemini Tools', 'Excel Automation', 'PHP Script', 'AI Agent'];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 🔥 State Management (URL থেকে ভ্যালু নিয়ে আসা)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔥 প্রতি পেজে ৯টি করে প্রোডাক্ট
  const itemsPerPage = 9;

  // 🔥 ফিল্টার প্রয়োগ করার ফাংশন (URL আপডেট করবে)
  const applyFilters = (page: number = 1) => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (page > 1) params.set('page', page.toString());
    
    router.push(`/products?${params.toString()}`);
  };

  // 🔥 ডেটা ফেচিং লজিক
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('is_approved', true)
          .eq('is_deleted', false);

        // ১. সার্চ ফিল্টার (Case-insensitive)
        if (searchQuery.trim()) {
          query = query.ilike('title', `%${searchQuery.trim()}%`);
        }

        // ২. ক্যাটাগরি ফিল্টার
        if (selectedCategory !== 'All') {
          query = query.eq('category', selectedCategory);
        }

        // ৩. প্রাইস রেঞ্জ ফিল্টার
        if (minPrice) {
          query = query.gte('price', Number(minPrice));
        }
        if (maxPrice) {
          query = query.lte('price', Number(maxPrice));
        }

        // ৪. পেজিনেশন এবং সর্টিং
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data, count, error } = await query
          .range(from, to)
          .order('created_at', { ascending: false });

        if (!error) {
          setProducts(data || []);
          setTotalCount(count || 0);
        } else {
          console.error('Supabase fetch error:', error);
        }
      } catch (error) {
        console.error('Fetch products error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
    router.push('/products');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-bangla">
      <div className="max-w-7xl mx-auto">
        
        {/* ================= 🔥 ১. বড় সার্চ বার (উপরে) ================= */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 text-center">
            {searchQuery ? `"${searchQuery}" এর ফলাফল` : 'সকল প্রোডাক্ট'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
            মোট {totalCount} টি প্রোডাক্ট পাওয়া গেছে
          </p>

          {/* 🔥 বড় সার্চ বার */}
          <form onSubmit={(e) => { e.preventDefault(); applyFilters(1); }} className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 text-xl group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আপনি কী খুঁজছেন? (যেমন: ChatGPT Prompt, Canva Template...)" 
              className="w-full pl-16 pr-32 py-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-indigo-500/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg"
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/30"
            >
              সার্চ করুন <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </button>
          </form>
        </div>

        {/* ================= 🔥 ২. ক্যাটাগরি ট্যাব (সার্চ বারের নিচে) ================= */}
        <div className="mb-10 overflow-x-auto pb-2">
          <div className="flex items-center justify-center gap-3 min-w-max px-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setTimeout(() => applyFilters(1), 50); }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border-2 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ================= ৩. মেইন কন্টেন্ট (সাইডবার + গ্রিড) ================= */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ================= LEFT SIDEBAR FILTERS ================= */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faFilter} className="text-indigo-500" /> ফিল্টার
                </h3>
                <button onClick={handleReset} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" /> রিসেট
                </button>
              </div>

              {/* 🔥 ক্যাটাগরি <select> ড্রপডাউন */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTag} className="text-indigo-500 text-xs" /> ক্যাটাগরি
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setTimeout(() => applyFilters(1), 50); }}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none cursor-pointer transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 my-6" />

              {/* 🔥 প্রাইস রেঞ্জ ফিল্টার */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-indigo-500 text-xs" /> মূল্য সীমা (৳)
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="সর্বনিম্ন" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                  />
                  <span className="text-slate-400">-</span>
                  <input 
                    type="number" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="সর্বোচ্চ" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <button onClick={() => applyFilters(1)} className="w-full mt-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  প্রাইস ফিল্টার প্রয়োগ করুন
                </button>
              </div>
            </div>
          </aside>

          {/* ================= RIGHT SIDE PRODUCTS GRID ================= */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-2xl p-4 animate-pulse h-80"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <FontAwesomeIcon icon={faRocket} className="text-5xl text-slate-300 dark:text-slate-600 mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">আপনার দেওয়া ফিল্টার অনুযায়ী কোনো প্রোডাক্ট নেই। দয়া করে ফিল্টার পরিবর্তন করুন।</p>
                <Button variant="primary" size="md" onClick={handleReset} icon={faRotateLeft}>সব ফিল্টার মুছে ফেলুন</Button>
              </div>
            ) : (
              <>
                {/* 🔥 ৯টি প্রোডাক্ট দেখানোর জন্য ৩ কলামের গ্রিড */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                  {products.map((product) => (
                    <Link 
                      href={`/products/${product.id}`}
                      key={product.id} 
                      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <ImageWithLoader src={product.preview_url || ''} alt={product.title} className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105" />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-xs font-bold text-indigo-700 dark:text-indigo-300 rounded-full shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                            {product.category}
                          </span>
                        </div>
                        {product.average_rating > 0 && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-yellow-400/90 backdrop-blur-md text-slate-900 rounded-full shadow-sm text-xs font-bold">
                            <FontAwesomeIcon icon={faStar} className="text-slate-900 text-[10px]" />
                            {Number(product.average_rating).toFixed(1)}
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 leading-snug text-base min-h-[3rem]">
                          {product.title}
                        </h3>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                            <FontAwesomeIcon icon={faDownload} className="text-indigo-500 dark:text-indigo-400" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">{product.download_count || 0} বিক্রি</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xl font-black text-slate-900 dark:text-white">৳{product.price}</span>
                          <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                            বিস্তারিত <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* ================= PAGINATION ================= */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => { const newPage = currentPage - 1; setCurrentPage(newPage); applyFilters(newPage); }}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => { setCurrentPage(page); applyFilters(page); }}
                        className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button 
                      onClick={() => { const newPage = currentPage + 1; setCurrentPage(newPage); applyFilters(newPage); }}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}