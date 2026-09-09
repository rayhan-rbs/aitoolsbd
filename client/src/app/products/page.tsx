import { Suspense } from 'react';
import ProductsClient from './ProductsClient';

// 🔥 এই লাইনটি Next.js-কে বলে দেয় এই পেজটি বিল্ড টাইমে স্ট্যাটিক বানানোর চেষ্টা করবে না
export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  return (
    // 🔥 এখানে আমরা ক্লায়েন্ট কম্পোনেন্টটিকে Suspense দিয়ে ঘিরে দিচ্ছি
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bangla text-xl">প্রোডাক্ট লোড হচ্ছে...</div>}>
      <ProductsClient />
    </Suspense>
  );
}