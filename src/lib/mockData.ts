// Capacity Connect - High Fidelity Mock Repository & Seed Data
// IMD & MoES "Mission Mausam" Digital Capacity Building, Competency Management & Trainer Discovery

export interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'TRAINEE' | 'TRAINER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  isVerified: boolean;
  cadreTrack?: 'DRSTC' | 'FTC' | 'IMTC' | 'MODULAR';
  designation?: string;
  centre?: string;
  profile: {
    fullName: string;
    headline: string;
    bio: string;
    organization: string;
    department: string;
    avatarUrl: string;
    phone: string;
    location: string;
    qualifications: Array<{ degree: string; institution: string; year: string; field: string }>;
    experience: Array<{ title: string; company: string; startYear: string; endYear: string; description: string }>;
    certificates: Array<{ title: string; issuer: string; issueDate: string; credentialUrl: string }>;
  };
  competencies: Array<{ competencyId: string; competencyName: string; code: string; proficiencyLevel: number; verified: boolean }>;
}

export interface MockCompetency {
  id: string;
  name: string;
  code: string;
  category: 'Atmospheric Physics & Modeling' | 'Observational Radar & Satellite' | 'Computational & HPC' | 'Applied Meteorology & DSS' | 'Governance & Leadership';
  description: string;
  targetLevel: number;
}

export interface MockCadreBenchmark {
  id: string;
  name: string;
  code: 'DRSTC' | 'FTC' | 'IMTC' | 'MODULAR';
  fullName: string;
  targetAudience: string;
  description: string;
  duration: string;
  requiredCompetencies: Array<{
    competencyId: string;
    competencyName: string;
    code: string;
    benchmarkLevel: number; // 1 to 5
    importance: 'CRITICAL' | 'HIGH' | 'CORE';
  }>;
}

export interface MockCourse {
  id: string;
  title: string;
  code: string;
  slug: string;
  description: string;
  category: string;
  cadreTrack: 'DRSTC' | 'FTC' | 'IMTC' | 'MODULAR';
  level: string;
  durationHours: number;
  thumbnail: string;
  status: 'PUBLISHED' | 'DRAFT';
  trainerId: string;
  trainerName: string;
  trainerRating: number;
  trainerSpecialization: string;
  competencies: Array<{ competencyId: string; competencyName: string; requiredProficiency: number; weight: number }>;
  materials: Array<{
    id: string;
    title: string;
    description: string;
    type: 'VIDEO' | 'PDF' | 'PPT' | 'DOC';
    url: string;
    downloadUrl?: string;
    durationSeconds?: number;
    fileSize: string;
    sortOrder: number;
    isPreview: boolean;
  }>;
  assessmentId: string;
}

export interface MockAssessment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  maxAttempts: number;
  submissionDeadline?: string;
  questions: Array<{
    id: string;
    questionText: string;
    questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
    options: Array<{ id: string; text: string }>;
    correctOption: string | string[];
    weight: number;
    explanation: string;
    sortOrder: number;
  }>;
}

export interface MockEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  progressPercentage: number;
  completedMaterialIds: string[];
  currentMaterialId?: string | null;
  enrolledAt: string;
  completedAt?: string | null;
  certificateId?: string | null;
  certificateUrl?: string | null;
}

export interface MockFeedback {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userRole: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MockAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'ALERT' | 'SPOTLIGHT' | 'ACHIEVEMENT' | 'GENERAL';
  isPinned: boolean;
  authorName: string;
  createdAt: string;
}

// ----------------------------------------------------
// INITIAL MOCK REPOSITORY DATA: IMD & MISSION MAUSAM
// ----------------------------------------------------

export const initialCompetencies: MockCompetency[] = [
  {
    id: 'comp-nwp',
    name: 'Numerical Weather Prediction & Earth-System Modelling',
    code: 'MET-NWP',
    category: 'Atmospheric Physics & Modeling',
    description: 'Dynamic grid parametrization, hydrostatic/non-hydrostatic atmospheric equations, WRF/GFS modeling, and global ensemble prediction systems.',
    targetLevel: 5,
  },
  {
    id: 'comp-radar',
    name: 'Doppler Weather Radar (DWR) & Convective Nowcasting',
    code: 'MET-RADAR',
    category: 'Observational Radar & Satellite',
    description: 'Interpretation of S/C/X-band dual-polarimetric radar products, reflectivity Z, differential reflectivity ZDR, velocity de-aliasing, and severe storm nowcasting.',
    targetLevel: 5,
  },
  {
    id: 'comp-sat',
    name: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics',
    code: 'MET-SAT',
    category: 'Observational Radar & Satellite',
    description: 'Analysis of geostationary meteorological satellites (INSAT-3DR/3DS), multi-spectral water vapor channels, atmospheric motion vectors, and cloud top brightness temperatures.',
    targetLevel: 4,
  },
  {
    id: 'comp-hpc',
    name: 'High-Performance Computing & Atmospheric Grid Parallelism',
    code: 'MET-HPC',
    category: 'Computational & HPC',
    description: 'MPI/OpenMP distributed computing on sovereign supercomputing clusters (Pratyush / Mihir), NetCDF/GRIB2 I/O optimization, and GPU acceleration for climate dynamics.',
    targetLevel: 4,
  },
  {
    id: 'comp-aiml',
    name: 'AI/ML for Weather Forecasting & Extreme Event Prediction',
    code: 'MET-AIML',
    category: 'Computational & HPC',
    description: 'Deep neural networks (ConvLSTM, Graph Neural Networks, U-Net) for precipitation nowcasting, physics-informed AI, and tropical cyclone intensity estimation.',
    targetLevel: 4,
  },
  {
    id: 'comp-dss',
    name: 'Early Warning & Multi-Hazard Decision Support Systems',
    code: 'MET-DSS',
    category: 'Applied Meteorology & DSS',
    description: 'Integration of meteorological models with disaster response protocols (NDRF/SDMA), impact-based forecasting, and automated color-coded alerts (Red/Orange/Yellow).',
    targetLevel: 4,
  },
  {
    id: 'comp-synop',
    name: 'Synoptic Meteorology & Tropical Cyclone Dynamics',
    code: 'MET-SYNOP',
    category: 'Atmospheric Physics & Modeling',
    description: 'Surface weather chart synoptic analysis, tropical cyclogenesis tracking, storm surge modeling, Madden-Julian Oscillation (MJO), and monsoon depression mechanics.',
    targetLevel: 5,
  },
  {
    id: 'comp-agro',
    name: 'Agrometeorology, Hydromet & Flash Flood Warning',
    code: 'MET-AGRO',
    category: 'Applied Meteorology & DSS',
    description: 'Gramin Krishi Mausam Sewa (GKMS) crop-weather modeling, hydrological runoff simulation, Doppler flash flood guidance, and soil moisture telemetry.',
    targetLevel: 3,
  },
];

export const initialCadres: MockCadreBenchmark[] = [
  {
    id: 'cadre-drstc',
    name: 'DRSTC Inductee',
    code: 'DRSTC',
    fullName: 'Direct Recruited Scientists Training Course (Scientist-B / C)',
    targetAudience: 'Newly inducted scientists into IMD, IITM, NCMRWF and MoES institutes',
    description: 'Rigorous 12-month residential foundation in core atmospheric dynamics, NWP modeling, HPC parallelization on Pratyush/Mihir, and satellite data assimilation.',
    duration: '12 Months (Comprehensive Induction)',
    requiredCompetencies: [
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', benchmarkLevel: 5, importance: 'CRITICAL' },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', code: 'MET-HPC', benchmarkLevel: 4, importance: 'CRITICAL' },
      { competencyId: 'comp-aiml', competencyName: 'AI/ML for Weather Forecasting & Extreme Event Prediction', code: 'MET-AIML', benchmarkLevel: 4, importance: 'HIGH' },
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', code: 'MET-SAT', benchmarkLevel: 4, importance: 'HIGH' },
      { competencyId: 'comp-radar', competencyName: 'Doppler Weather Radar (DWR) & Convective Nowcasting', code: 'MET-RADAR', benchmarkLevel: 3, importance: 'CORE' },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', code: 'MET-DSS', benchmarkLevel: 3, importance: 'CORE' },
    ],
  },
  {
    id: 'cadre-ftc',
    name: 'Forecaster Cadre',
    code: 'FTC',
    fullName: 'Forecasters Training Course (Operational Weather Forecasters)',
    targetAudience: 'Mid-career operational forecasters across Regional Met Centres (RMCs) and Cyclone Warning Centres',
    description: 'Advanced operational training specializing in extreme weather detection, Dual-Pol Doppler Radar nowcasting, tropical cyclone track forecasting, and color-coded alert dissemination.',
    duration: '6 Months (Operational Specialization)',
    requiredCompetencies: [
      { competencyId: 'comp-radar', competencyName: 'Doppler Weather Radar (DWR) & Convective Nowcasting', code: 'MET-RADAR', benchmarkLevel: 5, importance: 'CRITICAL' },
      { competencyId: 'comp-synop', competencyName: 'Synoptic Meteorology & Tropical Cyclone Dynamics', code: 'MET-SYNOP', benchmarkLevel: 5, importance: 'CRITICAL' },
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', code: 'MET-SAT', benchmarkLevel: 4, importance: 'HIGH' },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', code: 'MET-DSS', benchmarkLevel: 4, importance: 'HIGH' },
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', benchmarkLevel: 3, importance: 'CORE' },
      { competencyId: 'comp-aiml', competencyName: 'AI/ML for Weather Forecasting & Extreme Event Prediction', code: 'MET-AIML', benchmarkLevel: 3, importance: 'CORE' },
    ],
  },
  {
    id: 'cadre-imtc',
    name: 'Integrated Met Officer',
    code: 'IMTC',
    fullName: 'Integrated Meteorological Training Course (Foundational Officers & Observers)',
    targetAudience: 'Meteorological Assistants, Scientific Assistants, and Observers stationed at Surface/Upper-Air Observatories',
    description: 'Foundational training in atmospheric instrumentation, synoptic chart plotting, standard meteorological codes (METAR/SPECI/SYNOP), and weather observation quality control.',
    duration: '4 Months (Foundational)',
    requiredCompetencies: [
      { competencyId: 'comp-synop', competencyName: 'Synoptic Meteorology & Tropical Cyclone Dynamics', code: 'MET-SYNOP', benchmarkLevel: 4, importance: 'CRITICAL' },
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', code: 'MET-SAT', benchmarkLevel: 3, importance: 'HIGH' },
      { competencyId: 'comp-radar', competencyName: 'Doppler Weather Radar (DWR) & Convective Nowcasting', code: 'MET-RADAR', benchmarkLevel: 3, importance: 'HIGH' },
      { competencyId: 'comp-agro', competencyName: 'Agrometeorology, Hydromet & Flash Flood Warning', code: 'MET-AGRO', benchmarkLevel: 3, importance: 'CORE' },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', code: 'MET-DSS', benchmarkLevel: 2, importance: 'CORE' },
    ],
  },
  {
    id: 'cadre-modular',
    name: 'Modular Specialized Cadre',
    code: 'MODULAR',
    fullName: 'Modular Specialized In-Service Upskilling (Mission Mausam Focus)',
    targetAudience: 'In-service scientists, aviation meteorologists, and radar engineers requiring cutting-edge AI/HPC refreshers',
    description: 'Targeted short-duration advanced masterclasses in high-resolution convective modeling, physics-informed AI nowcasting, and Mission Mausam next-gen radar networks.',
    duration: '2 to 6 Weeks (Modular Intensive)',
    requiredCompetencies: [
      { competencyId: 'comp-aiml', competencyName: 'AI/ML for Weather Forecasting & Extreme Event Prediction', code: 'MET-AIML', benchmarkLevel: 5, importance: 'CRITICAL' },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', code: 'MET-HPC', benchmarkLevel: 4, importance: 'CRITICAL' },
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', benchmarkLevel: 4, importance: 'HIGH' },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', code: 'MET-DSS', benchmarkLevel: 4, importance: 'HIGH' },
    ],
  },
];

export const initialUsers: MockUser[] = [
  {
    id: 'user-admin-gov',
    email: 'admin@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe', // Password123!
    role: 'ADMIN',
    status: 'APPROVED',
    isVerified: true,
    designation: 'Director & Chief Administrative Lead',
    centre: 'Mausam Bhavan, Lodhi Road, New Delhi',
    profile: {
      fullName: 'Dr. Rajeshwari Sharma',
      headline: 'Chief Administrative Officer & Portal Director',
      bio: 'Overseeing institutional capacity building, faculty credentialing, and multi-cadre progression programs.',
      organization: 'India Meteorological Department (IMD)',
      department: 'Central Administration & Capacity Building Wing',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
      phone: '+91 11 2461 1000',
      location: 'Mausam Bhavan, Lodhi Road, New Delhi',
      qualifications: [
        { degree: 'Ph.D. in Public Administration', institution: 'JNU New Delhi', year: '2005', field: 'Administrative Governance' }
      ],
      experience: [
        { title: 'Chief Administrative Officer', company: 'IMD', startYear: '2020', endYear: 'Present', description: 'Institutional administration.' }
      ],
      certificates: []
    },
    competencies: [
      { competencyId: 'comp-synop', competencyName: 'Synoptic Meteorology & Tropical Cyclone Dynamics', code: 'MET-SYNOP', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', code: 'MET-DSS', proficiencyLevel: 5, verified: true }
    ]
  },
  {
    id: 'user-trainer-lead',
    email: 'trainer@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINER',
    status: 'APPROVED',
    isVerified: true,
    designation: 'Principal Faculty Lead • NWP & Modeling Division',
    centre: 'IMD Central Training Division, Pune',
    profile: {
      fullName: 'Senior Faculty Lead',
      headline: 'Principal Meteorological Instructor • Training Division',
      bio: 'Lead instructor conducting DRSTC and FTC specialized curricula in atmospheric modeling and operational forecasting.',
      organization: 'IMD Central Training Institute',
      department: 'Faculty of Meteorological Sciences',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      phone: '+91 20 2553 5000',
      location: 'Pune, Maharashtra',
      qualifications: [
        { degree: 'Ph.D. in Atmospheric Physics', institution: 'IISc Bangalore', year: '2010', field: 'Atmospheric Physics' }
      ],
      experience: [
        { title: 'Chief Instructor', company: 'IMD Training Institute', startYear: '2017', endYear: 'Present', description: 'Faculty lead.' }
      ],
      certificates: []
    },
    competencies: [
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', code: 'MET-HPC', proficiencyLevel: 5, verified: true }
    ]
  },
  {
    id: 'user-trainer-vikram',
    email: 'vikram.trainer@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINER',
    status: 'APPROVED',
    isVerified: true,
    designation: 'Principal Scientist & Chief Faculty (NWP & HPC Dynamics)',
    centre: 'Meteorological Training Institute (MTI) / IITM Pune',
    profile: {
      fullName: 'Prof. Vikramaditya Sen',
      headline: 'Senior Faculty & Chief Atmospheric Modeller • IMD Training Institute, Pune',
      bio: 'Over 18 years mentoring DRSTC & FTC batches in high-resolution global numerical weather prediction, parallel atmospheric dynamics on Pratyush HPC, and boundary-layer physics.',
      organization: 'India Meteorological Department / IITM',
      department: 'Central Training Division & NWP Core',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      phone: '+91 20 2553 5200',
      location: 'Pune, Maharashtra',
      qualifications: [
        { degree: 'Ph.D. in Climate Dynamics & Parallel Computing', institution: 'IISc Bangalore', year: '2008', field: 'Numerical Modeling' }
      ],
      experience: [
        { title: 'Chief Faculty (NWP & HPC)', company: 'IMD Central Training Institute, Pune', startYear: '2016', endYear: 'Present', description: 'Directing DRSTC induction modules.' }
      ],
      certificates: []
    },
    competencies: [
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', code: 'MET-HPC', proficiencyLevel: 5, verified: true }
    ]
  },
  {
    id: 'user-trainee-default',
    email: 'trainee@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINEE',
    status: 'APPROVED',
    isVerified: true,
    cadreTrack: 'DRSTC',
    designation: 'Meteorological Officer Trainee (DRSTC Batch)',
    centre: 'Induction Training Division, IMD New Delhi',
    profile: {
      fullName: 'Meteorological Officer Trainee',
      headline: 'Scientist-B Inductee • DRSTC Foundation Batch',
      bio: 'Cadre inductee developing foundational competencies in synoptic weather forecasting, radar analytics, and numerical modeling.',
      organization: 'India Meteorological Department (IMD)',
      department: 'Induction Training Division',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
      phone: '+91 11 2461 2000',
      location: 'New Delhi, India',
      qualifications: [
        { degree: 'M.Tech in Atmospheric Science', institution: 'IIT Delhi', year: '2024', field: 'Meteorology' }
      ],
      experience: [],
      certificates: []
    },
    competencies: [
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', proficiencyLevel: 3, verified: true },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', code: 'MET-HPC', proficiencyLevel: 3, verified: true }
    ]
  },
  {
    id: 'user-trainee-aarav',
    email: 'aarav.trainee@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINEE',
    status: 'APPROVED',
    isVerified: true,
    cadreTrack: 'DRSTC',
    designation: 'Scientist-B (DRSTC 2026 Batch Inductee)',
    centre: 'Numerical Weather Prediction Division, IMD HQ, New Delhi',
    profile: {
      fullName: 'Aarav Patel',
      headline: 'Scientist-B • Numerical Weather Prediction & Earth-System Modelling Inductee',
      bio: 'Directly recruited scientist enrolled in the DRSTC 2026 induction track. Focusing on high-resolution atmospheric modelling, high-performance computing, and AI data assimilation for Mission Mausam.',
      organization: 'India Meteorological Department (IMD)',
      department: 'Numerical Weather Prediction Division',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
      phone: '+91 98765 43210',
      location: 'New Delhi, India',
      qualifications: [
        { degree: 'M.Tech in Atmospheric Science & Computing', institution: 'IIT Delhi', year: '2024', field: 'Atmospheric Physics' }
      ],
      experience: [],
      certificates: []
    },
    competencies: [
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', proficiencyLevel: 3, verified: true },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', code: 'MET-HPC', proficiencyLevel: 3, verified: true }
    ]
  },
  {
    id: 'user-trainee-priya',
    email: 'priya.sharma@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINEE',
    status: 'APPROVED',
    isVerified: true,
    cadreTrack: 'DRSTC',
    designation: 'Scientist-B • Satellite Met Division',
    centre: 'IMD Mausam Bhavan, New Delhi',
    profile: {
      fullName: 'Priya Sharma',
      headline: 'Scientist-B • Satellite Meteorology & Remote Sensing Inductee',
      bio: 'Enrolled in DRSTC satellite meteorology track, specializing in INSAT-3DS sounder data processing and radiative transfer.',
      organization: 'India Meteorological Department (IMD)',
      department: 'Satellite Meteorology Division',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
      phone: '+91 98765 11223',
      location: 'New Delhi, India',
      qualifications: [],
      experience: [],
      certificates: []
    },
    competencies: [
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', code: 'MET-SAT', proficiencyLevel: 3, verified: true }
    ]
  },
  {
    id: 'user-admin-1',
    email: 'dg.imd@moes.gov.in',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe', // Password123!
    role: 'ADMIN',
    status: 'APPROVED',
    isVerified: true,
    designation: 'Director General of Meteorology & Mission Mausam National Director',
    centre: 'IMD Headquarters, Mausam Bhavan, New Delhi',
    profile: {
      fullName: 'Dr. Mrutyunjay Mohapatra',
      headline: 'Director General of Meteorology • National Head, Mission Mausam',
      bio: 'Leading the national modernization of meteorological services, next-generation Doppler radar deployment, Earth-system modelling on sovereign HPC, and specialized capacity development across MoES.',
      organization: 'India Meteorological Department (IMD)',
      department: 'Ministry of Earth Sciences (MoES)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
      phone: '+91 11 2461 1068',
      location: 'Mausam Bhavan, Lodhi Road, New Delhi',
      qualifications: [
        { degree: 'Ph.D. in Atmospheric Physics & Cyclone Dynamics', institution: 'IIT Delhi', year: '1998', field: 'Tropical Meteorology' },
        { degree: 'M.Sc. in Physics', institution: 'Utkal University', year: '1988', field: 'Atmospheric Physics' }
      ],
      experience: [
        { title: 'Director General', company: 'India Meteorological Department', startYear: '2019', endYear: 'Present', description: 'Spearheading Mission Mausam capacity and infrastructure.' },
        { title: 'Head, Cyclone Warning Division', company: 'IMD New Delhi', startYear: '2008', endYear: '2019', description: 'Early warning precision lead for severe weather.' }
      ],
      certificates: [
        { title: 'WMO Executive Fellow & Lead Expert on Tropical Cyclones', issuer: 'World Meteorological Organization (Geneva)', issueDate: '2021', credentialUrl: 'https://wmo.int/verify/imd-exec' }
      ]
    },
    competencies: [
      { competencyId: 'comp-synop', competencyName: 'Synoptic Meteorology & Tropical Cyclone Dynamics', code: 'MET-SYNOP', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', code: 'MET-DSS', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', proficiencyLevel: 5, verified: true }
    ]
  },
  {
    id: 'user-trainer-1',
    email: 'vikram.sen@imd.gov.in',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINER',
    status: 'APPROVED',
    isVerified: true,
    designation: 'Principal Scientist & Chief Faculty (NWP & HPC Dynamics)',
    centre: 'Meteorological Training Institute (MTI) / IITM Pune',
    profile: {
      fullName: 'Prof. Vikramaditya Sen',
      headline: 'Senior Faculty & Chief Atmospheric Modeller • IMD Training Institute, Pune',
      bio: 'Over 18 years mentoring DRSTC & FTC batches in high-resolution global numerical weather prediction, parallel atmospheric dynamics on Pratyush HPC, and boundary-layer physics.',
      organization: 'India Meteorological Department / IITM',
      department: 'Central Training Division & NWP Core',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      phone: '+91 20 2553 5200',
      location: 'Pune, Maharashtra',
      qualifications: [
        { degree: 'Ph.D. in Climate Dynamics & Parallel Computing', institution: 'IISc Bangalore', year: '2008', field: 'Numerical Modeling' },
        { degree: 'M.Tech in Atmospheric Science', institution: 'IIT Kharagpur', year: '2004', field: 'Atmospheric Physics' }
      ],
      experience: [
        { title: 'Chief Faculty (NWP & HPC)', company: 'IMD Central Training Institute, Pune', startYear: '2016', endYear: 'Present', description: 'Directing DRSTC induction modules.' },
        { title: 'Senior Research Scientist', company: 'NCMRWF Noida', startYear: '2008', endYear: '2016', description: 'Unified Model assimilation on Pratyush.' }
      ],
      certificates: [
        { title: 'Certified Master Trainer in Earth-System Grid Modelling', issuer: 'WMO Regional Training Center', issueDate: '2022', credentialUrl: 'https://wmo.int/rtc/imd' },
        { title: 'High-Performance GPU Computing for Geosciences', issuer: 'NVIDIA Deep Learning Institute', issueDate: '2023', credentialUrl: 'https://nvidia.com/dli/cert/geo' }
      ]
    },
    competencies: [
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', code: 'MET-HPC', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-aiml', competencyName: 'AI/ML for Weather Forecasting & Extreme Event Prediction', code: 'MET-AIML', proficiencyLevel: 4, verified: true },
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', code: 'MET-SAT', proficiencyLevel: 4, verified: true }
    ]
  },
  {
    id: 'user-trainer-2',
    email: 'ananya.roy@moes.gov.in',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINER',
    status: 'APPROVED',
    isVerified: true,
    designation: 'Lead AI Scientist & Satellite Remote Sensing Specialist',
    centre: 'MoES Center for AI/ML in Climate Sciences & IMD Satellite Met Division',
    profile: {
      fullName: 'Dr. Ananya Roy',
      headline: 'Lead AI/ML Scientist • Center for Atmospheric Deep Learning & INSAT Analytics',
      bio: 'Pioneering physics-informed neural networks (PINNs) and Graph Neural Networks for ultra-fast convective storm nowcasting and INSAT-3DR multi-channel data assimilation.',
      organization: 'Ministry of Earth Sciences (MoES) / IMD',
      department: 'Satellite Meteorology & AI Division',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
      phone: '+91 11 2462 8900',
      location: 'New Delhi, India',
      qualifications: [
        { degree: 'Ph.D. in Deep Learning in Geosciences', institution: 'IIT Delhi', year: '2016', field: 'AI in Remote Sensing' }
      ],
      experience: [
        { title: 'Lead AI Scientist', company: 'MoES AI Unit', startYear: '2019', endYear: 'Present', description: 'Deploying neural nowcasting engines.' }
      ],
      certificates: [
        { title: 'Advanced Geospatial Deep Learning Specialist', issuer: 'ISRO / IIRS Dehradun', issueDate: '2023', credentialUrl: 'https://iirs.gov.in/cert/ai' }
      ]
    },
    competencies: [
      { competencyId: 'comp-aiml', competencyName: 'AI/ML for Weather Forecasting & Extreme Event Prediction', code: 'MET-AIML', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', code: 'MET-SAT', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', code: 'MET-DSS', proficiencyLevel: 4, verified: true }
    ]
  },
  {
    id: 'user-trainer-3',
    email: 'rameshwar.radar@imd.gov.in',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINER',
    status: 'APPROVED',
    isVerified: true,
    designation: 'Senior Radar Meteorologist & Cyclone Warning Specialist',
    centre: 'Cyclone Warning Centre (CWC) & DWR Network, Visakhapatnam / Chennai',
    profile: {
      fullName: 'Dr. Rameshwar Rao',
      headline: 'Chief Doppler Radar Specialist • DWR Operations & Cyclone Warning Division',
      bio: 'Expert in Dual-Polarimetric Doppler Radar calibration, hydrometeor classification, severe squall line detection, and Bay of Bengal tropical cyclone landfall nowcasting.',
      organization: 'India Meteorological Department (IMD)',
      department: 'Radar Meteorology & Cyclone Warning Wing',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
      phone: '+91 44 2827 1234',
      location: 'Chennai, Tamil Nadu',
      qualifications: [
        { degree: 'Ph.D. in Radar Remote Sensing', institution: 'Andhra University', year: '2010', field: 'Radar Meteorology' }
      ],
      experience: [
        { title: 'Chief Radar Officer', company: 'IMD Coastal DWR Network', startYear: '2015', endYear: 'Present', description: 'Supervising 14 coastal Doppler installations.' }
      ],
      certificates: [
        { title: 'Dual-Polarization Radar Interpretation Master', issuer: 'WMO Radar Group', issueDate: '2022', credentialUrl: 'https://wmo.int/radar-cert' }
      ]
    },
    competencies: [
      { competencyId: 'comp-radar', competencyName: 'Doppler Weather Radar (DWR) & Convective Nowcasting', code: 'MET-RADAR', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-synop', competencyName: 'Synoptic Meteorology & Tropical Cyclone Dynamics', code: 'MET-SYNOP', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', code: 'MET-DSS', proficiencyLevel: 4, verified: true }
    ]
  },
  {
    id: 'user-trainee-1',
    email: 'aarav.patel@imd.gov.in',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINEE',
    status: 'APPROVED',
    isVerified: true,
    cadreTrack: 'DRSTC',
    designation: 'Scientist-B (DRSTC 2026 Batch Inductee)',
    centre: 'Numerical Weather Prediction Division, IMD HQ, New Delhi',
    profile: {
      fullName: 'Aarav Patel',
      headline: 'Scientist-B • Numerical Weather Prediction & Earth-System Modelling Inductee',
      bio: 'Directly recruited scientist enrolled in the DRSTC 2026 induction track. Focusing on high-resolution atmospheric modelling, high-performance computing, and AI data assimilation for Mission Mausam.',
      organization: 'India Meteorological Department (IMD)',
      department: 'Numerical Weather Prediction Division',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
      phone: '+91 98765 43210',
      location: 'New Delhi, India',
      qualifications: [
        { degree: 'M.Tech in Atmospheric Science & Computing', institution: 'IIT Delhi', year: '2024', field: 'Atmospheric Physics' },
        { degree: 'B.Tech in Computer Science & Engineering', institution: 'NIT Surat', year: '2022', field: 'High Performance Computing' }
      ],
      experience: [
        { title: 'Scientist-B (Trainee)', company: 'India Meteorological Department', startYear: '2025', endYear: 'Present', description: 'Assisting in ensemble NWP post-processing.' }
      ],
      certificates: [
        { title: 'Foundational Meteorological Observer Certificate', issuer: 'IMD Central Training Division', issueDate: '2025', credentialUrl: 'https://imd.gov.in/cert/obs-102' }
      ]
    },
    // Aarav's verified skills: Has good HPC & foundational NWP, but deficient in Radar & AI nowcasting for DRSTC benchmark!
    competencies: [
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', proficiencyLevel: 3, verified: true },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', code: 'MET-HPC', proficiencyLevel: 3, verified: true },
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', code: 'MET-SAT', proficiencyLevel: 2, verified: true },
      { competencyId: 'comp-radar', competencyName: 'Doppler Weather Radar (DWR) & Convective Nowcasting', code: 'MET-RADAR', proficiencyLevel: 1, verified: true },
      { competencyId: 'comp-aiml', competencyName: 'AI/ML for Weather Forecasting & Extreme Event Prediction', code: 'MET-AIML', proficiencyLevel: 2, verified: true },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', code: 'MET-DSS', proficiencyLevel: 1, verified: true }
    ]
  },
  {
    id: 'user-trainee-2',
    email: 'sneha.forecaster@imd.gov.in',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINEE',
    status: 'APPROVED',
    isVerified: true,
    cadreTrack: 'FTC',
    designation: 'Meteorologist Grade-I (Forecasters Training Course)',
    centre: 'Cyclone Warning Centre (CWC), RMC Chennai',
    profile: {
      fullName: 'Sneha Kulkarni',
      headline: 'Operational Forecaster • Cyclone Warning & Severe Weather Division',
      bio: 'Enrolled in the FTC track to master Doppler Radar polarimetric signatures and Bay of Bengal tropical storm track estimation.',
      organization: 'India Meteorological Department (IMD)',
      department: 'Regional Meteorological Centre, Chennai',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
      phone: '+91 94440 12345',
      location: 'Chennai, Tamil Nadu',
      qualifications: [
        { degree: 'M.Sc. in Meteorology', institution: 'Andhra University', year: '2021', field: 'Tropical Weather' }
      ],
      experience: [
        { title: 'Assistant Forecaster', company: 'RMC Chennai', startYear: '2022', endYear: 'Present', description: 'Real-time severe weather bulletins.' }
      ],
      certificates: []
    },
    competencies: [
      { competencyId: 'comp-synop', competencyName: 'Synoptic Meteorology & Tropical Cyclone Dynamics', code: 'MET-SYNOP', proficiencyLevel: 4, verified: true },
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', code: 'MET-SAT', proficiencyLevel: 3, verified: true },
      { competencyId: 'comp-radar', competencyName: 'Doppler Weather Radar (DWR) & Convective Nowcasting', code: 'MET-RADAR', proficiencyLevel: 2, verified: true },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', code: 'MET-DSS', proficiencyLevel: 2, verified: true }
    ]
  },
  {
    id: 'user-trainee-pending',
    email: 'kavita.drstc@imd.gov.in',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINEE',
    status: 'PENDING',
    isVerified: false,
    cadreTrack: 'DRSTC',
    designation: 'Scientist-B (Direct Recruit Candidate)',
    centre: 'Indian Institute of Tropical Meteorology (IITM) Pune',
    profile: {
      fullName: 'Dr. Kavita Deshmukh',
      headline: 'Incoming Scientist-B • Earth-System Cloud Physics Inductee',
      bio: 'Selected through UPSC Geoscientist/MoES scientist examination. Awaiting onboarding authorization into the DRSTC 2026 cohort.',
      organization: 'IITM Pune / MoES',
      department: 'Cloud & Aerosol Dynamics Group',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
      phone: '+91 98230 77889',
      location: 'Pune, Maharashtra',
      qualifications: [
        { degree: 'Ph.D. in Cloud Microphysics', institution: 'IIT Bombay', year: '2024', field: 'Aerosol Dynamics' }
      ],
      experience: [
        { title: 'Postdoctoral Fellow', company: 'IIT Bombay', startYear: '2024', endYear: 'Present', description: 'Microphysical parametrization.' }
      ],
      certificates: []
    },
    competencies: [
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', code: 'MET-NWP', proficiencyLevel: 3, verified: false },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', code: 'MET-HPC', proficiencyLevel: 2, verified: false }
    ]
  }
];

export const initialCourses: MockCourse[] = [
  {
    id: 'course-drstc-nwp',
    title: 'DRSTC: Earth-System Modelling & HPC Parallel Architectures on Pratyush',
    code: 'IMD-DRSTC-101',
    slug: 'drstc-earth-system-modelling-hpc-pratyush',
    description: 'Direct Recruited Scientists Training Course (DRSTC) flagship module: Master non-hydrostatic atmospheric grid dynamics, numerical time-stepping (CFL criteria), MPI/OpenMP domain decomposition on sovereign supercomputers (Pratyush / Mihir), and GFS/NCUM ensemble assimilation.',
    category: 'Atmospheric Physics & Modeling',
    cadreTrack: 'DRSTC',
    level: 'Advanced Inductee',
    durationHours: 24.0,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    trainerId: 'user-trainer-1',
    trainerName: 'Prof. Vikramaditya Sen',
    trainerRating: 4.92,
    trainerSpecialization: 'Principal Modeller & HPC Faculty • MTI Pune',
    competencies: [
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', requiredProficiency: 5, weight: 1.8 },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', requiredProficiency: 4, weight: 1.4 },
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', requiredProficiency: 3, weight: 0.9 },
    ],
    materials: [
      {
        id: 'mat-nwp-1',
        title: 'Module 1: What Are Numerical Weather Prediction (NWP) Models & Governing Equations',
        description: 'Comprehensive breakdown of primitive hydrostatic equations, baroclinic instability, and finite difference grid staggerings (Arakawa A-E).',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=XVNdacklXCk',
        durationSeconds: 1680,
        fileSize: '165 MB',
        sortOrder: 1,
        isPreview: true,
      },
      {
        id: 'mat-nwp-2',
        title: 'High-Performance Parallel MPI Grid Decomposition Guide (Technical PDF)',
        description: 'Technical handbook detailing 2D spatial domain splitting, boundary halo exchanges, and NetCDF4 parallel I/O on national supercomputers (Pratyush / Mihir).',
        type: 'PDF',
        url: '/materials/nwp-mpi-grid-decomposition-guide.pdf',
        downloadUrl: '/materials/nwp-mpi-grid-decomposition-guide.pdf',
        fileSize: '6.5 KB',
        sortOrder: 2,
        isPreview: false,
      },
      {
        id: 'mat-nwp-3',
        title: 'Module 2: Atmospheric Supercomputing & High-Performance Modelling on Pratyush',
        description: 'Mathematical formulation of cost function minimization, background error covariance matrices, and radiance bias correction on supercomputers.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=SsJmhSHPe40',
        durationSeconds: 1940,
        fileSize: '210 MB',
        sortOrder: 3,
        isPreview: false,
      },
      {
        id: 'mat-nwp-4',
        title: 'Mission Mausam HPC Optimization Manual & Unified Model Tuning (PDF)',
        description: 'Standard operating benchmarks for WRF and Unified Model compilation on indigenous compute partitions.',
        type: 'PDF',
        url: '/materials/mission-mausam-hpc-optimization-manual.pdf',
        downloadUrl: '/materials/mission-mausam-hpc-optimization-manual.pdf',
        fileSize: '4.3 KB',
        sortOrder: 4,
        isPreview: false,
      }
    ],
    assessmentId: 'assess-drstc-nwp',
  },
  {
    id: 'course-ftc-radar',
    title: 'FTC: Dual-Polarization Doppler Weather Radar & Cyclone Nowcasting',
    code: 'IMD-FTC-201',
    slug: 'ftc-dual-pol-doppler-weather-radar-cyclone-nowcasting',
    description: 'Forecasters Training Course (FTC) Core Module: Master S-band and C-band Dual-Polarimetric Doppler Radar interpretation, differential reflectivity ZDR, specific differential phase KDP, velocity de-aliasing, and automated severe convective storm tracking for RMC forecasters.',
    category: 'Observational Radar & Satellite',
    cadreTrack: 'FTC',
    level: 'Advanced Operational',
    durationHours: 18.5,
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    trainerId: 'user-trainer-3',
    trainerName: 'Dr. Rameshwar Rao',
    trainerRating: 4.88,
    trainerSpecialization: 'Chief Radar Officer • Cyclone Warning Division',
    competencies: [
      { competencyId: 'comp-radar', competencyName: 'Doppler Weather Radar (DWR) & Convective Nowcasting', requiredProficiency: 5, weight: 2.0 },
      { competencyId: 'comp-synop', competencyName: 'Synoptic Meteorology & Tropical Cyclone Dynamics', requiredProficiency: 4, weight: 1.3 },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', requiredProficiency: 4, weight: 1.0 },
    ],
    materials: [
      {
        id: 'mat-radar-1',
        title: 'Module 1: Dual-Polarization Doppler Weather Radar & Storm Nowcasting',
        description: 'Dissecting ZDR columns, correlation coefficient (CC) drops for hail detection, Doppler velocity de-aliasing, and convective storm tracking.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=NZ7rNeQck2A',
        durationSeconds: 1520,
        fileSize: '140 MB',
        sortOrder: 1,
        isPreview: true,
      },
      {
        id: 'mat-radar-2',
        title: 'IMD Doppler Weather Radar Operation & Dual-Polarization Guide (PDF)',
        description: 'Practical handbook on S-band/C-band hydrometeor classification (ZDR, KDP, CC), Nyquist de-aliasing, and severe storm tracking.',
        type: 'PDF',
        url: '/materials/imd-doppler-radar-handbook.pdf',
        downloadUrl: '/materials/imd-doppler-radar-handbook.pdf',
        fileSize: '4.9 KB',
        sortOrder: 2,
        isPreview: false,
      },
      {
        id: 'mat-radar-3',
        title: 'Module 2: Dual-Pol Products in 5 Minutes — Reflectivity, Velocity & Correlation Coefficient',
        description: 'Rapid visual primer on reading classic reflectivity, green-red velocity couplets, and CC debris signatures for tornado confirmation.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=419AVaS-PNs',
        durationSeconds: 300,
        fileSize: '48 MB',
        sortOrder: 3,
        isPreview: true,
      }
    ],
    assessmentId: 'assess-ftc-radar',
  },
  {
    id: 'course-modular-ai',
    title: 'Modular: Physics-Informed AI/ML for Convective Precipitation Nowcasting',
    code: 'IMD-MOD-401',
    slug: 'modular-physics-informed-ai-ml-precipitation-nowcasting',
    description: 'Mission Mausam In-Service Masterclass: Harness deep learning architectures (ConvLSTM, GraphCast, UNet) integrated with physical mass-conservation constraints to generate sub-kilometer 0-6 hour high-resolution precipitation nowcasts.',
    category: 'Computational & HPC',
    cadreTrack: 'MODULAR',
    level: 'Specialized Advanced',
    durationHours: 14.0,
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    trainerId: 'user-trainer-2',
    trainerName: 'Dr. Ananya Roy',
    trainerRating: 4.95,
    trainerSpecialization: 'Lead AI Scientist • MoES Center for AI',
    competencies: [
      { competencyId: 'comp-aiml', competencyName: 'AI/ML for Weather Forecasting & Extreme Event Prediction', requiredProficiency: 5, weight: 1.8 },
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', requiredProficiency: 4, weight: 1.2 },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', requiredProficiency: 3, weight: 0.8 },
    ],
    materials: [
      {
        id: 'mat-ai-1',
        title: 'Module 1: The AI Weather Forecasting Revolution & Neural Nowcasting',
        description: 'Constraining deep neural networks (GraphCast, ConvLSTM, UNet) with Navier-Stokes continuity equations and moisture advection.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=JUsFvifyZeM',
        durationSeconds: 1350,
        fileSize: '128 MB',
        sortOrder: 1,
        isPreview: true,
      },
      {
        id: 'mat-ai-2',
        title: 'Atmospheric AI Model Benchmark & Verification Metric Handbook (PDF)',
        description: 'Critical analysis of Critical Success Index (CSI), Fractions Skill Score (FSS), and equitable threat scores.',
        type: 'PDF',
        url: '/materials/atmospheric-ai-benchmark-handbook.pdf',
        downloadUrl: '/materials/atmospheric-ai-benchmark-handbook.pdf',
        fileSize: '5.0 KB',
        sortOrder: 2,
        isPreview: false,
      },
      {
        id: 'mat-ai-3',
        title: 'Module 2: Neural Network Foundations — Neurons, Layers & Learning (3Blue1Brown)',
        description: 'Visual intuition for how deep networks represent functions — the mathematical substrate beneath ConvLSTM, UNet, and GraphCast nowcasting models.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=aircAruvnKk',
        durationSeconds: 1140,
        fileSize: '132 MB',
        sortOrder: 3,
        isPreview: true,
      }
    ],
    assessmentId: 'assess-modular-ai',
  },
  {
    id: 'course-imtc-synop',
    title: 'IMTC: Integrated Synoptic Meteorology & INSAT-3DS Remote Sensing',
    code: 'IMD-IMTC-301',
    slug: 'imtc-integrated-synoptic-meteorology-insat-remote-sensing',
    description: 'Foundational certification for Meteorological Officers and Observers: Master synoptic weather charting, cloud classification, thermal infrared water vapor interpretation, and standard WMO METAR code generation.',
    category: 'Atmospheric Physics & Modeling',
    cadreTrack: 'IMTC',
    level: 'Foundational Inductee',
    durationHours: 16.0,
    thumbnail: 'https://images.unsplash.com/photo-1590552515252-3a5a1bce7bed?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    trainerId: 'user-trainer-1',
    trainerName: 'Prof. Vikramaditya Sen',
    trainerRating: 4.92,
    trainerSpecialization: 'Principal Modeller & HPC Faculty • MTI Pune',
    competencies: [
      { competencyId: 'comp-synop', competencyName: 'Synoptic Meteorology & Tropical Cyclone Dynamics', requiredProficiency: 4, weight: 1.6 },
      { competencyId: 'comp-sat', competencyName: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics', requiredProficiency: 3, weight: 1.2 },
      { competencyId: 'comp-agro', competencyName: 'Agrometeorology, Hydromet & Flash Flood Warning', requiredProficiency: 3, weight: 1.0 },
    ],
    materials: [
      {
        id: 'mat-imtc-1',
        title: 'Module 1: How Meteorological Satellites & Synoptic Systems Work',
        description: 'Plotting isobars, pressure tendency symbols, frontal boundaries, and interpreting INSAT-3DS thermal infrared water vapor channels.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=olmwTIVo5ss',
        durationSeconds: 1450,
        fileSize: '150 MB',
        sortOrder: 1,
        isPreview: true,
      },
      {
        id: 'mat-imtc-2',
        title: 'Synoptic Meteorology Chart Analysis & INSAT-3DS Interpretation Guide (PDF)',
        description: 'Comprehensive field guide on surface observations, isobar plotting, frontal dynamics, water vapor channels, and WMO METAR coding.',
        type: 'PDF',
        url: '/materials/synoptic-weather-chart-handbook.pdf',
        downloadUrl: '/materials/synoptic-weather-chart-handbook.pdf',
        fileSize: '4.6 KB',
        sortOrder: 2,
        isPreview: false,
      },
      {
        id: 'mat-imtc-3',
        title: 'Module 2: Read Weather Radar Like a Meteorologist — Reflectivity vs Velocity',
        description: 'Field-style walkthrough of live reflectivity and velocity products: rotation couplets, tornado debris signatures, and beam-height limitations.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=vIH7y3oxz68',
        durationSeconds: 2400,
        fileSize: '185 MB',
        sortOrder: 3,
        isPreview: false,
      }
    ],
    assessmentId: 'assess-imtc-synop',
  },
  {
    id: 'course-ftc-cyclone',
    title: 'FTC: Tropical Cyclone Dynamics, Storm Surge & Coastal Early Warning',
    code: 'IMD-FTC-202',
    slug: 'ftc-tropical-cyclone-dynamics-storm-surge-coastal-warning',
    description: 'Forecasters Training Course (FTC) advanced module: Cyclogenesis over the Bay of Bengal & Arabian Sea, eye-wall replacement cycles, Dvorak intensity analysis, storm-surge modelling, and IMD cyclone warning protocols from depression to super cyclonic storm.',
    category: 'Observational Radar & Satellite',
    cadreTrack: 'FTC',
    level: 'Advanced Operational',
    durationHours: 20.0,
    thumbnail: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    trainerId: 'user-trainer-3',
    trainerName: 'Dr. Rameshwar Rao',
    trainerRating: 4.88,
    trainerSpecialization: 'Chief Radar Officer • Cyclone Warning Division',
    competencies: [
      { competencyId: 'comp-synop', competencyName: 'Synoptic Meteorology & Tropical Cyclone Dynamics', requiredProficiency: 5, weight: 1.8 },
      { competencyId: 'comp-radar', competencyName: 'Doppler Weather Radar (DWR) & Convective Nowcasting', requiredProficiency: 4, weight: 1.3 },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', requiredProficiency: 4, weight: 1.0 },
    ],
    materials: [
      {
        id: 'mat-cyc-1',
        title: 'Module 1: Tropical Cyclone Anatomy — Eye, Eye-Wall & Spiral Bands (Biparjoy Case Study)',
        description: 'Complete genesis-to-landfall story: Coriolis spin-up, warm-core intensification, eye formation, and why moisture cut-off kills storms at the coast.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=W2UDbDXXYGE',
        durationSeconds: 1800,
        fileSize: '168 MB',
        sortOrder: 1,
        isPreview: true,
      },
      {
        id: 'mat-cyc-2',
        title: 'Module 2: Cyclone Naming, Classification & Tauktae-Yaas Post-Storm Analysis',
        description: 'IMD intensity grades from depression to super cyclonic storm, basin naming protocols, and lessons from recent Arabian Sea and Bay of Bengal landfalls.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=pg_LtOh4jk4',
        durationSeconds: 1200,
        fileSize: '115 MB',
        sortOrder: 2,
        isPreview: false,
      },
      {
        id: 'mat-cyc-3',
        title: 'IMD Doppler Weather Radar Operation & Dual-Polarization Guide (Companion PDF)',
        description: 'Shared handbook: eye-wall velocity couplet tracking, Nyquist de-aliasing, and severe storm interrogation for cyclone warning centres.',
        type: 'PDF',
        url: '/materials/imd-doppler-radar-handbook.pdf',
        downloadUrl: '/materials/imd-doppler-radar-handbook.pdf',
        fileSize: '4.9 KB',
        sortOrder: 3,
        isPreview: false,
      }
    ],
    assessmentId: 'assess-ftc-cyclone',
  },
  {
    id: 'course-imtc-monsoon',
    title: 'IMTC: Monsoon Dynamics, Agrometeorology & Flash-Flood Early Warning',
    code: 'IMD-IMTC-302',
    slug: 'imtc-monsoon-agrometeorology-flash-flood-warning',
    description: 'Intermediate certification for Met Officers and Agromet observers: Southwest monsoon onset mechanics, orographic rainfall, crop-weather advisories, and flash-flood guidance using INSAT rapid-scan and surface networks.',
    category: 'Applied Meteorology & DSS',
    cadreTrack: 'IMTC',
    level: 'Foundational',
    durationHours: 15.0,
    thumbnail: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    trainerId: 'user-trainer-1',
    trainerName: 'Prof. Vikramaditya Sen',
    trainerRating: 4.92,
    trainerSpecialization: 'Principal Modeller & HPC Faculty • MTI Pune',
    competencies: [
      { competencyId: 'comp-agro', competencyName: 'Agrometeorology, Hydromet & Flash Flood Warning', requiredProficiency: 4, weight: 1.6 },
      { competencyId: 'comp-synop', competencyName: 'Synoptic Meteorology & Tropical Cyclone Dynamics', requiredProficiency: 3, weight: 1.2 },
      { competencyId: 'comp-dss', competencyName: 'Early Warning & Multi-Hazard Decision Support Systems', requiredProficiency: 3, weight: 1.0 },
    ],
    materials: [
      {
        id: 'mat-mon-1',
        title: 'Module 1: Why the Monsoon Enters Through Kerala — Onset Science & IMD Criteria',
        description: 'Arabian Sea vs Bay of Bengal branches, orographic lift over the Western Ghats, El Niño linkages, and the official monsoon declaration checklist.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=5x1rPf5julk',
        durationSeconds: 1500,
        fileSize: '142 MB',
        sortOrder: 1,
        isPreview: true,
      },
      {
        id: 'mat-mon-2',
        title: 'Module 2: Geostationary Sentinels — How INSAT-Class Satellites Watch the Monsoon',
        description: 'Why a 22,000-mile-high parking orbit enables minute-scale rapid scans, motion-vector derivation, and continuous severe-weather nowcasting.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=kMcUDLIHLA4',
        durationSeconds: 60,
        fileSize: '12 MB',
        sortOrder: 2,
        isPreview: true,
      },
      {
        id: 'mat-mon-3',
        title: 'Synoptic Meteorology Chart Analysis & INSAT-3DS Interpretation Guide (Companion PDF)',
        description: 'Shared field guide: isobar plotting, frontal boundaries, water-vapor channels, and WMO METAR coding for agromet stations.',
        type: 'PDF',
        url: '/materials/synoptic-weather-chart-handbook.pdf',
        downloadUrl: '/materials/synoptic-weather-chart-handbook.pdf',
        fileSize: '4.6 KB',
        sortOrder: 3,
        isPreview: false,
      }
    ],
    assessmentId: 'assess-imtc-monsoon',
  },
  {
    id: 'course-drstc-dynamics',
    title: 'DRSTC: Non-Hydrostatic Dynamics, Navier-Stokes & Ensemble Prediction Systems',
    code: 'IMD-DRSTC-102',
    slug: 'drstc-nonhydrostatic-dynamics-navier-stokes-ensemble',
    description: 'Direct Recruited Scientists Training Course (DRSTC) theory core: Navier-Stokes foundations, quasi-geostrophic filtering, Arakawa staggering trade-offs, ensemble perturbation design (MOGREPS-style), and the observation-to-forecast logistics chain.',
    category: 'Atmospheric Physics & Modeling',
    cadreTrack: 'DRSTC',
    level: 'Advanced Inductee',
    durationHours: 22.0,
    thumbnail: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    trainerId: 'user-trainer-1',
    trainerName: 'Prof. Vikramaditya Sen',
    trainerRating: 4.92,
    trainerSpecialization: 'Principal Modeller & HPC Faculty • MTI Pune',
    competencies: [
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', requiredProficiency: 5, weight: 1.8 },
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', requiredProficiency: 3, weight: 1.0 },
      { competencyId: 'comp-aiml', competencyName: 'AI/ML for Weather Forecasting & Extreme Event Prediction', requiredProficiency: 3, weight: 0.8 },
    ],
    materials: [
      {
        id: 'mat-dyn-1',
        title: 'Module 1: The Navier-Stokes Equations — The Governing Law of All Weather Models',
        description: 'Rigorous yet visual tour of momentum conservation in fluids — the equation every dynamical core, from WRF to the Unified Model, discretizes.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=ERBVFcutl3M',
        durationSeconds: 1200,
        fileSize: '118 MB',
        sortOrder: 1,
        isPreview: true,
      },
      {
        id: 'mat-dyn-2',
        title: 'Module 2: The Incredible Logistics Behind Every Forecast — Observations to Supercomputer',
        description: 'Radiosondes, radar networks, data assimilation pipelines, and why modern forecasts are a triumph of coordinated global infrastructure.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=V0Xx0E8cs7U',
        durationSeconds: 1200,
        fileSize: '121 MB',
        sortOrder: 2,
        isPreview: false,
      },
      {
        id: 'mat-dyn-3',
        title: 'High-Performance Parallel MPI Grid Decomposition Guide (Companion PDF)',
        description: 'Shared technical handbook: 2D domain splitting, halo exchanges, and parallel I/O underpinning high-resolution ensemble runs.',
        type: 'PDF',
        url: '/materials/nwp-mpi-grid-decomposition-guide.pdf',
        downloadUrl: '/materials/nwp-mpi-grid-decomposition-guide.pdf',
        fileSize: '6.5 KB',
        sortOrder: 3,
        isPreview: false,
      }
    ],
    assessmentId: 'assess-drstc-dynamics',
  },
  {
    id: 'course-mod-hpcai',
    title: 'Modular: GPU Supercomputing & AI Inference at Scale for Operational NWP',
    code: 'IMD-MOD-402',
    slug: 'modular-gpu-supercomputing-ai-inference-nwp',
    description: 'Mission Mausam In-Service Masterclass: From Pratyush CPU partitions to H100 GPU inference — running GraphCast-class models in minutes, HPC-as-a-service for hurricane ensembles, and LLM-assisted forecast generation as demonstrated by NOAA and the UK Met Office.',
    category: 'Computational & HPC',
    cadreTrack: 'MODULAR',
    level: 'Specialized Advanced',
    durationHours: 12.0,
    thumbnail: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    trainerId: 'user-trainer-2',
    trainerName: 'Dr. Ananya Roy',
    trainerRating: 4.95,
    trainerSpecialization: 'Lead AI Scientist • MoES Center for AI',
    competencies: [
      { competencyId: 'comp-hpc', competencyName: 'High-Performance Computing & Atmospheric Grid Parallelism', requiredProficiency: 5, weight: 1.8 },
      { competencyId: 'comp-aiml', competencyName: 'AI/ML for Weather Forecasting & Extreme Event Prediction', requiredProficiency: 4, weight: 1.3 },
      { competencyId: 'comp-nwp', competencyName: 'Numerical Weather Prediction & Earth-System Modelling', requiredProficiency: 3, weight: 0.9 },
    ],
    materials: [
      {
        id: 'mat-hpc-1',
        title: 'Module 1: From 25,000 CPU Cores to a Few GPUs — NOAA\'s HPC-to-AI Transition',
        description: 'How GraphCast-class inference collapsed a 1.5-hour 25k-core hurricane forecast to 7 minutes on a handful of H100s — and what it means for Pratyush workloads.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=zmWCkoi-Qlg',
        durationSeconds: 2700,
        fileSize: '240 MB',
        sortOrder: 1,
        isPreview: true,
      },
      {
        id: 'mat-hpc-2',
        title: 'Module 2: Met Office Case Study — LLMs Writing Operational Shipping Forecasts',
        description: 'Turning 45 GB of model grids into strictly-formatted forecaster text with Nova-class LLMs: architecture, evaluation by word-F1, and production lessons.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=VLjzP9n63mA',
        durationSeconds: 1800,
        fileSize: '165 MB',
        sortOrder: 2,
        isPreview: false,
      },
      {
        id: 'mat-hpc-3',
        title: 'Mission Mausam HPC Optimization Manual & Unified Model Tuning (Companion PDF)',
        description: 'Shared benchmarks for compiling WRF and Unified Model configurations on indigenous compute partitions, including GPU offload flags.',
        type: 'PDF',
        url: '/materials/mission-mausam-hpc-optimization-manual.pdf',
        downloadUrl: '/materials/mission-mausam-hpc-optimization-manual.pdf',
        fileSize: '4.3 KB',
        sortOrder: 3,
        isPreview: false,
      }
    ],
    assessmentId: 'assess-mod-hpcai',
  }
];

export const initialAssessments: MockAssessment[] = [
  {
    id: 'assess-drstc-nwp',
    courseId: 'course-drstc-nwp',
    title: 'DRSTC: Earth-System Modelling & HPC Certification Exam',
    description: 'Comprehensive timed evaluation testing mastery over non-hydrostatic governing equations, CFL numerical stability criteria, 4D-Var radiance assimilation, and domain parallelization.',
    timeLimitMinutes: 25,
    passingScorePercentage: 70.0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q_nwp_1',
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
        id: 'q_nwp_2',
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
        explanation: 'In spectral models (e.g. GFS/NCUM), converting between grid point space and spectral harmonic space requires global MPI_Alltoall transposes, which become the dominant latency at massive core counts.',
        sortOrder: 2,
      },
      {
        id: 'q_nwp_3',
        questionText: 'In 4D-Var Data Assimilation for meteorological models, what distinguishes 4D-Var from 3D-Var assimilation?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: '4D-Var uses a linear regression without covariance matrices' },
          { id: 'opt_2', text: '4D-Var incorporates the dynamic forecast model (tangent linear & adjoint model) within a finite time assimilation window to compare observations at their exact valid timestamps' },
          { id: 'opt_3', text: '4D-Var ignores satellite radiance observations' },
          { id: 'opt_4', text: '4D-Var only updates surface pressure variables' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: '4D-Var utilizes the forward tangent linear model and its adjoint to propagate information forward and backward in time within the assimilation window, producing dynamically consistent initial states.',
        sortOrder: 3,
      },
      {
        id: 'q_nwp_4',
        questionText: 'Which Arakawa spatial grid staggering separates the velocity components (u on east/west cell faces, v on north/south cell faces) while keeping mass/pressure (p, T) at cell centers to prevent unphysical checkerboard decoupling in gravity waves?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Arakawa A-grid (Collocated)' },
          { id: 'opt_2', text: 'Arakawa C-grid (Staggered)' },
          { id: 'opt_3', text: 'Arakawa E-grid (Diagonal)' },
          { id: 'opt_4', text: 'Arakawa B-grid' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'The Arakawa C-grid staggers normal velocity components on cell edges with scalar pressure at centers, providing optimal wave dispersion for high-resolution non-hydrostatic models like WRF.',
        sortOrder: 4,
      }
    ]
  },
  {
    id: 'assess-ftc-radar',
    courseId: 'course-ftc-radar',
    title: 'FTC: Dual-Polarimetric Doppler Radar & Cyclone Exam',
    description: 'Operational forecaster examination covering radar Doppler dilemma, velocity aliasing, differential reflectivity ZDR signatures, and tropical cyclone eye tracking.',
    timeLimitMinutes: 20,
    passingScorePercentage: 70.0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q_rad_1',
        questionText: 'In Doppler Weather Radar operations, what is the mathematical consequence of increasing the Pulse Repetition Frequency (PRF) to raise the Maximum Unambiguous Velocity (V_max)?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Maximum Unambiguous Range (R_max) decreases proportionally (Doppler Dilemma: R_max * V_max = c * λ / 8)' },
          { id: 'opt_2', text: 'Radar antenna rotation speed must be doubled' },
          { id: 'opt_3', text: 'Beam width narrows by 50%' },
          { id: 'opt_4', text: 'Differential reflectivity ZDR becomes zero' },
        ],
        correctOption: 'opt_1',
        weight: 2.5,
        explanation: 'The fundamental Doppler Dilemma links range and velocity: higher PRF prevents velocity aliasing but reduces maximum unambiguous range before second-trip echoes appear.',
        sortOrder: 1,
      },
      {
        id: 'q_rad_2',
        questionText: 'When observing a severe convective thunderstorm with a Dual-Polarimetric Doppler Radar, a region of high reflectivity (Z > 55 dBZ) accompanied by near-zero or negative Differential Reflectivity (ZDR ≈ -0.5 to 0.5 dB) and low Correlation Coefficient (CC < 0.90) indicates which hydrometeor?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Large oblate liquid raindrops' },
          { id: 'opt_2', text: 'Tumbling, irregularly-shaped Hail or Graupel' },
          { id: 'opt_3', text: 'Light stratiform drizzle' },
          { id: 'opt_4', text: 'Dry snow aggregates' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'Large raindrops flatten into oblate spheroids giving high ZDR (+2 to +4 dB). Tumbling hail appears isotropic on average (ZDR near 0) with high reflectivity and low CC due to mixed-phase scatterers.',
        sortOrder: 2,
      }
    ]
  },
  {
    id: 'assess-modular-ai',
    courseId: 'course-modular-ai',
    title: 'Modular: AI/ML Extreme Weather Nowcasting Exam',
    description: 'Physics-informed neural networks, convective nowcasting architectures, and metric verification evaluation.',
    timeLimitMinutes: 20,
    passingScorePercentage: 70.0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q_ai_1',
        questionText: 'Why are standard Mean Squared Error (MSE) loss functions suboptimal when training deep neural networks for extreme convective precipitation nowcasting?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'MSE penalizes high-frequency sharp gradients and produces blurry, over-smoothed ensemble averages that underestimate intense localized rainfall peaks.' },
          { id: 'opt_2', text: 'MSE cannot be optimized with gradient descent.' },
          { id: 'opt_3', text: 'MSE requires 64-bit precision on GPUs.' },
          { id: 'opt_4', text: 'MSE is mathematically incompatible with satellite infrared bands.' },
        ],
        correctOption: 'opt_1',
        weight: 2.5,
        explanation: 'MSE minimization tends to predict the conditional mean of the distribution, smoothing out extreme localized convective cells. Loss functions incorporating Critical Success Index (CSI), focal loss, or GAN discriminators preserve sharp storm structures.',
        sortOrder: 1,
      }
    ]
  },
  {
    id: 'assess-imtc-synop',
    courseId: 'course-imtc-synop',
    title: 'IMTC: Synoptic Meteorology & INSAT Certification Exam',
    description: 'Foundational synoptic chart analysis, isobaric patterns, and INSAT-3DS cloud interpretation.',
    timeLimitMinutes: 20,
    passingScorePercentage: 70.0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q_imtc_1',
        questionText: 'In a Northern Hemisphere synoptic weather chart, in which direction does the wind blow around a low-pressure cyclonic vortex in accordance with Buys Ballot’s Law and Coriolis force?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Counter-Clockwise (Cyclonic)' },
          { id: 'opt_2', text: 'Clockwise (Anticyclonic)' },
          { id: 'opt_3', text: 'Directly radially outward from the center' },
          { id: 'opt_4', text: 'Parallel to latitude lines only' },
        ],
        correctOption: 'opt_1',
        weight: 2.5,
        explanation: 'In the Northern Hemisphere, Coriolis force deflects moving air to the right, causing cyclonic flow around low-pressure systems to turn counter-clockwise.',
        sortOrder: 1,
      }
    ]
  },
  {
    id: 'assess-ftc-cyclone',
    courseId: 'course-ftc-cyclone',
    title: 'FTC: Tropical Cyclone Dynamics & Coastal Warning Exam',
    description: 'Cyclogenesis, eye-wall dynamics, Dvorak intensity grades, and IMD landfall warning protocols for Bay of Bengal and Arabian Sea systems.',
    timeLimitMinutes: 20,
    passingScorePercentage: 70.0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q_cyc_1',
        questionText: 'A tropical cyclone approaching the Indian coast runs on warm ocean moisture. What happens to its intensity shortly after landfall, and why?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'It weakens because the moisture supply from the ocean is cut off and surface friction disrupts the vortex' },
          { id: 'opt_2', text: 'It intensifies because land friction adds rotational energy' },
          { id: 'opt_3', text: 'It remains unchanged until the eye collapses from Coriolis loss' },
          { id: 'opt_4', text: 'It reverses direction due to the land-sea thermal contrast' },
        ],
        correctOption: 'opt_1',
        weight: 2.5,
        explanation: 'Tropical cyclones are heat engines fuelled by oceanic latent heat flux; landfall removes the energy source while friction spins down the vortex.',
        sortOrder: 1,
      },
      {
        id: 'q_cyc_2',
        questionText: 'In the Northern Hemisphere, surface winds spiral into a tropical cyclone in which sense, and which force is primarily responsible for the deflection?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Clockwise, driven by centrifugal force' },
          { id: 'opt_2', text: 'Counter-clockwise, driven by the Coriolis force deflecting inflow to the right' },
          { id: 'opt_3', text: 'Radially inward with no deflection, driven only by the pressure gradient' },
          { id: 'opt_4', text: 'Counter-clockwise, driven by magnetic declination' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'Coriolis deflection (right in the Northern Hemisphere) turns pressure-gradient inflow into the characteristic counter-clockwise spiral.',
        sortOrder: 2,
      }
    ]
  },
  {
    id: 'assess-imtc-monsoon',
    courseId: 'course-imtc-monsoon',
    title: 'IMTC: Monsoon & Agromet Early Warning Exam',
    description: 'Southwest monsoon onset mechanics, orographic rainfall, geostationary monitoring advantages, and agromet advisory basics.',
    timeLimitMinutes: 20,
    passingScorePercentage: 70.0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q_mon_1',
        questionText: 'Why does the southwest monsoon reliably produce its first heavy Indian rainfall over Kerala rather than further north?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Kerala is closest to the equator and receives vertical solar rays first' },
          { id: 'opt_2', text: 'Moisture-laden cross-equatorial flow first meets the Western Ghats, forcing orographic ascent and condensation' },
          { id: 'opt_3', text: 'The Bay of Bengal branch is blocked by Sri Lanka until July' },
          { id: 'opt_4', text: 'Coriolis force is zero over Kerala, allowing direct rainfall' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'The Arabian Sea branch strikes the Western Ghats escarpment first; forced orographic lifting condenses the moist flow into Kerala onset showers.',
        sortOrder: 1,
      },
      {
        id: 'q_mon_2',
        questionText: 'What is the principal operational advantage of a geostationary satellite (e.g. INSAT-3DS) over a polar orbiter for severe-weather nowcasting?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Higher spatial resolution than any polar instrument' },
          { id: 'opt_2', text: 'Continuous fixed-disc staring with minute-scale rapid scans, enabling cloud-motion tracking' },
          { id: 'opt_3', text: 'Immunity from solar eclipses during the monsoon season' },
          { id: 'opt_4', text: 'Direct measurement of surface pressure at every pixel' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'Geostationary orbit syncs with Earth rotation, so the sensor stares at the same disc continuously — rapid-scan imagery reveals storm motion in near real time.',
        sortOrder: 2,
      }
    ]
  },
  {
    id: 'assess-drstc-dynamics',
    courseId: 'course-drstc-dynamics',
    title: 'DRSTC: Non-Hydrostatic Dynamics & Ensemble Systems Exam',
    description: 'Navier-Stokes foundations, CFL stability, forecast logistics chain, and ensemble perturbation rationale for scientist inductees.',
    timeLimitMinutes: 25,
    passingScorePercentage: 70.0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q_dyn_1',
        questionText: 'The Navier-Stokes equations underpin every NWP dynamical core. Which conservation law does the momentum equation primarily express?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Conservation of mass in a compressible fluid' },
          { id: 'opt_2', text: 'Newton’s second law (F = ma) applied to a fluid parcel, balancing pressure-gradient, Coriolis, gravity, and friction forces' },
          { id: 'opt_3', text: 'Conservation of entropy along isentropic surfaces' },
          { id: 'opt_4', text: 'Conservation of angular momentum of the Earth system' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'Navier-Stokes is Newton’s second law per unit mass of fluid; NWP models discretize exactly these acceleration balances on the model grid.',
        sortOrder: 1,
      },
      {
        id: 'q_dyn_2',
        questionText: 'Why do operational centres run ensembles of forecasts from slightly perturbed initial conditions instead of one deterministic run?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'To keep all supercomputer cores equally busy for accounting purposes' },
          { id: 'opt_2', text: 'Because the atmosphere is chaotic: tiny initial errors grow, and the ensemble spread quantifies forecast uncertainty and probabilities' },
          { id: 'opt_3', text: 'Because deterministic models cannot run on modern GPUs' },
          { id: 'opt_4', text: 'To satisfy WMO requirements for map colour diversity' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'Chaotic error growth means a single trajectory is overconfident; ensembles sample the distribution of plausible evolutions for probabilistic guidance.',
        sortOrder: 2,
      },
      {
        id: 'q_dyn_3',
        questionText: 'In an explicit advection scheme, the Courant number C = u·Δt/Δx exceeds the stability limit. What is the correct remediation?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Increase the time step to outrun the instability' },
          { id: 'opt_2', text: 'Reduce the time step (or coarsen resolution) so information cannot cross more than one grid cell per step' },
          { id: 'opt_3', text: 'Switch the map projection to polar stereographic' },
          { id: 'opt_4', text: 'Add more ensemble members' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'The CFL condition requires the numerical domain of dependence to contain the physical one; violating it amplifies errors catastrophically.',
        sortOrder: 3,
      }
    ]
  },
  {
    id: 'assess-mod-hpcai',
    courseId: 'course-mod-hpcai',
    title: 'Modular: GPU Supercomputing & AI Inference Exam',
    description: 'HPC-to-AI transition economics, GPU inference speedups for GraphCast-class models, and LLM-assisted operational forecasting.',
    timeLimitMinutes: 20,
    passingScorePercentage: 70.0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q_hpc_1',
        questionText: 'NOAA demonstrated a GraphCast-class hurricane forecast dropping from 1.5 hours on 25,000 CPU cores to ~7 minutes on a few GPUs. What does this imply for centres like IMD with Pratyush-class systems?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Physics-based models are obsolete and must be decommissioned immediately' },
          { id: 'opt_2', text: 'Trained AI emulators can deliver rapid ensemble guidance at a fraction of the compute, complementing physics models for time-critical warnings' },
          { id: 'opt_3', text: 'GPUs are only useful for graphics rendering, not forecasting' },
          { id: 'opt_4', text: 'Forecast skill is determined solely by core count' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'Once trained, neural emulators infer in minutes on accelerators — ideal for rapid-update severe-weather guidance alongside conventional NWP.',
        sortOrder: 1,
      },
      {
        id: 'q_hpc_2',
        questionText: 'The UK Met Office prototype generated Shipping Forecasts from 45 GB of model grids with an LLM in under five minutes. What was the key architectural trick?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Feeding raw binary grids directly as image pixels to the LLM' },
          { id: 'opt_2', text: 'A text-intermediary layer: extracting regional statistics first, then letting the LLM compose strictly-formatted prose from them' },
          { id: 'opt_3', text: 'Training the LLM exclusively on 19th-century weather diaries' },
          { id: 'opt_4', text: 'Disabling all evaluation so any output counts as correct' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'Distilling grids into regional statistics gives the LLM a compact, factual grounding, avoiding hallucinated numbers while keeping format control.',
        sortOrder: 2,
      }
    ]
  }
];

export const initialEnrollments: MockEnrollment[] = [
  {
    id: 'enroll-drstc-1',
    userId: 'user-trainee-1',
    courseId: 'course-drstc-nwp',
    status: 'ACTIVE',
    progressPercentage: 50.0,
    completedMaterialIds: ['mat-nwp-1', 'mat-nwp-2'],
    currentMaterialId: 'mat-nwp-3',
    enrolledAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    completedAt: null,
    certificateId: null,
    certificateUrl: null,
  }
];

export const initialFeedbacks: MockFeedback[] = [
  {
    id: 'fb-1',
    courseId: 'course-drstc-nwp',
    userId: 'user-trainee-1',
    userName: 'Aarav Patel (Scientist-B, DRSTC)',
    userRole: 'DRSTC 2026 Inductee',
    rating: 5,
    comment: 'Exceptional depth on governing primitive equations, Arakawa staggering, and Pratyush HPC domain decomposition. The hands-on MPI benchmarks are directly relevant to our operational NWP runs at Mausam Bhavan.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fb-2',
    courseId: 'course-ftc-radar',
    userId: 'user-trainee-2',
    userName: 'Sneha Kulkarni (Forecaster, FTC)',
    userRole: 'Cyclone Warning Centre Forecaster',
    rating: 5,
    comment: 'The polarimetric hydrometeor classification and Doppler Nyquist velocity de-aliasing labs have made our real-time coastal radar nowcasting significantly faster and more accurate.',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  }
];

export const initialAnnouncements: MockAnnouncement[] = [
  {
    id: 'ann-1',
    title: '🛰️ Mission Mausam National Rollout: Next-Gen Observation & Capacity Framework',
    content: 'Ministry of Earth Sciences announces the comprehensive capacity building guidelines for Mission Mausam. All DRSTC, FTC, and IMTC cadre pathways are now synced with national supercomputing (Pratyush/Mihir) and Dual-Pol Doppler Radar networks.',
    type: 'SPOTLIGHT' as const,
    isPinned: true,
    authorName: 'Dr. Mrutyunjay Mohapatra (Director General of Meteorology)',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ann-2',
    title: '⚡ HPC Compute Maintenance: Pratyush GPU Cluster Partition Upgrade',
    content: 'Atmospheric numerical simulation partitions will undergo scheduled CUDA 12.6 driver upgrades this Friday from 01:00 AM to 04:00 AM IST. Offline model run checkpoints will resume automatically.',
    type: 'ALERT' as const,
    isPinned: false,
    authorName: 'Dr. Mrutyunjay Mohapatra (Director General of Meteorology)',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ann-3',
    title: '🏆 IMD Capacity Milestone: 100% Forecaster Radar Accreditation Achieved',
    content: 'Capacity Connect has successfully certified over 1,450 operational forecasters across all 28 state meteorological centres in Dual-Polarization Doppler Radar nowcasting ahead of the monsoon season.',
    type: 'ACHIEVEMENT' as const,
    isPinned: true,
    authorName: 'Central Training Division, IMD Pune',
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  }
];
