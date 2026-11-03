import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client (Service Role Key ব্যবহার করুন যাতে RLS বাইপাস করে আপডেট করতে পারে)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // এটি .env.local এ যোগ করুন
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const status = formData.get('status') as string;
    const tran_id = formData.get('tran_id') as string;
    const val_id = formData.get('val_id') as string;

    if (status === 'VALID') {
      // ১. Supabase-এ অর্ডারের স্ট্যাটাস 'completed' এ আপডেট করুন
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          transaction_id: val_id, // SSLCommerz এর ভেরিফিকেশন ID
          payment_method: 'sslcommerz'
        })
        .eq('transaction_id', tran_id); // আপনার অর্ডার টেবিলের প্রাইমারি কি অনুযায়ী

      if (error) throw error;

      // ২. সাকসেস হলে ইউজারকে ড্যাশবোর্ড বা ডাউনলোড পেজে রিডাইরেক্ট করুন
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders?payment=success`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders?payment=failed`);
    }
  } catch (error) {
    console.error('Payment Success Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders?payment=error`);
  }
}