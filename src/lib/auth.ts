import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export type UserRole = 'TRAINEE' | 'TRAINER' | 'ADMIN';
export type UserStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  [key: string]: unknown;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'capacity-connect-super-secure-jwt-secret-key-2026'
);

const TOKEN_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRY = '7d';

/**
 * Hash a plain password using Bcrypt with 10 salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain password against a stored Bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign an edge-compatible JWT token with user claims
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export const generateToken = signToken;

/**
 * Verify and decode an edge-compatible JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Set httpOnly secure authentication cookie on a response
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

/**
 * Remove authentication cookie on logout
 */
export function clearAuthCookie(response: NextResponse): void {
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

/**
 * Helper to retrieve currently authenticated session from React Server Components or Route Handlers
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = await verifyToken(token);
    if (!payload) return null;
    if (payload.status === 'SUSPENDED' || payload.status === 'REJECTED') {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}
