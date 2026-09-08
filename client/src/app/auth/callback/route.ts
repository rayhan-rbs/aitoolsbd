import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = cookies();
    
    // 🔥 Supabase Server Client তৈরি করা
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // 🔥 Google থেকে আসা কোডটি এক্সচেঞ্জ করে সেশন তৈরি করা
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 🔥 লগইন সফল হলে ইউজারকে হোম পেজে বা ড্যাশবোর্ডে রিডাইরেক্ট করা
  return NextResponse.redirect(origin);
}