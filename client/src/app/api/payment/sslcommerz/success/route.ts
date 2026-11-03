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

    if (status === 'VALID' || status === 'VALIDATED') {
      await supabaseAdmin.from('orders').update({ 
        status: 'completed',
        transaction_id: val_id || tran_id
      }).eq('transaction_id', tran_id);
    }

    // ডেটাবেস আপডেট হওয়ার পর ইউজারকে ড্যাশবোর্ডে পাঠিয়ে দেওয়া
    return NextResponse.redirect('https://aitoolsbd.vercel.app/dashboard/orders?payment=success');
  } catch (error) {
    return NextResponse.redirect('https://aitoolsbd.vercel.app/dashboard/orders?payment=error');
  }
}