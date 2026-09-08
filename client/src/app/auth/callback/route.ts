import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // 🔥 Next.js 15+: cookies() এখন Promise, তাই await করতে হবে
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL এ যদি next parameter থাকে, সেখানে redirect করবে, নাহলে homepage এ
  const next = requestUrl.searchParams.get('next') || '/';
  return NextResponse.redirect(new URL(next, request.url));
}