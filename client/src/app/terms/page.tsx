import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

export const metadata = {
  title: 'ব্যবহারের শর্তাবলী - AIToolsBD',
  description: 'AIToolsBD প্ল্যাটফর্ম ব্যবহারের শর্তাবলী, নিয়ম এবং নির্দেশিকা।'
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-bangla">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-6 border border-indigo-100 dark:border-indigo-800">
            <FontAwesomeIcon icon={faFileContract} className="text-indigo-500" />
            <span>আইনি নথি</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4">
            ব্যবহারের <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">শর্তাবলী</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" />
            সর্বশেষ আপডেট: ১ জানুয়ারি, ২০২৬
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
          
          <section>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              AIToolsBD ("আমরা", "আমাদের", বা "প্ল্যাটফর্ম")-এ স্বাগতম। এই ওয়েবসাইট এবং এর সেবা ব্যবহার করার মাধ্যমে, আপনি নিম্নলিখিত শর্তাবলী ("শর্তাবলী") মেনে চলতে সম্মত হচ্ছেন। দয়া করে এই শর্তাবলী সাবধানতার সাথে পড়ুন।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">১</span>
              পরিষেবার বিবরণ
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              AIToolsBD একটি ডিজিটাল মার্কেটপ্লেস যেখানে ব্যবহারকারীরা AI প্রম্পট, ক্যানভা টেমপ্লেট, WordPress প্লাগিন, অটোমেশন স্ক্রিপ্ট এবং অন্যান্য ডিজিটাল পণ্য কিনতে এবং বিক্রি করতে পারেন। আমরা ক্রেতা এবং বিক্রেতার মধ্যে একটি নিরাপদ প্ল্যাটফর্ম প্রদান করি।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">২</span>
              অ্যাকাউন্ট দায়িত্ব
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>আপনাকে অবশ্যই সঠিক এবং সম্পূর্ণ তথ্য প্রদান করে রেজিস্ট্রেশন করতে হবে।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>আপনার অ্যাকাউন্টের পাসওয়ার্ডের গোপনীয়তা রক্ষা করা আপনার দায়িত্ব।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>আপনার অ্যাকাউন্টের অধীনে发生的 সমস্ত কার্যকলাপের জন্য আপনি সম্পূর্ণ দায়ী।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>একাধিক ব্যক্তির সাথে আপনার অ্যাকাউন্ট শেয়ার করা নিষিদ্ধ।</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৩</span>
              ক্রেতার দায়িত্ব
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>কেনা প্রোডাক্ট শুধুমাত্র ব্যক্তিগত বা বাণিজ্যিক ব্যবহারের জন্য, পুনরায় বিক্রির জন্য নয় (যদি না বিক্রেতা অনুমতি দেন)।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>ডাউনলোড করা ফাইল শেয়ার বা আপলোড করা সম্পূর্ণ নিষিদ্ধ।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>পেমেন্ট সম্পন্ন করার আগে প্রোডাক্টের বিবরণ সঠিকভাবে পড়ুন।</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৪</span>
              বিক্রেতার দায়িত্ব
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>শুধুমাত্র আপনার নিজস্ব তৈরি বা লাইসেন্সপ্রাপ্ত প্রোডাক্ট আপলোড করুন।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>কপিরাইট লঙ্ঘন, পাইরেটেড সফটওয়্যার বা অবৈধ কন্টেন্ট আপলোড সম্পূর্ণ নিষিদ্ধ।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>প্রোডাক্টের বিবরণ সঠিক এবং পরিষ্কার হতে হবে।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>প্ল্যাটফর্ম কমিশন (১৫%) মেনে চলতে হবে।</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৫</span>
              পেমেন্ট এবং ফি
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>সমস্ত মূল্য বাংলাদেশি টাকায় (BDT) প্রদর্শিত হয়।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>বিক্রেতার আয়ের ৮৫% পাবেন, বাকি ১৫% প্ল্যাটফর্ম ফি হিসেবে রাখা হয়।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>উইথড্রর ন্যূনতম পরিমাণ ১০০ টাকা।</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>পেমেন্ট প্রসেসিং-এ ২৪-৪৮ ঘন্টা সময় লাগতে পারে।</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৬</span>
              নিষিদ্ধ কার্যকলাপ
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">নিম্নলিখিত কার্যকলাপগুলি কঠোরভাবে নিষিদ্ধ এবং অ্যাকাউন্ট স্থগিত বা স্থায়ীভাবে বন্ধ করার কারণ হতে পারে:</p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>• জালিয়াতি বা প্রতারণামূলক কার্যকলাপ</li>
              <li>• স্প্যাম বা অবাঞ্ছিত কন্টেন্ট পোস্ট করা</li>
              <li>• অন্য ব্যবহারকারীর অ্যাকাউন্টে অনুপ্রবেশের চেষ্টা</li>
              <li>• প্ল্যাটফর্মের নিরাপত্তা ব্যবস্থায় হস্তক্ষেপ</li>
              <li>• কপিরাইট বা মেধাস্বত্ব লঙ্ঘন</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৭</span>
              মেধাস্বত্ব
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              AIToolsBD-এর সমস্ত কন্টেন্ট, লোগো, ডিজাইন এবং সফটওয়্যার আমাদের মেধাস্বত্ব দ্বারা সুরক্ষিত। বিক্রেতারা তাদের আপলোড করা প্রোডাক্টের মেধাস্বত্বের মালিক থাকবেন। অনুমতি ছাড়া কোনো কন্টেন্ট কপি, পুনরুৎপাদন বা বিতরণ করা যাবে না।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৮</span>
              দায়িত্ব সীমাবদ্ধতা
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              AIToolsBD একটি প্ল্যাটফর্ম প্রদানকারী হিসেবে কাজ করে। বিক্রেতাদের প্রোডাক্টের গুণগত মান, নির্ভুলতা বা কার্যকারিতার জন্য আমরা দায়ী নই। ক্রেতাদের উচিত কেনার আগে প্রোডাক্টের বিবরণ এবং রিভিউ সতর্কতার সাথে পরীক্ষা করা।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৯</span>
              শর্তাবলী পরিবর্তন
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার সংরক্ষণ করি। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে আমরা ইমেইল বা সাইট নোটিফিকেশনের মাধ্যমে আপনাকে অবহিত করব। পরিবর্তনের পর প্ল্যাটফর্ম ব্যবহার অব্যাহত রাখলে আপনি নতুন শর্তাবলী মেনে চলতে সম্মত হচ্ছেন।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">১০</span>
              যোগাযোগ
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              এই শর্তাবলী সম্পর্কে কোনো প্রশ্ন থাকলে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন:
            </p>
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-700 dark:text-slate-300">📧 ইমেইল: <strong>support@aitoolsbd.com</strong></p>
              <p className="text-slate-700 dark:text-slate-300 mt-2">📞 ফোন: <strong>+880 1XXX-XXXXXX</strong></p>
              <p className="text-slate-700 dark:text-slate-300 mt-2">📍 ঠিকানা: <strong>ঢাকা, বাংলাদেশ</strong></p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}