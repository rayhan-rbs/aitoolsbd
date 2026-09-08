import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faUsers, faShieldHalved, faHandshake, 
  faBullseye, faEye, faHeart, faAward 
} from '@fortawesome/free-solid-svg-icons';

export const metadata = {
  title: 'আমাদের সম্পর্কে - AIToolsBD',
  description: 'বাংলাদেশের সবচেয়ে বিশ্বস্ত প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস AIToolsBD-এর গল্প, লক্ষ্য এবং টিম সম্পর্কে জানুন।'
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-bangla">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-6 border border-indigo-100 dark:border-indigo-800">
            <FontAwesomeIcon icon={faRocket} className="text-indigo-500" />
            <span>আমাদের গল্প</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            বাংলাদেশের ডিজিটাল <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              বিপ্লবের অগ্রদূত
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            AIToolsBD হলো বাংলাদেশের প্রথম এবং সবচেয়ে বিশ্বস্ত প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস, যেখানে ক্রেতা এবং বিক্রেতা উভয়েই নিরাপদে তাদের ডিজিটাল পণ্য কেনা-বেচা করতে পারেন।
          </p>
        </div>

        {/* Our Story */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 mb-12 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <FontAwesomeIcon icon={faHeart} className="text-xl text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">আমাদের গল্প</h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed text-base">
            <p>
              ২০২৪ সালে, যখন বাংলাদেশে AI এবং ডিজিটাল টুলসের চাহিদা তুঙ্গে, তখন আমরা লক্ষ্য করলাম যে দেশীয় উদ্যোক্তা, ফ্রিল্যান্সার এবং কন্টেন্ট ক্রিয়েটরদের জন্য একটি নির্ভরযোগ্য প্ল্যাটফর্মের অভাব রয়েছে। বিদেশি মার্কেটপ্লেসগুলোতে পেমেন্ট সমস্যা, ভাষার বাধা এবং সাপোর্টের অভাব আমাদের দেশের মানুষদের জন্য বড় চ্যালেঞ্জ ছিল।
            </p>
            <p>
              এই সমস্যাগুলোর সমাধান করতেই আমরা প্রতিষ্ঠা করি <strong className="text-indigo-600 dark:text-indigo-400">AIToolsBD</strong>। আমাদের লক্ষ্য ছিল একটি এমন প্ল্যাটফর্ম তৈরি করা যেখানে:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>বিকাশ, নগদ, রকেটের মাধ্যমে সহজ পেমেন্ট</li>
              <li>১০০% বাংলায় সাপোর্ট এবং ইন্টারফেস</li>
              <li>নিরাপদ এবং স্বচ্ছ লেনদেন</li>
              <li>সেলারদের জন্য সর্বোচ্চ ৮৫% আয়ের সুযোগ</li>
            </ul>
            <p>
              আজ আমরা গর্বের সাথে বলতে পারি, হাজার হাজার সন্তুষ্ট ক্রেতা এবং সেলার আমাদের সাথে যুক্ত আছেন এবং প্রতিদিন নতুন নতুন ডিজিটাল প্রোডাক্ট তৈরি ও বিক্রি হচ্ছে আমাদের প্ল্যাটফর্মে।
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faBullseye} className="text-2xl" />
            </div>
            <h3 className="text-2xl font-black mb-4">আমাদের লক্ষ্য (Mission)</h3>
            <p className="text-indigo-100 leading-relaxed">
              বাংলাদেশের প্রতিটি ডিজিটাল ক্রিয়েটরকে তাদের স্কিল এবং প্রোডাক্ট থেকে ন্যায্য আয় করার সুযোগ করে দেওয়া। আমরা চাই প্রতিটি উদ্যোক্তা যেন তাদের ডিজিটাল পণ্যের সঠিক মূল্য পান।
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-3xl p-8 text-white shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faEye} className="text-2xl" />
            </div>
            <h3 className="text-2xl font-black mb-4">আমাদের দৃষ্টিভঙ্গি (Vision)</h3>
            <p className="text-purple-100 leading-relaxed">
              ২০৩০ সালের মধ্যে দক্ষিণ এশিয়ার সবচেয়ে বড় এবং বিশ্বস্ত ডিজিটাল মার্কেটপ্লেস হিসেবে প্রতিষ্ঠিত হওয়া, যেখানে লক্ষ লক্ষ ক্রেতা-বিক্রেতা নিরাপদে তাদের লেনদেন করবেন।
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 mb-12 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-8 text-center">আমাদের মূল্যবোধ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: faShieldHalved, title: 'নিরাপত্তা', desc: 'আপনার ডেটা এবং পেমেন্ট সর্বোচ্চ নিরাপত্তায় সুরক্ষিত।' },
              { icon: faHandshake, title: 'স্বচ্ছতা', desc: 'কোনো লুকানো ফি নেই। সব কিছু পরিষ্কার এবং উন্মুক্ত।' },
              { icon: faUsers, title: 'কমিউনিটি', desc: 'আমরা একটি শক্তিশালী ক্রিয়েটর কমিউনিটি গড়ে তুলছি।' },
              { icon: faAward, title: 'গুণগত মান', desc: 'শুধুমাত্র প্রিমিয়াম এবং যাচাইকৃত প্রোডাক্ট।' }
            ].map((value, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mb-4 mx-auto">
                  <FontAwesomeIcon icon={value.icon} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-10 sm:p-16 text-white shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">আমাদের যাত্রায় যোগ দিন</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            আপনি ক্রেতা হোন বা বিক্রেতা, AIToolsBD পরিবারের অংশ হয়ে আপনার ডিজিটাল স্বপ্নকে বাস্তবে রূপ দিন।
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products" className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg">
              প্রোডাক্ট দেখুন
            </Link>
            <Link href="/sellers" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
              সেলার হোন
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}