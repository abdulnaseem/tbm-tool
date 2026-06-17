import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${API_BASE}/auth/login/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  const response = NextResponse.json(data, { status: res.status });

  const cookie = res.headers.get('set-cookie');
  if (cookie) {
    response.headers.set('set-cookie', cookie);
  }

  return response;
}