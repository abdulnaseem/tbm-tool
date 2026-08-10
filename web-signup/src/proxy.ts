import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  GRAPPLE_ACCESS_COOKIE,
  verifyGrappleAccessToken,
} from './lib/grapple-access';

export function proxy(request: NextRequest) {
  const accessFromUrl = request.nextUrl.searchParams.get('access');
  const accessFromCookie =
    request.cookies.get(GRAPPLE_ACCESS_COOKIE)?.value;

  const token = accessFromUrl || accessFromCookie;
  const payload = verifyGrappleAccessToken(token);

  if (!payload) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  }

  if (accessFromUrl) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete('access');

    const response = NextResponse.redirect(cleanUrl);
    const now = Math.floor(Date.now() / 1000);

    response.cookies.set({
      name: GRAPPLE_ACCESS_COOKIE,
      value: accessFromUrl,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/the-grapple-hub',
      maxAge: Math.max(payload.exp - now, 1),
    });

    response.headers.set(
      'X-Robots-Tag',
      'noindex, nofollow, noarchive',
    );

    return response;
  }

  const response = NextResponse.next();

  response.headers.set(
    'X-Robots-Tag',
    'noindex, nofollow, noarchive',
  );

  return response;
}

export const config = {
  matcher: '/the-grapple-hub/:path*',
};