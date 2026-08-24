import { NextRequest, NextResponse } from 'next/server';
import { initialUsers } from '@/lib/mockData';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    let targetEmail = 'aarav.trainee@capacityconnect.gov';
    if (role === 'ADMIN') targetEmail = 'admin@capacityconnect.gov';
    if (role === 'TRAINER') targetEmail = 'vikram.trainer@capacityconnect.gov';
    if (role === 'TRAINER_PENDING') targetEmail = 'karthik.devops@capacityconnect.gov';
    if (role === 'TRAINEE_PENDING') targetEmail = 'priya.sharma@capacityconnect.gov';

    const user = initialUsers.find((u) => u.email === targetEmail) || initialUsers[0];

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName: user.profile.fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.profile.fullName,
        avatarUrl: user.profile.avatarUrl,
        headline: user.profile.headline,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
