import { NextRequest, NextResponse } from 'next/server';
import SSLCommerzPayment from 'sslcommerz-lts';
import { createClient } from '@supabase/supabase-js';
const store_id = process.env.SSLCOMMERZ_STORE_ID!;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD!;
const is_live = false; // লাইভ করার সময় true করবেন

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, amount, original_price, buyer_id, seller_id, coupon_code, discount_amount, customer_name, customer_email, customer_phone } = body;

    const tran_id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const downloadToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const originalSellerEarning = Number(original_price) * 0.85;
    const originalPlatformCommission = Number(original_price) * 0.15;
    const finalPlatformCommission = Math.max(0, originalPlatformCommission - Number(discount_amount));

    await supabaseAdmin.from('orders').insert({
      id: tran_id,
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

    const data = {
      total_amount: Number(amount),
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/sslcommerz/success`,
      fail_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/sslcommerz/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/sslcommerz/cancel`,
      ipn_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/sslcommerz/ipn`,
      shipping_method: 'NO',
      product_name: 'Digital Product',
      product_category: 'Digital Goods',
      product_profile: 'general',
      cus_name: customer_name,
      cus_email: customer_email,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: customer_phone,
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      return NextResponse.json({ url: apiResponse.GatewayPageURL, tran_id });
    } else {
      throw new Error('SSLCommerz Gateway URL পাওয়া যায়নি।');
    }
  } catch (error: any) {
    console.error('SSLCommerz Init Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}