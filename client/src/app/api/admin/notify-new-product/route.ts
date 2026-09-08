import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { productTitle, productLink } = await request.json();

    // ১. শুধু active সাবস্ক্রাইবারদের আনা
    const { data: subscribers, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_unsubscribed', false);

    if (dbError || !subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, message: 'কোনো সক্রিয় সাবস্ক্রাইবার নেই' });
    }

    const emails = subscribers.map((s: any) => s.email);
    let sentCount = 0;

    // ২. ব্যাচ করে ইমেইল পাঠানো
    for (let i = 0; i < emails.length; i += 100) {
      const chunk = emails.slice(i, i + 100);
      await resend.batch.send(
        chunk.map((email: string) => ({
          from: 'AIToolsBD <onboarding@resend.dev>',
          to: email,
          subject: `🎉 নতুন প্রোডাক্ট: ${productTitle}`,
          html: `
            <div style="font-family: 'Hind Siliguri', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4f46e5;">নতুন প্রোডাক্ট যুক্ত হয়েছে! 🚀</h2>
              <p style="font-size: 16px; line-height: 24px; color: #333;">
                আমাদের প্ল্যাটফর্মে নতুন একটি প্রিমিয়াম প্রোডাক্ট যুক্ত হয়েছে যা আপনার কাজকে আরও সহজ করে তুলবে।
              </p>
              <p style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 20px 0;">
                📦 প্রোডাক্ট: ${productTitle}
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${productLink}" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  এখনই দেখুন →
                </a>
              </div>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
              <p style="font-size: 12px; color: #64748b;">
                আপনি এই ইমেইলটি পেয়েছেন কারণ আপনি AIToolsBD-এর নিউজলেটার সাবস্ক্রাইব করেছেন। 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #ef4444; text-decoration: underline;">আনসাবস্ক্রাইব করুন</a>
              </p>
            </div>
          `,
        }))
      );
      sentCount += chunk.length;
    }

    return NextResponse.json({ success: true, message: `${sentCount} জনকে নোটিফিকেশন পাঠানো হয়েছে।` });
  } catch (error: any) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'সার্ভার এরর' }, { status: 500 });
  }
}