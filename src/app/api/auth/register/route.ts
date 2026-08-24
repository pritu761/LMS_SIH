import { NextRequest, NextResponse } from 'next/server';
import { initialUsers, MockUser } from '@/lib/mockData';
import { registerSchema } from '@/lib/validations';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid registration input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password, fullName, role, organization, department, headline, bio } = parsed.data;

    // Check if user already exists in DB or mock
    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({ where: { email } });
    } catch (e) {
      // Fallback
      existingUser = initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    let userId = `user-${Date.now()}`;

    // 1. Persist to PostgreSQL via Prisma with PENDING status
    try {
      const dbUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: role as 'TRAINEE' | 'TRAINER',
          status: 'PENDING', // All onboarded users require System Admin Approval
          isVerified: false,
          profile: {
            create: {
              fullName,
              headline: headline || (role === 'TRAINER' ? 'Senior Faculty Candidate' : 'Civil Service Candidate'),
              bio: bio || 'Excited to contribute to institutional digital capacity building.',
              organization: organization || 'Government / Public Sector',
              department: department || 'General Administration',
              avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face`,
            },
          },
        },
      });
      userId = dbUser.id;
    } catch (err) {
      console.warn('Prisma create fallback to memory:', err);
    }

    // 2. Also register in runtime state
    const newUser: MockUser = {
      id: userId,
      email,
      passwordHash,
      role: role as 'TRAINEE' | 'TRAINER',
      status: 'PENDING', // Strict PENDING guard
      isVerified: false,
      profile: {
        fullName,
        headline: headline || `${role === 'TRAINER' ? 'Senior Faculty Candidate' : 'Civil Service Candidate'}`,
        bio: bio || 'Excited to contribute to institutional digital capacity building.',
        organization: organization || 'Government / Public Sector',
        department: department || 'General Administration',
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face`,
        phone: '+91 90000 00000',
        location: 'New Delhi, India',
        qualifications: [],
        experience: [],
        certificates: [],
      },
      competencies: [],
    };

    initialUsers.push(newUser);

    // Sign JWT token with PENDING status
    const token = await signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      status: 'PENDING',
      fullName: newUser.profile.fullName,
    });

    const response = NextResponse.json({
      success: true,
      status: 'PENDING',
      message: 'Registration received. Your account is PENDING approval by the System Administrator.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        status: 'PENDING',
        fullName: newUser.profile.fullName,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
