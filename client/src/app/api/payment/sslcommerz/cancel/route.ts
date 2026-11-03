import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders?payment=cancelled`);
}