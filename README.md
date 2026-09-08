# 🚀 AIToolsBD - প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস

বাংলাদেশের প্রথম এবং সবচেয়ে বিশ্বস্ত প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস। এখানে AI প্রম্পট, ক্যানভা টেমপ্লেট, ওয়ার্ডপ্রেস প্লাগিন এবং অটোমেশন স্ক্রিপ্ট নিরাপদে কিনুন বা বিক্রি করুন।

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

## ✨ মূল ফিচারসমূহ

### 👤 ব্যবহারকারী (Users)
- 🔐 **নিরাপদ অথেন্টিকেশন:** ইমেইল/পাসওয়ার্ড এবং Google OAuth সাপোর্ট।
- 🛒 **সহজ কেনাকাটা:** তাৎক্ষণিক ডাউনলোড লিংক এবং ডাউনলোড লিমিট ট্র্যাকিং।
- 💳 **পেমেন্ট ভেরিফিকেশন:** bKash, Nagad, Rocket এবং PayPal-এর জন্য ম্যানুয়াল TrxID ভেরিফিকেশন সিস্টেম।
- 🎟️ **রেফারেল সিস্টেম:** রেফারেল কোডের মাধ্যমে রেজিস্ট্রেশন এবং ট্র্যাকিং।

### 🏪 বিক্রেতা (Sellers)
- 📤 **প্রোডাক্ট আপলোড:** ড্র্যাগ-অ্যান্ড-ড্রপ ফাইল আপলোড, প্রিভিউ ইমেজ এবং বিস্তারিত বিবরণ যোগ করা।
- 📊 **ড্যাশবোর্ড:** নিজের বিক্রি, ডাউনলোড সংখ্যা এবং আয়ের বিস্তারিত পরিসংখ্যান।
- 💸 **উইথড্র সিস্টেম:** ওয়ালেট ব্যালেন্স থেকে সহজেই টাকা উত্তোলনের অনুরোধ।

### 🛡️ অ্যাডমিন (Admin)
- ✅ **প্রোডাক্ট অনুমোদন:** সেলারদের আপলোড করা প্রোডাক্ট রিভিউ এবং অনুমোদন/বাতিল করা।
- 🔍 **পেমেন্ট যাচাই:** ক্রেতাদের দেওয়া TrxID যাচাই করে অর্ডার কমপ্লিট করা।
- 📧 **নিউজলেটার ম্যানেজমেন্ট:** Resend API ব্যবহার করে সব সাবস্ক্রাইবারদের এক ক্লিকে ইমেইল পাঠানো (Bulk Email)।
- 🎟️ **কুপন ম্যানেজমেন্ট:** ডিসকাউন্ট কুপন তৈরি, এডিট এবং মনিটর করা।

### 🎨 UI/UX এবং পারফরম্যান্স
- 🌙 **ডার্ক/লাইট মোড:** স্বয়ংক্রিয় এবং ম্যানুয়াল থিম সুইচিং।
- ⚡ **অপটিমাইজড লোডিং:** ইমেজ অপটিমাইজেশন, Lazy Loading এবং স্মার্ট Skeleton Preloader।
- ♿ **Accessibility:** কীবোর্ড ন্যাভিগেশন, স্ক্রিন রিডার সাপোর্ট এবং ডিসলেক্সিয়া-ফ্রেন্ডলি ফন্ট অপশন।
- 📱 **ফুলি রেসপন্সিভ:** মোবাইল, ট্যাবলেট এবং ডেস্কটপে নিখুঁত ডিজাইন।

---

## 🛠️ টেকনোলজি স্ট্যাক

- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Framer Motion (অ্যানিমেশনের জন্য)
- **Icons:** FontAwesome
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
- **Email Service:** Resend
- **Deployment:** Vercel

---

## 🚀 লোকাল সেটআপ (Installation)

প্রজেক্টটি আপনার কম্পিউটারে রান করার জন্য নিচের ধাপগুলো অনুসরণ করুন:

### ১. রিপোজিটরি ক্লোন করুন

```bash
git clone https://github.com/YOUR_USERNAME/aitoolsbd.git
cd aitoolsbd
```

### ২. ডিপেন্ডেন্সি ইনস্টল করুন

```bash
npm install
```

### ৩. এনভায়রনমেন্ট ভেরিয়েবল সেটআপ করুন

প্রজেক্টের রুট ফোল্ডারে একটি `.env.local` ফাইল তৈরি করুন এবং নিচের ভেরিয়েবলগুলো যোগ করুন:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Cron Job Security (Optional, for automated newsletters)
CRON_SECRET=your_random_secret_string
```

### ৪. ডেটাবেস মাইগ্রেশন (Supabase)

Supabase Dashboard-এর SQL Editor-এ গিয়ে প্রজেক্টের প্রয়োজনীয় টেবিল (`profiles`, `products`, `orders`, `withdrawals`, `coupons`, `newsletter_subscribers`) এবং RLS Policies তৈরি করুন।

### ৫. ডেভেলপমেন্ট সার্ভার চালু করুন

```bash
npm run dev
```

এখন ব্রাউজারে [http://localhost:3000](http://localhost:3000) ভিজিট করুন।

---

## 📂 প্রজেক্ট স্ট্রাকচার

```text
aitoolsbd/
├── src/
│   ├── app/                # Next.js App Router pages & API routes
│   │   ├── api/            # Backend API endpoints (Newsletter, Cron, etc.)
│   │   ├── dashboard/      # User & Seller dashboards
│   │   ├── admin/          # Admin management panel
│   │   └── page.tsx        # Home page
│   ├── components/         # Reusable UI components (Buttons, Modals, Layouts)
│   ├── contexts/           # React Contexts (Language, Auth)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions & Supabase client
│   └── emails/             # React Email templates (Welcome, Newsletter)
├── public/                 # Static assets (images, icons)
├── .env.local              # Environment variables (Do not commit!)
├── next.config.js          # Next.js configuration
└── package.json            # Project dependencies
```

---

## 🌐 ডিপ্লয়মেন্ট (Vercel)

এই প্রজেক্টটি Vercel-এ ডিপ্লয় করা সবচেয়ে সহজ:

1. আপনার GitHub রিপোজিটরিটি [Vercel](https://vercel.com)-এ ইম্পোর্ট করুন।
2. **Environment Variables** সেকশনে `.env.local` ফাইলের সব ভেরিয়েবল যোগ করুন।
3. **Deploy** বাটনে ক্লিক করুন।
4. কয়েক মিনিটের মধ্যে আপনার সাইট লাইভ হয়ে যাবে!

---

## 📝 লাইসেন্স

এই প্রজেক্টটি ব্যক্তিগত এবং বাণিজ্যিক ব্যবহারের জন্য [MIT License](LICENSE)-এর অধীনে লাইসেন্সকৃত।

---

## 📞 যোগাযোগ

প্রজেক্ট সম্পর্কে কোনো প্রশ্ন বা পরামর্শ থাকলে নির্দ্বিধায় যোগাযোগ করুন:
- 📧 ইমেইল: support@aitoolsbd.com
- 🌐 ওয়েবসাইট: [aitoolsbd.com](https://aitoolsbd.com)

---

*তৈরি করেছে ❤️ দিয়ে বাংলাদেশ থেকে।*