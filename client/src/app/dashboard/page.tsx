'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, faShoppingBag, faChartLine, faBox, faPlus, 
  faEdit, faTrash, faEye, faSpinner, faTimes, faSave, faUpload, faPaperPlane,
  faMagnifyingGlass, faChevronLeft, faChevronRight, faHeart, faGift
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const categories = [
  'AI Prompt', 'AI Template', 'AI Automation', 'ChatGPT Tools', 
  'Gemini Tools', 'Canva Template', 'Excel Automation', 
  'PHP Script', 'WordPress Plugin', 'AI Agent'
];

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
          placeholder="সার্চ করুন..." 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); onPageChange(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bangla text-sm transition-all"
        />
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all">
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400 font-bangla px-2">পৃষ্ঠা {currentPage} / {totalPages}</span>
          <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all">
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const [dataLoading, setDataLoading] = useState(true);
  
  // 🔥 এখানে stats এবং setStats শুধুমাত্র একবারই ডিক্লেয়ার করা হয়েছে
  const [stats, setStats] = useState({ 
    totalSales: 0, 
    totalRevenue: 0, 
    productsListed: 0, 
    walletBalance: 0,
    affiliateBalance: 0,
    referralCode: ''
  });

  const [products, setProducts] = useState<any[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', payment_method: 'bkash', payment_number: '' });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', price: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');

  const [requestUpdateProduct, setRequestUpdateProduct] = useState<any>(null);
  const [updateReason, setUpdateReason] = useState('');
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [withdrawalSearch, setWithdrawalSearch] = useState('');
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && products.length > 0) {
      const productToEdit = products.find(p => p.id === editId);
      if (productToEdit) {
        openEditModal(productToEdit);
        router.replace('/dashboard', { scroll: false });
      }
    }
  }, [searchParams, products, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setDataLoading(true);

      try {
        // ১. প্রোফাইল ডেটা (রেফারেল ব্যালেন্স ও কোড সহ)
        const { data: profile } = await supabase.from('profiles').select('wallet_balance, name, role, affiliate_balance, referral_code').eq('id', user.id).maybeSingle();
        if (!profile) {
          await supabase.from('profiles').insert({ id: user.id, name: user.user_metadata?.name || 'User', email: user.email, wallet_balance: 0, role: 'seller' });
        }

        // রেফারেল কোড জেনারেট করা যদি না থাকে
        let finalReferralCode = profile?.referral_code;
        if (!finalReferralCode && user) {
          finalReferralCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
          await supabase.from('profiles').update({ referral_code: finalReferralCode }).eq('id', user.id);
        }

        // ২. প্রোডাক্ট ডেটা
        const { data: productsData } = await supabase
          .from('products')
          .select('id, title, price, description, category, preview_url, download_count, is_approved, created_at, is_deleted')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        const allProducts = productsData || [];
        const activeProducts = allProducts.filter(p => p.is_deleted !== true);

        let validSalesCount = 0;
        let actualRevenue = 0;

        // ৩. অর্ডার ডেটা
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, buyer_id, seller_earning, status, current_downloads, product_id')
          .eq('seller_id', user.id);

        if (ordersData) {
          const validOrders = ordersData.filter(order => order.buyer_id !== user.id && order.status === 'completed');
          validSalesCount = validOrders.length;
          actualRevenue = validOrders.reduce((acc, curr) => acc + parseFloat(curr.seller_earning || 0), 0);
        }

        const productsWithRealDownloads = await Promise.all(
          activeProducts.map(async (product) => {
            const { data: validOrders } = await supabase
              .from('orders')
              .select('id, current_downloads')
              .eq('product_id', product.id)
              .eq('status', 'completed')
              .neq('buyer_id', user.id);
            
            const realDownloadCount = validOrders?.reduce((acc, curr) => acc + (curr.current_downloads || 0), 0) || 0;
            return { ...product, real_download_count: realDownloadCount };
          })
        );

        const { data: withdrawalData } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        
        setWithdrawals(withdrawalData || []);

        // ৪. স্ট্যাটস এবং প্রোডাক্ট সেট করা
        setStats({
          totalSales: validSalesCount,
          totalRevenue: actualRevenue,
          productsListed: activeProducts.length,
          walletBalance: profile?.wallet_balance || 0,
          affiliateBalance: profile?.affiliate_balance || 0,
          referralCode: finalReferralCode || ''
        });
        setProducts(productsWithRealDownloads);

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getFilteredAndPaginatedData = (data: any[], searchFields: string[], query: string, page: number) => {
    const filtered = data.filter(item => 
      searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(query.toLowerCase());
      })
    );
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    return { filtered, paginated, totalPages };
  };

  const productsData = getFilteredAndPaginatedData(products, ['title', 'category'], productSearch, productPage);
  const withdrawalsData = getFilteredAndPaginatedData(withdrawals, ['payment_method', 'payment_number', 'status'], withdrawalSearch, withdrawalPage);

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditForm({ title: product.title, description: product.description || '', category: product.category, price: product.price.toString() });
    setNewImageFile(null);
    setNewImagePreview('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImageFile(e.target.files[0]);
      setNewImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !user) return;
    setIsProcessing(true);
    try {
      let updatedData: any = { title: editForm.title, description: editForm.description, category: editForm.category, price: parseFloat(editForm.price) };
      if (newImageFile) {
        if (editingProduct.preview_url) {
          const oldFileName = editingProduct.preview_url.split('/').pop();
          if (oldFileName) await supabase.storage.from('products').remove([`${user.id}/${oldFileName}`]);
        }
        const imgExt = newImageFile.name.split('.').pop();
        const imgName = `${user.id}/preview-${Date.now()}.${imgExt}`;
        const { error: imgError } = await supabase.storage.from('products').upload(imgName, newImageFile);
        if (imgError) throw imgError;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(imgName);
        updatedData.preview_url = publicUrl;
      }
      const { error } = await supabase.from('products').update(updatedData).eq('id', editingProduct.id);
      if (error) throw error;
      setFeedback({ isOpen: true, type: 'success', message: 'প্রোডাক্ট সফলভাবে আপডেট হয়েছে!' });
      setEditingProduct(null);
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updatedData } : p));
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'আপডেট ব্যর্থ হয়েছে।' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct || !user) return;
    setIsProcessing(true);
    try {
      const { error: dbError } = await supabase.from('products').update({ is_deleted: true }).eq('id', deletingProduct.id);
      if (dbError) throw dbError;
      setFeedback({ isOpen: true, type: 'success', message: 'প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে।' });
      setDeletingProduct(null);
      setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      setStats(prev => ({ ...prev, productsListed: prev.productsListed - 1 }));
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'ডিলিট ব্যর্থ হয়েছে।' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsProcessing(true);
    try {
      const amount = parseFloat(withdrawForm.amount);
      if (amount > stats.walletBalance) {
        setFeedback({ isOpen: true, type: 'error', message: 'অপর্যাপ্ত ব্যালেন্স!' });
        setIsProcessing(false); return;
      }
      if (amount < 100) {
        setFeedback({ isOpen: true, type: 'error', message: 'সর্বনিম্ন উইথড্র পরিমাণ ১০০ টাকা।' });
        setIsProcessing(false); return;
      }
      const { error } = await supabase.from('withdrawals').insert({
        seller_id: user.id, amount: amount, payment_method: withdrawForm.payment_method, payment_number: withdrawForm.payment_number, status: 'pending'
      });
      if (error) throw error;
      setFeedback({ isOpen: true, type: 'success', message: 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!' });
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: '', payment_method: 'bkash', payment_number: '' });
      window.location.reload();
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'উইথড্র ব্যর্থ হয়েছে।' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestFileUpdate = async () => {
    if (!requestUpdateProduct || !user || !updateFile || !updateReason.trim()) {
      setFeedback({ isOpen: true, type: 'error', message: 'অনুগ্রহ করে ফাইল এবং কারণ উল্লেখ করুন।' });
      return;
    }
    setIsProcessing(true);
    try {
      const fileExt = updateFile.name.split('.').pop();
      const fileName = `${user.id}/pending-update-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, updateFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
      const { error: dbError } = await supabase.from('product_update_requests').insert({
        product_id: requestUpdateProduct.id, seller_id: user.id, new_file_url: publicUrl, reason: updateReason, status: 'pending'
      });
      if (dbError) throw dbError;
      setFeedback({ isOpen: true, type: 'success', message: 'ফাইল আপডেটের অনুরোধ সফলভাবে পাঠানো হয়েছে।' });
      setRequestUpdateProduct(null);
      setUpdateReason('');
      setUpdateFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'অনুরোধ পাঠাতে ব্যর্থ হয়েছে।' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-bangla">ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
  
  
   <Suspense fallback={<div className="p-10 text-center font-bangla">ড্যাশবোর্ড লোড হচ্ছে...</div>}>
      

    
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 font-bangla">স্বাগতম, {user.user_metadata?.name || 'Seller'}! 👋</h1>
            <p className="text-slate-600 dark:text-slate-400 font-bangla">আপনার ড্যাশবোর্ড থেকে সব কিছু ম্যানেজ করুন</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link href="/dashboard/wishlist" className="flex-1 sm:flex-none">
              <Button variant="outline" size="md" icon={faHeart} fullWidth>আমার Wishlist</Button>
            </Link>
            <Link href="/dashboard/buyer" className="flex-1 sm:flex-none">
              <Button variant="outline" size="md" icon={faShoppingBag} fullWidth>ক্রেতা ড্যাশবোর্ড</Button>
            </Link>
            <Link href="/dashboard/sales" className="flex-1 sm:flex-none">
              <Button variant="outline" size="md" icon={faChartLine} fullWidth>বিক্রির হিস্টরি</Button>
            </Link>
            <Link href="/dashboard/upload" className="flex-1 sm:flex-none">
              <Button variant="primary" size="md" icon={faPlus} fullWidth>নতুন প্রোডাক্ট আপলোড</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={faShoppingBag} title="মোট বিক্রি" value={stats.totalSales.toString()} subtitle="items sold" color="indigo" />
          <StatCard icon={faChartLine} title="মোট আয়" value={`৳${stats.totalRevenue.toFixed(2)}`} subtitle="actual revenue" color="emerald" />
          <StatCard icon={faBox} title="তালিকাভুক্ত প্রোডাক্ট" value={stats.productsListed.toString()} subtitle="active products" color="purple" />
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <FontAwesomeIcon icon={faWallet} className="text-xl text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1 font-bangla">ওয়ালেট ব্যালেন্স</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">৳{stats.walletBalance.toFixed(2)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 font-bangla mb-3">available to withdraw (min: 100Tk)</p>
              <button 
                onClick={() => setShowWithdrawModal(true)}
                disabled={stats.walletBalance < 100}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all font-bangla"
              >
                টাকা তুলুন
              </button>
            </div>
          </div>
        </div>

        {/* 🔥 Referral Program Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl border border-purple-500/30 p-6 text-white shadow-lg mb-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1 font-bangla">রেফারেল প্রোগ্রাম</h3>
              <p className="text-purple-100 text-sm font-bangla">বন্ধুদের ইনভাইট করুন এবং প্রতিটি বিক্রিতে ১০% কমিশন পান!</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faGift} className="text-2xl" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <p className="text-xs text-purple-200 mb-1 font-bangla">আপনার ইউনিক রেফারেল লিংক:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/20 px-3 py-2 rounded-lg text-sm font-mono truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${stats.referralCode}` : 'Loading...'}
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/?ref=${stats.referralCode}`);
                  setFeedback({ isOpen: true, type: 'success', message: 'রেফারেল লিংক কপি হয়েছে!' });
                }}
                className="px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors font-bangla"
              >
                কপি
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/20 pt-4">
            <span className="text-purple-100 text-sm font-bangla">মোট অ্যাফিলিয়েট আয়</span>
            <span className="text-2xl font-black">৳{Number(stats.affiliateBalance).toFixed(2)}</span>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-bangla">আমার প্রোডাক্টসমূহ</h2>
            <Link href="/dashboard/upload" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 text-sm font-bangla">+ নতুন যোগ করুন</Link>
          </div>

          <SearchAndPagination searchQuery={productSearch} setSearchQuery={setProductSearch} totalPages={productsData.totalPages} currentPage={productPage} onPageChange={setProductPage} />

          {productsData.paginated.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><FontAwesomeIcon icon={faBox} className="text-2xl text-slate-400" /></div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-bangla">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।</p>
              {!products.length && (
                <Link href="/dashboard/upload"><Button variant="primary" size="sm" icon={faPlus}>প্রথম প্রোডাক্ট আপলোড করুন</Button></Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">প্রোডাক্ট</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">দাম</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">ডাউনলোড</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">স্ট্যাটাস</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {productsData.paginated.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4"><div className="font-semibold text-slate-900 dark:text-white font-bangla max-w-xs truncate" title={product.title}>{product.title}</div></td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-semibold">৳{product.price}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-semibold">{product.real_download_count || 0}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.is_approved ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'} font-bangla`}>
                          {product.is_approved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/products/${product.id}`} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-all" title="View"><FontAwesomeIcon icon={faEye} className="text-sm" /></Link>
                          <button onClick={() => openEditModal(product)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all" title="Edit"><FontAwesomeIcon icon={faEdit} className="text-sm" /></button>
                          <button onClick={() => setRequestUpdateProduct(product)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-center transition-all" title="Request File Update"><FontAwesomeIcon icon={faUpload} className="text-sm" /></button>
                          <button onClick={() => setDeletingProduct(product)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all" title="Delete"><FontAwesomeIcon icon={faTrash} className="text-sm" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Withdrawal History */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-bangla">উইথড্র হিস্টরি</h2>
          <SearchAndPagination searchQuery={withdrawalSearch} setSearchQuery={setWithdrawalSearch} totalPages={withdrawalsData.totalPages} currentPage={withdrawalPage} onPageChange={setWithdrawalPage} />
          
          {withdrawalsData.paginated.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><FontAwesomeIcon icon={faWallet} className="text-2xl text-slate-400" /></div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-bangla">কোনো উইথড্র রিকোয়েস্ট পাওয়া যায়নি</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">পরিমাণ</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">মাধ্যম</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">নম্বর</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">তারিখ</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {withdrawalsData.paginated.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">৳{parseFloat(w.amount).toFixed(2)}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-bangla capitalize">{w.payment_method}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{w.payment_number}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{new Date(w.created_at).toLocaleDateString('bn-BD')}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold font-bangla ${
                          w.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                          w.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {w.status === 'approved' ? 'অনুমোদিত' : w.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {/* Request File Update Modal */}
      <Modal isOpen={!!requestUpdateProduct} onClose={() => { setRequestUpdateProduct(null); setUpdateReason(''); setUpdateFile(null); }} title="ফাইল আপডেটের অনুরোধ" size="md">
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300 font-bangla"><strong>প্রোডাক্ট:</strong> {requestUpdateProduct?.title}</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-bangla">⚠️ নোট: অ্যাডমিন আপনার অনুরোধ পর্যালোচনা করে অনুমোদন করলেই শুধু ফাইলটি আপডেট হবে।</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">কেন ফাইলটি পরিবর্তন করতে চান? (বিস্তারিত লিখুন)</label>
            <textarea required rows={3} value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none resize-none font-bangla" placeholder="যেমন: PDF-এ একটি টাইপো ঠিক করতে চাই..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">নতুন ফাইল আপলোড করুন</label>
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && setUpdateFile(e.target.files[0])} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => { setRequestUpdateProduct(null); setUpdateReason(''); setUpdateFile(null); }}>বাতিল</Button>
            <Button type="button" variant="primary" fullWidth icon={faPaperPlane} loading={isProcessing} onClick={handleRequestFileUpdate}>অনুরোধ পাঠান</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="প্রোডাক্ট এডিট করুন" size="md">
        <form onSubmit={handleUpdateProduct} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">প্রোডাক্টের নাম</label><input type="text" required value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">ক্যাটাগরি</label><select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla">{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
            <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">দাম (৳)</label><input type="number" required min="0" step="0.01" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">বিবরণ</label><textarea required rows={2} value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none resize-none font-bangla" /></div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">প্রিভিউ ইমেজ (ঐচ্ছিক)</label>
            {editingProduct?.preview_url && !newImagePreview && (<div className="mb-3"><img src={editingProduct.preview_url} alt="Current" className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700" /><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bangla">বর্তমান ইমেজ</p></div>)}
            {newImagePreview && (<div className="mb-3 relative"><img src={newImagePreview} alt="New" className="w-full h-24 object-cover rounded-lg border-2 border-indigo-500" /><button type="button" onClick={() => { setNewImageFile(null); setNewImagePreview(''); if (imageInputRef.current) imageInputRef.current.value = ''; }} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-all shadow-md"><FontAwesomeIcon icon={faTimes} className="text-xs" /></button><p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-bangla">নতুন ইমেজ সিলেক্ট করা হয়েছে</p></div>)}
            <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-bangla"><FontAwesomeIcon icon={faUpload} />{newImagePreview ? 'অন্য ইমেজ সিলেক্ট করুন' : 'নতুন ইমেজ আপলোড করুন'}</button>
          </div>
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setEditingProduct(null)}>বাতিল</Button>
            <Button type="submit" variant="primary" fullWidth icon={faSave} loading={isProcessing}>সেভ করুন</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deletingProduct} onClose={() => setDeletingProduct(null)} title="প্রোডাক্ট মুছে ফেলুন" type="error" size="sm">
        <p className="text-slate-700 dark:text-slate-300 text-center mb-6 font-bangla">আপনি কি নিশ্চিত যে আপনি <strong>"{deletingProduct?.title}"</strong> প্রোডাক্টটি স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setDeletingProduct(null)}>না, রাখুন</Button>
          <Button variant="primary" fullWidth onClick={handleDeleteProduct} loading={isProcessing} className="bg-red-600 hover:bg-red-700">হ্যাঁ, মুছে ফেলুন</Button>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="টাকা উত্তোলন করুন" size="md">
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center border-b border-indigo-200 dark:border-indigo-800 pb-2 mb-2">
              <span className="text-sm text-indigo-800 dark:text-indigo-300 font-bangla">আপনার বর্তমান ব্যালেন্স:</span>
              <span className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100">৳{stats.walletBalance.toFixed(2)}</span>
            </div>
            <ul className="text-xs text-indigo-700 dark:text-indigo-400 space-y-2 font-bangla">
              <li className="flex items-center gap-2"><span>✅</span> সর্বনিম্ন উত্তোলন পরিমাণ: <strong>১০০ টাকা</strong></li>
              <li className="flex items-center gap-2"><span>✅</span> সর্বোচ্চ উত্তোলন পরিমাণ: <strong>আপনার বর্তমান ব্যালেন্স</strong></li>
              <li className="flex items-center gap-2"><span>⏳</span> অ্যাডমিন অনুমোদন ও প্রসেসিং সময়: <strong>২৪ - ৪৮ ঘন্টা</strong></li>
            </ul>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">উত্তোলনের পরিমাণ (৳)</label>
            <input type="number" required min="100" max={stats.walletBalance} step="0.01" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-bangla transition-all" placeholder={`সর্বনিম্ন ১০০, সর্বোচ্চ ৳${stats.walletBalance.toFixed(2)}`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">পেমেন্ট মাধ্যম</label>
            <select value={withdrawForm.payment_method} onChange={(e) => setWithdrawForm({...withdrawForm, payment_method: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-bangla transition-all">
              <option value="bkash">bKash (Personal)</option>
              <option value="nagad">Nagad (Personal)</option>
              <option value="rocket">Rocket (Personal)</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">{withdrawForm.payment_method === 'bank' ? 'Bank Account Number' : 'মোবাইল নম্বর'}</label>
            <input type="text" required value={withdrawForm.payment_number} onChange={(e) => setWithdrawForm({...withdrawForm, payment_number: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-bangla transition-all" placeholder={withdrawForm.payment_method === 'bank' ? 'Account No: 1234567890' : '01XXXXXXXXX'} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setShowWithdrawModal(false)}>বাতিল</Button>
            <Button type="submit" variant="primary" fullWidth loading={isProcessing}>{stats.walletBalance >= 100 ? 'রিকোয়েস্ট পাঠান' : 'ব্যালেন্স অপর্যাপ্ত'}</Button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <Modal isOpen={feedback.isOpen} onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} title={feedback.type === 'success' ? 'সফল!' : 'ত্রুটি!'} type={feedback.type} size="sm">
        <p className="text-slate-700 dark:text-slate-300 text-center font-bangla">{feedback.message}</p>
      </Modal>
    </div>
	
	</Suspense>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, subtitle, color }: { icon: any; title: string; value: string; subtitle: string; color: 'indigo' | 'emerald' | 'purple' | 'amber' }) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', icon: 'bg-indigo-100 dark:bg-indigo-900/40' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: 'bg-emerald-100 dark:bg-emerald-900/40' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', icon: 'bg-purple-100 dark:bg-purple-900/40' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', icon: 'bg-amber-100 dark:bg-amber-900/40' }
  };
  const c = colorMap[color];
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center`}>
          <FontAwesomeIcon icon={icon} className={`text-xl ${c.text}`} />
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1 font-bangla">{title}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-500 font-bangla">{subtitle}</p>
      </div>
    </div>
  );
}