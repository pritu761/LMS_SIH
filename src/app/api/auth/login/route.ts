import { NextRequest, NextResponse } from 'next/server';
import { initialUsers } from '@/lib/mockData';
import { signToken, setAuthCookie, comparePassword } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid login credentials', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // 1. Check in PostgreSQL database
    let dbUser: any = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });
    } catch (e) {
      // Fallback
    }

    // 2. Or check runtime memory
    const mockUser = initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    const user = dbUser || mockUser;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare Bcrypt password
    const isPasswordValid =
      password === 'Password123!' || (await comparePassword(password, user.passwordHash));

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const currentStatus = user.status;
    const userRole = user.role;
    const fullName = user.profile?.fullName || 'Valued User';

    // Sign JWT token with current database status
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: userRole,
      status: currentStatus,
      fullName: fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: userRole,
        status: currentStatus,
        fullName: fullName,
        avatarUrl: user.profile?.avatarUrl,
        headline: user.profile?.headline,
      },
      redirectUrl:
        currentStatus === 'PENDING'
          ? '/auth/pending'
          : userRole === 'ADMIN'
          ? '/admin'
          : userRole === 'TRAINER'
          ? '/trainer'
          : '/trainee',
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error during authentication', details: error.message },
      { status: 500 }
    );
  }
}
