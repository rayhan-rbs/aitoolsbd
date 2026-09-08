'use client';
import Skeleton from '@/components/ui/Skeleton';
import Toast from '@/components/ui/Toast'; // 🔥 এই লাইনটি যোগ করুন
import LazySection from '@/components/ui/LazySection';
import ImageWithLoader from '@/components/ui/ImageWithLoader';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faBolt, faCode, faArrowRight, faDownload, faStar, faCheckCircle,
  faRobot, faPalette, faFileCode, faGear, faShieldHalved, faHeadset, faChevronUp, faMagnifyingGlass,
  faUsers, faEnvelope, faQuoteLeft, faWallet, faPaperPlane, faMapMarkerAlt, faPhone
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, faTwitter, faLinkedinIn, faYoutube 
} from '@fortawesome/free-brands-svg-icons';
import { supabase } from '@/lib/supabaseClient';

const categories = [
  { name: 'All', icon: faRocket, color: 'from-indigo-500 to-purple-500' },
  { name: 'AI Prompt', icon: faRobot, color: 'from-purple-500 to-pink-500' },
  { name: 'Canva Template', icon: faPalette, color: 'from-pink-500 to-rose-500' },
  { name: 'WordPress Plugin', icon: faCode, color: 'from-blue-500 to-cyan-500' },
  { name: 'AI Automation', icon: faGear, color: 'from-emerald-500 to-teal-500' },
];

const testimonials = [
  { name: 'রাফি আহমেদ', role: 'ফ্রিল্যান্সার', text: 'এখানকার AI প্রম্পট প্যাকগুলো আমার কাজের গতি ৩ গুণ বাড়িয়ে দিয়েছে। সাপোর্ট টিম অসাধারণ!', rating: 5 },
  { name: 'সাদিয়া ইসলাম', role: 'ডিজিটাল মার্কেটার', text: 'ক্যানভা টেমপ্লেটগুলো অত্যন্ত প্রফেশনাল এবং সহজেই কাস্টমাইজ করা যায়। Highly Recommended!', rating: 5 },
  { name: 'তানভীর হাসান', role: 'সেলার', text: 'AIToolsBD তে সেলার হিসেবে আমার অভিজ্ঞতা চমৎকার। পেমেন্ট খুব দ্রুত এবং স্বচ্ছভাবে পাচ্ছি।', rating: 5 },
  { name: 'মাহফুজা আক্তার', role: 'গ্রাফিক ডিজাইনার', text: 'কাস্টমার সাপোর্ট এবং প্রোডাক্টের কোয়ালিটি দুটোই টপ লেভেলের। ধন্যবাদ AIToolsBD টিমকে।', rating: 5 }
];

export default function Home() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [displayCount, setDisplayCount] = useState(8);
  
  // 🔥 সার্চ স্টেট
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🔥 নিউজলেটার স্টেট
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState(''); // 🔥 এরর মেসেজের জন্য নতুন স্টেট
  
  // 🔥 নিচের লাইনটি যোগ করুন (Toast দেখানোর জন্য)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // 🔥 ফাংশনাল সার্চ হ্যান্ডলার
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 🔥 ফাংশনাল নিউজলেটার হ্যান্ডলার (alert ছাড়া, UI ফিডব্যাক সহ)
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setToast(null); // আগের কোনো টোস্ট থাকলে মুছে ফেলা
    setIsSubscribing(true);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
        // 🔥 এখানে Alert এর বদলে Toast সেট করছি
        setToast({ message: 'সাবস্ক্রিপশন সফল! আপনার ইমেইল চেক করুন।', type: 'success' });
        setTimeout(() => setIsSubscribed(false), 4000);
      } else {
        // 🔥 এখানেও Alert এর বদলে Toast সেট করছি
        setToast({ message: data.error || 'সাবস্ক্রিপশনে সমস্যা হয়েছে।', type: 'error' });
      }
    } catch (err) {
      console.error("Newsletter error:", err);
      setToast({ message: 'সার্ভার এরর। দয়া করে আবার চেষ্টা করুন।', type: 'error' });
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setDisplayCount(8);

      try {
        let query = supabase
          .from('products')
          .select('id, title, category, price, preview_url, download_count, average_rating, review_count')
          .eq('is_approved', true)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (activeCategory !== 'All') {
          query = query.eq('category', activeCategory);
        }

        const { data, error } = await query.limit(100);
        if (!error && data) setAllProducts(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, [activeCategory]);

  const visibleProducts = allProducts.slice(0, displayCount);
  const hasMoreProducts = displayCount < allProducts.length;
  const handleLoadMore = () => setDisplayCount((prev) => prev + 4);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 overflow-x-hidden transition-colors duration-300 font-bangla">
      
      {/* ================= ১. HERO SECTION ================= */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-8 shadow-sm backdrop-blur-md">
            <FontAwesomeIcon icon={faBolt} className="text-yellow-500 animate-pulse" />
            <span>বাংলাদেশের #১ প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tight">
            আপনার ব্যবসাকে AI ও <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              টেকনোলজি দিয়ে গ্রো করান
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            প্রিমিয়াম AI প্রম্পট, ক্যানভা টেমপ্লেট, অটোমেশন স্ক্রিপ্ট এবং প্লাগিন কিনুন বা বিক্রি করুন একই প্ল্যাটফর্মে। 
            <span className="block mt-2 font-semibold text-slate-800 dark:text-slate-200">১০০% নিরাপদ, তাৎক্ষণিক ডাউনলোড এবং সাশ্রয়ী মূল্যে।</span>
          </p>

          {/* 🔥 ফাংশনাল সার্চ বক্স */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আপনি কী খুঁজছেন? (যেমন: ChatGPT Prompt, Canva...)" 
              className="w-full pl-12 pr-14 py-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-indigo-500/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg"
            />
            <button type="submit" className="active:scale-95 absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/products" className="active:scale-95 group inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-bold text-lg rounded-2xl hover:bg-indigo-700 transition-all duration-300 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1">
              <FontAwesomeIcon icon={faRocket} className="group-hover:rotate-12 transition-transform duration-300" />
              প্রোডাক্ট দেখুন
            </Link>
            <Link href="/dashboard/upload" className="active:scale-95 group inline-flex items-center gap-3 px-10 py-5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-lg rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              বিক্রেতা হোন
              <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      <LazySection>
        {/* ================= ২. PLATFORM STATS ================= */}
        <section className="py-16 bg-indigo-600 dark:bg-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
              {[
                { icon: faCode, value: '৫০০+', label: 'প্রিমিয়াম প্রোডাক্ট' },
                { icon: faUsers, value: '২,০০০+', label: 'সক্রিয় ব্যবহারকারী' },
                { icon: faDownload, value: '১০,০০০+', label: 'সফল ডাউনলোড' },
                { icon: faShieldHalved, value: '১০০%', label: 'নিরাপদ লেনদেন' },
              ].map((stat, idx) => (
                <div key={idx} className="p-4">
                  <FontAwesomeIcon icon={stat.icon} className="text-4xl mb-4 text-indigo-200" />
                  <div className="text-4xl lg:text-5xl font-black mb-2">{stat.value}</div>
                  <div className="text-indigo-100 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      <LazySection>
        {/* ================= ৩. CATEGORIES SECTION ================= */}
        <section className="py-24 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">জনপ্রিয় ক্যাটাগরি</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">আপনার প্রয়োজন অনুযায়ী সেরা টুলস বেছে নিন</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.map((cat) => (
                <button 
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                    activeCategory === cat.name 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-lg shadow-indigo-500/10' 
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg`}>
                    <FontAwesomeIcon icon={cat.icon} className="text-2xl" />
                  </div>
                  <span className="font-bold text-base">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      <LazySection>
        {/* ================= ৪. WHY CHOOSE US ================= */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">কেন আমাদের বেছে নেবেন?</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">আমরা নিশ্চিত করি সেরা মান, নিরাপত্তা এবং সাশ্রয়ী মূল্যে ডিজিটাল পণ্য ক্রয়-বিক্রয়ের অভিজ্ঞতা।</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: faShieldHalved, title: '১০০% নিরাপদ লেনদেন', desc: 'আপনার পেমেন্ট এবং ডেটা সর্বোচ্চ নিরাপত্তা প্রোটোকল দিয়ে সুরক্ষিত।' },
                { icon: faBolt, title: 'তাৎক্ষণিক ডাউনলোড', desc: 'পেমেন্ট কনফার্ম হওয়ার সাথে সাথেই আপনার ফাইল ডাউনলোড লিংক সক্রিয় হয়ে যাবে।' },
                { icon: faHeadset, title: '২৪/৭ প্রিমিয়াম সাপোর্ট', desc: 'যেকোনো প্রয়োজনে আমাদের ডেডিকেটেড সাপোর্ট টিম সবসময় আপনার পাশে আছে।' }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 hover:-translate-y-1 group text-center shadow-sm hover:shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <FontAwesomeIcon icon={feature.icon} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      <LazySection>
        {/* ================= ৫. DYNAMIC PRODUCTS SECTION ================= */}
        <section className="py-24 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
                  {activeCategory === 'All' ? 'সকল ফিচার্ড প্রোডাক্ট' : `${activeCategory} ক্যাটাগরির প্রোডাক্ট`}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">সবচেয়ে জনপ্রিয় এবং ট্রেন্ডিং ডিজিটাল প্রোডাক্টসমূহ</p>
              </div>
              <Link href="/products" className="active:scale-95 group text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2 transition-colors text-lg">
                সব প্রোডাক্ট দেখুন 
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </div>

            {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex gap-3">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-11 w-24 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
              <div className="text-center py-24 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <FontAwesomeIcon icon={faCode} className="text-5xl text-slate-300 dark:text-slate-600 mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">এই ক্যাটাগরিতে কোনো প্রোডাক্ট নেই</h3>
                <button onClick={() => setActiveCategory('All')} className="active:scale-95 text-indigo-600 hover:text-indigo-700 font-bold text-lg hover:underline">সকল প্রোডাক্ট দেখুন</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {visibleProducts.map((product, index) => (
                    <Link 
                      href={`/products/${product.id}`}
                      key={`${product.id}-${index}`} 
                      className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <ImageWithLoader src={product.preview_url || ''} alt={product.title} className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-xs font-bold text-indigo-700 dark:text-indigo-300 rounded-full shadow-sm border border-indigo-100 dark:border-indigo-800/50 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 dark:group-hover:text-white transition-colors duration-300">
                            {product.category}
                          </span>
                        </div>
                        {product.average_rating > 0 && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1.5 bg-yellow-400/90 backdrop-blur-md text-slate-900 rounded-full shadow-sm text-xs font-bold">
                            <FontAwesomeIcon icon={faStar} className="text-slate-900 text-xs" />
                            {product.average_rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 leading-snug text-lg min-h-[3.5rem]">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-5">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            <FontAwesomeIcon icon={faDownload} className="text-indigo-500 dark:text-indigo-400 text-xs" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">{product.download_count || 0} বিক্রি</span>
                          </div>
                          {product.review_count > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                              <FontAwesomeIcon icon={faStar} className="text-indigo-500 dark:text-indigo-400 text-xs" />
                              <span className="font-bold text-slate-700 dark:text-slate-300">{product.review_count}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">মূল্য</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">৳{product.price}</span>
                          </div>
                          <span className="active:scale-95 relative overflow-hidden px-5 py-3 bg-slate-900 dark:bg-indigo-600 text-white text-sm font-bold rounded-xl group-hover:bg-indigo-600 dark:group-hover:bg-indigo-700 transition-all duration-300 shadow-lg flex items-center gap-2">
                            বিস্তারিত
                            <FontAwesomeIcon icon={faArrowRight} className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {hasMoreProducts && (
                  <div className="text-center mt-16">
                    <button onClick={handleLoadMore} className="active:scale-95 inline-flex items-center gap-3 px-10 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md">
                      আরও প্রোডাক্ট দেখুন <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </LazySection>

      <LazySection>
        {/* ================= ৬. TESTIMONIALS MARQUEE SLIDER ================= */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">আমাদের ব্যবহারকারীরা কী বলেন?</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">হাজার হাজার সন্তুষ্ট ক্রেতা ও বিক্রেতার অভিজ্ঞতা</p>
          </div>
          <style>{`
            @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .animate-marquee { animation: marquee 40s linear infinite; }
            .animate-marquee:hover { animation-play-state: paused; }
          `}</style>
          <div className="relative w-full">
            <div className="flex animate-marquee hover:[animation-play-state:paused] gap-6 w-max">
              {[...testimonials, ...testimonials, ...testimonials].map((t, idx) => (
                <div key={idx} className="w-[350px] sm:w-[400px] flex-shrink-0 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 relative">
                  <FontAwesomeIcon icon={faQuoteLeft} className="text-4xl text-indigo-100 dark:text-indigo-900/50 absolute top-6 right-6" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 text-sm" />)}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed italic min-h-[80px]">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">{t.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      <LazySection>
        {/* ================= ৭. SELLER CTA SECTION ================= */}
        <section className="py-32 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900 to-purple-900/80 dark:from-indigo-950/80 dark:via-slate-950 dark:to-purple-950/80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/20 dark:bg-indigo-500/10 text-indigo-400 mb-8 animate-bounce">
              <FontAwesomeIcon icon={faCode} className="text-4xl" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 leading-tight">
              আপনার তৈরি করা ডিজিটাল প্রোডাক্ট <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">হাজার হাজার মানুষের কাছে পৌঁছে দিন</span>
            </h2>
            <p className="text-slate-300 dark:text-slate-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              আজই AIToolsBD-তে সেলার হিসেবে রেজিস্টার করুন এবং আপনার ডিজিটাল প্রোডাক্ট বিক্রি শুরু করুন। আমরা দিচ্ছি অটোমেটেড পেমেন্ট সিস্টেম, মার্কেটিং সাপোর্ট এবং ২৪/৭ প্রায়োরিটি সাপোর্ট।
            </p>
            <Link href="/dashboard/upload" className="active:scale-95 group inline-flex items-center gap-4 px-12 py-6 bg-white dark:bg-indigo-600 text-slate-900 dark:text-white font-black text-xl rounded-3xl hover:bg-indigo-50 dark:hover:bg-indigo-700 transition-all duration-300 shadow-2xl shadow-white/10 dark:shadow-indigo-500/30 hover:shadow-white/20 dark:hover:shadow-indigo-500/40 hover:-translate-y-2">
              আজই বিক্রি শুরু করুন <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </section>
      </LazySection>

      <LazySection>
        {/* ================= ৮. NEWSLETTER (Fully Functional, No Alert) ================= */}
        <section className="py-20 bg-indigo-600 dark:bg-indigo-900">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <FontAwesomeIcon icon={faEnvelope} className="text-5xl text-indigo-200 mb-6" />
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">সর্বশেষ আপডেট এবং অফার পেতে সাবস্ক্রাইব করুন</h2>
            <p className="text-indigo-100 mb-8 text-lg">আমরা স্প্যাম করি না। শুধুমাত্র গুরুত্বপূর্ণ আপডেট এবং এক্সক্লুসিভ ডিসকাউন্ট কোড পাঠাই।</p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubscribeError(''); // টাইপ করার সাথে সাথে এরর মুছে যাবে
                }}
                placeholder="আপনার ইমেইল অ্যাড্রেস" 
                required
                disabled={isSubscribed || isSubscribing}
                className="flex-1 px-6 py-4 rounded-2xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder-indigo-200 focus:ring-4 focus:ring-white/20 outline-none disabled:opacity-70"
              />
              <button 
                type="submit" 
                disabled={isSubscribed || isSubscribing}
                className={`active:scale-95 px-8 py-4 font-bold rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 min-w-[160px] ${
                  isSubscribed ? 'bg-emerald-500 text-white cursor-default' : 'bg-white text-indigo-600 hover:bg-indigo-50 disabled:opacity-70'
                }`}
              >
                {isSubscribing ? 'অপেক্ষা করুন...' : isSubscribed ? <><FontAwesomeIcon icon={faCheckCircle} /> সাবস্ক্রাইবড!</> : <><FontAwesomeIcon icon={faPaperPlane} /> সাবস্ক্রাইব</>}
              </button>
            </form>
            
            {/* 🔥 Alert এর পরিবর্তে সুন্দর UI এরর মেসেজ */}
            {subscribeError && (
              <p className="text-red-200 text-sm mt-4 font-bangla flex items-center justify-center gap-2 animate-pulse">
                ⚠️ {subscribeError}
              </p>
            )}
          </div>
        </section>
      </LazySection>
      {/* ================= ৯. PROFESSIONAL FOOTER ================= */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/50 font-bangla">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            <div className="lg:col-span-4 space-y-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                  <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">AI<span className="text-indigo-400">Tools</span>BD</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">বাংলাদেশের সবচেয়ে বিশ্বস্ত প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস। AI প্রম্পট, ক্যানভা টেমপ্লেট, অটোমেশন স্ক্রিপ্ট এবং আরও অনেক কিছু কিনুন বা বিক্রি করুন।</p>
              <div className="flex gap-3 pt-2">
                {[faFacebookF, faTwitter, faLinkedinIn, faYoutube].map((icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all duration-300 group" aria-label="Social Link">
                    <FontAwesomeIcon icon={icon} className="text-sm group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-base mb-6 tracking-wide uppercase">মার্কেটপ্লেস</h3>
              <ul className="space-y-4">
                {[{ label: 'সকল প্রোডাক্ট', href: '/products' }, { label: 'ক্যাটাগরি', href: '/products?category=all' }, { label: 'বিক্রেতা হোন', href: '/sellers' }, { label: 'আমাদের সম্পর্কে', href: '/about' }].map((item, idx) => (
                  <li key={idx}><Link href={item.href} className="text-sm hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 inline-block">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-base mb-6 tracking-wide uppercase">সাপোর্ট ও নীতিমালা</h3>
              <ul className="space-y-4">
                {[{ label: 'হেল্প সেন্টার', href: '/help' }, { label: 'ব্যবহারের শর্তাবলী', href: '/terms' }, { label: 'গোপনীয়তা নীতি', href: '/privacy' }, { label: 'রিফান্ড পলিসি', href: '/refund' }].map((item, idx) => (
                  <li key={idx}><Link href={item.href} className="text-sm hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 inline-block">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-4">
              <h3 className="text-white font-bold text-base mb-6 tracking-wide uppercase">যোগাযোগ করুন</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/50 transition-colors"><FontAwesomeIcon icon={faEnvelope} className="text-indigo-400 text-xs" /></div>
                  <span className="pt-1 group-hover:text-white transition-colors">support@aitoolsbd.com</span>
                </li>
                <li className="flex items-start gap-3 text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/50 transition-colors"><FontAwesomeIcon icon={faPhone} className="text-indigo-400 text-xs" /></div>
                  <span className="pt-1 group-hover:text-white transition-colors">+880 1XXX-XXXXXX</span>
                </li>
                <li className="flex items-start gap-3 text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/50 transition-colors"><FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-400 text-xs" /></div>
                  <span className="pt-1 group-hover:text-white transition-colors">ঢাকা, বাংলাদেশ</span>
                </li>
              </ul>
              <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" /></div>
                <div><p className="text-xs font-bold text-white">১০০% নিরাপদ লেনদেন</p><p className="text-[10px] text-slate-500">SSL এনক্রিপ্টেড পেমেন্ট</p></div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800/50 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} <span className="text-slate-300 font-semibold">AIToolsBD</span>. সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <span>তৈরি করা হয়েছে</span><FontAwesomeIcon icon={faRocket} className="text-red-500 animate-pulse" /><span>বাংলাদেশ থেকে</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 🔥 Toast Notification এখানে রেন্ডার হবে */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <button onClick={scrollToTop} className={`fixed bottom-8 right-8 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-110 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`} aria-label="Back to top">
        <FontAwesomeIcon icon={faChevronUp} className="text-xl" />
      </button>
    </div>
  );
}