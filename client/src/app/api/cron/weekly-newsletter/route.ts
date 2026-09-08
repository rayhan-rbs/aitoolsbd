import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // 🔥 সিকিউরিটি: শুধু Vercel Cron থেকে কল অনুমোদিত
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { data: subscribers } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_unsubscribed', false);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers' });
    }

    // এখানে আপনার সাপ্তাহিক ইমেইল লজিক বসবে (Phase ২ এর মতো batch.send)
    // উদাহরণস্বরূপ:
    console.log(`Sending weekly newsletter to ${subscribers.length} users...`);
    
    return NextResponse.json({ success: true, message: 'Weekly cron executed' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}