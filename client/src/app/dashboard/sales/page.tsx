'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faWallet, 
  faClock, 
  faCheckCircle, 
  faSpinner,
  faUsers,
  faCalendar,
  faMagnifyingGlass,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="প্রোডাক্ট, ক্রেতা বা স্ট্যাটাস দিয়ে সার্চ করুন..." 
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

export default function SalesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingWithdrawal: 0,
    totalWithdrawn: 0,
    totalSales: 0
  });

  // 🔥 সার্চ ও পেজিনেশন স্টেট
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchSales = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const { data: myProducts } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', user.id);

        const myProductIds = myProducts?.map(p => p.id) || [];
        let validSales = [];
        let totalEarnings = 0;
        let totalSalesCount = 0;

        if (myProductIds.length > 0) {
          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              products:product_id (title, price, preview_url, seller_id),
              profiles:buyer_id (name, email)
            `)
            .in('product_id', myProductIds)
            .order('created_at', { ascending: false });

          if (!error && data) {
            validSales = data.filter(sale => sale.buyer_id !== user.id);
            totalSalesCount = validSales.length;
            
            totalEarnings = validSales
              .filter(s => s.status === 'completed')
              .reduce((acc, curr) => acc + parseFloat(curr.seller_earning || 0), 0);
          }
        }

        setSales(validSales);

        const { data: withdrawalData } = await supabase
          .from('withdrawals')
          .select('amount, status')
          .eq('seller_id', user.id);

        const pendingWithdrawal = withdrawalData
          ?.filter(w => w.status === 'pending')
          .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0) || 0;

        const totalWithdrawn = withdrawalData
          ?.filter(w => w.status === 'approved')
          .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0) || 0;

        setStats({
          totalEarnings,
          pendingWithdrawal,
          totalWithdrawn,
          totalSales: totalSalesCount
        });

      } catch (error) {
        console.error("Fetch sales error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [user]);

  // 🔥 ফিল্টারিং এবং পেজিনেশন লজিক
  const filteredSales = sales.filter(sale => 
    sale.products?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-bangla">বিক্রির তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 font-bangla">
            আমার বিক্রির হিস্টরি
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-bangla">
            আপনার সকল বিক্রি, আয় এবং উইথড্র-এর বিস্তারিত তথ্য
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <FontAwesomeIcon icon={faWallet} className="text-2xl text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-bangla">মোট আয়</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">৳{stats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="text-2xl text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-bangla">পেন্ডিং উইথড্র</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">৳{stats.pendingWithdrawal.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-bangla">মোট উত্তোলিত</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">৳{stats.totalWithdrawn.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-bangla">মোট বিক্রি</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalSales} টি</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales List Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-bangla">সাম্প্রতিক বিক্রি</h2>

          {/* 🔥 সার্চ ও পেজিনেশন সবার উপরে রাখা হয়েছে */}
          <SearchAndPagination 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* 🔥 কন্ডিশনাল রেন্ডারিং: সার্চ রেজাল্ট ০ হলেও সার্চ বক্স দেখা যাবে */}
          {paginatedSales.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} className="text-2xl text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-bangla">
                {sales.length === 0 ? 'কোনো বিক্রি নেই' : 'কোনো ম্যাচিং বিক্রি পাওয়া যায়নি'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-bangla">
                {sales.length === 0 
                  ? 'আপনি এখনও কোনো প্রোডাক্ট বিক্রি করেননি।' 
                  : 'আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedSales.map((sale) => (
                <div key={sale.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4">
                  {sale.products?.preview_url && (
                    <img 
                      src={sale.products.preview_url} 
                      alt={sale.products.title}
                      className="w-full sm:w-24 h-24 object-cover rounded-xl flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-bangla truncate" title={sale.products?.title}>
                      {sale.products?.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm mb-3">
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg font-semibold font-bangla">
                        ৳{sale.products?.price}
                      </span>
                      <span className={`px-3 py-1 rounded-lg font-semibold font-bangla ${
                        sale.status === 'completed' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : sale.status === 'pending_verification'
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}>
                        {sale.status === 'completed' ? 'সম্পন্ন' : sale.status === 'pending_verification' ? 'যাচাই হচ্ছে' : 'বাতিল'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faUsers} className="text-xs" />
                        <span className="font-bangla truncate max-w-[150px] sm:max-w-none" title={sale.profiles?.name}>
                          ক্রেতা: {sale.profiles?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                        <span className="font-bangla">
                          {new Date(sale.created_at).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-center flex-shrink-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla mb-1">আপনার আয়</p>
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      ৳{parseFloat(sale.seller_earning || 0).toFixed(2)}
                    </p>
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