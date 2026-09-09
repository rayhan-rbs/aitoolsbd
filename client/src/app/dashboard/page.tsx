import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

// 🔥 এটি এখন একটি সার্ভার কম্পোনেন্ট, তাই এটি বৈধ
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bangla text-xl">ড্যাশবোর্ড লোড হচ্ছে...</div>}>
      <DashboardClient />
    </Suspense>
  );
}