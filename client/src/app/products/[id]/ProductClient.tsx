'use client';

import ImageWithLoader from '@/components/ui/ImageWithLoader';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faStar,
  faDownload,
  faUser,
  faCalendar,
  faSpinner,
  faShoppingCart,
  faShieldAlt,
  faCheckCircle,
  faHeart,
  faTimesCircle,
  faArrowRight 
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function ProductClient({ productId }: { productId: string })  {
 
  const router = useRouter();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [feedback, setFeedback] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false, type: 'success', message: ''
  });

  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    payment_method: 'bkash',
    payment_number: '',
    transaction_id: '',
    payment_note: ''
  });

  const [isInWishlist, setIsInWishlist] = useState(false);

  // 🔥 Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [finalPrice, setFinalPrice] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // প্রোডাক্টের ডেটা ফেচ করা
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;
      setLoading(true);
      
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`*, profiles:seller_id (id, name, email)`)
          .eq('id', productId)
          .eq('is_approved', true)
          .single();

        if (productError || !productData) {
          console.error('Error fetching product:', productError);
          router.push('/products');
          return;
        }

        setProduct(productData);

        // 🔥 একই ক্যাটাগরির Related Products আনা
        const { data: relatedData } = await supabase
          .from('products')
          .select('id, title, category, price, preview_url, download_count, average_rating')
          .eq('category', productData.category)
          .eq('is_approved', true)
          .eq('is_deleted', false)
          .neq('id', productId) // বর্তমান প্রোডাক্টটি বাদ দেওয়া
          .order('created_at', { ascending: false })
          .limit(4); // সর্বোচ্চ ৪টি

        if (relatedData) setRelatedProducts(relatedData);

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(`*, profiles:buyer_id (name)`)
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (reviewsData) setReviews(reviewsData);

        if (user) {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('id, status')
            .eq('product_id', productId)
            .eq('buyer_id', user.id);

          const isPurchased = ordersData?.some(order => order.status === 'completed') || false;
          setHasPurchased(isPurchased);

          if (isPurchased) {
            const { data: reviewData } = await supabase
              .from('reviews')
              .select('id')
              .eq('product_id', productId)
              .eq('buyer_id', user.id)
              .maybeSingle();
            setHasReviewed(!!reviewData);
          }

          const { data: wishlistData } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .maybeSingle();
          setIsInWishlist(!!wishlistData);
        }

      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, router, user]);

  // 🔥 কুপন প্রয়োগ হলে ফাইনাল প্রাইস ক্যালকুলেট করা
  useEffect(() => {
    if (product) {
      let price = Number(product.price);
      if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'fixed') {
          price = Math.max(0, price - Number(appliedCoupon.discount_value));
        } else if (appliedCoupon.discount_type === 'percentage') {
          let discount = (price * Number(appliedCoupon.discount_value)) / 100;
          if (appliedCoupon.max_discount) {
            discount = Math.min(discount, Number(appliedCoupon.max_discount));
          }
          price = Math.max(0, price - discount);
        }
      }
      setFinalPrice(price);
    }
  }, [product, appliedCoupon]);

  const handlePurchase = async () => {
    if (!user) {
      setFeedback({ isOpen: true, type: 'error', message: 'অনুগ্রহ করে প্রথমে লগইন করুন।' });
      return;
    }
    if (product.seller_id === user.id) {
      setFeedback({ isOpen: true, type: 'error', message: 'আপনি নিজের প্রোডাক্ট কিনতে পারবেন না।' });
      return;
    }
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('product_id', product.id)
      .in('status', ['completed', 'pending_verification'])
      .maybeSingle();

    if (existingOrder) {
      setFeedback({ isOpen: true, type: 'error', message: 'আপনি ইতিমধ্যে এই প্রোডাক্টটি কিনেছেন।' });
      return;
    }
    setShowCheckoutModal(true);
  };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setIsProcessing(true);

    try {
      if (!checkoutForm.payment_number.trim()) {
        setFeedback({ isOpen: true, type: 'error', message: 'অনুগ্রহ করে আপনার পেমেন্ট নম্বর দিন।' });
        setIsProcessing(false); return;
      }
      if (!checkoutForm.transaction_id.trim()) {
        setFeedback({ isOpen: true, type: 'error', message: 'অনুগ্রহ করে Transaction ID (TrxID) দিন।' });
        setIsProcessing(false); return;
      }

      const downloadToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // 🔥 নিরাপদ আর্থিক লজিক: সেলারের আয় মূল দামের উপর ভিত্তি করে, ডিসকাউন্ট প্ল্যাটফর্ম বহন করবে
      const originalSellerEarning = Number(product.price) * 0.85;
      const originalPlatformCommission = Number(product.price) * 0.15;
      const discountAmount = appliedCoupon ? (Number(product.price) - finalPrice) : 0;
      const finalPlatformCommission = Math.max(0, originalPlatformCommission - discountAmount);

      const { error: orderError } = await supabase.from('orders').insert({
        buyer_id: user.id,
        seller_id: product.seller_id,
        product_id: product.id,
        amount: Number(product.price),
        discount_amount: discountAmount,
        final_amount: finalPrice,
        platform_commission: finalPlatformCommission,
        seller_earning: originalSellerEarning, // 🔥 সেলার সর্বদা তাদের নির্ধারিত ৮৫% পূর্ণ পাবে
        status: 'pending_verification',
        payment_method: checkoutForm.payment_method,
        payment_number: checkoutForm.payment_number,
        transaction_id: checkoutForm.transaction_id,
        payment_note: checkoutForm.payment_note,
        download_token: downloadToken,
        link_expires_at: expiresAt.toISOString(),
        max_downloads: 3,
        current_downloads: 0,
        coupon_code: appliedCoupon ? appliedCoupon.code : null
      });

      if (orderError) throw orderError;

      if (appliedCoupon) {
        await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id });
      }

      // 🔥 রেফারেল কমিশন লজিক (অর্ডার সফল হওয়ার পর)
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', user.id)
        .single();

      if (buyerProfile?.referred_by) {
        const commissionAmount = Number(finalPrice) * 0.10; // ফাইনাল প্রাইসের ১০% কমিশন
        
        const { data: referrerData } = await supabase
          .from('profiles')
          .select('affiliate_balance')
          .eq('id', buyerProfile.referred_by)
          .single();

        const newAffiliateBalance = Number(referrerData?.affiliate_balance || 0) + commissionAmount;

        await supabase
          .from('profiles')
          .update({ affiliate_balance: newAffiliateBalance })
          .eq('id', buyerProfile.referred_by);
      }

      setFeedback({ 
        isOpen: true, 
        type: 'success', 
        message: 'অর্ডার সফলভাবে সাবমিট হয়েছে! অ্যাডমিন আপনার পেমেন্ট যাচাই করার পর ডাউনলোড লিংক পাবেন।' 
      });
      setShowCheckoutModal(false);
      setCheckoutForm({ payment_method: 'bkash', payment_number: '', transaction_id: '', payment_note: '' });
      setAppliedCoupon(null);
      setCouponCode('');

    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'অর্ডার ব্যর্থ হয়েছে।' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        buyer_id: user.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });

      if (error) throw error;

      setFeedback({ isOpen: true, type: 'success', message: 'আপনার রিভিউ সফলভাবে জমা হয়েছে!' });
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '' });
      setHasReviewed(true);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`*, profiles:buyer_id (name)`)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (reviewsData) setReviews(reviewsData);

    } catch (error: any) {
      setFeedback({ isOpen: true, type: 'error', message: error.message || 'রিভিউ জমা দিতে সমস্যা হয়েছে।' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      setFeedback({ isOpen: true, type: 'error', message: 'অনুগ্রহ করে প্রথমে লগইন করুন।' });
      return;
    }

    try {
      if (isInWishlist) {
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
        setIsInWishlist(false);
        setFeedback({ isOpen: true, type: 'success', message: 'প্রোডাক্টটি wishlist থেকে মুছে ফেলা হয়েছে।' });
      } else {
        await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
        setIsInWishlist(true);
        setFeedback({ isOpen: true, type: 'success', message: 'প্রোডাক্টটি wishlist-এ যোগ করা হয়েছে!' });
      }
    } catch (error) {
      setFeedback({ isOpen: true, type: 'error', message: 'Wishlist আপডেট করতে সমস্যা হয়েছে।' });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setCouponError('অবৈধ বা নিষ্ক্রিয় কুপন কোড।');
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setCouponError('এই কুপনটির মেয়াদ শেষ হয়ে গেছে।');
        return;
      }

      if (data.usage_limit && data.used_count >= data.usage_limit) {
        setCouponError('এই কুপনটির ব্যবহার সীমা শেষ হয়ে গেছে।');
        return;
      }

      if (Number(product.price) < Number(data.min_purchase)) {
        setCouponError(`এই কুপন ব্যবহার করতে কমপক্ষে ৳${data.min_purchase} এর প্রোডাক্ট কিনতে হবে।`);
        return;
      }

      setAppliedCoupon(data);
      setCouponError('');
    } catch (err) {
      setCouponError('কুপন যাচাই করতে সমস্যা হয়েছে।');
    } finally {
      setCouponLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-bangla">প্রোডাক্ট লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/products" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors font-bangla">
          <FontAwesomeIcon icon={faArrowLeft} />
          সকল প্রোডাক্টে ফিরে যান
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-xl">
              <ImageWithLoader
                src={product.preview_url || ''}
                alt={product.title}
                className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-center">
                <FontAwesomeIcon icon={faDownload} className="text-2xl text-indigo-600 dark:text-indigo-400 mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{product.download_count || 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">ডাউনলোড</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-center">
                <FontAwesomeIcon icon={faStar} className={`text-2xl mb-2 ${product.average_rating > 0 ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{product.average_rating > 0 ? Number(product.average_rating).toFixed(1) : '0.0'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">গড় রেটিং</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-center">
                <FontAwesomeIcon icon={faShieldAlt} className="text-2xl text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla">নিরাপদ</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-block px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-semibold font-bangla">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight font-bangla">
              {product.title}
            </h1>

            <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {product.profiles?.name ? product.profiles.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bangla">সেলার</p>
                <p className="font-semibold text-slate-900 dark:text-white font-bangla">
                  {product.profiles?.name || 'Unknown Seller'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-bangla">মূল্য</p>
                  <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    ৳{Number(product.price).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span className="text-sm font-semibold font-bangla">তাৎক্ষণিক ডাউনলোড</span>
                </div>
              </div>

              <button 
                onClick={handleToggleWishlist}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-3 ${
                  isInWishlist 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <FontAwesomeIcon icon={faHeart} className={isInWishlist ? 'fill-current' : ''} />
                {isInWishlist ? 'Wishlist-এ আছে ❤️' : 'Wishlist-এ যোগ করুন 🤍'}
              </button>
              
              <Button variant="primary" size="lg" icon={faShoppingCart} fullWidth onClick={handlePurchase}>
                এখনই কিনুন
              </Button>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3 font-bangla">
                নিরাপদ পেমেন্ট • ২৪/৭ সাপোর্ট • ১০০% মানি ব্যাক গ্যারান্টি
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 font-bangla">প্রোডাক্ট বিবরণ</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-bangla">
                {product.description}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-bangla">অতিরিক্ত তথ্য</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-bangla">ক্যাটাগরি</span>
                  <span className="font-semibold text-slate-900 dark:text-white font-bangla">{product.category}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-bangla">যোগ করার তারিখ</span>
                  <span className="font-semibold text-slate-900 dark:text-white font-bangla">
                    {new Date(product.created_at).toLocaleDateString('bn-BD')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600 dark:text-slate-400 font-bangla">মোট বিক্রি</span>
                  <span className="font-semibold text-slate-900 dark:text-white font-bangla">{product.download_count || 0} বার</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RELATED PRODUCTS SECTION ================= */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 font-bangla">
                একই ক্যাটাগরির আরও প্রোডাক্ট
              </h2>
              <p className="text-slate-600 dark:text-slate-400 font-bangla">
                আপনার পছন্দ হতে পারে এমন আরও কিছু প্রোডাক্ট
              </p>
            </div>
            <Link 
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="hidden sm:flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-bangla"
            >
              সব দেখুন
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <Link 
                href={`/products/${relProduct.id}`}
                key={relProduct.id} 
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <ImageWithLoader
                    src={relProduct.preview_url || ''}
                    alt={relProduct.title}
                    className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {relProduct.average_rating > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-yellow-400/90 backdrop-blur-md text-slate-900 rounded-full shadow-sm text-xs font-bold">
                      <FontAwesomeIcon icon={faStar} className="text-slate-900 text-[10px]" />
                      {Number(relProduct.average_rating).toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 leading-snug text-sm min-h-[2.5rem]">
                    {relProduct.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faDownload} className="text-indigo-500 dark:text-indigo-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{relProduct.download_count || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ৳{relProduct.price}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                      বিস্তারিত <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

        {/* ================= REVIEWS SECTION ================= */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 font-bangla">ক্রেতাদের মতামত</h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesomeIcon
                      key={star}
                      icon={faStar}
                      className={`text-lg ${star <= Math.round(Number(product.average_rating) || 0) ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400 font-bangla">
                  {Number(product.average_rating) > 0 ? Number(product.average_rating).toFixed(1) : '0.0'} ({product.review_count || 0}টি রিভিউ)
                </span>
              </div>
            </div>
            {hasPurchased && !hasReviewed && (
              <Button variant="primary" size="md" onClick={() => setShowReviewForm(true)}>রিভিউ দিন</Button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-bangla">আপনার রিভিউ লিখুন</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">রেটিং</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <FontAwesomeIcon
                          icon={faStar}
                          className={`text-3xl ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">মন্তব্য</label>
                  <textarea
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 outline-none resize-none font-bangla"
                    placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>বাতিল</Button>
                  <Button type="submit" variant="primary" loading={isProcessing}>জমা দিন</Button>
                </div>
              </form>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 font-bangla">এখনও কোনো রিভিউ নেই। প্রথম রিভিউ দিন!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {review.profiles?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white font-bangla">{review.profiles?.name || 'Anonymous'}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(review.created_at).toLocaleDateString('bn-BD')}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FontAwesomeIcon key={star} icon={faStar} className={`text-sm ${star <= review.rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-bangla">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal isOpen={feedback.isOpen} onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} title={feedback.type === 'success' ? 'সফল!' : 'ত্রুটি!'} type={feedback.type} size="sm">
        <p className="text-slate-700 dark:text-slate-300 text-center font-bangla">{feedback.message}</p>
      </Modal>

      {/* ================= CHECKOUT MODAL ================= */}
      <Modal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} title="পেমেন্ট সম্পন্ন করুন" size="md">
        
        {/* ১. ম্যানুয়াল পেমেন্ট (bKash, Nagad, Rocket) */}
        {checkoutForm.payment_method !== 'paypal' && (
          <form onSubmit={handleCheckoutSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            
            {/* 🔥 Coupon Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">কুপন কোড প্রয়োগ করুন</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="যেমন: WELCOME20"
                  disabled={!!appliedCoupon}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla text-sm uppercase"
                />
                {appliedCoupon ? (
                  <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); }} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                    মুছুন
                  </button>
                ) : (
                  <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                    {couponLoading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                    প্রয়োগ
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs text-red-500 mt-2 font-bangla flex items-center gap-1"><FontAwesomeIcon icon={faTimesCircle} className="text-xs" /> {couponError}</p>}
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-bangla flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-xs" /> কুপন সফলভাবে প্রয়োগ হয়েছে!
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 font-bangla">আপনি ৳{(Number(product.price) - finalPrice).toFixed(2)} সাশ্রয় করছেন।</p>
                </div>
              )}
            </div>

            {/* 🔥 Updated Price Display */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-indigo-800 dark:text-indigo-300 font-bangla">মূল মূল্য:</span>
                <span className={`text-sm font-semibold ${appliedCoupon ? 'line-through text-slate-500' : 'text-indigo-900 dark:text-indigo-100'}`}>৳{Number(product.price).toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-emerald-700 dark:text-emerald-400 font-bangla">ডিসকাউন্ট:</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">- ৳{(Number(product.price) - finalPrice).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-indigo-200 dark:border-indigo-800 pt-2 mt-2">
                <span className="text-base font-bold text-indigo-900 dark:text-indigo-100 font-bangla">সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100">৳{finalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2 font-bangla">📱 পেমেন্ট নির্দেশিকা:</p>
              <ol className="text-xs text-amber-700 dark:text-amber-400 space-y-1 font-bangla list-decimal list-inside">
                <li>আমাদের নম্বরে <strong>৳{finalPrice.toFixed(2)}</strong> পাঠান</li>
                <li>পেমেন্টের পর Transaction ID (TrxID) কপি করুন</li>
                <li>নিচে TrxID দিয়ে "সাবমিট করুন" চাপুন</li>
              </ol>
              <div className="mt-3 p-2 bg-white dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla">📞 আমাদের {checkoutForm.payment_method} নম্বর:</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">01XXXXXXXXX</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">(Personal)</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">পেমেন্ট মাধ্যম</label>
              <select value={checkoutForm.payment_method} onChange={(e) => setCheckoutForm({...checkoutForm, payment_method: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla">
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="paypal">PayPal (আন্তর্জাতিক)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">আপনার পেমেন্ট নম্বর</label>
              <input type="text" required value={checkoutForm.payment_number} onChange={(e) => setCheckoutForm({...checkoutForm, payment_number: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla" placeholder="01XXXXXXXXX" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 font-bangla">Transaction ID (TrxID) *</label>
              <input type="text" required value={checkoutForm.transaction_id} onChange={(e) => setCheckoutForm({...checkoutForm, transaction_id: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla" placeholder="যেমন: TXN8A7K2M9P4" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" fullWidth onClick={() => setShowCheckoutModal(false)}>বাতিল</Button>
              <Button type="submit" variant="primary" fullWidth loading={isProcessing}>সাবমিট করুন</Button>
            </div>
          </form>
        )}

        {/* ২. PayPal পেমেন্ট গেটওয়ে */}
        {checkoutForm.payment_method === 'paypal' && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            
            {/* 🔥 Coupon Section for PayPal */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">কুপন কোড প্রয়োগ করুন</label>
              <div className="flex gap-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="যেমন: WELCOME20" disabled={!!appliedCoupon} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla text-sm uppercase" />
                {appliedCoupon ? (
                  <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); }} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">মুছুন</button>
                ) : (
                  <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                    {couponLoading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />} প্রয়োগ
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs text-red-500 mt-2 font-bangla flex items-center gap-1"><FontAwesomeIcon icon={faTimesCircle} className="text-xs" /> {couponError}</p>}
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-bangla flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} className="text-xs" /> কুপন সফলভাবে প্রয়োগ হয়েছে!</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 font-bangla">আপনি ৳{(Number(product.price) - finalPrice).toFixed(2)} সাশ্রয় করছেন।</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-800 dark:text-blue-300 font-bangla">প্রোডাক্ট:</span>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100 font-bangla truncate max-w-[200px]">{product.title}</span>
              </div>
              <div className="flex justify-between items-center border-t border-blue-200 dark:border-blue-800 pt-2">
                <span className="text-sm text-blue-800 dark:text-blue-300 font-bangla">সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-xl font-extrabold text-blue-900 dark:text-blue-100">৳{finalPrice.toFixed(2)} (≈ ${(finalPrice / 110).toFixed(2)} USD)</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-2 font-bangla">* ১ USD ≈ ১১০ BDT (আনুমানিক)। পেমেন্ট সফল হলে অটোমেটিক ডাউনলোড লিংক সক্রিয় হবে।</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bangla">পেমেন্ট মাধ্যম পরিবর্তন</label>
              <select value={checkoutForm.payment_method} onChange={(e) => setCheckoutForm({...checkoutForm, payment_method: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bangla">
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="paypal">PayPal (আন্তর্জাতিক)</option>
              </select>
            </div>

            <div className="mt-4">
              <PayPalScriptProvider options={{ clientId: "BAAKGknrrwQcimlKmt4LT_mfhgQY_J-rV3vHSTudc2-hmu7RZnRU8ggUA19LNWiNRrqmg8cskcLCRFfcUY", currency: "USD" }}>
                <PayPalButtons
                  style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{ amount: { value: (finalPrice / 110).toFixed(2) } }],
                    });
                  }}
                                    onApprove={async (data, actions) => {
                    setIsProcessing(true);
                    try {
                      const details = await actions.order.capture();
                      const downloadToken = crypto.randomUUID();
                      const expiresAt = new Date();
                      expiresAt.setHours(expiresAt.getHours() + 24);

                      const originalSellerEarning = Number(product.price) * 0.85;
                      const originalPlatformCommission = Number(product.price) * 0.15;
                      const discountAmount = appliedCoupon ? (Number(product.price) - finalPrice) : 0;
                      const finalPlatformCommission = Math.max(0, originalPlatformCommission - discountAmount);

                      const { error: orderError } = await supabase.from('orders').insert({
                        buyer_id: user.id,
                        seller_id: product.seller_id,
                        product_id: product.id,
                        amount: Number(product.price),
                        discount_amount: discountAmount,
                        final_amount: finalPrice,
                        platform_commission: finalPlatformCommission,
                        seller_earning: originalSellerEarning,
                        status: 'completed',
                        payment_method: 'paypal',
                        payment_number: details.payer.email_address,
                        transaction_id: details.id,
                        payment_note: `PayPal Transaction: ${details.id}`,
                        download_token: downloadToken,
                        link_expires_at: expiresAt.toISOString(),
                        max_downloads: 3,
                        current_downloads: 0,
                        coupon_code: appliedCoupon ? appliedCoupon.code : null
                      });

                      if (orderError) throw orderError;

                      if (appliedCoupon) {
                        await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id });
                      }

                      // 🔥 রেফারেল কমিশন লজিক (PayPal অর্ডার সফল হওয়ার পর)
                      const { data: buyerProfile } = await supabase
                        .from('profiles')
                        .select('referred_by')
                        .eq('id', user.id)
                        .single();

                      if (buyerProfile?.referred_by) {
                        const commissionAmount = Number(finalPrice) * 0.10; // ফাইনাল প্রাইসের ১০% কমিশন
                        
                        const { data: referrerData } = await supabase
                          .from('profiles')
                          .select('affiliate_balance')
                          .eq('id', buyerProfile.referred_by)
                          .single();

                        const newAffiliateBalance = Number(referrerData?.affiliate_balance || 0) + commissionAmount;

                        await supabase
                          .from('profiles')
                          .update({ affiliate_balance: newAffiliateBalance })
                          .eq('id', buyerProfile.referred_by);
                      }

                      setFeedback({ isOpen: true, type: 'success', message: 'পেমেন্ট সফল! আপনি এখন ডাউনলোড করতে পারবেন।' });
                      setShowCheckoutModal(false);
                      setAppliedCoupon(null);
                      setCouponCode('');
                    } catch (error: any) {
                      console.error("Order save error:", error);
                      setFeedback({ isOpen: true, type: 'error', message: error.message || 'অর্ডার সেভ করতে সমস্যা হয়েছে।' });
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  onError={(err) => {
                    console.error("PayPal Error:", err);
                    setFeedback({ isOpen: true, type: 'error', message: 'PayPal পেমেন্ট প্রক্রিয়াকরণে সমস্যা হয়েছে।' });
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}