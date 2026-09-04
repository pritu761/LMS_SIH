import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

interface SeedUserData {
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'TRAINER' | 'TRAINEE';
  status: 'APPROVED' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  isVerified: boolean;
  fullName: string;
  headline?: string;
  bio?: string;
  organization?: string;
  department?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
}

async function seedUserWithProfile(userData: SeedUserData) {
  const user = await prisma.user.upsert({
    where: { email: userData.email.toLowerCase() },
    update: {
      passwordHash: userData.passwordHash,
      role: userData.role,
      status: userData.status,
      isVerified: userData.isVerified,
    },
    create: {
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role,
      status: userData.status,
      isVerified: userData.isVerified,
      profile: {
        create: {
          fullName: userData.fullName,
          headline: userData.headline,
          bio: userData.bio,
          organization: userData.organization,
          department: userData.department,
          avatarUrl: userData.avatarUrl,
          phone: userData.phone,
          location: userData.location,
        },
      },
    },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      fullName: userData.fullName,
      headline: userData.headline,
      bio: userData.bio,
      organization: userData.organization,
      department: userData.department,
      avatarUrl: userData.avatarUrl,
      phone: userData.phone,
      location: userData.location,
    },
    create: {
      userId: user.id,
      fullName: userData.fullName,
      headline: userData.headline,
      bio: userData.bio,
      organization: userData.organization,
      department: userData.department,
      avatarUrl: userData.avatarUrl,
      phone: userData.phone,
      location: userData.location,
    },
  });

  return user;
}

async function ensureUserCompetencies(
  userId: string,
  competencies: Array<{ competencyId: string; proficiencyLevel: number; verified: boolean }>
) {
  for (const c of competencies) {
    await prisma.userCompetency.upsert({
      where: {
        userId_competencyId: {
          userId,
          competencyId: c.competencyId,
        },
      },
      update: {
        proficiencyLevel: c.proficiencyLevel,
        verified: c.verified,
      },
      create: {
        userId,
        competencyId: c.competencyId,
        proficiencyLevel: c.proficiencyLevel,
        verified: c.verified,
      },
    });
  }
}

async function main() {
  console.log('Seeding Capacity Connect Database with IMD / Mission Mausam Data...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Core Meteorological Competencies
  const nwpComp = await prisma.competency.upsert({
    where: { code: 'MET-NWP' },
    update: {},
    create: {
      name: 'Numerical Weather Prediction & Earth-System Modelling',
      code: 'MET-NWP',
      category: 'Atmospheric Physics & Modeling',
      description: 'Dynamic grid parametrization, non-hydrostatic atmospheric equations, WRF/GFS modeling, and global ensemble prediction systems.',
      targetLevel: 5,
    },
  });

  const radarComp = await prisma.competency.upsert({
    where: { code: 'MET-RADAR' },
    update: {},
    create: {
      name: 'Doppler Weather Radar (DWR) & Convective Nowcasting',
      code: 'MET-RADAR',
      category: 'Observational Radar & Satellite',
      description: 'Interpretation of S/C/X-band dual-polarimetric radar products, reflectivity Z, differential reflectivity ZDR, velocity de-aliasing, and severe storm nowcasting.',
      targetLevel: 5,
    },
  });

  const satComp = await prisma.competency.upsert({
    where: { code: 'MET-SAT' },
    update: {},
    create: {
      name: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics',
      code: 'MET-SAT',
      category: 'Observational Radar & Satellite',
      description: 'Analysis of geostationary meteorological satellites (INSAT-3DR/3DS), multi-spectral water vapor channels, and atmospheric motion vectors.',
      targetLevel: 4,
    },
  });

  const hpcComp = await prisma.competency.upsert({
    where: { code: 'MET-HPC' },
    update: {},
    create: {
      name: 'High-Performance Computing & Atmospheric Grid Parallelism',
      code: 'MET-HPC',
      category: 'Computational & HPC',
      description: 'MPI/OpenMP distributed computing on sovereign supercomputing clusters (Pratyush / Mihir), NetCDF/GRIB2 I/O optimization, and GPU acceleration.',
      targetLevel: 4,
    },
  });

  const aimlComp = await prisma.competency.upsert({
    where: { code: 'MET-AIML' },
    update: {},
    create: {
      name: 'AI/ML for Weather Forecasting & Extreme Event Prediction',
      code: 'MET-AIML',
      category: 'Computational & HPC',
      description: 'Deep neural networks (ConvLSTM, Graph Neural Networks, U-Net) for precipitation nowcasting, physics-informed AI, and tropical cyclone intensity estimation.',
      targetLevel: 4,
    },
  });

  const dssComp = await prisma.competency.upsert({
    where: { code: 'MET-DSS' },
    update: {},
    create: {
      name: 'Early Warning & Multi-Hazard Decision Support Systems',
      code: 'MET-DSS',
      category: 'Applied Meteorology & DSS',
      description: 'Integration of meteorological models with disaster response protocols (NDRF/SDMA), impact-based forecasting, and automated color-coded alerts.',
      targetLevel: 4,
    },
  });

  const synopComp = await prisma.competency.upsert({
    where: { code: 'MET-SYNOP' },
    update: {},
    create: {
      name: 'Synoptic Meteorology & Tropical Cyclone Dynamics',
      code: 'MET-SYNOP',
      category: 'Atmospheric Physics & Modeling',
      description: 'Surface weather chart synoptic analysis, tropical cyclogenesis tracking, storm surge modeling, and monsoon depression mechanics.',
      targetLevel: 5,
    },
  });

  // 2. Seed Initial Admin Personas
  const adminUser = await seedUserWithProfile({
    email: 'dg.imd@moes.gov.in',
    passwordHash,
    role: 'ADMIN',
    status: 'APPROVED',
    isVerified: true,
    fullName: 'Dr. Mrutyunjay Mohapatra',
    headline: 'Director General of Meteorology • National Head, Mission Mausam',
    bio: 'Leading the national modernization of meteorological services, next-generation Doppler radar deployment, Earth-system modelling on sovereign HPC, and specialized capacity development across MoES.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Ministry of Earth Sciences (MoES)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
    phone: '+91 11 2461 1068',
    location: 'Mausam Bhavan, Lodhi Road, New Delhi',
  });

  const portalAdmin = await seedUserWithProfile({
    email: 'admin@capacityconnect.gov',
    passwordHash,
    role: 'ADMIN',
    status: 'APPROVED',
    isVerified: true,
    fullName: 'Dr. Rajeshwari Sharma',
    headline: 'Chief Administrative Officer & Portal Director',
    bio: 'Overseeing institutional capacity building, faculty credentialing, and multi-cadre progression programs.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Central Administration & Capacity Building Wing',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
    phone: '+91 11 2461 1000',
    location: 'Mausam Bhavan, Lodhi Road, New Delhi',
  });

  // 3. Seed Initial Trainer Personas
  const trainerUser = await seedUserWithProfile({
    email: 'vikram.sen@imd.gov.in',
    passwordHash,
    role: 'TRAINER',
    status: 'APPROVED',
    isVerified: true,
    fullName: 'Prof. Vikramaditya Sen',
    headline: 'Senior Faculty & Chief Atmospheric Modeller • IMD Training Institute, Pune',
    bio: 'Over 18 years mentoring DRSTC & FTC batches in high-resolution global numerical weather prediction, parallel atmospheric dynamics on Pratyush HPC, and boundary-layer physics.',
    organization: 'India Meteorological Department / IITM',
    department: 'Central Training Division & NWP Core',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    phone: '+91 20 2553 5200',
    location: 'Pune, Maharashtra',
  });

  await ensureUserCompetencies(trainerUser.id, [
    { competencyId: nwpComp.id, proficiencyLevel: 5, verified: true },
    { competencyId: hpcComp.id, proficiencyLevel: 5, verified: true },
    { competencyId: aimlComp.id, proficiencyLevel: 4, verified: true },
    { competencyId: satComp.id, proficiencyLevel: 4, verified: true },
  ]);

  const genericTrainer = await seedUserWithProfile({
    email: 'trainer@capacityconnect.gov',
    passwordHash,
    role: 'TRAINER',
    status: 'APPROVED',
    isVerified: true,
    fullName: 'Senior Faculty Lead',
    headline: 'Principal Meteorological Instructor • Training Division',
    bio: 'Lead instructor conducting DRSTC and FTC specialized curricula in atmospheric modeling and operational forecasting.',
    organization: 'IMD Central Training Institute',
    department: 'Faculty of Meteorological Sciences',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    phone: '+91 20 2553 5000',
    location: 'Pune, Maharashtra',
  });

  // 4. Seed Initial Trainee Personas (APPROVED)
  const traineeUser = await seedUserWithProfile({
    email: 'aarav.patel@imd.gov.in',
    passwordHash,
    role: 'TRAINEE',
    status: 'APPROVED',
    isVerified: true,
    fullName: 'Aarav Patel',
    headline: 'Scientist-B • Numerical Weather Prediction & Earth-System Modelling Inductee',
    bio: 'Directly recruited scientist enrolled in the DRSTC 2026 induction track. Focusing on high-resolution atmospheric modelling, high-performance computing, and AI data assimilation for Mission Mausam.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Numerical Weather Prediction Division',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
    phone: '+91 98765 43210',
    location: 'New Delhi, India',
  });

  await ensureUserCompetencies(traineeUser.id, [
    { competencyId: nwpComp.id, proficiencyLevel: 3, verified: true },
    { competencyId: hpcComp.id, proficiencyLevel: 3, verified: true },
    { competencyId: satComp.id, proficiencyLevel: 2, verified: true },
    { competencyId: radarComp.id, proficiencyLevel: 1, verified: true },
  ]);

  const genericTrainee = await seedUserWithProfile({
    email: 'trainee@capacityconnect.gov',
    passwordHash,
    role: 'TRAINEE',
    status: 'APPROVED',
    isVerified: true,
    fullName: 'Meteorological Officer Trainee',
    headline: 'Scientist-B Inductee • DRSTC Foundation Batch',
    bio: 'Cadre inductee developing foundational competencies in synoptic weather forecasting, radar analytics, and numerical modeling.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Induction Training Division',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
    phone: '+91 11 2461 2000',
    location: 'New Delhi, India',
  });

  // 5. Seed Status Test Personas (Explicitly required by R3 / Acceptance Criteria)
  // Standard capacityconnect.org domain personas
  await seedUserWithProfile({
    email: 'suspended@capacityconnect.org',
    passwordHash,
    role: 'TRAINEE',
    status: 'SUSPENDED',
    isVerified: false,
    fullName: 'Suspended Trainee',
    headline: 'Account Suspended • Access Restricted',
    bio: 'Account temporarily suspended pending administrative security review.',
    organization: 'CapacityConnect Security Testing',
    department: 'Trainee Cadre',
    phone: '+91 98000 00001',
    location: 'New Delhi, India',
  });

  await seedUserWithProfile({
    email: 'rejected@capacityconnect.org',
    passwordHash,
    role: 'TRAINEE',
    status: 'REJECTED',
    isVerified: false,
    fullName: 'Rejected Applicant',
    headline: 'Enrollment Application Rejected',
    bio: 'Candidate enrollment application was rejected by the administrative board.',
    organization: 'CapacityConnect Admissions',
    department: 'Applicant Pool',
    phone: '+91 98000 00002',
    location: 'New Delhi, India',
  });

  await seedUserWithProfile({
    email: 'pending@capacityconnect.org',
    passwordHash,
    role: 'TRAINEE',
    status: 'PENDING',
    isVerified: false,
    fullName: 'Pending Verification Trainee',
    headline: 'Awaiting Administrator Approval',
    bio: 'Account registration submitted, awaiting verification and credential validation by portal administrator.',
    organization: 'CapacityConnect Onboarding',
    department: 'Induction Queue',
    phone: '+91 98000 00003',
    location: 'New Delhi, India',
  });

  // Domain aliases for .gov test parity
  await seedUserWithProfile({
    email: 'suspended@capacityconnect.gov',
    passwordHash,
    role: 'TRAINEE',
    status: 'SUSPENDED',
    isVerified: false,
    fullName: 'Suspended Officer Trainee',
    headline: 'Account Suspended • Access Restricted',
    bio: 'Account temporarily suspended pending administrative review.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Administrative Sanctions',
    phone: '+91 11 2461 9991',
    location: 'New Delhi, India',
  });

  await seedUserWithProfile({
    email: 'rejected@capacityconnect.gov',
    passwordHash,
    role: 'TRAINEE',
    status: 'REJECTED',
    isVerified: false,
    fullName: 'Rejected Candidate',
    headline: 'Cadre Application Rejected',
    bio: 'Application rejected during background or credential verification.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Recruitment Board',
    phone: '+91 11 2461 9992',
    location: 'New Delhi, India',
  });

  await seedUserWithProfile({
    email: 'pending@capacityconnect.gov',
    passwordHash,
    role: 'TRAINEE',
    status: 'PENDING',
    isVerified: false,
    fullName: 'Pending Registration Officer',
    headline: 'Candidate Awaiting Verification',
    bio: 'Newly registered officer awaiting cadre supervisor approval.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Induction Training Division',
    phone: '+91 11 2461 9993',
    location: 'New Delhi, India',
  });

  // 6. Seed Official Course (IMD-DRSTC-101)
  const course = await prisma.course.upsert({
    where: { code: 'IMD-DRSTC-101' },
    update: {
      trainerId: trainerUser.id,
    },
    create: {
      title: 'DRSTC: Earth-System Modelling & HPC Parallel Architectures on Pratyush',
      code: 'IMD-DRSTC-101',
      slug: 'drstc-earth-system-modelling-hpc-pratyush',
      description: 'Direct Recruited Scientists Training Course (DRSTC) flagship module: Master non-hydrostatic atmospheric grid dynamics, numerical time-stepping (CFL criteria), MPI/OpenMP domain decomposition on sovereign supercomputers (Pratyush / Mihir), and GFS/NCUM ensemble assimilation.',
      category: 'Atmospheric Physics & Modeling',
      level: 'Advanced Inductee',
      durationHours: 24.0,
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      status: 'PUBLISHED',
      trainerId: trainerUser.id,
      competencies: {
        create: [
          { competencyId: nwpComp.id, requiredProficiency: 5, weight: 1.8 },
          { competencyId: hpcComp.id, requiredProficiency: 4, weight: 1.4 },
          { competencyId: satComp.id, requiredProficiency: 3, weight: 0.9 },
        ],
      },
      materials: {
        create: [
          {
            title: 'Module 1: What Are Numerical Weather Prediction (NWP) Models & Governing Equations',
            description: 'Comprehensive breakdown of primitive hydrostatic equations, baroclinic instability, and finite difference grid staggerings.',
            type: 'VIDEO',
            url: 'https://www.youtube.com/watch?v=XVNdacklXCk',
            durationSeconds: 1680,
            fileSize: '165 MB',
            sortOrder: 1,
            isPreview: true,
          },
          {
            title: 'High-Performance Parallel MPI Grid Decomposition Guide (Technical PDF)',
            description: 'Technical handbook detailing 2D spatial domain splitting, boundary halo exchanges, and NetCDF4 parallel I/O on national supercomputers (Pratyush / Mihir).',
            type: 'PDF',
            url: '/materials/nwp-mpi-grid-decomposition-guide.pdf',
            downloadUrl: '/materials/nwp-mpi-grid-decomposition-guide.pdf',
            fileSize: '6.5 KB',
            sortOrder: 2,
            isPreview: false,
          },
        ],
      },
    },
  });

  // 7. Seed Assessment (Fully Idempotent Check & Prune)
  const existingAssessment = await prisma.assessment.findFirst({
    where: {
      courseId: course.id,
      title: 'DRSTC: Earth-System Modelling & HPC Certification Exam',
    },
  });

  let assessment;
  if (existingAssessment) {
    assessment = existingAssessment;
    // Clean up any extraneous duplicate assessments for the same course and title from prior non-idempotent runs
    const duplicateAssessments = await prisma.assessment.findMany({
      where: {
        courseId: course.id,
        title: 'DRSTC: Earth-System Modelling & HPC Certification Exam',
        id: { not: existingAssessment.id },
      },
    });
    if (duplicateAssessments.length > 0) {
      for (const dup of duplicateAssessments) {
        await prisma.assessment.delete({ where: { id: dup.id } });
      }
      console.log(`Pruned ${duplicateAssessments.length} duplicate assessment(s) from earlier non-idempotent runs.`);
    }
  } else {
    assessment = await prisma.assessment.create({
      data: {
        courseId: course.id,
        title: 'DRSTC: Earth-System Modelling & HPC Certification Exam',
        description: 'Comprehensive timed evaluation testing mastery over non-hydrostatic governing equations, CFL numerical stability criteria, and domain parallelization.',
        timeLimitMinutes: 25,
        passingScorePercentage: 70.0,
        maxAttempts: 3,
        totalQuestions: 2,
        totalWeight: 5.0,
        isPublished: true,
        questions: {
          create: [
            {
              questionText: 'In numerical weather prediction (NWP) finite-difference discretization, which condition must be satisfied by the time step (Δt) and grid spacing (Δx) for explicit advection schemes to maintain numerical stability?',
              questionType: 'SINGLE_CHOICE',
              options: [
                { id: 'opt_1', text: 'Courant–Friedrichs–Lewy (CFL) Condition: C = u*(Δt/Δx) ≤ C_max (typically ≤ 1.0)' },
                { id: 'opt_2', text: 'Richardson Number stability limit (Ri > 0.25)' },
                { id: 'opt_3', text: 'Brunt–Väisälä buoyancy frequency threshold (N² > 0)' },
                { id: 'opt_4', text: 'Navier–Stokes Reynolds number equivalence (Re = 1)' },
              ],
              correctOption: 'opt_1',
              weight: 2.5,
              explanation: 'The CFL condition governs explicit time-stepping stability; if information propagates across a spatial grid cell faster than the time step, numerical divergence occurs.',
              sortOrder: 1,
            },
            {
              questionText: 'When scaling atmospheric earth-system models on sovereign supercomputers (e.g. Pratyush / Mihir) with thousands of MPI ranks, what is the primary communication bottleneck during spectral transform steps (Legendre / Fourier)?',
              questionType: 'SINGLE_CHOICE',
              options: [
                { id: 'opt_1', text: 'Point-to-point nearest neighbor halo exchange' },
                { id: 'opt_2', text: 'All-to-All (MPI_Alltoall) global communication transpose' },
                { id: 'opt_3', text: 'Local L1 cache memory latency' },
                { id: 'opt_4', text: 'Serial file write to stdout' },
              ],
              correctOption: 'opt_2',
              weight: 2.5,
              explanation: 'In spectral models, converting between grid point space and spectral harmonic space requires global MPI_Alltoall transposes across all nodes.',
              sortOrder: 2,
            },
          ],
        },
      },
    });
  }

  // 8. Seed Enrollment (Idempotent)
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: traineeUser.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: traineeUser.id,
      courseId: course.id,
      status: 'ACTIVE',
      progressPercentage: 50.0,
    },
  });

  console.log('IMD & Mission Mausam database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
