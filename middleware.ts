/**
 * middleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Protects /admin and /api/admin/* with HTTP Basic Authentication.
 *
 * Why Basic Auth here instead of a login page?
 *   - No session store required — stateless, works out of the box
 *   - Appropriate for a low-traffic internal tool (wedding admin)
 *   - Browser caches credentials for the session, so you only type once
 *
 * Trade-offs to discuss in interviews:
 *   - No server-side logout (user must clear browser cache)
 *   - Credentials sent on every request (mitigated by HTTPS)
 *   - Would replace with NextAuth.js / JWT for a multi-user app
 *
 * Credentials are read from env vars so they're never hardcoded:
 *   ADMIN_USER=yourname
 *   ADMIN_PASS=yourpassword
 */

import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/admin', '/api/admin'];

function isProtected(pathname: string): boolean {
  return PROTECTED.some((prefix) => pathname.startsWith(prefix));
}

function unauthorized(): NextResponse {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Wedding Admin", charset="UTF-8"',
    },
  });
}

export function middleware(request: NextRequest): NextResponse {
  if (!isProtected(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Basic ')) return unauthorized();

  const [user, pass] = Buffer.from(authHeader.slice(6), 'base64')
    .toString()
    .split(':');

  const expectedUser = process.env.ADMIN_USER ?? 'admin';
  const expectedPass = process.env.ADMIN_PASS ?? 'changeme';

  if (user !== expectedUser || pass !== expectedPass) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
