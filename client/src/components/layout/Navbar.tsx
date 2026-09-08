'use client';
import dynamic from 'next/dynamic';

const AuthModal = dynamic(() => import('../auth/AuthModal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl p-8">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="h-32 w-96 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  ),
  ssr: false, // 🔥 শুধু ক্লায়েন্ট সাইডে লোড হবে
});
import { useTranslation } from '@/contexts/LanguageContext'; // 🔥 Translation হুক ইম্পোর্ট
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, 
  faBars, 
  faXmark, 
  faUser, 
  faShoppingCart, 
  faRightFromBracket,
  faShieldHalved,
  faBoxOpen,
  faChartLine,
  faGear,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const { t } = useTranslation(); // 🔥 Translation ফাংশন কল করা হয়েছে
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(''); // 🔥 নতুন: Avatar URL স্টেট
  
  // 🔥 Desktop User Dropdown State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔥 Click outside to close desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // 🔥 আপডেটেড: role এবং avatar_url দুটোই ফেচ করা হচ্ছে
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setUserRole(null);
        setAvatarUrl('');
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('role, avatar_url') // 🔥 avatar_url যোগ করা হয়েছে
        .eq('id', user.id)
        .single();
      
      setUserRole(data?.role || null);
      setAvatarUrl(data?.avatar_url || ''); // 🔥 avatar_url সেট করা
    };
    fetchProfileData();
  }, [user]);

  const openLogin = () => { setAuthMode('login'); setIsAuthModalOpen(true); };
  const openRegister = () => { setAuthMode('register'); setIsAuthModalOpen(true); };
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg shadow-lg border-b border-slate-200 dark:border-slate-800' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* ১. Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white font-bangla">
                AI<span className="text-indigo-600 dark:text-indigo-400">Tools</span>BD
              </span>
            </Link>

            {/* ২. Desktop Menu Links */}
            <div className="hidden lg:flex items-center gap-8">
              <Link href="/products" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors font-bangla">
                {t('nav.products')}
              </Link>
              <Link href="/sellers" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors font-bangla">
                {t('nav.sellers')}
              </Link>
            </div>

            {/* ৩. Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ) : user ? (
                <div className="relative" ref={dropdownRef}>
                  {/* 🔥 User Dropdown Trigger */}
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                  >
                    {/* 🔥 Avatar Image অথবা Fallback Initial */}
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/30 shadow-md" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {user.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-slate-900 dark:text-white font-bangla group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors max-w-[120px] truncate">
                      {user.user_metadata?.name || 'User'}
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} className={`text-xs text-slate-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* 🔥 User Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden"
                      >
                        <Link href="/dashboard/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bangla">
                          <FontAwesomeIcon icon={faUser} className="w-4 text-indigo-500" /> {t('nav.profile')}
                        </Link>
                        <Link href="/dashboard/settings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bangla">
                          <FontAwesomeIcon icon={faGear} className="w-4 text-slate-500" /> {t('nav.settings')}
                        </Link>
                        
                        <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
                        
                        <Link href="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bangla">
                          <FontAwesomeIcon icon={faChartLine} className="w-4 text-slate-500" /> {t('nav.dashboard')}
                        </Link>
                        <Link href="/dashboard/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bangla">
                          <FontAwesomeIcon icon={faBoxOpen} className="w-4 text-slate-500" /> {t('nav.orders')}
                        </Link>
                        
                        {userRole === 'admin' && (
                          <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-bangla">
                            <FontAwesomeIcon icon={faShieldHalved} className="w-4" /> {t('nav.admin')}
                          </Link>
                        )}

                        <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
                        
                        <button 
                          onClick={() => { signOut(); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bangla text-left"
                        >
                          <FontAwesomeIcon icon={faRightFromBracket} className="w-4" /> {t('nav.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" icon={faShoppingCart}>Cart</Button>
                  <Button variant="outline" size="sm" onClick={openLogin} icon={faUser}>{t('nav.login')}</Button>
                  <Button variant="primary" size="sm" onClick={openRegister}>{t('nav.register')}</Button>
                </>
              )}
            </div>

            {/* ৪. Mobile Right Side */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                aria-label="Toggle Menu"
              >
                <FontAwesomeIcon 
                  icon={isMobileMenuOpen ? faXmark : faBars} 
                  className="text-slate-700 dark:text-slate-300 text-xl" 
                />
              </button>
            </div>
          </div>
        </div>

        {/* ================= ৫. MOBILE MENU ================= */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-2">
                <Link href="/products" className="px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors font-bangla" onClick={closeMobileMenu}>
                  {t('nav.products')}
                </Link>
                <Link href="/sellers" className="px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors font-bangla" onClick={closeMobileMenu}>
                  {t('nav.sellers')}
                </Link>

                <div className="border-t border-slate-200 dark:border-slate-800 my-2" />

                {loading ? (
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                ) : user ? (
                  <>
                    {/* User Info Card */}
                    <div className="px-4 py-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-xl mb-2 border border-slate-100 dark:border-slate-800">
                      {/* 🔥 Avatar Image অথবা Fallback Initial */}
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30 shadow-md" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {user.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
                          {user.user_metadata?.name || 'User'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bangla capitalize">
                          {userRole === 'admin' ? 'Admin' : 'Buyer/Seller'}
                        </span>
                      </div>
                    </div>

                    {/* 🔥 নতুন যোগ করা লিংকসমূহ */}
                    <Link href="/dashboard/profile" className="px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors font-bangla flex items-center gap-3" onClick={closeMobileMenu}>
                      <FontAwesomeIcon icon={faUser} className="text-indigo-500 w-5" /> {t('nav.profile')}
                    </Link>
                    <Link href="/dashboard/settings" className="px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors font-bangla flex items-center gap-3" onClick={closeMobileMenu}>
                      <FontAwesomeIcon icon={faGear} className="text-slate-500 w-5" /> {t('nav.settings')}
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <Link href="/dashboard" className="px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors font-bangla flex items-center gap-3" onClick={closeMobileMenu}>
                      <FontAwesomeIcon icon={faChartLine} className="text-slate-500 w-5" /> {t('nav.dashboard')}
                    </Link>
                    <Link href="/dashboard/orders" className="px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors font-bangla flex items-center gap-3" onClick={closeMobileMenu}>
                      <FontAwesomeIcon icon={faBoxOpen} className="text-slate-500 w-5" /> {t('nav.orders')}
                    </Link>

                    {userRole === 'admin' && (
                      <Link href="/admin" className="px-4 py-3 rounded-xl text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium transition-colors font-bangla flex items-center gap-3" onClick={closeMobileMenu}>
                        <FontAwesomeIcon icon={faShieldHalved} className="w-5" /> {t('nav.admin')}
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button 
                      onClick={() => { signOut(); closeMobileMenu(); }}
                      className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-bangla flex items-center gap-3"
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} className="w-5" /> {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" fullWidth onClick={() => { openLogin(); closeMobileMenu(); }} icon={faUser} className="font-bangla">{t('nav.login')}</Button>
                    <Button variant="primary" fullWidth onClick={() => { openRegister(); closeMobileMenu(); }} className="font-bangla">{t('nav.register')}</Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}