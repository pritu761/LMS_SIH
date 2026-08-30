import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

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

  // 2. Seed Admin User (Director General of Meteorology)
  const adminUser = await prisma.user.upsert({
    where: { email: 'dg.imd@moes.gov.in' },
    update: {},
    create: {
      email: 'dg.imd@moes.gov.in',
      passwordHash,
      role: 'ADMIN',
      status: 'APPROVED',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Dr. Mrutyunjay Mohapatra',
          headline: 'Director General of Meteorology • National Head, Mission Mausam',
          bio: 'Leading the national modernization of meteorological services, next-generation Doppler radar deployment, Earth-system modelling on sovereign HPC, and specialized capacity development across MoES.',
          organization: 'India Meteorological Department (IMD)',
          department: 'Ministry of Earth Sciences (MoES)',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
          phone: '+91 11 2461 1068',
          location: 'Mausam Bhavan, Lodhi Road, New Delhi',
        },
      },
    },
  });

  // 3. Seed Trainer User (Prof. Vikramaditya Sen)
  const trainerUser = await prisma.user.upsert({
    where: { email: 'vikram.sen@imd.gov.in' },
    update: {},
    create: {
      email: 'vikram.sen@imd.gov.in',
      passwordHash,
      role: 'TRAINER',
      status: 'APPROVED',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Prof. Vikramaditya Sen',
          headline: 'Senior Faculty & Chief Atmospheric Modeller • IMD Training Institute, Pune',
          bio: 'Over 18 years mentoring DRSTC & FTC batches in high-resolution global numerical weather prediction, parallel atmospheric dynamics on Pratyush HPC, and boundary-layer physics.',
          organization: 'India Meteorological Department / IITM',
          department: 'Central Training Division & NWP Core',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
          phone: '+91 20 2553 5200',
          location: 'Pune, Maharashtra',
        },
      },
      competencies: {
        create: [
          { competencyId: nwpComp.id, proficiencyLevel: 5, verified: true },
          { competencyId: hpcComp.id, proficiencyLevel: 5, verified: true },
          { competencyId: aimlComp.id, proficiencyLevel: 4, verified: true },
          { competencyId: satComp.id, proficiencyLevel: 4, verified: true },
        ],
      },
    },
  });

  // 4. Seed Trainee User (Aarav Patel - DRSTC Inductee)
  const traineeUser = await prisma.user.upsert({
    where: { email: 'aarav.patel@imd.gov.in' },
    update: {},
    create: {
      email: 'aarav.patel@imd.gov.in',
      passwordHash,
      role: 'TRAINEE',
      status: 'APPROVED',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Aarav Patel',
          headline: 'Scientist-B • Numerical Weather Prediction & Earth-System Modelling Inductee',
          bio: 'Directly recruited scientist enrolled in the DRSTC 2026 induction track. Focusing on high-resolution atmospheric modelling, high-performance computing, and AI data assimilation for Mission Mausam.',
          organization: 'India Meteorological Department (IMD)',
          department: 'Numerical Weather Prediction Division',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
          phone: '+91 98765 43210',
          location: 'New Delhi, India',
        },
      },
      competencies: {
        create: [
          { competencyId: nwpComp.id, proficiencyLevel: 3, verified: true },
          { competencyId: hpcComp.id, proficiencyLevel: 3, verified: true },
          { competencyId: satComp.id, proficiencyLevel: 2, verified: true },
          { competencyId: radarComp.id, proficiencyLevel: 1, verified: true },
        ],
      },
    },
  });

  // 5. Seed Official Course (IMD-DRSTC-101)
  const course = await prisma.course.upsert({
    where: { code: 'IMD-DRSTC-101' },
    update: {},
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

  // 6. Seed Assessment
  const assessment = await prisma.assessment.create({
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

  // 7. Seed Enrollment
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
