'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, 
  faFacebookF, 
  faTwitter, 
  faLinkedinIn, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
  faPaperPlane,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // এখানে পরে Supabase বা Email API ইন্টিগ্রেশন যোগ করবেন
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/50 font-bangla">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 🔥 ১. Newsletter Section (প্রফেশনাল লুকের জন্য অত্যন্ত জরুরি) */}
        <div className="py-12 border-b border-slate-800/50">
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-2xl p-8 md:p-10 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">নতুন AI টুলস এবং আপডেট সবার আগে পান</h3>
              <p className="text-slate-300 text-sm">আমাদের নিউজলেটার সাবস্ক্রাইব করুন, স্প্যাম পাঠানো হবে না।</p>
            </div>
            <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার ইমেইল অ্যাড্রেস" 
                  required
                  className="w-full sm:w-80 pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubscribed}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isSubscribed 
                    ? 'bg-emerald-600 text-white cursor-default' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                }`}
              >
                {isSubscribed ? (
                  <><FontAwesomeIcon icon={faCheckCircle} /> সাবস্ক্রাইবড</>
                ) : (
                  <><FontAwesomeIcon icon={faPaperPlane} /> সাবস্ক্রাইব</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 🔥 ২. Main Footer Grid */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand Column (4 cols) */}
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
            
            {/* Social Links with Glow Effect */}
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

          {/* Quick Links (2 cols) */}
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

          {/* Support (2 cols) */}
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

          {/* Contact & Trust (4 cols) */}
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

            {/* Trust Badges (Optional but highly professional) */}
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

        {/* 🔥 ৩. Bottom Bar */}
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
  );
}