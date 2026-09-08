import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { LanguageProvider } from "@/contexts/LanguageContext";

// 🔥 Font optimization: display: 'swap' যোগ করা হয়েছে
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({ 
  subsets: ["bengali"], 
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AIToolsBD - বাংলাদেশের #১ প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস',
    template: '%s | AIToolsBD'
  },
  description: 'প্রিমিয়াম AI প্রম্পট, ক্যানভা টেমপ্লেট, WordPress Plugin এবং অটোমেশন স্ক্রিপ্ট কিনুন বা বিক্রি করুন। ১০০% নিরাপদ, তাৎক্ষণিক ডাউনলোড এবং সাশ্রয়ী মূল্যে।',
  keywords: ['AI tools', 'digital marketplace', 'canva template', 'AI prompt', 'wordpress plugin', 'bangladesh', 'AIToolsBD'],
  authors: [{ name: 'AIToolsBD Team' }],
  creator: 'AIToolsBD',
  publisher: 'AIToolsBD',
  applicationName: 'AIToolsBD',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AIToolsBD',
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: '/',
    siteName: 'AIToolsBD',
    title: 'AIToolsBD - বাংলাদেশের #১ প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস',
    description: 'প্রিমিয়াম ডিজিটাল প্রোডাক্ট কিনুন বা বিক্রি করুন একই প্ল্যাটফর্মে।',
    images: [
      {
        url: '/og-image.png', 
        width: 1200,
        height: 630,
        alt: 'AIToolsBD - Digital Marketplace'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIToolsBD - প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস',
    description: 'AI প্রম্পট, ক্যানভা টেমপ্লেট এবং আরও অনেক কিছু।',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* 🔥 Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://cwhlbqmuevfqooqemtsa.supabase.co" />
        <link rel="preconnect" href="https://embed.tawk.to" />
        <link rel="dns-prefetch" href="https://embed.tawk.to" />
      </head>
      <body className={`${inter.variable} ${hindSiliguri.variable} font-sans antialiased`}>
        
        {/* 🔥 Skip to Content Link (Keyboard users দের জন্য) */}
        <a href="#main-content" className="skip-to-content">
          মূল কন্টেন্টে যান (Skip to Content)
        </a>
        
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <Navbar />
            
            <main 
              id="main-content" 
              tabIndex={-1}
              className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16 lg:pt-20 transition-colors duration-300 outline-none"
            >
              {children}
            </main>

            {/* 🔥 Tawk.to Live Chat - lazyOnload strategy দিয়ে দ্রুত লোড */}
            <Script id="tawk-chat" strategy="lazyOnload">
              {`
                var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                (function(){
                  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                  s1.async=true;
                  s1.src='https://embed.tawk.to/6a9d4e27ff72393448baa8e4/1k1r7iivu';
                  s1.charset='UTF-8';
                  s1.setAttribute('crossorigin','*');
                  s0.parentNode.insertBefore(s1,s0);
                })();
              `}
            </Script>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}