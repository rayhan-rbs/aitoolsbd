import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndoAlt, faCalendarAlt, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export const metadata = {
  title: 'রিফান্ড পলিসি - AIToolsBD',
  description: 'AIToolsBD-এর রিফান্ড পলিসি, শর্ত এবং প্রক্রিয়া সম্পর্কে বিস্তারিত তথ্য।'
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-bangla">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-6 border border-indigo-100 dark:border-indigo-800">
            <FontAwesomeIcon icon={faUndoAlt} className="text-indigo-500" />
            <span>রিফান্ড নীতি</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4">
            রিফান্ড <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">পলিসি</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" />
            সর্বশেষ আপডেট: ১ জানুয়ারি, ২০২৬
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8 flex gap-4">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2">গুরুত্বপূর্ণ নোটিশ</h3>
            <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
              ডিজিটাল প্রোডাক্ট হওয়ার কারণে, একবার ডাউনলোড করার পর রিফান্ড পাওয়া কঠিন। তাই কেনার আগে প্রোডাক্টের বিবরণ, প্রিভিউ এবং রিভিউ সতর্কতার সাথে পরীক্ষা করুন।
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              রিফান্ডের যোগ্যতা
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              নিম্নলিখিত পরিস্থিতিতে আপনি রিফান্ডের জন্য আবেদন করতে পারেন:
            </p>
            <div className="space-y-3">
              {[
                { title: 'প্রোডাক্ট ডাউনলোড করা যায়নি', desc: 'পেমেন্ট সম্পন্ন হওয়ার পরও যদি আপনি প্রোডাক্টটি ডাউনলোড করতে না পারেন।' },
                { title: 'প্রোডাক্ট ত্রুটিপূর্ণ', desc: 'প্রোডাক্টটি বিবরণ অনুযায়ী কাজ করে না বা গুরুত্বপূর্ণ ফিচার অনুপস্থিত।' },
                { title: 'ভুল প্রোডাক্ট ডেলিভারি', desc: 'আপনি যে প্রোডাক্ট কিনেছেন তার পরিবর্তে অন্য কিছু পেয়েছেন।' },
                { title: 'ডুপ্লিকেট পেমেন্ট', desc: 'একই প্রোডাক্টের জন্য ভুলবশত দুবার পেমেন্ট হয়ে গেলে।' },
                { title: 'অননুমোদিত লেনদেন', desc: 'আপনার অনুমতি ছাড়া আপনার অ্যাকাউন্ট থেকে পেমেন্ট হলে।' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              রিফান্ডের সময়সীমা
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">📅 পেমেন্টের পর</h3>
                <p className="text-3xl font-black text-indigo-700 dark:text-indigo-400 mb-1">২৪ ঘন্টা</p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">রিফান্ড আবেদনের সময়সীমা</p>
              </div>
              <div className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
                <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-2">⏱️ প্রসেসিং সময়</h3>
                <p className="text-3xl font-black text-purple-700 dark:text-purple-400 mb-1">৩-৫ দিন</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">রিফান্ড অনুমোদনের পর</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              রিফান্ড প্রক্রিয়া
            </h2>
            <div className="space-y-4">
              {[
                { step: '১', title: 'রিফান্ড আবেদন জমা দিন', desc: 'support@aitoolsbd.com ইমেইলে আপনার অর্ডার আইডি, ক্রয়ের তারিখ এবং সমস্যার বিবরণ পাঠান।' },
                { step: '২', title: 'আমাদের টিম যাচাই করবে', desc: 'আমাদের সাপোর্ট টিম ২৪ ঘন্টার মধ্যে আপনার আবেদন পর্যালোচনা করবে এবং প্রয়োজনে অতিরিক্ত তথ্য চাইতে পারে।' },
                { step: '৩', title: 'অনুমোদন বা প্রত্যাখ্যান', desc: 'রিফান্ডের যোগ্যতা যাচাইয়ের পর আমরা আপনাকে ইমেইলে জানাবো।' },
                { step: '৪', title: 'রিফান্ড প্রসেসিং', desc: 'অনুমোদিত হলে, আপনার মূল পেমেন্ট মেথডে ৩-৫ কার্যদিবসের মধ্যে টাকা ফেরত দেওয়া হবে।' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              রিফান্ড প্রযোজ্য নয় এমন ক্ষেত্রে
            </h2>
            <div className="space-y-3">
              {[
                'পেমেন্টের ২৪ ঘন্টা পর আবেদন করলে',
                'প্রোডাক্ট সফলভাবে ডাউনলোড করার পর (যদি না ত্রুটি থাকে)',
                'শুধুমাত্র মত পরিবর্তনের কারণে',
                'প্রোডাক্টের বিবরণ পড়ার পরও ভুল বোঝাবুঝি হলে',
                'ডিসকাউন্ট বা অফারের সময় কেনা প্রোডাক্টের ক্ষেত্রে (বিশেষ শর্ত প্রযোজ্য)',
                'সেলারের সাথে ব্যক্তিগত চুক্তিতে কেনা প্রোডাক্ট'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                  <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              আংশিক রিফান্ড
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              কিছু ক্ষেত্রে আমরা আংশিক রিফান্ড প্রদান করতে পারি:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              <li>• প্রোডাক্টের কিছু অংশ ত্রুটিপূর্ণ হলে</li>
              <li>• প্রোডাক্ট সম্পূর্ণরূপে কাজ না করলে কিন্তু কিছু ফিচার কাজ করলে</li>
              <li>• বিক্রেতার সম্মতিতে বিশেষ পরিস্থিতিতে</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              রিফান্ড মেথড
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              রিফান্ড সর্বদা মূল পেমেন্ট মেথডেই ফেরত দেওয়া হবে:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { method: 'bKash / Nagad / Rocket', time: '২৪-৪৮ ঘন্টা' },
                { method: 'Bank Transfer', time: '৩-৫ কার্যদিবস' },
                { method: 'PayPal', time: '৫-৭ কার্যদিবস' },
                { method: 'Wallet Balance', time: 'তাৎক্ষণিক' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">{item.method}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">সময়: {item.time}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              বিক্রেতাদের জন্য রিফান্ড নীতি
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              যদি কোনো ক্রেতা রিফান্ডের আবেদন করেন এবং তা অনুমোদিত হয়:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              <li>• বিক্রেতার ওয়ালেট থেকে প্রযোজ্য পরিমাণ কাটা হবে</li>
              <li>• যদি ওয়ালেটে পর্যাপ্ত ব্যালেন্স না থাকে, ভবিষ্যতের আয় থেকে সমন্বয় করা হবে</li>
              <li>• বারবার রিফান্ডের শিকার হলে বিক্রেতার অ্যাকাউন্ট পর্যালোচনা করা হবে</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              বিবাদ নিষ্পত্তি
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              যদি ক্রেতা এবং বিক্রেতার মধ্যে কোনো বিবাদ হয়:
            </p>
            <ol className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed mt-3 list-decimal list-inside">
              <li>প্রথমে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন</li>
              <li>আমরা উভয় পক্ষের বক্তব্য শুনব এবং প্রমাণ পর্যালোচনা করব</li>
              <li>নিরপেক্ষভাবে সিদ্ধান্ত নেওয়া হবে</li>
              <li>চূড়ান্ত সিদ্ধান্ত বাধ্যতামূলক এবং অপরিবর্তনীয়</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              যোগাযোগ
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              রিফান্ড সম্পর্কিত যেকোনো প্রশ্ন বা আবেদনের জন্য:
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-700 dark:text-slate-300">📧 ইমেইল: <strong>refund@aitoolsbd.com</strong></p>
              <p className="text-slate-700 dark:text-slate-300 mt-2">📞 ফোন: <strong>+880 1XXX-XXXXXX</strong></p>
              <p className="text-slate-700 dark:text-slate-300 mt-2">🕒 সাপোর্ট সময়: <strong>সকাল ৯টা - রাত ১১টা (প্রতিদিন)</strong></p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}