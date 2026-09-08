import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'ইমেইল প্রয়োজন' }, { status: 400 });
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ is_unsubscribed: true })
      .eq('email', email);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'সফলভাবে আনসাবস্ক্রাইব করা হয়েছে।' });
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'সার্ভার এরর' }, { status: 500 });
  }
}