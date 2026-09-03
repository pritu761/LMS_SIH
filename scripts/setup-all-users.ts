import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

const DEFAULT_PASSWORD = 'Password123!';

interface UserSeedData {
  email: string;
  role: 'ADMIN' | 'TRAINER' | 'TRAINEE';
  fullName: string;
  headline: string;
  bio: string;
  organization: string;
  department: string;
  phone: string;
  location: string;
  avatarUrl?: string;
}

const usersToSetup: UserSeedData[] = [
  // ==========================================
  // 1. ADMINS
  // ==========================================
  {
    email: 'admin@capacityconnect.gov',
    role: 'ADMIN',
    fullName: 'Dr. Rajeshwari Sharma',
    headline: 'Chief Administrative Officer & Portal Director',
    bio: 'Overseeing institutional capacity building, faculty credentialing, and multi-cadre progression programs.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Central Administration & Capacity Building Wing',
    phone: '+91 11 2461 1000',
    location: 'Mausam Bhavan, Lodhi Road, New Delhi',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'dg.imd@moes.gov.in',
    role: 'ADMIN',
    fullName: 'Dr. Mrutyunjay Mohapatra',
    headline: 'Director General of Meteorology • National Head, Mission Mausam',
    bio: 'Leading the national modernization of meteorological services, next-generation Doppler radar deployment, Earth-system modelling on sovereign HPC, and specialized capacity development across MoES.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Ministry of Earth Sciences (MoES)',
    phone: '+91 11 2461 1068',
    location: 'Mausam Bhavan, Lodhi Road, New Delhi',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
  },

  // ==========================================
  // 2. TRAINERS
  // ==========================================
  {
    email: 'trainer@capacityconnect.gov',
    role: 'TRAINER',
    fullName: 'Senior Faculty Lead',
    headline: 'Principal Meteorological Instructor • Training Division',
    bio: 'Lead instructor conducting DRSTC and FTC specialized curricula in atmospheric modeling and operational forecasting.',
    organization: 'IMD Central Training Institute',
    department: 'Faculty of Meteorological Sciences',
    phone: '+91 20 2553 5000',
    location: 'Pune, Maharashtra',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'vikram.trainer@capacityconnect.gov',
    role: 'TRAINER',
    fullName: 'Prof. Vikramaditya Sen',
    headline: 'Senior Faculty & Chief Atmospheric Modeller • IMD Training Institute, Pune',
    bio: 'Over 18 years mentoring DRSTC & FTC batches in high-resolution global numerical weather prediction, parallel atmospheric dynamics on Pratyush HPC, and boundary-layer physics.',
    organization: 'India Meteorological Department / IITM',
    department: 'Central Training Division & NWP Core',
    phone: '+91 20 2553 5200',
    location: 'Pune, Maharashtra',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'vikram.sen@imd.gov.in',
    role: 'TRAINER',
    fullName: 'Prof. Vikramaditya Sen',
    headline: 'Senior Faculty & Chief Atmospheric Modeller • IMD Training Institute, Pune',
    bio: 'Over 18 years mentoring DRSTC & FTC batches in high-resolution global numerical weather prediction, parallel atmospheric dynamics on Pratyush HPC, and boundary-layer physics.',
    organization: 'India Meteorological Department / IITM',
    department: 'Central Training Division & NWP Core',
    phone: '+91 20 2553 5200',
    location: 'Pune, Maharashtra',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'ananya.roy@moes.gov.in',
    role: 'TRAINER',
    fullName: 'Dr. Ananya Roy',
    headline: 'Lead AI/ML Scientist • Center for Atmospheric Deep Learning & INSAT Analytics',
    bio: 'Pioneering physics-informed neural networks (PINNs) and Graph Neural Networks for ultra-fast convective storm nowcasting and INSAT-3DR multi-channel data assimilation.',
    organization: 'Ministry of Earth Sciences (MoES) / IMD',
    department: 'Satellite Meteorology & AI Division',
    phone: '+91 11 2462 8900',
    location: 'New Delhi, India',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'rameshwar.radar@imd.gov.in',
    role: 'TRAINER',
    fullName: 'Dr. Rameshwar Rao',
    headline: 'Chief Doppler Radar Specialist • DWR Operations & Cyclone Warning Division',
    bio: 'Expert in Dual-Polarimetric Doppler Radar calibration, hydrometeor classification, severe squall line detection, and Bay of Bengal tropical cyclone landfall nowcasting.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Radar Meteorology & Cyclone Warning Wing',
    phone: '+91 44 2827 1234',
    location: 'Chennai, Tamil Nadu',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'ramesh@gmail.com',
    role: 'TRAINER',
    fullName: 'Ramesh Kumar',
    headline: 'Operational Meteorology Trainer • Field Instrumentation Specialist',
    bio: 'Specialist in automated weather station (AWS) calibration, surface observation network maintenance, and field training.',
    organization: 'India Meteorological Department',
    department: 'Surface Instruments & Observatories Division',
    phone: '+91 98110 54321',
    location: 'Hyderabad, Telangana',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face',
  },

  // ==========================================
  // 3. TRAINEES
  // ==========================================
  {
    email: 'trainee@capacityconnect.gov',
    role: 'TRAINEE',
    fullName: 'Meteorological Officer Trainee',
    headline: 'Scientist-B Inductee • DRSTC Foundation Batch',
    bio: 'Cadre inductee developing foundational competencies in synoptic weather forecasting, radar analytics, and numerical modeling.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Induction Training Division',
    phone: '+91 11 2461 2000',
    location: 'New Delhi, India',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'aarav.trainee@capacityconnect.gov',
    role: 'TRAINEE',
    fullName: 'Aarav Patel',
    headline: 'Scientist-B • Numerical Weather Prediction & Earth-System Modelling Inductee',
    bio: 'Directly recruited scientist enrolled in the DRSTC 2026 induction track. Focusing on high-resolution atmospheric modelling, high-performance computing, and AI data assimilation for Mission Mausam.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Numerical Weather Prediction Division',
    phone: '+91 98765 43210',
    location: 'New Delhi, India',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'aarav.patel@imd.gov.in',
    role: 'TRAINEE',
    fullName: 'Aarav Patel',
    headline: 'Scientist-B • Numerical Weather Prediction & Earth-System Modelling Inductee',
    bio: 'Directly recruited scientist enrolled in the DRSTC 2026 induction track. Focusing on high-resolution atmospheric modelling, high-performance computing, and AI data assimilation for Mission Mausam.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Numerical Weather Prediction Division',
    phone: '+91 98765 43210',
    location: 'New Delhi, India',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'priya.sharma@capacityconnect.gov',
    role: 'TRAINEE',
    fullName: 'Priya Sharma',
    headline: 'Scientist-B • Satellite Meteorology & Remote Sensing Inductee',
    bio: 'Enrolled in DRSTC satellite meteorology track, specializing in INSAT-3DS sounder data processing and radiative transfer.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Satellite Meteorology Division',
    phone: '+91 98765 11223',
    location: 'New Delhi, India',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'priya.sharma.1787592967258@gov.in',
    role: 'TRAINEE',
    fullName: 'Priya Sharma',
    headline: 'Scientist-B • Satellite Meteorology & Remote Sensing Inductee',
    bio: 'Enrolled in DRSTC satellite meteorology track, specializing in INSAT-3DS sounder data processing and radiative transfer.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Satellite Meteorology Division',
    phone: '+91 98765 11223',
    location: 'New Delhi, India',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'sneha.forecaster@imd.gov.in',
    role: 'TRAINEE',
    fullName: 'Sneha Kulkarni',
    headline: 'Operational Forecaster • Cyclone Warning & Severe Weather Division',
    bio: 'Enrolled in the FTC track to master Doppler Radar polarimetric signatures and Bay of Bengal tropical storm track estimation.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Regional Meteorological Centre, Chennai',
    phone: '+91 94440 12345',
    location: 'Chennai, Tamil Nadu',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'kavita.drstc@imd.gov.in',
    role: 'TRAINEE',
    fullName: 'Dr. Kavita Deshmukh',
    headline: 'Scientist-B • Cloud Physics & Aerosol Dynamics Inductee',
    bio: 'Direct recruit inductee into the DRSTC cohort, focusing on cloud microphysical parameterizations and climate modeling.',
    organization: 'IITM Pune / MoES',
    department: 'Cloud & Aerosol Dynamics Group',
    phone: '+91 98230 77889',
    location: 'Pune, Maharashtra',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
  },
  {
    email: 'ujuj8@gmail.com',
    role: 'TRAINEE',
    fullName: 'Trainee Officer (hfkif)',
    headline: 'Scientific Assistant Inductee • Meteorological Operations',
    bio: 'Induction trainee in observational meteorology and atmospheric data acquisition.',
    organization: 'India Meteorological Department',
    department: 'Regional Operations Division',
    phone: '+91 98765 99887',
    location: 'New Delhi, India',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
  },
];

async function main() {
  console.log('Generating secure bcrypt hash for password:', DEFAULT_PASSWORD);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  console.log('--- EXECUTING UPSERTS FOR ALL ADMIN, TRAINER & TRAINEE USERS ---');

  for (const item of usersToSetup) {
    const existing = await prisma.user.findUnique({
      where: { email: item.email },
      include: { profile: true },
    });

    if (existing) {
      // Update existing user: approve status, verify, and update password
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          role: item.role,
          status: 'APPROVED',
          isVerified: true,
        },
      });

      // Update or create profile
      if (existing.profile) {
        await prisma.profile.update({
          where: { id: existing.profile.id },
          data: {
            fullName: item.fullName,
            headline: item.headline,
            bio: item.bio,
            organization: item.organization,
            department: item.department,
            phone: item.phone,
            location: item.location,
            avatarUrl: item.avatarUrl || existing.profile.avatarUrl,
          },
        });
      } else {
        await prisma.profile.create({
          data: {
            userId: existing.id,
            fullName: item.fullName,
            headline: item.headline,
            bio: item.bio,
            organization: item.organization,
            department: item.department,
            phone: item.phone,
            location: item.location,
            avatarUrl: item.avatarUrl,
          },
        });
      }
      console.log(`[UPDATED] ${item.role.padEnd(8)} -> ${item.email} (${item.fullName})`);
    } else {
      // Create new user with profile
      await prisma.user.create({
        data: {
          email: item.email,
          passwordHash,
          role: item.role,
          status: 'APPROVED',
          isVerified: true,
          profile: {
            create: {
              fullName: item.fullName,
              headline: item.headline,
              bio: item.bio,
              organization: item.organization,
              department: item.department,
              phone: item.phone,
              location: item.location,
              avatarUrl: item.avatarUrl,
            },
          },
        },
      });
      console.log(`[CREATED] ${item.role.padEnd(8)} -> ${item.email} (${item.fullName})`);
    }
  }

  // Also check if any other user remains in the DB and ensure they are approved with valid password
  const allDbUsers = await prisma.user.findMany({
    include: { profile: true },
  });

  for (const u of allDbUsers) {
    if (u.status !== 'APPROVED' || !u.isVerified) {
      await prisma.user.update({
        where: { id: u.id },
        data: {
          status: 'APPROVED',
          isVerified: true,
          passwordHash,
        },
      });
      console.log(`[AUTO-APPROVED] ${u.role} -> ${u.email}`);
    }
  }

  console.log('\n=== FINAL VERIFICATION QUERY ===');
  const finalUsers = await prisma.user.findMany({
    include: { profile: true },
    orderBy: [{ role: 'asc' }, { email: 'asc' }],
  });

  console.log(`Total users configured in PostgreSQL: ${finalUsers.length}\n`);
  const report = finalUsers.map(u => ({
    Role: u.role,
    Name: u.profile?.fullName || 'N/A',
    Email: u.email,
    Password: DEFAULT_PASSWORD,
    Status: u.status,
    Verified: u.isVerified,
    DashboardUrl: u.role === 'ADMIN' ? '/admin' : u.role === 'TRAINER' ? '/trainer' : '/trainee',
  }));

  console.table(report);
}

main()
  .catch((err) => {
    console.error('Error during setup:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
