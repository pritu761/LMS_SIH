import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT verification (Edge-runtime compatible)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'capacity-connect-super-secure-jwt-secret-key-2026'
);

const TOKEN_COOKIE_NAME = 'auth_token';

// Interface for decoded JWT payload
interface DecodedToken {
  userId: string;
  email: string;
  role: 'TRAINEE' | 'TRAINER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  fullName: string;
  [key: string]: unknown;
}

/**
 * Route RBAC Configuration Matrix
 * Maps URL prefixes to permitted roles
 */
const RBAC_RULES: Array<{ prefix: string; roles: Array<'TRAINEE' | 'TRAINER' | 'ADMIN'> }> = [
  { prefix: '/admin', roles: ['ADMIN'] },
  { prefix: '/api/admin', roles: ['ADMIN'] },
  { prefix: '/trainer', roles: ['TRAINER', 'ADMIN'] },
  { prefix: '/api/trainer', roles: ['TRAINER', 'ADMIN'] },
  { prefix: '/trainee', roles: ['TRAINEE', 'ADMIN'] },
  { prefix: '/api/trainee', roles: ['TRAINEE', 'ADMIN'] },
];

/**
 * Public routes that do not require authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/pending',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/demo-login',
  '/api/health',
  '/api/health/db',
];

/**
 * Next.js Edge Middleware for Role-Based Access Control (RBAC)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the path is an asset, internal, or static route
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Allow public routes
  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
  if (isPublic && !pathname.startsWith('/trainee') && !pathname.startsWith('/trainer') && !pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // 3. Extract JWT token from httpOnly cookie or Authorization header
  const token =
    request.cookies.get(TOKEN_COOKIE_NAME)?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  const isApiRoute = pathname.startsWith('/api/');

  // 4. Handle unauthenticated access
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to access this resource', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Verify and decode JWT token
  let decodedUser: DecodedToken;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    decodedUser = payload as unknown as DecodedToken;
  } catch (error) {
    // Token is invalid or expired
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Unauthorized: Session has expired or token is invalid', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'SessionExpired');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(TOKEN_COOKIE_NAME);
    return response;
  }

  // 6. Check Account Approval Status
  // PENDING or SUSPENDED users are barred from operational dashboards
  if (decodedUser.status !== 'APPROVED' && decodedUser.role !== 'ADMIN') {
    if (pathname !== '/auth/pending') {
      if (isApiRoute) {
        return NextResponse.json(
          {
            error: `Forbidden: Account is ${decodedUser.status}. Contact administrator for approval.`,
            status: decodedUser.status,
            code: 'ACCOUNT_NOT_APPROVED',
          },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/auth/pending', request.url));
    }
    return NextResponse.next();
  }

  // 7. Enforce Role-Based Access Control (RBAC)
  for (const rule of RBAC_RULES) {
    if (pathname.startsWith(rule.prefix)) {
      const hasPermission = rule.roles.includes(decodedUser.role);

      if (!hasPermission) {
        if (isApiRoute) {
          return NextResponse.json(
            {
              error: `Forbidden: Insufficient privileges. Required: [${rule.roles.join(', ')}], Current: ${decodedUser.role}`,
              code: 'FORBIDDEN_ROLE',
            },
            { status: 403 }
          );
        }

        // Redirect user to their own role's primary dashboard
        let targetDashboard = '/trainee';
        if (decodedUser.role === 'TRAINER') targetDashboard = '/trainer';
        if (decodedUser.role === 'ADMIN') targetDashboard = '/admin';

        return NextResponse.redirect(new URL(targetDashboard, request.url));
      }
    }
  }

  // 8. Inject authenticated user headers for downstream Server Components & Handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', decodedUser.userId);
  requestHeaders.set('x-user-role', decodedUser.role);
  requestHeaders.set('x-user-email', decodedUser.email);
  requestHeaders.set('x-user-name', encodeURIComponent(decodedUser.fullName || 'User'));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, svgs, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
