import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AIToolsBD - প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস',
    short_name: 'AIToolsBD',
    description: 'বাংলাদেশের সবচেয়ে বিশ্বস্ত ডিজিটাল মার্কেটপ্লেস। AI প্রম্পট, ক্যানভা টেমপ্লেট এবং আরও অনেক কিছু কিনুন বা বিক্রি করুন।',
    start_url: '/',
    display: 'standalone', // এটি ব্রাউজারের URL বার লুকিয়ে ফুল স্ক্রিন অ্যাপের মতো দেখাবে
    background_color: '#f8fafc', // slate-50
    theme_color: '#4f46e5', // indigo-600 (আপনার ব্র্যান্ড কালার)
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  }
}