import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🔥 require ব্যবহার করা হচ্ছে CommonJS প্যাকেজের জন্য (সবচেয়ে নিরাপদ উপায়)
const SSLCommerzPayment = require('sslcommerz-lts');

export async function POST(req: NextRequest) {
  try {
    const store_id = process.env.SSLCOMMERZ_STORE_ID;
    const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const site_url = process.env.NEXT_PUBLIC_SITE_URL;
    const supabase_key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 🔥 DEBUG LOG: Vercel Function Logs-এ এটি চেক করুন
    console.log("ENV CHECK - Store ID:", store_id ? "OK" : "MISSING");
    console.log("ENV CHECK - Password:", store_passwd ? "OK" : "MISSING");

    if (!store_id || !store_passwd) {
      return NextResponse.json({ error: "SSLCommerz credentials missing in environment variables" }, { status: 500 });
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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabase_key!
    );

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
      total_amount: String(amount), // 🔥 String এ কনভার্ট করা জরুরি
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `${site_url}/api/payment/sslcommerz/success`,
      fail_url: `${site_url}/api/payment/sslcommerz/fail`,
      cancel_url: `${site_url}/api/payment/sslcommerz/cancel`,
      ipn_url: `${site_url}/api/payment/sslcommerz/ipn`,
      shipping_method: 'NO',
      product_name: 'Digital Product',
      product_category: 'Digital Goods',
      product_profile: 'general',
      cus_name: customer_name || 'Customer',
      cus_email: customer_email || 'test@test.com',
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: customer_phone || '01000000000',
    };

    const is_live = false; // স্যান্ডবক্সের জন্য false
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      return NextResponse.json({ url: apiResponse.GatewayPageURL, tran_id });
    } else {
      console.error("SSLCommerz API Response:", apiResponse);
      throw new Error('SSLCommerz Gateway URL পাওয়া যায়নি।');
    }
  } catch (error: any) {
    console.error('SSLCommerz Init Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}