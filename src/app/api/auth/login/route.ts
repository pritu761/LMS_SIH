import { NextRequest, NextResponse } from 'next/server';
import { generateToken, setAuthCookie, comparePassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { email, password } = body || {};

    if (
      !email ||
      typeof email !== 'string' ||
      !email.trim() ||
      !password ||
      typeof password !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query PostgreSQL User and Profile models via Prisma
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Strictly compare Bcrypt password hash
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Enforce account status checks
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Account is suspended. Please contact administration.' },
        { status: 403 }
      );
    }

    if (user.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Account has been rejected.' },
        { status: 403 }
      );
    }

    // Determine redirect URL based on status and role
    let redirectUrl = '/trainee';
    if (user.status === 'PENDING') {
      redirectUrl = '/auth/pending';
    } else if (user.status === 'APPROVED') {
      switch (user.role) {
        case 'ADMIN':
          redirectUrl = '/admin';
          break;
        case 'TRAINER':
          redirectUrl = '/trainer';
          break;
        case 'TRAINEE':
        default:
          redirectUrl = '/trainee';
          break;
      }
    }

    const fullName = user.profile?.fullName || '';

    // Sign JWT token using edge-compatible helper
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName,
    });

    const avatarUrl = user.profile?.avatarUrl || '';

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName,
        avatarUrl,
        profile: user.profile,
      },
      redirectUrl,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error during authentication', details: error?.message },
      { status: 500 }
    );
  }
}
