import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.redirect(`${process.env.SITE_URL}/dashboard/orders?payment=cancelled`);
}