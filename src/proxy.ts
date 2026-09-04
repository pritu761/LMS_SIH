import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// NOTE: This file intentionally verifies the JWT inline with `jose` instead of
// importing `@/lib/auth`. That module pulls in `bcryptjs`, which is not
// edge-runtime compatible and would crash the proxy layer.

const TOKEN_COOKIE_NAME = 'auth_token';

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || 'capacity-connect-super-secure-jwt-secret-key-2026'
  );
}

interface SessionClaims {
  userId: string;
  email: string;
  role: 'TRAINEE' | 'TRAINER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
}

/**
 * Optimistic session check: verifies signature + expiry and rejects
 * accounts whose token claims are SUSPENDED / REJECTED.
 * Full authorization is still enforced inside route handlers and layouts.
 */
async function getSession(request: NextRequest): Promise<SessionClaims | null> {
  try {
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getJwtSecret());
    const status = payload.status as SessionClaims['status'];
    if (status === 'SUSPENDED' || status === 'REJECTED') return null;
    return {
      userId: String(payload.userId || ''),
      email: String(payload.email || ''),
      role: payload.role as SessionClaims['role'],
      status,
    };
  } catch {
    return null;
  }
}

function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

function roleHome(role: SessionClaims['role'], status: SessionClaims['status']): string {
  if (status === 'PENDING') return '/auth/pending';
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'TRAINER':
      return '/trainer';
    case 'TRAINEE':
    default:
      return '/trainee';
  }
}

function isAllowed(session: SessionClaims, pathname: string): boolean {
  // PENDING accounts may only view the pending-approval page.
  if (session.status === 'PENDING') return false;
  if (pathname.startsWith('/admin')) return session.role === 'ADMIN';
  if (pathname.startsWith('/trainer')) return session.role === 'TRAINER' || session.role === 'ADMIN';
  if (pathname.startsWith('/trainee')) return session.role === 'TRAINEE' || session.role === 'ADMIN';
  return true;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtectedArea =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/trainer') ||
    pathname.startsWith('/trainee');
  const isAuthPage = pathname.startsWith('/auth/');

  if (!isProtectedArea && !isAuthPage) {
    return NextResponse.next();
  }

  const session = await getSession(request);

  // --- Protected LMS areas: require a valid session -------------------------
  if (isProtectedArea) {
    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('next', pathname + search);
      loginUrl.searchParams.set('error', 'LoginRequired');
      const redirect = NextResponse.redirect(loginUrl);
      // Drop any stale/expired token so it is never sent again.
      clearAuthCookie(redirect);
      return redirect;
    }

    if (!isAllowed(session, pathname)) {
      return NextResponse.redirect(new URL(roleHome(session.role, session.status), request.url));
    }

    return NextResponse.next();
  }

  // --- Auth pages: keep logged-in users out of login/register ----------------
  if (isAuthPage && session) {
    // Expired/invalid tokens never reach here (getSession returns null),
    // so a stale cookie must be cleared to avoid a redirect loop.
    if (pathname === '/auth/login' || pathname === '/auth/register') {
      return NextResponse.redirect(new URL(roleHome(session.role, session.status), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/trainer/:path*', '/trainee/:path*', '/auth/:path*'],
};
