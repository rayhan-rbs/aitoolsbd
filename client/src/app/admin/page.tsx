'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, faTimes, faSpinner, faUsers, 
  faChartLine, faWallet, faShieldHalved, faMoneyBillWave,
  faFileArrowUp, faDownload, faMagnifyingGlass, faChevronLeft, faChevronRight,
  faPlus, faTrash, faEdit, faToggleOn, faToggleOff, faEnvelope, faPaperPlane, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

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

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [updateRequests, setUpdateRequests] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'withdrawals' | 'requests' | 'payments' | 'coupons' | 'newsletter'>('products');
  
  const [platformStats, setPlatformStats] = useState({ totalCommission: 0, totalSales: 0, totalSellers: 0 });
  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [couponForm, setCouponForm] = useState({
    code: '', discount_type: 'percentage', discount_value: '', min_purchase: '', max_discount: '', usage_limit: '', is_active: true, expires_at: ''
  });

  // 🔥 নিউজলেটার স্টেট
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  // 🔥 কাস্টম কনফার্মেশন মোডাল স্টেট (alert/confirm এর বিকল্প)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'newsletter' | 'delete_coupon' | null>(null);
  const [targetCouponId, setTargetCouponId] = useState<string | null>(null);

  useEffect(() => {
    setSearchQuery('');
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') { router.push('/'); return; }
      setIsAdmin(true);

      const { data: orders } = await supabase.from('orders').select('platform_commission, status').eq('status', 'completed');
      const totalCommission = orders?.reduce((acc, curr) => acc + parseFloat(curr.platform_commission || 0), 0) || 0;
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller');

      setPlatformStats({ totalCommission, totalSales: orders?.length || 0, totalSellers: count || 0 });

      fetchPendingProducts();
      fetchWithdrawals();
      fetchUpdateRequests();
      fetchPendingPayments();
      fetchCoupons();
    };
    checkAdminAndFetchData();
  }, [user, router]);

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data);
  };

  const fetchPendingProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select(`id, title, description, category, price, preview_url, created_at, file_url, profiles:seller_id (name, email)`).eq('is_approved', false).eq('is_deleted', false).order('created_at', { ascending: false });
    if (data) setPendingProducts(data);
    setLoading(false);
  };

  const fetchWithdrawals = async () => {
    const { data } = await supabase.from('withdrawals').select(`*, profiles:seller_id (name, email)`).order('created_at', { ascending: false });
    if (data) setWithdrawals(data);
  };

  const fetchUpdateRequests = async () => {
    const { data } = await supabase.from('product_update_requests').select(`*, products:product_id (title, file_url), profiles:seller_id (name, email)`).order('created_at', { ascending: false });
    if (data) setUpdateRequests(data);
  };

  const fetchPendingPayments = async () => {
    const { data } = await supabase.from('orders').select(`*, products:product_id (title, price), profiles:buyer_id (name, email)`).eq('status', 'pending_verification').order('created_at', { ascending: false });
    if (data) setPendingPayments(data);
  };

    const handleApprove = async (productId: string) => {
    setProcessingId(productId);
    
    // প্রথমে প্রোডাক্টের তথ্য নেওয়া যাতে ইমেইলে নাম ও লিংক পাঠানো যায়
    const { data: productData } = await supabase.from('products').select('title').eq('id', productId).single();

    const { error } = await supabase.from('products').update({ is_approved: true }).eq('id', productId);
    
    if (error) {
      setFeedback({ isOpen: true, type: 'error', message: 'অনুমোদন ব্যর্থ হয়েছে।' });
    } else {
      setFeedback({ isOpen: true, type: 'success', message: 'প্রোডাক্ট অনুমোদিত হয়েছে!' });
      fetchPendingProducts();

      // 🔥 অটোমেটিক নোটিফিকেশন ট্রিগার করা
      if (productData) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        fetch('/api/admin/notify-new-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            productTitle: productData.title, 
            productLink: `${siteUrl}/products/${productId}` 
          }),
        }).catch(err => console.error('Auto-notify failed:', err));
      }
    }
    setProcessingId(null);
  };

  const handleReject = async (productId: string) => {
    setProcessingId(productId);
    const { error } = await supabase.from('products').update({ is_deleted: true }).eq('id', productId);
    if (error) setFeedback({ isOpen: true, type: 'error', message: 'ডিলিট ব্যর্থ হয়েছে।' });
    else {
      setFeedback({ isOpen: true, type: 'success', message: 'প্রোডাক্ট বাতিল করা হয়েছে।' });
      fetchPendingProducts();
    }
    setProcessingId(null);
  };

  const handleApproveWithdrawal = async (withdrawalId: string, sellerId: string, amount: number) => {
    setProcessingId(withdrawalId);
    try {
      const { error: wError } = await supabase.from('withdrawals').update({ status: 'approved', processed_at: new Date().toISOString(), processed_by: user?.id }).eq('id', withdrawalId);
      if (wError) throw wError;
      const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', sellerId).single();
      const { error: pError } = await supabase.from('profiles').update({ wallet_balance: (profile?.wallet_balance || 0) - amount }).eq('id', sellerId);
      if (pError) throw pError;
      setFeedback({ isOpen: true, type: 'success', message: `৳${amount} সফলভাবে অনুমোদিত হয়েছে।` });
      fetchWithdrawals();
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'অনুমোদন ব্যর্থ।' });
    }
    setProcessingId(null);
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    setProcessingId(withdrawalId);
    const { error } = await supabase.from('withdrawals').update({ status: 'rejected', processed_at: new Date().toISOString(), processed_by: user?.id }).eq('id', withdrawalId);
    if (error) setFeedback({ isOpen: true, type: 'error', message: 'বাতিল ব্যর্থ।' });
    else {
      setFeedback({ isOpen: true, type: 'success', message: 'উইথড্র রিকোয়েস্ট বাতিল করা হয়েছে।' });
      fetchWithdrawals();
    }
    setProcessingId(null);
  };

  const handleApproveUpdateRequest = async (requestId: string, productId: string, newFileUrl: string, oldFileUrl?: string) => {
    setProcessingId(requestId);
    try {
      await supabase.from('products').update({ file_url: newFileUrl }).eq('id', productId);
      await supabase.from('product_update_requests').update({ status: 'approved', processed_at: new Date().toISOString(), processed_by: user?.id }).eq('id', requestId);
      if (oldFileUrl) {
        const oldFileName = oldFileUrl.split('/').pop();
        if (oldFileName) await supabase.storage.from('products').remove([oldFileName]).catch(() => {});
      }
      setFeedback({ isOpen: true, type: 'success', message: 'ফাইল আপডেট অনুমোদিত হয়েছে!' });
      fetchUpdateRequests();
      fetchPendingProducts();
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'অনুমোদন ব্যর্থ।' });
    }
    setProcessingId(null);
  };

  const handleRejectUpdateRequest = async (requestId: string) => {
    setProcessingId(requestId);
    const { error } = await supabase.from('product_update_requests').update({ status: 'rejected', processed_at: new Date().toISOString(), processed_by: user?.id }).eq('id', requestId);
    if (error) setFeedback({ isOpen: true, type: 'error', message: 'বাতিল ব্যর্থ।' });
    else {
      setFeedback({ isOpen: true, type: 'success', message: 'অনুরোধ বাতিল করা হয়েছে।' });
      fetchUpdateRequests();
    }
    setProcessingId(null);
  };

  const handleVerifyPayment = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);
      setFeedback({ isOpen: true, type: 'success', message: 'পেমেন্ট সফলভাবে যাচাই করা হয়েছে!' });
      fetchPendingPayments();
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'যাচাই ব্যর্থ হয়েছে।' });
    }
    setProcessingId(null);
  };

  const handleRejectPayment = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
      setFeedback({ isOpen: true, type: 'success', message: 'অর্ডার বাতিল করা হয়েছে।' });
      fetchPendingPayments();
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'বাতিল ব্যর্থ।' });
    }
    setProcessingId(null);
  };

  // 🔥 নিউজলেটার পাঠানোর ইনিশিয়েশন (কনফার্মেশন মোডাল ওপেন করবে)
  const initiateSendNewsletter = () => {
    if (!newsletterSubject || !newsletterContent) {
      setFeedback({ isOpen: true, type: 'error', message: 'Subject এবং Content দুটোই প্রয়োজন' });
      return;
    }
    setConfirmAction('newsletter');
    setShowConfirmModal(true);
  };

  // 🔥 নিউজলেটার পাঠানোর মূল লজিক
     
  const executeSendNewsletter = async () => {
    setShowConfirmModal(false);
    setSendingNewsletter(true);
    
    try {
      // ১. প্রথমে সাবস্ক্রাইবার লিস্ট আনি (client-side, যেখানে user already authenticated)
      const { data: subscribers, error: subError } = await supabase
        .from('newsletter_subscribers')
        .select('email');

      if (subError) {
        throw new Error('সাবস্ক্রাইবার লিস্ট আনতে ব্যর্থ হয়েছে');
      }

      if (!subscribers || subscribers.length === 0) {
        setFeedback({ isOpen: true, type: 'error', message: 'কোনো সাবস্ক্রাইবার পাওয়া যায়নি' });
        setSendingNewsletter(false);
        return;
      }

      console.log(`✅ Found ${subscribers.length} subscribers`);

      // ২. এখন API call করি শুধু email sending এর জন্য
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject: newsletterSubject, 
          content: newsletterContent,
          emails: subscribers.map(s => s.email) // 🔥 emails array পাঠাচ্ছি
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setFeedback({ isOpen: true, type: 'success', message: data.message });
        setNewsletterSubject('');
        setNewsletterContent('');
      } else {
        setFeedback({ isOpen: true, type: 'error', message: data.error });
      }
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'সার্ভার এরর হয়েছে' });
    } finally {
      setSendingNewsletter(false);
    }
  };

  // 🔥 কুপন ডিলিট ইনিশিয়েশন
  const initiateDeleteCoupon = (id: string) => {
    setTargetCouponId(id);
    setConfirmAction('delete_coupon');
    setShowConfirmModal(true);
  };

  // 🔥 কুপন ডিলিট মূল লজিক
  const executeDeleteCoupon = async () => {
    setShowConfirmModal(false);
    if (!targetCouponId) return;
    
    setProcessingId(targetCouponId);
    try {
      await supabase.from('coupons').delete().eq('id', targetCouponId);
      fetchCoupons();
      setFeedback({ isOpen: true, type: 'success', message: 'কুপন মুছে ফেলা হয়েছে।' });
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message });
    } finally {
      setProcessingId(null);
      setTargetCouponId(null);
    }
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-600 animate-spin" />
      </div>
    );
  }

  const getFilteredAndPaginatedData = (data: any[], searchFields: string[]) => {
    const filtered = data.filter(item => 
      searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return { filtered, paginated, totalPages };
  };

  const handleOpenCouponModal = (coupon: any = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm({
        code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value.toString(),
        min_purchase: coupon.min_purchase.toString(), max_discount: coupon.max_discount ? coupon.max_discount.toString() : '',
        usage_limit: coupon.usage_limit ? coupon.usage_limit.toString() : '', is_active: coupon.is_active,
        expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', min_purchase: '0', max_discount: '', usage_limit: '', is_active: true, expires_at: '' });
    }
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingId('saving');
    try {
      const payload = {
        code: couponForm.code.toUpperCase(),
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        min_purchase: parseFloat(couponForm.min_purchase) || 0,
        max_discount: couponForm.max_discount ? parseFloat(couponForm.max_discount) : null,
        usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit) : null,
        is_active: couponForm.is_active,
        expires_at: couponForm.expires_at ? new Date(couponForm.expires_at).toISOString() : null,
      };

      if (editingCoupon) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingCoupon.id);
        if (error) throw error;
        setFeedback({ isOpen: true, type: 'success', message: 'কুপন সফলভাবে আপডেট হয়েছে।' });
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
        setFeedback({ isOpen: true, type: 'success', message: 'নতুন কুপন তৈরি হয়েছে।' });
      }
      setShowCouponModal(false);
      fetchCoupons();
    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'সেভ করতে ব্যর্থ হয়েছে।' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleCouponStatus = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
      fetchCoupons();
    } finally {
      setProcessingId(null);
    }
  };

  const productsData = getFilteredAndPaginatedData(pendingProducts, ['title', 'profiles.name', 'category']);
  const withdrawalsData = getFilteredAndPaginatedData(withdrawals, ['profiles.name', 'profiles.email', 'payment_number']);
  const requestsData = getFilteredAndPaginatedData(updateRequests, ['products.title', 'profiles.name']);
  const paymentsData = getFilteredAndPaginatedData(pendingPayments, ['products.title', 'profiles.name', 'profiles.email', 'transaction_id']);
  const couponsData = getFilteredAndPaginatedData(coupons, ['code']);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <FontAwesomeIcon icon={faShieldHalved} className="text-2xl text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-1 font-bangla">অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-slate-600 dark:text-slate-400 font-bangla">প্ল্যাটফর্ম ম্যানেজমেন্ট এবং অনুমোদন প্যানেল</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard icon={faWallet} title="প্ল্যাটফর্ম মোট আয়" value={`৳${platformStats.totalCommission.toFixed(2)}`} subtitle="মোট কমিশন (১৫%)" color="emerald" />
          <StatCard icon={faChartLine} title="মোট বিক্রি" value={platformStats.totalSales.toString()} subtitle="সফল অর্ডার" color="indigo" />
          <StatCard icon={faUsers} title="মোট সেলার" value={platformStats.totalSellers.toString()} subtitle="রেজিস্টার্ড বিক্রেতা" color="purple" />
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {(['products', 'withdrawals', 'requests', 'payments', 'coupons', 'newsletter'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold font-bangla transition-all whitespace-nowrap ${activeTab === tab ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              {tab === 'products' && `প্রোডাক্ট অনুমোদন (${pendingProducts.length})`}
              {tab === 'withdrawals' && `উইথড্র রিকোয়েস্ট (${withdrawals.filter((w: any) => w.status === 'pending').length})`}
              {tab === 'requests' && `ফাইল আপডেট (${updateRequests.filter((r: any) => r.status === 'pending').length})`}
              {tab === 'payments' && `পেমেন্ট যাচাই (${pendingPayments.length})`}
              {tab === 'coupons' && `কুপন ম্যানেজমেন্ট (${coupons.length})`}
              {tab === 'newsletter' && `নিউজলেটার পাঠান`}
            </button>
          ))}
        </div>

        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-bangla">অপেক্ষমাণ প্রোডাক্ট</h2>
            <SearchAndPagination searchQuery={searchQuery} setSearchQuery={setSearchQuery} totalPages={productsData.totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
            {loading ? (
              <div className="p-12 text-center"><FontAwesomeIcon icon={faSpinner} className="text-3xl text-indigo-600 animate-spin" /></div>
            ) : productsData.paginated.length === 0 ? (
              <div className="p-12 text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-bangla">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {productsData.paginated.map((product) => (
                  <div key={product.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4">
                    {product.preview_url && <img src={product.preview_url} alt={product.title} className="w-full sm:w-32 h-32 object-cover rounded-xl" />}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-bangla">{product.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 font-bangla">{product.description}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full font-semibold font-bangla">{product.category}</span>
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full font-semibold">৳{product.price}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-bangla">সেলার: {product.profiles?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 mt-2 sm:mt-0">
                      <Button variant="primary" size="sm" icon={faCheck} loading={processingId === product.id} onClick={() => handleApprove(product.id)} className="flex-1 sm:flex-none">অনুমোদন</Button>
                      <Button variant="outline" size="sm" icon={faTimes} loading={processingId === product.id} onClick={() => handleReject(product.id)} className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50">বাতিল</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= WITHDRAWALS TAB ================= */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-bangla">সকল উইথড্র রিকোয়েস্ট</h2>
            <SearchAndPagination searchQuery={searchQuery} setSearchQuery={setSearchQuery} totalPages={withdrawalsData.totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
            {withdrawalsData.paginated.length === 0 ? (
              <div className="p-12 text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-bangla">কোনো রিকোয়েস্ট পাওয়া যায়নি</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">সেলার</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">পরিমাণ</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">মাধ্যম</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">নম্বর</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">স্ট্যাটাস</th>
                      <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {withdrawalsData.paginated.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white font-bangla">{w.profiles?.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{w.profiles?.email}</div>
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">৳{parseFloat(w.amount).toFixed(2)}</td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300 capitalize font-bangla text-sm">
                          {w.payment_method === 'bkash' ? 'bKash' : w.payment_method === 'nagad' ? 'Nagad' : w.payment_method === 'rocket' ? 'Rocket' : w.payment_method === 'paypal' ? 'PayPal' : w.payment_method}
                        </td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300 text-sm">{w.payment_number}</td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold font-bangla ${
                            w.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                            w.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}>
                            {w.status === 'approved' ? 'অনুমোদিত' : w.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {w.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="primary" size="sm" icon={faCheck} loading={processingId === w.id} onClick={() => handleApproveWithdrawal(w.id, w.seller_id, parseFloat(w.amount))}>অনুমোদন</Button>
                              <Button variant="outline" size="sm" icon={faTimes} loading={processingId === w.id} onClick={() => handleRejectWithdrawal(w.id)} className="text-red-600 border-red-200 hover:bg-red-50">বাতিল</Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end">
                              {w.status === 'approved' ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                  <FontAwesomeIcon icon={faCheck} className="text-xs" /> সম্পন্ন
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold border border-red-200 dark:border-red-800">
                                  <FontAwesomeIcon icon={faTimes} className="text-xs" /> বাতিল
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= UPDATE REQUESTS TAB ================= */}
        {activeTab === 'requests' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-bangla">ফাইল আপডেট অনুরোধসমূহ</h2>
            <SearchAndPagination searchQuery={searchQuery} setSearchQuery={setSearchQuery} totalPages={requestsData.totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
            {requestsData.paginated.length === 0 ? (
              <div className="p-12 text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-bangla">কোনো অনুরোধ পাওয়া যায়নি</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {requestsData.paginated.map((req) => (
                  <div key={req.id} className="py-6 first:pt-0 last:pb-0 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-bangla">{req.products?.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla">সেলার: {req.profiles?.name} ({req.profiles?.email}) | তারিখ: {new Date(req.created_at).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold font-bangla whitespace-nowrap ${
                        req.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        req.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {req.status === 'approved' ? 'অনুমোদিত' : req.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">অনুরোধের কারণ:</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-bangla whitespace-pre-wrap">{req.reason}</p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex flex-wrap gap-3">
                        <a href={req.new_file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all font-bangla">
                          <FontAwesomeIcon icon={faDownload} /> নতুন ফাইলটি ডাউনলোড করে চেক করুন
                        </a>
                        <Button variant="primary" size="sm" icon={faCheck} loading={processingId === req.id} onClick={() => handleApproveUpdateRequest(req.id, req.product_id, req.new_file_url, req.products?.file_url)}>অনুমোদন করুন</Button>
                        <Button variant="outline" size="sm" icon={faTimes} loading={processingId === req.id} onClick={() => handleRejectUpdateRequest(req.id)} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">বাতিল করুন</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= PAYMENTS TAB ================= */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-bangla">অপেক্ষমাণ পেমেন্ট যাচাই</h2>
            <SearchAndPagination searchQuery={searchQuery} setSearchQuery={setSearchQuery} totalPages={paymentsData.totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
            {paymentsData.paginated.length === 0 ? (
              <div className="p-12 text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-bangla">কোনো পেমেন্ট পাওয়া যায়নি</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {paymentsData.paginated.map((payment) => (
                  <div key={payment.id} className="py-6 first:pt-0 last:pb-0 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-bangla">{payment.products?.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla">ক্রেতা: {payment.profiles?.name} ({payment.profiles?.email})</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bangla">তারিখ: {new Date(payment.created_at).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">৳{payment.amount}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">মোট পরিমাণ</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">পেমেন্ট মাধ্যম</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize font-bangla">
                          {payment.payment_method === 'bkash' ? 'bKash' : payment.payment_method === 'nagad' ? 'Nagad' : payment.payment_method === 'rocket' ? 'Rocket' : payment.payment_method === 'paypal' ? 'PayPal' : payment.payment_method}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">ক্রেতার নম্বর / ইমেইল</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white font-bangla">{payment.payment_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">Transaction ID (TrxID)</p>
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 font-mono">{payment.transaction_id}</p>
                      </div>
                      {payment.payment_note && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">নোট</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-bangla">{payment.payment_note}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="primary" size="sm" icon={faCheck} loading={processingId === payment.id} onClick={() => handleVerifyPayment(payment.id)} className="flex-1">পেমেন্ট যাচাই করুন</Button>
                      <Button variant="outline" size="sm" icon={faTimes} loading={processingId === payment.id} onClick={() => handleRejectPayment(payment.id)} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">বাতিল</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= COUPONS TAB ================= */}
        {activeTab === 'coupons' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-bangla">সকল কুপন</h2>
              <Button variant="primary" size="sm" icon={faPlus} onClick={() => handleOpenCouponModal()}>নতুন কুপন তৈরি করুন</Button>
            </div>

            <SearchAndPagination 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalPages={couponsData.totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />

            {couponsData.paginated.length === 0 ? (
              <div className="p-12 text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-bangla">কোনো কুপন পাওয়া যায়নি</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">আপনার সার্চ ক্যোয়ারী পরিবর্তন করুন অথবা রিসেট করুন।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">কোড</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">ধরন ও মূল্য</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">শর্তাবলী</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">ব্যবহার</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">স্ট্যাটাস</th>
                      <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bangla">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {couponsData.paginated.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{coupon.code}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.discount_type === 'percentage' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% ছাড়` : `৳${coupon.discount_value} ছাড়`}
                          </span>
                          {coupon.max_discount && <p className="text-xs text-slate-500 mt-1">সর্বোচ্চ ছাড়: ৳{coupon.max_discount}</p>}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                          <p>মিনিমাম অর্ডার: ৳{coupon.min_purchase}</p>
                          {coupon.expires_at && <p className="text-xs text-red-500">মেয়াদ: {new Date(coupon.expires_at).toLocaleDateString('bn-BD')}</p>}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {coupon.used_count} / {coupon.usage_limit || 'অসীম'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold font-bangla ${coupon.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {coupon.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleToggleCouponStatus(coupon.id, coupon.is_active)} disabled={processingId === coupon.id} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 flex items-center justify-center transition-all" title={coupon.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}>
                              <FontAwesomeIcon icon={coupon.is_active ? faToggleOn : faToggleOff} className={`text-lg ${coupon.is_active ? 'text-emerald-500' : 'text-slate-400'}`} />
                            </button>
                            <button onClick={() => handleOpenCouponModal(coupon)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 flex items-center justify-center transition-all" title="এডিট করুন">
                              <FontAwesomeIcon icon={faEdit} className="text-sm" />
                            </button>
                            <button onClick={() => initiateDeleteCoupon(coupon.id)} disabled={processingId === coupon.id} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 flex items-center justify-center transition-all" title="মুছে ফেলুন">
                              <FontAwesomeIcon icon={processingId === coupon.id ? faSpinner : faTrash} className={processingId === coupon.id ? 'animate-spin' : 'text-sm'} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= NEWSLETTER TAB ================= */}
        {activeTab === 'newsletter' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-bangla flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-indigo-500" /> নিউজলেটার পাঠান
            </h2>
            
            <div className="max-w-3xl space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300 font-bangla">
                  <strong>সতর্কতা:</strong> এই নিউজলেটারটি ডেটাবেসে থাকা <strong>সকল সাবস্ক্রাইবারের</strong> কাছে পাঠানো হবে। একবার পাঠানোর পর এটি ফেরত আনা যাবে না।
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">ইমেইলের বিষয় (Subject) *</label>
                <input 
                  type="text"
                  value={newsletterSubject}
                  onChange={(e) => setNewsletterSubject(e.target.value)}
                  placeholder="যেমন: 🎉 AIToolsBD-তে নতুন AI টুলস এসেছে!"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bangla"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">ইমেইলের মূল কন্টেন্ট (Content) *</label>
                <textarea 
                  value={newsletterContent}
                  onChange={(e) => setNewsletterContent(e.target.value)}
                  rows={10}
                  placeholder="প্রিয় গ্রাহক,&#10;&#10;আমরা আনন্দের সাথে জানাচ্ছি যে..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none font-bangla"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bangla">
                  💡 টিপস: আপনি এখানে সাধারণ টেক্সট ব্যবহার করতে পারেন। লাইন ব্রেক অটোমেটিক হ্যান্ডেল করা হবে।
                </p>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  icon={faPaperPlane}
                  loading={sendingNewsletter} 
                  onClick={initiateSendNewsletter}
                  className="px-8"
                >
                  📤 সব সাবস্ক্রাইবারদের কাছে পাঠান
                </Button>
                <button 
                  onClick={() => { setNewsletterSubject(''); setNewsletterContent(''); }}
                  className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-all font-bangla"
                >
                  ফর্ম ক্লিয়ার করুন
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ================= COUPON MODAL ================= */}
      <Modal isOpen={showCouponModal} onClose={() => setShowCouponModal(false)} title={editingCoupon ? 'কুপন এডিট করুন' : 'নতুন কুপন তৈরি করুন'} size="md">
        <form onSubmit={handleSaveCoupon} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">কুপন কোড *</label>
              <input type="text" required value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla uppercase" placeholder="যেমন: SUMMER20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">ডিসকাউন্টের ধরন *</label>
              <select value={couponForm.discount_type} onChange={(e) => setCouponForm({...couponForm, discount_type: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla">
                <option value="percentage">শতাংশ (%)</option>
                <option value="fixed">নির্দিষ্ট অংক (৳)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">ডিসকাউন্টের পরিমাণ *</label>
              <input type="number" required min="1" value={couponForm.discount_value} onChange={(e) => setCouponForm({...couponForm, discount_value: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla" placeholder={couponForm.discount_type === 'percentage' ? 'যেমন: 20' : 'যেমন: 50'} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">সর্বোচ্চ ছাড় সীমা (৳)</label>
              <input type="number" min="0" value={couponForm.max_discount} onChange={(e) => setCouponForm({...couponForm, max_discount: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla" placeholder="শুধু % এর জন্য প্রযোজ্য" disabled={couponForm.discount_type === 'fixed'} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">মিনিমাম অর্ডার (৳)</label>
              <input type="number" min="0" value={couponForm.min_purchase} onChange={(e) => setCouponForm({...couponForm, min_purchase: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla" placeholder="0 মানে কোনো শর্ত নেই" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">সর্বোচ্চ ব্যবহার সংখ্যা</label>
              <input type="number" min="1" value={couponForm.usage_limit} onChange={(e) => setCouponForm({...couponForm, usage_limit: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla" placeholder="খালি রাখলে অসীম" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">মেয়াদ শেষের তারিখ</label>
            <input type="date" value={couponForm.expires_at} onChange={(e) => setCouponForm({...couponForm, expires_at: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="isActive" checked={couponForm.is_active} onChange={(e) => setCouponForm({...couponForm, is_active: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-bangla">কুপনটি এখনই সক্রিয় (Active) করুন</label>
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setShowCouponModal(false)}>বাতিল</Button>
            <Button type="submit" variant="primary" fullWidth loading={processingId === 'saving'}>সেভ করুন</Button>
          </div>
        </form>
      </Modal>

      {/* ================= CUSTOM CONFIRMATION MODAL (alert/confirm এর পরিবর্তে) ================= */}
      <Modal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)} 
        title="নিশ্চিতকরণ প্রয়োজন" 
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-center mb-6 font-bangla leading-relaxed">
            {confirmAction === 'newsletter' 
              ? 'আপনি কি নিশ্চিত যে আপনি সব সাবস্ক্রাইবারদের কাছে এই নিউজলেটারটি পাঠাতে চান? একবার পাঠানোর পর এটি ফেরত আনা যাবে না।' 
              : 'আপনি কি নিশ্চিত যে আপনি এই কুপনটি স্থায়ীভাবে মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।'}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowConfirmModal(false)}>না, বাতিল করুন</Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={confirmAction === 'newsletter' ? executeSendNewsletter : executeDeleteCoupon}
              loading={confirmAction === 'newsletter' ? sendingNewsletter : processingId === targetCouponId}
              className={confirmAction === 'delete_coupon' ? 'bg-red-600 hover:bg-red-700 border-red-600' : ''}
            >
              হ্যাঁ, নিশ্চিত
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= FEEDBACK MODAL ================= */}
      <Modal isOpen={feedback.isOpen} onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} title={feedback.type === 'success' ? 'সফল!' : 'ত্রুটি!'} type={feedback.type} size="sm">
        <p className="text-slate-700 dark:text-slate-300 text-center font-bangla">{feedback.message}</p>
      </Modal>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }: { icon: any; title: string; value: string; subtitle: string; color: 'indigo' | 'emerald' | 'purple' | 'amber' }) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', icon: 'bg-indigo-100 dark:bg-indigo-900/40' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: 'bg-emerald-100 dark:bg-emerald-900/40' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', icon: 'bg-purple-100 dark:bg-purple-900/40' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', icon: 'bg-amber-100 dark:bg-amber-900/40' }
  };
  const c = colorMap[color];
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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