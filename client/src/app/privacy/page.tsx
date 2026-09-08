import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

export const metadata = {
  title: 'গোপনীয়তা নীতি - AIToolsBD',
  description: 'AIToolsBD কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত করে তার বিস্তারিত বিবরণ।'
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-bangla">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-6 border border-indigo-100 dark:border-indigo-800">
            <FontAwesomeIcon icon={faShieldAlt} className="text-indigo-500" />
            <span>আপনার গোপনীয়তা আমাদের অগ্রাধিকার</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4">
            গোপনীয়তা <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">নীতি</span>
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
              AIToolsBD ("আমরা", "আমাদের", বা "প্ল্যাটফর্ম") আপনার গোপনীয়তার প্রতি গভীর সম্মান রাখে। এই গোপনীয়তা নীতি ব্যাখ্যা করে কীভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ এবং সুরক্ষিত করি।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">১</span>
              আমরা যে তথ্য সংগ্রহ করি
            </h2>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 mt-4">ব্যক্তিগত তথ্য:</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              <li>• নাম, ইমেইল অ্যাড্রেস, ফোন নম্বর</li>
              <li>• পেমেন্ট তথ্য (বিকাশ/নগদ/রকেট নম্বর, ব্যাংক অ্যাকাউন্ট)</li>
              <li>• প্রোফাইল ছবি এবং বায়ো</li>
              <li>• লেনদেনের ইতিহাস</li>
            </ul>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য:</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>• IP অ্যাড্রেস এবং ব্রাউজারের ধরন</li>
              <li>• ডিভাইসের তথ্য</li>
              <li>• প্ল্যাটফর্ম ব্যবহারের প্যাটার্ন</li>
              <li>• কুকিজ এবং অনুরূপ ট্র্যাকিং প্রযুক্তি</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">২</span>
              কীভাবে আমরা তথ্য ব্যবহার করি
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>অ্যাকাউন্ট তৈরি এবং পরিচালনা</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>লেনদেন প্রক্রিয়াকরণ এবং পেমেন্ট হ্যান্ডলিং</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>কাস্টমার সাপোর্ট প্রদান</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>প্ল্যাটফর্মের নিরাপত্তা নিশ্চিত করা</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>গুরুত্বপূর্ণ আপডেট এবং অফার সম্পর্কে জানানো</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>প্ল্যাটফর্মের উন্নতি এবং নতুন ফিচার তৈরি</li>
              <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span>আইনি বাধ্যবাধকতা পূরণ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৩</span>
              তথ্য শেয়ারিং
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না। তবে নিম্নলিখিত ক্ষেত্রে তথ্য শেয়ার করা হতে পারে:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>• <strong>পেমেন্ট প্রসেসর:</strong> পেমেন্ট সম্পন্ন করার জন্য bKash, Nagad, PayPal ইত্যাদির সাথে প্রয়োজনীয় তথ্য</li>
              <li>• <strong>সেলারদের কাছে:</strong> ক্রেতার প্রয়োজনীয় তথ্য (শিপিং বা যোগাযোগের জন্য)</li>
              <li>• <strong>আইনি প্রয়োজনে:</strong> আদালতের আদেশ বা আইনি বাধ্যবাধকতা পূরণে</li>
              <li>• <strong>ব্যবসায়িক স্থানান্তর:</strong> মার্জার বা অধিগ্রহণের ক্ষেত্রে</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৪</span>
              ডেটা সুরক্ষা
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্প-মানের নিরাপত্তা ব্যবস্থা গ্রহণ করি:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              <li>• <strong>SSL এনক্রিপশন:</strong> সমস্ত ডেটা ট্রান্সমিশন এনক্রিপ্টেড</li>
              <li>• <strong>পাসওয়ার্ড হ্যাশিং:</strong> পাসওয়ার্ড কখনোই প্লেইন টেক্সটে সংরক্ষণ করা হয় না</li>
              <li>• <strong>নিয়মিত অডিট:</strong> নিরাপত্তা দুর্বলতা নিরীক্ষা</li>
              <li>• <strong>অ্যাক্সেস নিয়ন্ত্রণ:</strong> শুধুমাত্র অনুমোদিত কর্মীদের সীমিত অ্যাক্সেস</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৫</span>
              কুকি নীতি
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              আমরা কুকিজ এবং অনুরূপ ট্র্যাকিং প্রযুক্তি ব্যবহার করি:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              <li>• <strong>প্রয়োজনীয় কুকিজ:</strong> প্ল্যাটফর্ম সঠিকভাবে চালানোর জন্য</li>
              <li>• <strong>কার্যকরী কুকিজ:</strong> আপনার পছন্দ মনে রাখার জন্য (যেমন: থিম, ভাষা)</li>
              <li>• <strong>বিশ্লেষণাত্মক কুকিজ:</strong> প্ল্যাটফর্মের পারফরম্যান্স বিশ্লেষণের জন্য</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              আপনি আপনার ব্রাউজার সেটিংস থেকে কুকিজ নিয়ন্ত্রণ বা নিষ্ক্রিয় করতে পারেন, তবে এটি কিছু ফিচারের কার্যকারিতা প্রভাবিত করতে পারে।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৬</span>
              আপনার অধিকার
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">আপনার নিম্নলিখিত অধিকার রয়েছে:</p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>• <strong>অ্যাক্সেস:</strong> আমরা আপনার সম্পর্কে কোন তথ্য রাখি তা জানার অধিকার</li>
              <li>• <strong>সংশোধন:</strong> ভুল বা অসম্পূর্ণ তথ্য সংশোধনের অধিকার</li>
              <li>• <strong>মুছে ফেলা:</strong> নির্দিষ্ট পরিস্থিতিতে আপনার তথ্য মুছে ফেলার অনুরোধ করার অধিকার</li>
              <li>• <strong>আপত্তি:</strong> নির্দিষ্ট তথ্য প্রক্রিয়াকরণে আপত্তি জানানোর অধিকার</li>
              <li>• <strong>ডেটা পোর্টেবিলিটি:</strong> আপনার তথ্য অন্য সেবায় স্থানান্তরের অধিকার</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৭</span>
              ডেটা সংরক্ষণ
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              আমরা আপনার তথ্য ততদিন সংরক্ষণ করি যতদিন অ্যাকাউন্ট সক্রিয় থাকে বা আমাদের সেবা প্রদানের জন্য প্রয়োজন। অ্যাকাউন্ট ডিলিট করার অনুরোধ করলে, আমরা আইনি বাধ্যবাধকতা অনুযায়ী কিছু তথ্য সংরক্ষণ করতে পারি।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৮</span>
              শিশুদের গোপনীয়তা
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              আমাদের প্ল্যাটফর্ম ১৮ বছরের কম বয়সীদের জন্য নয়। আমরা জেনে ১৮ বছরের কম বয়সীদের কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। যদি আপনি জানেন যে কোনো নাবালক আমাদের প্ল্যাটফর্ম ব্যবহার করছে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">৯</span>
              নীতি পরিবর্তন
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে আমরা ইমেইল বা সাইট নোটিফিকেশনের মাধ্যমে আপনাকে অবহিত করব। পরিবর্তনের পর প্ল্যাটফর্ম ব্যবহার অব্যাহত রাখলে আপনি নতুন নীতি মেনে চলতে সম্মত হচ্ছেন।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">১০</span>
              যোগাযোগ
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              গোপনীয়তা সম্পর্কিত কোনো প্রশ্ন বা অনুরোধের জন্য আমাদের সাথে যোগাযোগ করুন:
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-700 dark:text-slate-300">📧 ইমেইল: <strong>privacy@aitoolsbd.com</strong></p>
              <p className="text-slate-700 dark:text-slate-300 mt-2">📞 ফোন: <strong>+880 1XXX-XXXXXX</strong></p>
              <p className="text-slate-700 dark:text-slate-300 mt-2">📍 ঠিকানা: <strong>ঢাকা, বাংলাদেশ</strong></p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}