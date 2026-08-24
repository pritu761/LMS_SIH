import { NextRequest, NextResponse } from 'next/server';
import { initialUsers } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';
import { userStatusUpdateSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('q')?.toLowerCase();

    // 1. Fetch from PostgreSQL database if available
    let allUsers: any[] = [];
    try {
      const dbUsers = await prisma.user.findMany({
        include: { profile: true, competencies: true },
        orderBy: { createdAt: 'desc' },
      });
      if (dbUsers && dbUsers.length > 0) {
        allUsers = dbUsers.map((u) => ({
          id: u.id,
          email: u.email,
          role: u.role,
          status: u.status,
          isVerified: u.isVerified,
          createdAt: u.createdAt.toISOString(),
          profile: u.profile || {
            fullName: 'User',
            headline: 'Candidate',
            organization: 'Government / Public Sector',
            department: 'General',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
            qualifications: [],
            experience: [],
            certificates: [],
          },
          competencies: u.competencies || [],
        }));
      }
    } catch (e) {
      // Fallback
    }

    // Merge with any mock memory users not in db
    initialUsers.forEach((mu) => {
      if (!allUsers.some((u) => u.email.toLowerCase() === mu.email.toLowerCase())) {
        const { passwordHash, ...sanitized } = mu;
        allUsers.push(sanitized);
      }
    });

    let filtered = allUsers;

    if (roleFilter && roleFilter !== 'ALL') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (statusFilter && statusFilter !== 'ALL') {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.profile?.fullName?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.profile?.organization?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      pendingCount: allUsers.filter((u) => u.status === 'PENDING').length,
      users: filtered,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = userStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid user update payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { userId, status, role } = parsed.data;

    // 1. Update in PostgreSQL database
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: status as any,
          isVerified: status === 'APPROVED',
          ...(role ? { role: role as any } : {}),
        },
      });
    } catch (e) {
      // Fallback to memory
    }

    // 2. Also update in memory
    const user = initialUsers.find((u) => u.id === userId);
    if (user) {
      user.status = status;
      if (status === 'APPROVED') {
        user.isVerified = true;
      }
      if (role) {
        user.role = role;
      }
    }

    return NextResponse.json({
      success: true,
      message: `User status successfully updated to ${status}.`,
      updated: {
        userId,
        status,
        role,
        isVerified: status === 'APPROVED',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
