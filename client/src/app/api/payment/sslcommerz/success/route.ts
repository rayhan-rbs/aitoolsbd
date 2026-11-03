import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const status = formData.get('status') as string;
    const tran_id = formData.get('tran_id') as string;
    const val_id = formData.get('val_id') as string;

    if (status === 'VALID') {
      // অর্ডারের স্ট্যাটাস 'completed' এ আপডেট করা (transaction_id দিয়ে খোঁজা)
      await supabaseAdmin.from('orders').update({ 
        status: 'completed',
        transaction_id: val_id 
      }).eq('transaction_id', tran_id);

      // সাকসেস হলে ড্যাশবোর্ডের অর্ডার পেজে রিডাইরেক্ট
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders?payment=success`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders?payment=failed`);
    }
  } catch (error) {
    console.error('SSLCommerz Success Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders?payment=error`);
  }
}