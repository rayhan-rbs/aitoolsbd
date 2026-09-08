import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Next.js 15+ এ cookies() একটি Promise, তাই await করতে হবে
    const cookieStore = await cookies();
    
    // @supabase/ssr এর সঠিক এবং একমাত্র উপায় হলো createServerClient ব্যবহার করা
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

    // কোড এক্সচেঞ্জ করে সেশন তৈরি করা
    await supabase.auth.exchangeCodeForSession(code);
  }

  // সফল হওয়ার পর যে পেজে রিডাইরেক্ট করবে
  const next = requestUrl.searchParams.get('next') || '/';
  return NextResponse.redirect(new URL(next, request.url));
}