import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const store_id = process.env.SSLCOMMERZ_STORE_ID;
    const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const site_url = process.env.SITE_URL;
    const supabase_key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // ১. এনভায়রনমেন্ট ভেরিয়েবল চেক করা
    if (!store_id || !store_passwd || !supabase_key) {
      console.error("Missing Env Vars:", { store_id: !!store_id, store_passwd: !!store_passwd, supabase_key: !!supabase_key });
      return NextResponse.json({ error: "সার্ভার কনফিগারেশন মিসিং। অ্যাডমিনের সাথে যোগাযোগ করুন।" }, { status: 500 });
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

    // ২. Supabase-এ অর্ডার সেভ করা
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabase_key);
    
    const { error: orderError } = await supabaseAdmin.from('orders').insert({
	  buyer_id, seller_id, product_id,  // ✅ id ফিল্ড আর থাকবে না
	  amount: Number(original_price),
	  discount_amount: Number(discount_amount),
	  final_amount: Number(amount),
	  platform_commission: finalPlatformCommission,
	  seller_earning: originalSellerEarning,
	  status: 'pending_payment',
	  payment_method: 'sslcommerz',
	  transaction_id: tran_id,  // ✅ এটিই SSLCommerz-এর সাথে ম্যাচ করবে
	  download_token: downloadToken,
	  link_expires_at: expiresAt.toISOString(),
	  max_downloads: 3,
	  current_downloads: 0,
	  coupon_code: coupon_code || null
	});

    if (orderError) throw new Error(orderError.message);

    // ৩. SSLCommerz API-এর জন্য ডেটা প্রস্তুত করা
    const is_live = false; // স্যান্ডবক্সের জন্য false, লাইভ হলে true করবেন
    const sslczURL = is_live 
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php' 
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    const formData = new URLSearchParams();
    formData.append('store_id', store_id);
    formData.append('store_passwd', store_passwd);
    formData.append('total_amount', String(amount));
    formData.append('currency', 'BDT');
    formData.append('tran_id', tran_id);
	formData.append('success_url', 'https://aitoolsbd.vercel.app/dashboard/orders?payment=success');
	formData.append('fail_url', 'https://aitoolsbd.vercel.app/dashboard/orders?payment=failed');
	formData.append('cancel_url', 'https://aitoolsbd.vercel.app/dashboard/orders?payment=cancelled');
	formData.append('ipn_url', 'https://aitoolsbd.vercel.app/api/payment/sslcommerz/ipn');
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

    // ৪. সরাসরি Fetch API ব্যবহার করে SSLCommerz-এ রিকোয়েস্ট পাঠানো
    const response = await fetch(sslczURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.status === 'SUCCESS' && data.GatewayPageURL) {
      return NextResponse.json({ url: data.GatewayPageURL, tran_id });
    } else {
      console.error("SSLCommerz API Error Response:", data);
      throw new Error(data.failedreason || 'SSLCommerz Gateway URL তৈরি করতে ব্যর্থ হয়েছে।');
    }

  } catch (error: any) {
    console.error('SSLCommerz Init Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}