import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestionCircle, faShoppingBag, faWallet, faUpload, 
  faShieldAlt, faHeadset, faEnvelope, faPhone, faComments
} from '@fortawesome/free-solid-svg-icons';

export const metadata = {
  title: 'হেল্প সেন্টার - AIToolsBD',
  description: 'AIToolsBD-এর ব্যবহার সম্পর্কিত সব প্রশ্নের উত্তর, গাইডলাইন এবং সাপোর্ট তথ্য।'
};

export default function HelpPage() {
  const faqCategories = [
    {
      icon: faShoppingBag,
      title: 'ক্রেতা সম্পর্কিত',
      color: 'indigo',
      faqs: [
        { q: 'কীভাবে প্রোডাক্ট কিনব?', a: 'যেকোনো প্রোডাক্ট পেজে গিয়ে "এখনই কিনুন" বাটনে ক্লিক করুন। পেমেন্ট মেথড সিলেক্ট করে পেমেন্ট সম্পন্ন করুন। পেমেন্ট ভেরিফাই হওয়ার পর অটোমেটিক ডাউনলোড লিংক পাবেন।' },
        { q: 'পেমেন্টের কী কী উপায় আছে?', a: 'আমরা bKash, Nagad, Rocket, Bank Transfer এবং PayPal সাপোর্ট করি। আন্তর্জাতিক ক্রেতাদের জন্য PayPal সবচেয়ে সুবিধাজনক।' },
        { q: 'ডাউনলোড লিংক কতদিন কাজ করবে?', a: 'প্রতিটি ডাউনলোড লিংক ২৪ ঘন্টার জন্য সক্রিয় থাকে এবং সর্বোচ্চ ৩ বার ডাউনলোড করা যায়।' },
        { q: 'রিফান্ড পেতে কী করব?', a: 'পেমেন্টের ২৪ ঘন্টার মধ্যে যদি প্রোডাক্টে সমস্যা থাকে, আমাদের সাপোর্টে যোগাযোগ করুন। রিফান্ড পলিসি অনুযায়ী ব্যবস্থা নেওয়া হবে।' }
      ]
    },
    {
      icon: faUpload,
      title: 'বিক্রেতা সম্পর্কিত',
      color: 'purple',
      faqs: [
        { q: 'সেলার অ্যাকাউন্ট কীভাবে খুলব?', a: '"বিক্রেতা হোন" পেজে গিয়ে ফ্রি রেজিস্ট্রেশন করুন। তারপর ড্যাশবোর্ড থেকে প্রোডাক্ট আপলোড শুরু করতে পারবেন।' },
        { q: 'কমিশন কত?', a: 'আমরা মাত্র ১৫% প্ল্যাটফর্ম কমিশন নেই। বাকি ৮৫% সরাসরি আপনার ওয়ালেটে জমা হয়।' },
        { q: 'পেমেন্ট কবে পাব?', a: 'ক্রেতার পেমেন্ট ভেরিফাই হওয়ার সাথে সাথে আপনার ওয়ালেটে টাকা জমা হবে। ন্যূনতম ১০০ টাকা হলে উইথড্র করতে পারবেন।' },
        { q: 'প্রোডাক্ট আপলোডের নিয়ম কী?', a: 'প্রোডাক্টের টাইটেল, বিবরণ, প্রিভিউ ইমেজ এবং মূল ফাইল আপলোড করুন। অ্যাডমিন রিভিউয়ের পর প্রোডাক্ট লাইভ হবে।' }
      ]
    },
    {
      icon: faShieldAlt,
      title: 'নিরাপত্তা ও অ্যাকাউন্ট',
      color: 'emerald',
      faqs: [
        { q: 'আমার ডেটা কি নিরাপদ?', a: 'হ্যাঁ, আমরা সর্বোচ্চ এনক্রিপশন এবং সিকিউরিটি প্রোটোকল ব্যবহার করি। আপনার পাসওয়ার্ড কখনোই প্লেইন টেক্সটে সেভ হয় না।' },
        { q: 'পাসওয়ার্ড ভুলে গেলে কী করব?', a: 'লগইন পেজে "পাসওয়ার্ড ভুলে গেছেন?" লিংকে ক্লিক করুন। ইমেইলে রিসেট লিংক পাবেন।' },
        { q: 'অ্যাকাউন্ট ডিলিট করতে চাইলে?', a: 'আমাদের সাপোর্ট টিমে ইমেইল করুন, আমরা ৪৮ ঘন্টার মধ্যে আপনার অ্যাকাউন্ট ডিলিট করে দেব।' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-bangla">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-6 border border-indigo-100 dark:border-indigo-800">
            <FontAwesomeIcon icon={faHeadset} className="text-indigo-500" />
            <span>সাহায্য প্রয়োজন?</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            হেল্প <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">সেন্টার</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            আপনার যেকোনো প্রশ্নের উত্তর এখানে পাবেন। খুঁজে না পেলে আমাদের সাপোর্ট টিম সবসময় আপনার পাশে আছে।
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-10 mb-16">
          {faqCategories.map((category, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-${category.color}-100 dark:bg-${category.color}-900/40 flex items-center justify-center`}>
                  <FontAwesomeIcon icon={category.icon} className={`text-2xl text-${category.color}-600 dark:text-${category.color}-400`} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{category.title}</h2>
              </div>
              <div className="space-y-4">
                {category.faqs.map((faq, i) => (
                  <details key={i} className="group bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors list-none">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base pr-4">{faq.q}</h3>
                      <span className="text-indigo-500 group-open:rotate-180 transition-transform duration-300">▼</span>
                    </summary>
                    <div className="px-5 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-4">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-white shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faComments} className="text-3xl" />
          </div>
          <h2 className="text-3xl font-black mb-4">এখনও সাহায্য দরকার?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            আমাদের ডেডিকেটেড সাপোর্ট টিম ২৪/৭ আপনার সেবায় নিয়োজিত। যেকোনো সমস্যায় আমাদের সাথে যোগাযোগ করুন।
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <a href="mailto:support@aitoolsbd.com" className="flex items-center justify-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl border border-white/20 transition-all">
              <FontAwesomeIcon icon={faEnvelope} />
              <span className="font-semibold">support@aitoolsbd.com</span>
            </a>
            <a href="tel:+8801XXXXXXXXX" className="flex items-center justify-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl border border-white/20 transition-all">
              <FontAwesomeIcon icon={faPhone} />
              <span className="font-semibold">+880 1XXX-XXXXXX</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}