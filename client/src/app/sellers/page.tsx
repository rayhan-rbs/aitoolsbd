'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faWallet, faShieldHalved, faChartLine, 
  faUpload, faCheckCircle, faArrowRight, faEnvelope,
  faPhone, faMapMarkerAlt // 🔥 ফুটারের জন্য যোগ করা হয়েছে
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, faTwitter, faYoutube, faLinkedinIn // 🔥 LinkedIn আইকন যোগ করা হয়েছে
} from '@fortawesome/free-brands-svg-icons';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function SellersPage() {
  const { user } = useAuth(); // 🔥 লগইন স্ট্যাটাস চেক করার জন্য

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-bangla flex flex-col">
      
      {/* ================= ১. HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-8 border border-indigo-100 dark:border-indigo-800 shadow-sm">
            <FontAwesomeIcon icon={faRocket} className="text-indigo-500" />
            <span>AIToolsBD সেলার প্রোগ্রাম</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-6 tracking-tight">
            আপনার ডিজিটাল প্রোডাক্ট বিক্রি করে <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              আয় শুরু করুন আজই
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI প্রম্পট, ক্যানভা টেমপ্লেট, সফটওয়্যার স্ক্রিপ্ট বা যেকোনো ডিজিটাল ফাইল আপলোড করুন। 
            আমরা দিচ্ছি অটোমেটেড পেমেন্ট, মার্কেটিং সাপোর্ট এবং মাত্র ১৫% কমিশনে সর্বোচ্চ আয়ের নিশ্চয়তা।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* 🔥 লগইন স্ট্যাটাস অনুযায়ী বাটন পরিবর্তন হবে */}
            {user ? (
              <Link href="/dashboard/upload">
                <Button variant="primary" size="lg" icon={faUpload} className="shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40">
                  প্রোডাক্ট আপলোড করুন
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button variant="primary" size="lg" icon={faRocket} className="shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40">
                  বিনামূল্যে সেলার অ্যাকাউন্ট খুলুন
                </Button>
              </Link>
            )}
            
            <Link href="/products">
              <Button variant="outline" size="lg" icon={faArrowRight} className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                মার্কেটপ্লেস দেখুন
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= ২. WHY CHOOSE US (সুবিধাসমূহ) ================= */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">কেন AIToolsBD তে বিক্রি করবেন?</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">আমরা সেলারদের সাফল্যকে প্রাধান্য দিই, তাই আমাদের প্ল্যাটফর্মটি সেরা ফিচার দিয়ে সজ্জিত।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: faWallet, title: 'সর্বোচ্চ আয় (৮৫%)', desc: 'মাত্র ১৫% প্ল্যাটফর্ম ফি। বাকি ৮৫% সরাসরি আপনার ওয়ালেটে জমা হবে।' },
              { icon: faChartLine, title: 'অটোমেটেড ডেলিভারি', desc: 'পেমেন্ট কনফার্ম হওয়ার সাথে সাথেই ক্রেতা নিরাপদে ফাইল ডাউনলোড করতে পারে।' },
              { icon: faShieldHalved, title: 'নিরাপদ লেনদেন', desc: 'আপনার ডিজিটাল ফাইল এবং পেমেন্ট সম্পূর্ণ নিরাপদ ও এনক্রিপ্টেড।' },
              { icon: faUpload, title: 'সহজ ম্যানেজমেন্ট', desc: 'কয়েকটি ক্লিকেই প্রোডাক্ট আপলোড, এডিট এবং সেলস ট্র্যাক করুন।' }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ৩. HOW IT WORKS (কীভাবে কাজ করে) ================= */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">মাত্র ৩টি ধাপে বিক্রি শুরু করুন</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 -z-10"></div>
            
            {[
              { step: '০১', title: 'অ্যাকাউন্ট তৈরি করুন', desc: 'সেকেন্ডের মধ্যে ফ্রি রেজিস্ট্রেশন করুন এবং সেলার প্রোফাইল সেটআপ করুন।' },
              { step: '০২', title: 'প্রোডাক্ট আপলোড করুন', desc: 'আপনার ডিজিটাল ফাইল, প্রিভিউ ইমেজ, দাম এবং বিবরণ যোগ করে সাবমিট করুন।' },
              { step: '০৩', title: 'আয় করুন ও উইথড্র নিন', desc: 'প্রোডাক্ট অনুমোদিত হওয়ার পর বিক্রি শুরু হবে। আয় সরাসরি ওয়ালেটে পাবেন।' }
            ].map((item, idx) => (
              <div key={idx} className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center z-10 hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/30">
                  {item.step}
                </div>
                <div className="mt-4 mb-6">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ৪. FINAL CTA ================= */}
      <section className="py-24 bg-indigo-600 dark:bg-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
            আপনার ডিজিটাল যাত্রা শুরু করতে প্রস্তুত?
          </h2>
          <p className="text-indigo-100 text-xl mb-10 max-w-2xl mx-auto">
            হাজার হাজার সফল সেলারের সাথে যোগ দিন এবং আপনার স্কিলকে আয়ে রূপান্তর করুন।
          </p>
          
          {user ? (
            <Link href="/dashboard/upload">
              <button className="px-8 py-4 bg-white text-indigo-700 font-black text-lg rounded-2xl hover:bg-indigo-50 transition-all duration-300 shadow-2xl flex items-center gap-3 mx-auto">
                <FontAwesomeIcon icon={faUpload} /> ড্যাশবোর্ডে গিয়ে আপলোড করুন
              </button>
            </Link>
          ) : (
            <Link href="/register">
              <button className="px-8 py-4 bg-white text-indigo-700 font-black text-lg rounded-2xl hover:bg-indigo-50 transition-all duration-300 shadow-2xl flex items-center gap-3 mx-auto">
                <FontAwesomeIcon icon={faRocket} /> এখনই ফ্রি রেজিস্ট্রেশন করুন
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* ================= ৫. PROFESSIONAL FOOTER ================= */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/50 font-bangla mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                  <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">
                  AI<span className="text-indigo-400">Tools</span>BD
                </span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                বাংলাদেশের সবচেয়ে বিশ্বস্ত প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস। AI প্রম্পট, ক্যানভা টেমপ্লেট, অটোমেশন স্ক্রিপ্ট এবং আরও অনেক কিছু কিনুন বা বিক্রি করুন।
              </p>
              
              <div className="flex gap-3 pt-2">
                {[faFacebookF, faTwitter, faLinkedinIn, faYoutube].map((icon, idx) => (
                  <a 
                    key={idx} 
                    href="#" 
                    className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all duration-300 group"
                    aria-label="Social Link"
                  >
                    <FontAwesomeIcon icon={icon} className="text-sm group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-base mb-6 tracking-wide uppercase">মার্কেটপ্লেস</h3>
              <ul className="space-y-4">
                {[
                  { label: 'সকল প্রোডাক্ট', href: '/products' },
                  { label: 'ক্যাটাগরি', href: '/products?category=all' },
                  { label: 'বিক্রেতা হোন', href: '/sellers' },
                  { label: 'আমাদের সম্পর্কে', href: '/about' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="text-sm hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-base mb-6 tracking-wide uppercase">সাপোর্ট ও নীতিমালা</h3>
              <ul className="space-y-4">
                {[
                  { label: 'হেল্প সেন্টার', href: '/help' },
                  { label: 'ব্যবহারের শর্তাবলী', href: '/terms' },
                  { label: 'গোপনীয়তা নীতি', href: '/privacy' },
                  { label: 'রিফান্ড পলিসি', href: '/refund' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="text-sm hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-4">
              <h3 className="text-white font-bold text-base mb-6 tracking-wide uppercase">যোগাযোগ করুন</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/50 transition-colors">
                    <FontAwesomeIcon icon={faEnvelope} className="text-indigo-400 text-xs" />
                  </div>
                  <span className="pt-1 group-hover:text-white transition-colors">support@aitoolsbd.com</span>
                </li>
                <li className="flex items-start gap-3 text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/50 transition-colors">
                    <FontAwesomeIcon icon={faPhone} className="text-indigo-400 text-xs" />
                  </div>
                  <span className="pt-1 group-hover:text-white transition-colors">+880 1XXX-XXXXXX</span>
                </li>
                <li className="flex items-start gap-3 text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/50 transition-colors">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-400 text-xs" />
                  </div>
                  <span className="pt-1 group-hover:text-white transition-colors">ঢাকা, বাংলাদেশ</span>
                </li>
              </ul>

              <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">১০০% নিরাপদ লেনদেন</p>
                  <p className="text-[10px] text-slate-500">SSL এনক্রিপ্টেড পেমেন্ট</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800/50 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} <span className="text-slate-300 font-semibold">AIToolsBD</span>. সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <span>তৈরি করা হয়েছে</span>
              <FontAwesomeIcon icon={faRocket} className="text-red-500 animate-pulse" />
              <span>বাংলাদেশ থেকে</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}