import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    include: {
      profile: true,
    },
  });

  console.log('=== USERS IN POSTGRESQL DATABASE ===');
  for (const u of users) {
    const isPassword123 = await bcrypt.compare('Password123!', u.passwordHash);
    console.log({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      isVerified: u.isVerified,
      fullName: u.profile?.fullName,
      matchesPassword123: isPassword123,
    });
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
