import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const store_id = process.env.SSLCOMMERZ_STORE_ID;
    const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const site_url = 'https://aitoolsbd.vercel.app'; // হার্ডকোড করা হলো যাতে undefined না আসে
    const supabase_key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!store_id || !store_passwd || !supabase_key) {
      return NextResponse.json({ error: "সার্ভার কনফিগারেশন মিসিং।" }, { status: 500 });
    }

    const body = await req.json();
    const { product_id, amount, original_price, buyer_id, seller_id, coupon_code, discount_amount, customer_name, customer_email, customer_phone } = body;

    const tran_id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const downloadToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const originalSellerEarning = Number(original_price) * 0.85;
    const originalPlatformCommission = Number(original_price) * 0.15;
    const finalPlatformCommission = Math.max(0, originalPlatformCommission - Number(discount_amount));

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabase_key);
    
    const { error: orderError } = await supabaseAdmin.from('orders').insert({
      buyer_id, seller_id, product_id,
      amount: Number(original_price),
      discount_amount: Number(discount_amount),
      final_amount: Number(amount),
      platform_commission: finalPlatformCommission,
      seller_earning: originalSellerEarning,
      status: 'pending_payment',
      payment_method: 'sslcommerz',
      transaction_id: tran_id,
      download_token: downloadToken,
      link_expires_at: expiresAt.toISOString(),
      max_downloads: 3,
      current_downloads: 0,
      coupon_code: coupon_code || null
    });

    if (orderError) throw new Error(orderError.message);

    const is_live = false; 
    const sslczURL = is_live 
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php' 
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    const formData = new URLSearchParams();
    formData.append('store_id', store_id);
    formData.append('store_passwd', store_passwd);
    formData.append('total_amount', String(amount));
    formData.append('currency', 'BDT');
    formData.append('tran_id', tran_id);
    
    // 🔥 এখানে API রুটের লিংক দেওয়া হলো (এটিই 405 এরর ঠিক করবে)
    formData.append('success_url', `${site_url}/api/payment/sslcommerz/success`);
    formData.append('fail_url', `${site_url}/api/payment/sslcommerz/fail`);
    formData.append('cancel_url', `${site_url}/api/payment/sslcommerz/cancel`);
    formData.append('ipn_url', `${site_url}/api/payment/sslcommerz/ipn`);
    
    formData.append('shipping_method', 'NO');
    formData.append('product_name', 'Digital Product');
    formData.append('product_category', 'Digital Goods');
    formData.append('product_profile', 'general');
    formData.append('cus_name', customer_name || 'Customer');
    formData.append('cus_email', customer_email || 'test@test.com');
    formData.append('cus_add1', 'Dhaka');
    formData.append('cus_city', 'Dhaka');
    formData.append('cus_postcode', '1000');
    formData.append('cus_country', 'Bangladesh');
    formData.append('cus_phone', customer_phone || '01000000000');

    const response = await fetch(sslczURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.status === 'SUCCESS' && data.GatewayPageURL) {
      return NextResponse.json({ url: data.GatewayPageURL, tran_id });
    } else {
      throw new Error(data.failedreason || 'Gateway URL তৈরি ব্যর্থ।');
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}