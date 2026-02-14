import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // Pass backend cookie through
  const response = NextResponse.json(await res.json());
  const cookie = res.headers.get('set-cookie');
  if (cookie) response.headers.set('set-cookie', cookie);

  return response;
}