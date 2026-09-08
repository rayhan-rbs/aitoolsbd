import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';
import WelcomeEmail from '@/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'ভ্যালিড ইমেইল দিন' }, { status: 400 });
    }

    // ১. ডেটাবেসে সেভ করা
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email });

    if (dbError) {
      if (dbError.code === '23505') {
        return NextResponse.json({ error: 'এই ইমেইল ইতিমধ্যে সাবস্ক্রাইব করা আছে' }, { status: 409 });
      }
      throw dbError;
    }

    // ২. Welcome Email পাঠানো
    const { data, error: emailError } = await resend.emails.send({
      from: 'AIToolsBD <onboarding@resend.dev>', // প্রোডাকশনে: newsletter@aitoolsbd.com
      to: email,
      subject: '🎉 AIToolsBD-তে স্বাগতম!',
      react: WelcomeEmail({ userEmail: email }) as React.ReactElement,
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      // ইমেইল ফেইল হলেও সাবস্ক্রিপশন সফল
    }

    return NextResponse.json({ 
      success: true, 
      message: 'সাবস্ক্রিপশন সফল! আপনার ইমেইল চেক করুন।' 
    });

  } catch (error: any) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'সার্ভার এরর' }, { status: 500 });
  }
}