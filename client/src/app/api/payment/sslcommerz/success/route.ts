import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST এবং GET দুটোই হ্যান্ডেল করবে যাতে 404 না আসে
export async function POST(req: NextRequest) {
  return handlePaymentStatus(req);
}

export async function GET(req: NextRequest) {
  return handlePaymentStatus(req);
}

async function handlePaymentStatus(req: NextRequest) {
  try {
    // POST হলে formData, আর GET হলে searchParams থেকে ডেটা নেওয়া
    let tran_id, val_id, status;

    if (req.method === 'POST') {
      const formData = await req.formData();
      status = formData.get('status') as string;
      tran_id = formData.get('tran_id') as string;
      val_id = formData.get('val_id') as string;
    } else {
      const searchParams = req.nextUrl.searchParams;
      status = searchParams.get('status') as string;
      tran_id = searchParams.get('tran_id') as string;
      val_id = searchParams.get('val_id') as string;
    }

    const siteUrl = process.env.SITE_URL;

    if (status === 'VALID' && tran_id) {
      await supabaseAdmin.from('orders').update({ 
        status: 'completed',
        transaction_id: val_id || 'manual_verify'
      }).eq('transaction_id', tran_id);

      return NextResponse.redirect(`${siteUrl}/dashboard/orders?payment=success`);
    } else {
      return NextResponse.redirect(`${siteUrl}/dashboard/orders?payment=failed`);
    }
  } catch (error) {
    console.error('SSLCommerz Success Error:', error);
    return NextResponse.redirect(`${process.env.SITE_URL}/dashboard/orders?payment=error`);
  }
}