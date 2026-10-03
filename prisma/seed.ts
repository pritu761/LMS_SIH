import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

// ============================================================================
// CapacityConnect — Full Seed (Phase 1–3)
// IMD / Mission Mausam: tracks, modules, lessons, stations, cohorts,
// question bank, certificates, audit log, notifications, radar cases, RAG docs.
// Fully idempotent: safe to re-run (upserts + find-first guards).
// ============================================================================

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
  cadre?: string;
  employeeCode?: string;
  stationCode?: string;
  rating?: number;
  cohortsDelivered?: number;
  specialization?: string;
  availability?: 'AVAILABLE' | 'ON_LEAVE' | 'UNAVAILABLE';
}

async function seedUserWithProfile(userData: SeedUserData) {
  const station = userData.stationCode
    ? await prisma.station.findUnique({ where: { code: userData.stationCode } })
    : null;

  const user = await prisma.user.upsert({
    where: { email: userData.email.toLowerCase() },
    update: {
      passwordHash: userData.passwordHash,
      role: userData.role,
      status: userData.status,
      isVerified: userData.isVerified,
      cadre: userData.cadre,
      employeeCode: userData.employeeCode,
      stationId: station ? station.id : undefined,
      rating: userData.rating,
      cohortsDelivered: userData.cohortsDelivered ?? 0,
      specialization: userData.specialization,
      availability: userData.availability ?? 'AVAILABLE',
    },
    create: {
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role,
      status: userData.status,
      isVerified: userData.isVerified,
      cadre: userData.cadre,
      employeeCode: userData.employeeCode,
      stationId: station ? station.id : undefined,
      rating: userData.rating,
      cohortsDelivered: userData.cohortsDelivered ?? 0,
      specialization: userData.specialization,
      availability: userData.availability ?? 'AVAILABLE',
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

async function ensureCompetencyScores(
  userId: string,
  scores: Array<{ domain: string; score: number; requiredScore: number }>
) {
  for (const s of scores) {
    await prisma.competencyScore.upsert({
      where: { userId_domain: { userId, domain: s.domain } },
      update: { score: s.score, requiredScore: s.requiredScore },
      create: { userId, domain: s.domain, score: s.score, requiredScore: s.requiredScore },
    });
  }
}

// ---------------------------------------------------------------------------
// 38 IMD radar stations (code, name, city, state, region, lat, lng, type)
// ---------------------------------------------------------------------------
const STATIONS: Array<{
  code: string;
  name: string;
  city: string;
  state: string;
  region: string;
  latitude: number;
  longitude: number;
  radarType: string;
  readinessPct: number;
  cadreCount: number;
  topGapDomain: string;
}> = [
  { code: 'DEL', name: 'Delhi (Lodhi Road)', city: 'New Delhi', state: 'Delhi', region: 'NORTH', latitude: 28.589, longitude: 77.221, radarType: 'S-BAND', readinessPct: 88, cadreCount: 42, topGapDomain: 'RAD-NOWCAST' },
  { code: 'MUM', name: 'Mumbai (Colaba)', city: 'Mumbai', state: 'Maharashtra', region: 'WEST', latitude: 18.906, longitude: 72.814, radarType: 'S-BAND', readinessPct: 91, cadreCount: 38, topGapDomain: 'DISASTER-OPS' },
  { code: 'CHN', name: 'Chennai (Nungambakkam)', city: 'Chennai', state: 'Tamil Nadu', region: 'SOUTH', latitude: 13.061, longitude: 80.251, radarType: 'S-BAND', readinessPct: 84, cadreCount: 35, topGapDomain: 'NWP' },
  { code: 'KOL', name: 'Kolkata (Alipore)', city: 'Kolkata', state: 'West Bengal', region: 'EAST', latitude: 22.532, longitude: 88.33, radarType: 'S-BAND', readinessPct: 79, cadreCount: 33, topGapDomain: 'RAD-NOWCAST' },
  { code: 'HYD', name: 'Hyderabad (Begumpet)', city: 'Hyderabad', state: 'Telangana', region: 'SOUTH', latitude: 17.453, longitude: 78.462, radarType: 'C-BAND', readinessPct: 76, cadreCount: 28, topGapDomain: 'HPC' },
  { code: 'BLR', name: 'Bengaluru (HAL)', city: 'Bengaluru', state: 'Karnataka', region: 'SOUTH', latitude: 12.95, longitude: 77.668, radarType: 'C-BAND', readinessPct: 82, cadreCount: 26, topGapDomain: 'COMMS' },
  { code: 'TVM', name: 'Thiruvananthapuram', city: 'Thiruvananthapuram', state: 'Kerala', region: 'SOUTH', latitude: 8.483, longitude: 76.949, radarType: 'S-BAND', readinessPct: 86, cadreCount: 30, topGapDomain: 'SYNOPTIC' },
  { code: 'COK', name: 'Kochi (Naval Base)', city: 'Kochi', state: 'Kerala', region: 'SOUTH', latitude: 9.939, longitude: 76.274, radarType: 'X-BAND', readinessPct: 71, cadreCount: 22, topGapDomain: 'RAD-NOWCAST' },
  { code: 'AMD', name: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', region: 'WEST', latitude: 23.068, longitude: 72.626, radarType: 'S-BAND', readinessPct: 74, cadreCount: 24, topGapDomain: 'NWP' },
  { code: 'BPL', name: 'Bhopal (Bairagarh)', city: 'Bhopal', state: 'Madhya Pradesh', region: 'CENTRAL', latitude: 23.287, longitude: 77.337, radarType: 'S-BAND', readinessPct: 68, cadreCount: 21, topGapDomain: 'HPC' },
  { code: 'LKO', name: 'Lucknow (Amausi)', city: 'Lucknow', state: 'Uttar Pradesh', region: 'NORTH', latitude: 26.761, longitude: 80.889, radarType: 'S-BAND', readinessPct: 77, cadreCount: 27, topGapDomain: 'COMMS' },
  { code: 'PAT', name: 'Patna', city: 'Patna', state: 'Bihar', region: 'EAST', latitude: 25.594, longitude: 85.088, radarType: 'S-BAND', readinessPct: 63, cadreCount: 19, topGapDomain: 'DISASTER-OPS' },
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', region: 'EAST', latitude: 20.244, longitude: 85.817, radarType: 'S-BAND', readinessPct: 89, cadreCount: 31, topGapDomain: 'NWP' },
  { code: 'VSK', name: 'Visakhapatnam (Dolphin Nose)', city: 'Visakhapatnam', state: 'Andhra Pradesh', region: 'SOUTH', latitude: 17.681, longitude: 83.297, radarType: 'S-BAND', readinessPct: 85, cadreCount: 25, topGapDomain: 'RAD-NOWCAST' },
  { code: 'RNC', name: 'Ranchi (Hinoo)', city: 'Ranchi', state: 'Jharkhand', region: 'EAST', latitude: 23.316, longitude: 85.321, radarType: 'C-BAND', readinessPct: 58, cadreCount: 15, topGapDomain: 'HPC' },
  { code: 'RPR', name: 'Raipur (Mana)', city: 'Raipur', state: 'Chhattisgarh', region: 'CENTRAL', latitude: 21.197, longitude: 81.738, radarType: 'C-BAND', readinessPct: 61, cadreCount: 16, topGapDomain: 'SYNOPTIC' },
  { code: 'JAI', name: 'Jaipur (Sanganer)', city: 'Jaipur', state: 'Rajasthan', region: 'NORTH', latitude: 26.824, longitude: 75.812, radarType: 'S-BAND', readinessPct: 73, cadreCount: 23, topGapDomain: 'COMMS' },
  { code: 'NAG', name: 'Nagpur (Sonegaon)', city: 'Nagpur', state: 'Maharashtra', region: 'CENTRAL', latitude: 21.089, longitude: 79.057, radarType: 'S-BAND', readinessPct: 80, cadreCount: 24, topGapDomain: 'NWP' },
  { code: 'PUN', name: 'Pune (Shivajinagar)', city: 'Pune', state: 'Maharashtra', region: 'WEST', latitude: 18.531, longitude: 73.857, radarType: 'X-BAND', readinessPct: 87, cadreCount: 29, topGapDomain: 'DISASTER-OPS' },
  { code: 'GOA', name: 'Goa (Dabolim)', city: 'Vasco da Gama', state: 'Goa', region: 'WEST', latitude: 15.38, longitude: 73.831, radarType: 'X-BAND', readinessPct: 69, cadreCount: 14, topGapDomain: 'RAD-NOWCAST' },
  { code: 'GAU', name: 'Guwahati (Borjhar)', city: 'Guwahati', state: 'Assam', region: 'NE', latitude: 26.106, longitude: 91.585, radarType: 'S-BAND', readinessPct: 72, cadreCount: 20, topGapDomain: 'COMMS' },
  { code: 'SHL', name: 'Shillong (Umroi)', city: 'Shillong', state: 'Meghalaya', region: 'NE', latitude: 25.705, longitude: 91.978, radarType: 'C-BAND', readinessPct: 55, cadreCount: 12, topGapDomain: 'HPC' },
  { code: 'AGT', name: 'Agartala', city: 'Agartala', state: 'Tripura', region: 'NE', latitude: 23.886, longitude: 91.242, radarType: 'C-BAND', readinessPct: 52, cadreCount: 11, topGapDomain: 'SYNOPTIC' },
  { code: 'IMP', name: 'Imphal (Tulihal)', city: 'Imphal', state: 'Manipur', region: 'NE', latitude: 24.766, longitude: 93.897, radarType: 'C-BAND', readinessPct: 48, cadreCount: 10, topGapDomain: 'RAD-NOWCAST' },
  { code: 'ITA', name: 'Itanagar', city: 'Itanagar', state: 'Arunachal Pradesh', region: 'NE', latitude: 27.133, longitude: 93.605, radarType: 'X-BAND', readinessPct: 46, cadreCount: 9, topGapDomain: 'COMMS' },
  { code: 'KOH', name: 'Kohima', city: 'Kohima', state: 'Nagaland', region: 'NE', latitude: 25.658, longitude: 94.093, radarType: 'X-BAND', readinessPct: 44, cadreCount: 8, topGapDomain: 'DISASTER-OPS' },
  { code: 'AIZ', name: 'Aizawl (Lengpui)', city: 'Aizawl', state: 'Mizoram', region: 'NE', latitude: 23.838, longitude: 92.619, radarType: 'X-BAND', readinessPct: 51, cadreCount: 9, topGapDomain: 'NWP' },
  { code: 'GTK', name: 'Gangtok', city: 'Gangtok', state: 'Sikkim', region: 'NE', latitude: 27.325, longitude: 88.612, radarType: 'X-BAND', readinessPct: 57, cadreCount: 10, topGapDomain: 'SYNOPTIC' },
  { code: 'SXR', name: 'Srinagar', city: 'Srinagar', state: 'J&K', region: 'NORTH', latitude: 33.987, longitude: 74.774, radarType: 'S-BAND', readinessPct: 66, cadreCount: 18, topGapDomain: 'DISASTER-OPS' },
  { code: 'JMU', name: 'Jammu (Satwari)', city: 'Jammu', state: 'J&K', region: 'NORTH', latitude: 32.682, longitude: 74.837, radarType: 'C-BAND', readinessPct: 64, cadreCount: 16, topGapDomain: 'RAD-NOWCAST' },
  { code: 'LEH', name: 'Leh (Kushok Bakula)', city: 'Leh', state: 'Ladakh', region: 'NORTH', latitude: 33.985, longitude: 77.61, radarType: 'X-BAND', readinessPct: 59, cadreCount: 8, topGapDomain: 'COMMS' },
  { code: 'SML', name: 'Shimla (Jubbarhatti)', city: 'Shimla', state: 'Himachal Pradesh', region: 'NORTH', latitude: 31.081, longitude: 77.068, radarType: 'X-BAND', readinessPct: 62, cadreCount: 12, topGapDomain: 'SYNOPTIC' },
  { code: 'DDN', name: 'Dehradun (Jolly Grant)', city: 'Dehradun', state: 'Uttarakhand', region: 'NORTH', latitude: 30.189, longitude: 78.18, radarType: 'C-BAND', readinessPct: 70, cadreCount: 15, topGapDomain: 'NWP' },
  { code: 'CHD', name: 'Chandigarh', city: 'Chandigarh', state: 'Chandigarh', region: 'NORTH', latitude: 30.672, longitude: 76.788, radarType: 'S-BAND', readinessPct: 75, cadreCount: 17, topGapDomain: 'HPC' },
  { code: 'ASR', name: 'Amritsar (Rajasansi)', city: 'Amritsar', state: 'Punjab', region: 'NORTH', latitude: 31.71, longitude: 74.799, radarType: 'C-BAND', readinessPct: 67, cadreCount: 14, topGapDomain: 'COMMS' },
  { code: 'PBR', name: 'Port Blair (Veer Savarkar)', city: 'Sri Vijaya Puram', state: 'A&N Islands', region: 'EAST', latitude: 11.641, longitude: 92.726, radarType: 'S-BAND', readinessPct: 60, cadreCount: 11, topGapDomain: 'DISASTER-OPS' },
  { code: 'MIN', name: 'Minicoy', city: 'Minicoy', state: 'Lakshadweep', region: 'SOUTH', latitude: 8.31, longitude: 73.06, radarType: 'X-BAND', readinessPct: 54, cadreCount: 7, topGapDomain: 'COMMS' },
  { code: 'BHJ', name: 'Bhuj (Rudramata)', city: 'Bhuj', state: 'Gujarat', region: 'WEST', latitude: 23.287, longitude: 69.674, radarType: 'S-BAND', readinessPct: 78, cadreCount: 18, topGapDomain: 'RAD-NOWCAST' },
];

// ---------------------------------------------------------------------------
// Tracks → modules → lessons (public catalog content)
// ---------------------------------------------------------------------------
interface SeedLesson {
  code: string;
  title: string;
  content: string;
  contentType: 'MARKDOWN' | 'VIDEO' | 'PDF' | 'QUIZ' | 'MIXED';
  videoUrl?: string;
  isPreviewFree?: boolean;
  wmoTags?: string[];
  resources?: Array<{ id: string; name: string; url: string; kind: string; size?: string }>;
}
interface SeedModule {
  code: string;
  title: string;
  description: string;
  outcomes: string[];
  wmoTags: string[];
  level: 'FOUNDATION' | 'ADVANCED';
  durationHours: number;
  lessons: SeedLesson[];
}
interface SeedTrack {
  code: string;
  name: string;
  description: string;
  level: 'FOUNDATION' | 'ADVANCED';
  domains: string[];
  estimatedDurationHrs: number;
  certificationBadge: string;
  modules: SeedModule[];
}

const TRACKS: SeedTrack[] = [
  {
    code: 'IMTC',
    name: 'Integrated Meteorological Training Course',
    description:
      'Foundation induction for newly recruited IMD officers: synoptic analysis, observation systems, monsoon dynamics and public weather services aligned to WMO-No.1083 BIP-M competencies.',
    level: 'FOUNDATION',
    domains: ['SYNOPTIC', 'COMMS', 'DISASTER-OPS'],
    estimatedDurationHrs: 240,
    certificationBadge: 'IMTC Foundation Certified',
    modules: [
      {
        code: 'IMTC-M01',
        title: 'Synoptic Chart Analysis Fundamentals',
        description:
          'Surface and upper-air chart plotting, isobaric analysis, identification of pressure systems, fronts and troughs over the Indian region.',
        outcomes: [
          'Plot and analyse a surface synoptic chart as per IMD plotting model',
          'Identify highs, lows, troughs, ridges and discontinuities',
          'Interpret 850/700/500 hPa contour patterns over South Asia',
        ],
        wmoTags: ['WMO-1083-I.1', 'WMO-1205-I.2'],
        level: 'FOUNDATION',
        durationHours: 40,
        lessons: [
          {
            code: 'IMTC-M01-L01',
            title: 'The IMD Surface Plotting Model (Sample Lesson)',
            content:
              '# The IMD Surface Plotting Model\n\nEvery synoptic observation is plotted around the station circle using the IMD synoptic code convention.\n\n## What you will learn\n\n- Station circle, wind shaft and present-weather symbols\n- Pressure (PPP), tendency (pp) and isobaric interval rules\n- Common plotting errors and how reviewers flag them\n\n> Worked example: 0300 UTC Mumbai (Sahara-region easterly wave) — pressure 1004.2 hPa, falling 1.8 hPa/3h, wind 270/12 kt.\n\n**Checkpoint:** which tendency code corresponds to a 1.8 hPa fall? (Answer: plotted as falling, characteristic 6.)',
            contentType: 'MARKDOWN',
            isPreviewFree: true,
            wmoTags: ['WMO-1083-I.1'],
            resources: [
              { id: 'r1', name: 'IMD Synoptic Plotting Model Chart (PDF)', url: '/materials/imtc/synoptic-plotting-model.pdf', kind: 'PDF', size: '2.1 MB' },
            ],
          },
          {
            code: 'IMTC-M01-L02',
            title: 'Pressure Systems Lab: Highs, Lows and Troughs',
            content:
              '# Pressure Systems Lab\n\nAnalyse three archived 0300 UTC charts: a monsoon low over Odisha, a western disturbance over J&K, and a high over the Arabian Sea.\n\nFor each chart, mark the system centre, draw the outermost closed isobar, and annotate the associated weather.',
            contentType: 'MIXED',
            wmoTags: ['WMO-1083-I.1'],
          },
        ],
      },
      {
        code: 'IMTC-M02',
        title: 'Satellite & Radar Observation Basics',
        description:
          'INSAT-3DS channels, DWR product catalogue (Z/V/W), radar range equation intuition and coverage geometry of the IMD network.',
        outcomes: [
          'List INSAT-3DS imager and sounder channels and their uses',
          'Read a PPI reflectivity frame and identify ground clutter vs precipitation',
          'Explain 150/250/500 km coverage rings of an S-band DWR',
        ],
        wmoTags: ['WMO-1083-II.3'],
        level: 'FOUNDATION',
        durationHours: 36,
        lessons: [
          {
            code: 'IMTC-M02-L01',
            title: 'INSAT-3DS: Channels and What They See',
            content:
              '# INSAT-3DS Channels\n\n- **VIS (0.55–0.75 µm):** cloud cover by day, fog detection at dawn.\n- **WV (6.5–7.1 µm):** mid/upper tropospheric moisture, jet streaks.\n- **TIR1/TIR2 (10–12 µm):** cloud-top temperature → deep convection nowcasting.\n- **Sounder (18 IR channels):** temperature/moisture profiles for NWP assimilation.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1083-II.3'],
          },
          {
            code: 'IMTC-M02-L02',
            title: 'Reading Your First PPI: Z, Clutter and Anomalous Propagation',
            content:
              '# Reading a PPI\n\nReflectivity (Z) in dBZ maps hydrometeor size and concentration. Below 15 dBZ: drizzle or Bragg scatter. 35–50 dBZ: moderate–heavy rain. Above 55 dBZ: hail likely.\n\nGround clutter hugs the radar site and persists frame-to-frame; anomalous propagation arcs appear on calm, humid nights.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1083-II.3'],
          },
        ],
      },
      {
        code: 'IMTC-M03',
        title: 'Monsoon Systems of South Asia',
        description:
          'Southwest and northeast monsoon onset, low-pressure systems, monsoon trough oscillations and break/active cycle diagnostics.',
        outcomes: [
          'Describe onset criteria and advance of the southwest monsoon',
          'Track monsoon lows/depressions and their rainfall swaths',
          'Diagnose active vs break phases from OLR and wind anomalies',
        ],
        wmoTags: ['WMO-1205-II.1'],
        level: 'FOUNDATION',
        durationHours: 44,
        lessons: [
          {
            code: 'IMTC-M03-L01',
            title: 'Onset, Advance and Withdrawal',
            content:
              '# Monsoon Onset\n\nIMD declares onset over Kerala when 60% of 14 designated stations report ≥2.5 mm for two consecutive days, supported by westerly depth and OLR criteria. Advance is tracked via northern limit of monsoon (NLM) isochrones.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-II.1'],
          },
          {
            code: 'IMTC-M03-L02',
            title: 'Lows, Depressions and Their Rainfall Swaths',
            content:
              '# Monsoon LPS\n\nBay of Bengal lows contribute ~60% of central-India seasonal rain. The rainfall maximum sits in the southwest quadrant of the system; orography along the Western Ghats amplifies the coastal swath.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-II.1'],
          },
        ],
      },
      {
        code: 'IMTC-M04',
        title: 'Public Weather Services & Communication',
        description:
          'District forecasts, nowcast wording, colour-coded warnings and coordination with disaster management authorities and media.',
        outcomes: [
          'Draft a district-level forecast following IMD wording standards',
          'Issue colour-coded warnings with correct validity and action lines',
          'Brief the media and SDMA control rooms under time pressure',
        ],
        wmoTags: ['WMO-1083-V.2'],
        level: 'FOUNDATION',
        durationHours: 32,
        lessons: [
          {
            code: 'IMTC-M04-L01',
            title: 'Warning Wording That Saves Lives',
            content:
              '# Warning Wording\n\nWarnings carry four blocks: phenomenon, intensity with probability language, valid period, and suggested action. Avoid jargon — "squall with wind 60–70 kmph gusting to 80" beats "thunderstorm activity".',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1083-V.2'],
          },
          {
            code: 'IMTC-M04-L02',
            title: 'Mock Press Briefing (Video)',
            content:
              '# Mock Press Briefing\n\nWatch the archived briefing for Cyclone Michaung landfall and note how uncertainty cones, storm-surge guidance and fishermen advisories are sequenced.',
            contentType: 'VIDEO',
            videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
            wmoTags: ['WMO-1083-V.2'],
          },
        ],
      },
    ],
  },
  {
    code: 'FTC',
    name: 'Forecaster Training Course',
    description:
      'Operational forecaster track: mesoscale analysis, NWP product interpretation and severe-weather warning operations for RMC/MC duty officers.',
    level: 'FOUNDATION',
    domains: ['SYNOPTIC', 'NWP', 'DISASTER-OPS'],
    estimatedDurationHrs: 180,
    certificationBadge: 'IMD Certified Forecaster',
    modules: [
      {
        code: 'FTC-M01',
        title: 'Mesoscale Analysis & Nowcasting',
        description:
          'Surface meso-analysis, satellite/radar blending, thunderstorm indices (CAPE, shear, K-index) and 0–6 h nowcast issuance.',
        outcomes: [
          'Compute and interpret CAPE, CIN, shear and composite indices',
          'Blend satellite and radar for 0–3 h thunderstorm nowcasts',
          'Issue nowcasts in the IMD three-hourly format',
        ],
        wmoTags: ['WMO-1205-III.2'],
        level: 'FOUNDATION',
        durationHours: 48,
        lessons: [
          {
            code: 'FTC-M01-L01',
            title: 'Instability Indices in Practice (Sample Lesson)',
            content:
              '# Instability Indices\n\nCAPE > 2500 J/kg with 0–6 km shear > 20 m/s flags organised severe convection. Use K-index and Total-Totals for airmass storms, and DCAPE for downburst potential.\n\nWorked sounding: Delhi May pre-monsoon — CAPE 3100, shear 18 m/s → severe squall nowcast issued 2 h before the event.',
            contentType: 'MARKDOWN',
            isPreviewFree: true,
            wmoTags: ['WMO-1205-III.2'],
            resources: [
              { id: 'r1', name: 'Thunderstorm index ready-reckoner (PDF)', url: '/materials/ftc/instability-indices.pdf', kind: 'PDF', size: '1.4 MB' },
            ],
          },
          {
            code: 'FTC-M01-L02',
            title: 'Blending Satellite + Radar for 0–3 h Nowcasts',
            content:
              '# Blend Method\n\nExtrapolate radar cells with satellite-derived motion vectors; update every 15 minutes. Document the conceptual model (gust front, flanking line) in the nowcast remarks.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-III.2'],
          },
        ],
      },
      {
        code: 'FTC-M02',
        title: 'NWP Product Interpretation for Forecasters',
        description:
          'GFS/NCUM/ECMWF deterministic and ensemble outputs, model biases over India, and writing model-discussion bulletins.',
        outcomes: [
          'Compare deterministic vs ensemble guidance for a western disturbance',
          'Recognise systematic model biases (e.g. cold bias in 2 m temperature)',
          'Write a forecaster model-discussion note',
        ],
        wmoTags: ['WMO-1205-IV.1'],
        level: 'FOUNDATION',
        durationHours: 44,
        lessons: [
          {
            code: 'FTC-M02-L01',
            title: 'Deterministic vs Ensemble: Reading the Plumes',
            content:
              '# Ensemble Plumes\n\nSpaghetti plots show track spread; meteograms show parameter uncertainty at a station. A tight cluster with an outlier control run means: trust the cluster, mention the outlier scenario in the bulletin.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-IV.1'],
          },
          {
            code: 'FTC-M02-L02',
            title: 'Known Biases of Models Over India',
            content:
              '# Model Biases\n\nGlobal models underplay Western Ghats orographic rainfall and overdo light rain over the peninsula. High-resolution NCUM-Regional corrects placement but spins up too much intense convection in pre-monsoon months.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-IV.1'],
          },
        ],
      },
      {
        code: 'FTC-M03',
        title: 'Severe Weather Warning Operations',
        description:
          'Cyclone, heavy-rainfall and heatwave warning chains; coordination drills with NDRF/SDMA; post-event verification scores (POD/FAR).',
        outcomes: [
          'Run the cyclone warning chain from TC advisory to district alert',
          'Compute POD, FAR and CSI for a warning episode',
          'Coordinate a mock drill with control-room scripts',
        ],
        wmoTags: ['WMO-1205-V.1'],
        level: 'FOUNDATION',
        durationHours: 40,
        lessons: [
          {
            code: 'FTC-M03-L01',
            title: 'The Cyclone Warning Chain',
            content:
              '# Warning Chain\n\nRSMC New Delhi TC advisory → ACWC/CWC bulletins → state MC/RMC district warnings → SDMA/NDRF action. Each hop has a mandated latency; log every handoff with timestamps.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-V.1'],
          },
          {
            code: 'FTC-M03-L02',
            title: 'Verifying Warnings: POD, FAR, CSI',
            content:
              '# Verification\n\nContingency table of hits, misses and false alarms gives POD = H/(H+M), FAR = F/(H+F). A good severe-weather season targets POD > 0.8 with FAR < 0.35.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-V.1'],
          },
        ],
      },
    ],
  },
  {
    code: 'DRSTC',
    name: 'Direct Recruited Scientists Training Course',
    description:
      'Advanced induction for Scientist-B direct recruits: earth-system modelling, data assimilation, dual-pol radar science and AI for extreme-event prediction on Pratyush/Mihir HPC.',
    level: 'ADVANCED',
    domains: ['NWP', 'HPC', 'RAD-NOWCAST', 'SYNOPTIC'],
    estimatedDurationHrs: 320,
    certificationBadge: 'DRSTC Scientist Certified',
    modules: [
      {
        code: 'DRSTC-M01',
        title: 'Earth-System Modelling & HPC Parallel Architectures',
        description:
          'Non-hydrostatic dynamics, CFL stability, MPI/OpenMP domain decomposition and parallel NetCDF I/O on sovereign supercomputers.',
        outcomes: [
          'Derive the CFL constraint for explicit advection schemes',
          'Explain 2D domain decomposition with halo exchanges',
          'Diagnose MPI_Alltoall bottlenecks in spectral transforms',
        ],
        wmoTags: ['WMO-1205-IV.2'],
        level: 'ADVANCED',
        durationHours: 64,
        lessons: [
          {
            code: 'DRSTC-M01-L01',
            title: 'Governing Equations to Grid Code (Sample Lesson)',
            content:
              '# From Equations to Grids\n\nPrimitive equations are discretised on Arakawa C-grids with staggered winds. Explicit time-stepping is stable only when the Courant number C = u·Δt/Δx ≤ C_max (≈1).\n\nHalve Δx for resolution → halve Δt too, so cost grows ~8× in 3D. That is why exascale parallelism, not clock speed, carries NWP forward.',
            contentType: 'MARKDOWN',
            isPreviewFree: true,
            wmoTags: ['WMO-1205-IV.2'],
            resources: [
              { id: 'r1', name: 'MPI grid-decomposition handbook (PDF)', url: '/materials/nwp-mpi-grid-decomposition-guide.pdf', kind: 'PDF', size: '6.5 KB' },
              { id: 'r2', name: 'Sample GRIB2: NCUM-Regional 12 km (subset)', url: '/materials/drstc/ncum-regional-sample.grib2', kind: 'GRIB2', size: '48 MB' },
            ],
          },
          {
            code: 'DRSTC-M01-L02',
            title: 'Scaling on Pratyush: MPI Ranks, I/O and Queues',
            content:
              '# Scaling on Pratyush\n\nDomain-decompose 2D in x–y, keep halos at 2–4 cells, overlap compute with non-blocking halo exchange, and write parallel NetCDF4 with chunking matched to the decomposition. Profile first with Darshan before requesting more nodes.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-IV.2'],
          },
        ],
      },
      {
        code: 'DRSTC-M02',
        title: 'Data Assimilation & Ensemble Prediction',
        description:
          '3D/4D-Var, LETKF, INSAT radiance assimilation, ensemble spread–skill and reliability diagrams for operational EPS.',
        outcomes: [
          'Contrast 3D-Var, 4D-Var and EnKF update equations',
          'Explain radiance bias correction for INSAT-3DS channels',
          'Read spread–skill and rank histograms for EPS health',
        ],
        wmoTags: ['WMO-1205-IV.3'],
        level: 'ADVANCED',
        durationHours: 56,
        lessons: [
          {
            code: 'DRSTC-M02-L01',
            title: 'How 4D-Var Ingests a Satellite Radiance',
            content:
              '# 4D-Var in One Page\n\nThe analysis minimises background + observation penalties over a 6 h window using the adjoint model. Radiances need variational bias correction; cloud-affected channels are blacklisted or thinned.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-IV.3'],
          },
          {
            code: 'DRSTC-M02-L02',
            title: 'Ensemble Health: Spread, Skill and Rank Histograms',
            content:
              '# EPS Health\n\nSpread should match RMSE of the ensemble mean. U-shaped rank histograms mean under-dispersion — add stochastic physics or inflate. Reliability diagrams check probability calibration for heavy-rain thresholds.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-IV.3'],
          },
        ],
      },
      {
        code: 'DRSTC-M03',
        title: 'Doppler Radar & Dual-Pol Quantitative Applications',
        description:
          'Velocity dealiasing, ZDR/KDP/CC hydrometeor classification, QPE relations and operational scan-strategy design.',
        outcomes: [
          'Dealias a folded velocity couplet using continuity',
          'Classify hydrometeors from Z/ZDR/CC signatures',
          'Design a 10-minute volume coverage pattern for severe weather',
        ],
        wmoTags: ['WMO-1205-III.3'],
        level: 'ADVANCED',
        durationHours: 60,
        lessons: [
          {
            code: 'DRSTC-M03-L01',
            title: 'Why Velocity Folds — and How to Unfold It',
            content:
              '# Velocity Dealiasing\n\nNyquist velocity V_n = PRF·λ/4. Returns beyond ±V_n fold. Region-based unfolding uses spatial continuity from a reference sounding; check the zero-isodop for the unfolding anchor.\n\nDual-PRF and staggered-PRT extend V_n at the cost of range coverage.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-III.3'],
            resources: [
              { id: 'r1', name: 'Dealiased vs aliased couplet pair (PDF)', url: '/materials/drstc/velocity-dealiasing-pairs.pdf', kind: 'PDF', size: '3.2 MB' },
            ],
          },
          {
            code: 'DRSTC-M03-L02',
            title: 'ZDR Columns, KDP Cores and Hail Signatures',
            content:
              '# Dual-Pol Hail Nowcasting\n\nA ZDR column above the freezing level marks a strong updraft; KDP cores show heavy rain mass; hail shows high Z with near-zero ZDR and low CC. Three-body scatter spikes confirm large hail aloft.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-III.3'],
          },
        ],
      },
      {
        code: 'DRSTC-M04',
        title: 'AI/ML for Extreme Event Prediction',
        description:
          'ConvLSTM nowcasting, U-Net segmentation of convection, physics-informed losses and cyclone intensity estimation from imagery.',
        outcomes: [
          'Train a ConvLSTM baseline for 0–2 h precipitation nowcasting',
          'Evaluate with CSI/FSS instead of pixel MSE alone',
          'Apply physics constraints (mass conservation) as loss terms',
        ],
        wmoTags: ['WMO-1205-IV.4'],
        level: 'ADVANCED',
        durationHours: 52,
        lessons: [
          {
            code: 'DRSTC-M04-L01',
            title: 'ConvLSTM Nowcasting Baseline',
            content:
              '# Nowcasting Baseline\n\nFeed 12 radar frames (5-min cadence) into a 3-layer ConvLSTM predicting the next 12. Score with CSI at 20/35 dBZ and Fractions Skill Score — MSE alone rewards blurry forecasts.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-IV.4'],
          },
          {
            code: 'DRSTC-M04-L02',
            title: 'Physics-Informed Losses and Trust',
            content:
              '# Trustworthy AI\n\nAdd advection-consistency and conservation penalties; always ship uncertainty (ensembles/dropout) and a failure-mode card before any operational trial.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-IV.4'],
          },
        ],
      },
    ],
  },
  {
    code: 'MODULAR',
    name: 'Modular Short Courses',
    description:
      'Stackable 1–3 week micro-credentials for working officers: dual-pol QPE/QPF and impact-based forecasting for disaster managers.',
    level: 'ADVANCED',
    domains: ['RAD-NOWCAST', 'DISASTER-OPS'],
    estimatedDurationHrs: 60,
    certificationBadge: 'IMD Micro-Credential',
    modules: [
      {
        code: 'MOD-M01',
        title: 'QPE/QPF with Dual-Pol Radar',
        description:
          'Rain-rate relations R(Z), R(KDP), R(Z,ZDR); gauge adjustment; blending into 0–6 h QPF for river basins.',
        outcomes: [
          'Select rain-rate relations by regime (stratiform vs convective)',
          'Apply mean-field gauge adjustment to radar QPE',
          'Blend QPE into a basin QPF table for CWC handoff',
        ],
        wmoTags: ['WMO-1205-III.4'],
        level: 'ADVANCED',
        durationHours: 24,
        lessons: [
          {
            code: 'MOD-M01-L01',
            title: 'Which R-Relation, When? (Sample Lesson)',
            content:
              '# R-Relations\n\nR(Z) is universal but hail-contaminated; R(KDP) shines in heavy rain and is immune to calibration drift; R(Z,ZDR) fixes drop-size errors. Blend by hydrometeor class from the classification output.',
            contentType: 'MARKDOWN',
            isPreviewFree: true,
            wmoTags: ['WMO-1205-III.4'],
          },
          {
            code: 'MOD-M01-L02',
            title: 'Gauge Adjustment and Basin Handoff',
            content:
              '# Adjustment\n\nCompute the gauge–radar ratio over the basin, apply as a smooth field (not a single number), and hand CWC a timed QPF table with uncertainty bands.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-III.4'],
          },
        ],
      },
      {
        code: 'MOD-M02',
        title: 'Impact-Based Forecasting for Disaster Managers',
        description:
          'Hazard–exposure–vulnerability matrices, colour-coded impact tables and joint SOP drills with SDMA control rooms.',
        outcomes: [
          'Build an impact matrix for urban flooding in a metro district',
          'Convert a heavy-rain warning into impact actions per colour',
          'Run a 60-minute tabletop drill with a control room',
        ],
        wmoTags: ['WMO-1205-V.2'],
        level: 'ADVANCED',
        durationHours: 20,
        lessons: [
          {
            code: 'MOD-M02-L01',
            title: 'From Hazard to Impact Tables',
            content:
              '# Impact Tables\n\nCross likelihood (unlikely→very likely) with impact (minimal→severe) to get the colour. Each cell names who acts: municipal pumps, traffic diversions, school closures.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-V.2'],
          },
          {
            code: 'MOD-M02-L02',
            title: 'Tabletop Drill Script',
            content:
              '# Drill Script\n\nA 60-minute script: inject 1 (orange warning), inject 2 (river rising), inject 3 (power failure at control room). Debrief against the decision log.',
            contentType: 'MARKDOWN',
            wmoTags: ['WMO-1205-V.2'],
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log('Seeding CapacityConnect (IMD / Mission Mausam) — full Phase 1–3 dataset...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ---------------------------------------------------------------- 1. Stations
  console.log('→ Stations (38 IMD radar stations)');
  for (const s of STATIONS) {
    await prisma.station.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        city: s.city,
        state: s.state,
        region: s.region,
        latitude: s.latitude,
        longitude: s.longitude,
        radarType: s.radarType,
        readinessPct: s.readinessPct,
        cadreCount: s.cadreCount,
        topGapDomain: s.topGapDomain,
        lastSurveyAt: new Date('2026-08-15T06:00:00Z'),
        isActive: true,
      },
      create: {
        code: s.code,
        name: s.name,
        city: s.city,
        state: s.state,
        region: s.region,
        latitude: s.latitude,
        longitude: s.longitude,
        radarType: s.radarType,
        radarRangeKm: 500,
        readinessPct: s.readinessPct,
        cadreCount: s.cadreCount,
        topGapDomain: s.topGapDomain,
        lastSurveyAt: new Date('2026-08-15T06:00:00Z'),
        isActive: true,
      },
    });
  }

  // ---------------------------------------------------------------- 2. Competencies
  console.log('→ Competencies (+WMO/domain mapping)');
  const compDefs: Array<{
    code: string;
    name: string;
    category: string;
    description: string;
    targetLevel: number;
    domainCode: string;
    wmoCode: string;
    wmoRubricRef: string;
    weight: number;
  }> = [
    {
      code: 'MET-NWP',
      name: 'Numerical Weather Prediction & Earth-System Modelling',
      category: 'Atmospheric Physics & Modeling',
      description:
        'Dynamic grid parametrization, non-hydrostatic atmospheric equations, WRF/GFS modeling, and global ensemble prediction systems.',
      targetLevel: 5,
      domainCode: 'NWP',
      wmoCode: 'WMO-1205-IV',
      wmoRubricRef: 'WMO-No.1205 §IV: NWP use and interpretation; deterministic + ensemble guidance.',
      weight: 1.8,
    },
    {
      code: 'MET-RADAR',
      name: 'Doppler Weather Radar (DWR) & Convective Nowcasting',
      category: 'Observational Radar & Satellite',
      description:
        'Interpretation of S/C/X-band dual-polarimetric radar products, reflectivity Z, differential reflectivity ZDR, velocity de-aliasing, and severe storm nowcasting.',
      targetLevel: 5,
      domainCode: 'RAD-NOWCAST',
      wmoCode: 'WMO-1205-III',
      wmoRubricRef: 'WMO-No.1205 §III: radar/satellite interpretation and nowcasting; dual-pol QPE.',
      weight: 1.6,
    },
    {
      code: 'MET-SAT',
      name: 'Satellite Remote Sensing & INSAT-3DS Sounder Analytics',
      category: 'Observational Radar & Satellite',
      description:
        'Analysis of geostationary meteorological satellites (INSAT-3DR/3DS), multi-spectral water vapor channels, and atmospheric motion vectors.',
      targetLevel: 4,
      domainCode: 'RAD-NOWCAST',
      wmoCode: 'WMO-1083-II',
      wmoRubricRef: 'WMO-No.1083 BIP-M: satellite data interpretation for analysis and nowcasting.',
      weight: 1.0,
    },
    {
      code: 'MET-HPC',
      name: 'High-Performance Computing & Atmospheric Grid Parallelism',
      category: 'Computational & HPC',
      description:
        'MPI/OpenMP distributed computing on sovereign supercomputing clusters (Pratyush / Mihir), NetCDF/GRIB2 I/O optimization, and GPU acceleration.',
      targetLevel: 4,
      domainCode: 'HPC',
      wmoCode: 'WMO-1205-IV',
      wmoRubricRef: 'Supporting competency: HPC literacy for operational NWP environments.',
      weight: 1.2,
    },
    {
      code: 'MET-AIML',
      name: 'AI/ML for Weather Forecasting & Extreme Event Prediction',
      category: 'Computational & HPC',
      description:
        'Deep neural networks (ConvLSTM, Graph Neural Networks, U-Net) for precipitation nowcasting, physics-informed AI, and tropical cyclone intensity estimation.',
      targetLevel: 4,
      domainCode: 'NWP',
      wmoCode: 'WMO-1205-IV',
      wmoRubricRef: 'Emerging competency: AI guidance interpretation with calibrated uncertainty.',
      weight: 1.0,
    },
    {
      code: 'MET-DSS',
      name: 'Early Warning & Multi-Hazard Decision Support Systems',
      category: 'Applied Meteorology & DSS',
      description:
        'Integration of meteorological models with disaster response protocols (NDRF/SDMA), impact-based forecasting, and automated color-coded alerts.',
      targetLevel: 4,
      domainCode: 'DISASTER-OPS',
      wmoCode: 'WMO-1205-V',
      wmoRubricRef: 'WMO-No.1205 §V: warning services, impact-based forecasting, coordination.',
      weight: 1.4,
    },
    {
      code: 'MET-SYNOP',
      name: 'Synoptic Meteorology & Tropical Cyclone Dynamics',
      category: 'Atmospheric Physics & Modeling',
      description:
        'Surface weather chart synoptic analysis, tropical cyclogenesis tracking, storm surge modeling, and monsoon depression mechanics.',
      targetLevel: 5,
      domainCode: 'SYNOPTIC',
      wmoCode: 'WMO-1205-I/II',
      wmoRubricRef: 'WMO-No.1205 §§I–II: synoptic analysis and tropical systems.',
      weight: 1.7,
    },
    {
      code: 'MET-COMMS',
      name: 'Meteorological Communication & Public Weather Services',
      category: 'Applied Meteorology & DSS',
      description:
        'District forecasts, warning wording standards, media briefing and coordination with disaster management authorities.',
      targetLevel: 4,
      domainCode: 'COMMS',
      wmoCode: 'WMO-1083-V',
      wmoRubricRef: 'WMO-No.1083 BIP-M: communication of meteorological information to users.',
      weight: 1.1,
    },
  ];
  const compByCode: Record<string, { id: string }> = {};
  for (const c of compDefs) {
    const rec = await prisma.competency.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        category: c.category,
        description: c.description,
        targetLevel: c.targetLevel,
        domainCode: c.domainCode,
        wmoCode: c.wmoCode,
        wmoRubricRef: c.wmoRubricRef,
        weight: c.weight,
      },
      create: {
        name: c.name,
        code: c.code,
        category: c.category,
        description: c.description,
        targetLevel: c.targetLevel,
        domainCode: c.domainCode,
        wmoCode: c.wmoCode,
        wmoRubricRef: c.wmoRubricRef,
        weight: c.weight,
      },
    });
    compByCode[c.code] = { id: rec.id };
  }
  const nwpComp = compByCode['MET-NWP'];
  const radarComp = compByCode['MET-RADAR'];
  const satComp = compByCode['MET-SAT'];
  const hpcComp = compByCode['MET-HPC'];
  const aimlComp = compByCode['MET-AIML'];
  const dssComp = compByCode['MET-DSS'];
  const synopComp = compByCode['MET-SYNOP'];
  const commsComp = compByCode['MET-COMMS'];

  // ---------------------------------------------------------------- 3. Users
  console.log('→ Users (admins, trainers, trainees, approval queue)');
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
    cadre: 'Scientist-G',
    employeeCode: 'IMD-ADMIN-0001',
    stationCode: 'DEL',
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
    cadre: 'Scientist-F',
    employeeCode: 'IMD-ADMIN-0002',
    stationCode: 'DEL',
  });

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
    cadre: 'Scientist-F',
    employeeCode: 'IMD-TRN-0101',
    stationCode: 'PUN',
    rating: 4.7,
    cohortsDelivered: 14,
    specialization: 'NWP, HPC, Data Assimilation',
    availability: 'AVAILABLE',
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
    cadre: 'Scientist-E',
    employeeCode: 'IMD-TRN-0102',
    stationCode: 'PUN',
    rating: 4.2,
    cohortsDelivered: 8,
    specialization: 'Radar Meteorology, Nowcasting',
    availability: 'AVAILABLE',
  });

  // Trainer on leave (matcher must auto-exclude)
  const leaveTrainer = await seedUserWithProfile({
    email: 'meera.iyer@imd.gov.in',
    passwordHash,
    role: 'TRAINER',
    status: 'APPROVED',
    isVerified: true,
    fullName: 'Dr. Meera Iyer',
    headline: 'Faculty • Satellite Meteorology (currently on leave)',
    bio: 'INSAT applications specialist; on sanctioned leave through September 2026.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Satellite Meteorology Division',
    phone: '+91 11 2461 1055',
    location: 'New Delhi, India',
    cadre: 'Scientist-D',
    employeeCode: 'IMD-TRN-0103',
    stationCode: 'DEL',
    rating: 4.5,
    cohortsDelivered: 6,
    specialization: 'Satellite Meteorology',
    availability: 'ON_LEAVE',
  });

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
    cadre: 'Scientist-B',
    employeeCode: 'IMD-SCB-2026-0147',
    stationCode: 'DEL',
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
    cadre: 'Scientist-B',
    employeeCode: 'IMD-SCB-2026-0148',
    stationCode: 'MUM',
  });

  // Extra cohort trainee (gap-score demo: weak RAD-NOWCAST)
  const priyaTrainee = await seedUserWithProfile({
    email: 'priya.nair@imd.gov.in',
    passwordHash,
    role: 'TRAINEE',
    status: 'APPROVED',
    isVerified: true,
    fullName: 'Priya Nair',
    headline: 'Scientific Assistant • DRSTC-04 Cohort',
    bio: 'Cohort DRSTC-04 trainee posted at Thiruvananthapuram; remediation focus on radar nowcasting.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Doppler Radar Unit',
    phone: '+91 98470 11223',
    location: 'Thiruvananthapuram, Kerala',
    cadre: 'Scientific Assistant',
    employeeCode: 'IMD-SA-2026-0311',
    stationCode: 'TVM',
  });

  // Approval queue: 2 pending registrations (admin demo)
  await seedUserWithProfile({
    email: 'rohan.verma@imd.gov.in',
    passwordHash,
    role: 'TRAINEE',
    status: 'PENDING',
    isVerified: false,
    fullName: 'Rohan Verma',
    headline: 'Awaiting Approval • Scientist-B (DRSTC)',
    bio: 'Direct recruit awaiting cadre verification.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Induction Training Division',
    phone: '+91 98111 22334',
    location: 'Nagpur, Maharashtra',
    cadre: 'Scientist-B',
    employeeCode: 'IMD-SCB-2026-0201',
    stationCode: 'NAG',
  });
  await seedUserWithProfile({
    email: 'kavya.reddy@imd.gov.in',
    passwordHash,
    role: 'TRAINER',
    status: 'PENDING',
    isVerified: false,
    fullName: 'Dr. Kavya Reddy',
    headline: 'Awaiting Approval • Trainer (Agromet)',
    bio: 'Agrimet specialist applying for trainer empanelment.',
    organization: 'India Meteorological Department (IMD)',
    department: 'Agrimet Division, Pune',
    phone: '+91 98220 44556',
    location: 'Pune, Maharashtra',
    cadre: 'Scientist-D',
    employeeCode: 'IMD-TRN-0104',
    stationCode: 'PUN',
  });

  // Deterministic SLA story for the approval queue: Rohan submitted ~41h
  // ago (within SLA), Kavya ~55h ago (breached). upsert() never rewrites
  // createdAt, so pin it explicitly (idempotent on re-runs).
  await prisma.user.updateMany({
    where: { email: 'rohan.verma@imd.gov.in', status: 'PENDING' },
    data: { createdAt: new Date('2026-09-06T08:50:00Z') },
  });
  await prisma.user.updateMany({
    where: { email: 'kavya.reddy@imd.gov.in', status: 'PENDING' },
    data: { createdAt: new Date('2026-09-05T03:35:00Z') },
  });

  // Status test personas
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

  // ---------------------------------------------------------------- 4. Tracks/Modules/Lessons
  console.log('→ Training tracks, modules, lessons, prerequisites');
  let sortTrack = 0;
  const moduleIdByCode: Record<string, string> = {};
  const lessonIdByCode: Record<string, string> = {};
  for (const t of TRACKS) {
    sortTrack += 1;
    const track = await prisma.trainingTrack.upsert({
      where: { code: t.code },
      update: {
        name: t.name,
        description: t.description,
        level: t.level,
        domains: t.domains,
        estimatedDurationHrs: t.estimatedDurationHrs,
        certificationBadge: t.certificationBadge,
        isPublished: true,
        displayOrder: sortTrack,
      },
      create: {
        code: t.code,
        name: t.name,
        description: t.description,
        level: t.level,
        domains: t.domains,
        estimatedDurationHrs: t.estimatedDurationHrs,
        certificationBadge: t.certificationBadge,
        thumbnail: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80`,
        isPublished: true,
        displayOrder: sortTrack,
      },
    });
    let sortModule = 0;
    let prevModuleId: string | null = null;
    for (const m of t.modules) {
      sortModule += 1;
      const mod = await prisma.trainingModule.upsert({
        where: { code: m.code },
        update: {
          trackId: track.id,
          title: m.title,
          description: m.description,
          outcomes: m.outcomes,
          wmoTags: m.wmoTags,
          level: m.level,
          durationHours: m.durationHours,
          sortOrder: sortModule,
          isPublished: true,
        },
        create: {
          code: m.code,
          trackId: track.id,
          title: m.title,
          description: m.description,
          outcomes: m.outcomes,
          wmoTags: m.wmoTags,
          level: m.level,
          durationHours: m.durationHours,
          sortOrder: sortModule,
          isPublished: true,
        },
      });
      moduleIdByCode[m.code] = mod.id;
      if (prevModuleId) {
        await prisma.modulePrerequisite.upsert({
          where: { moduleId_prerequisiteId: { moduleId: mod.id, prerequisiteId: prevModuleId } },
          update: {},
          create: { moduleId: mod.id, prerequisiteId: prevModuleId },
        });
      }
      prevModuleId = mod.id;
      let sortLesson = 0;
      for (const l of m.lessons) {
        sortLesson += 1;
        const lesson = await prisma.lesson.upsert({
          where: { code: l.code },
          update: {
            moduleId: mod.id,
            title: l.title,
            content: l.content,
            contentType: l.contentType,
            videoUrl: l.videoUrl ?? null,
            resources: l.resources ?? [],
            status: 'PUBLISHED',
            isPreviewFree: l.isPreviewFree ?? false,
            sortOrder: sortLesson,
            wmoTags: l.wmoTags ?? [],
            publishedAt: new Date('2026-07-01T09:00:00Z'),
          },
          create: {
            code: l.code,
            moduleId: mod.id,
            title: l.title,
            content: l.content,
            contentType: l.contentType,
            videoUrl: l.videoUrl ?? null,
            resources: l.resources ?? [],
            status: 'PUBLISHED',
            isPreviewFree: l.isPreviewFree ?? false,
            sortOrder: sortLesson,
            wmoTags: l.wmoTags ?? [],
            publishedAt: new Date('2026-07-01T09:00:00Z'),
          },
        });
        lessonIdByCode[l.code] = lesson.id;
        // v1 snapshot for version history
        await prisma.lessonVersion.upsert({
          where: { lessonId_version: { lessonId: lesson.id, version: 1 } },
          update: {},
          create: {
            lessonId: lesson.id,
            version: 1,
            content: l.content,
            changelog: 'Initial published version',
            createdById: trainerUser.id,
          },
        });
      }
    }
  }

  // ---------------------------------------------------------------- 5. Competency radar scores
  console.log('→ Competency radar scores (trainee demo)');
  await ensureCompetencyScores(traineeUser.id, [
    { domain: 'RAD-NOWCAST', score: 42, requiredScore: 80 },
    { domain: 'NWP', score: 68, requiredScore: 85 },
    { domain: 'HPC', score: 61, requiredScore: 80 },
    { domain: 'DISASTER-OPS', score: 55, requiredScore: 75 },
    { domain: 'SYNOPTIC', score: 74, requiredScore: 85 },
    { domain: 'COMMS', score: 58, requiredScore: 70 },
  ]);
  await ensureCompetencyScores(genericTrainee.id, [
    { domain: 'RAD-NOWCAST', score: 35, requiredScore: 80 },
    { domain: 'NWP', score: 52, requiredScore: 85 },
    { domain: 'HPC', score: 48, requiredScore: 80 },
    { domain: 'DISASTER-OPS', score: 60, requiredScore: 75 },
    { domain: 'SYNOPTIC', score: 57, requiredScore: 85 },
    { domain: 'COMMS', score: 66, requiredScore: 70 },
  ]);
  await ensureCompetencyScores(priyaTrainee.id, [
    { domain: 'RAD-NOWCAST', score: 28, requiredScore: 80 },
    { domain: 'NWP', score: 58, requiredScore: 85 },
    { domain: 'HPC', score: 44, requiredScore: 80 },
    { domain: 'DISASTER-OPS', score: 62, requiredScore: 75 },
    { domain: 'SYNOPTIC', score: 65, requiredScore: 85 },
    { domain: 'COMMS', score: 71, requiredScore: 70 },
  ]);

  // Lesson progress: Aarav completed IMTC-M01 lessons, bookmarked DRSTC lesson
  console.log('→ Lesson progress + bookmarks');
  const progressSeed: Array<{
    lessonCode: string;
    completed: boolean;
    bookmark: boolean;
    note?: string;
  }> = [
    { lessonCode: 'IMTC-M01-L01', completed: true, bookmark: false },
    { lessonCode: 'IMTC-M01-L02', completed: true, bookmark: false },
    { lessonCode: 'DRSTC-M01-L01', completed: false, bookmark: true, note: 'Revise CFL derivation before Friday exam window.' },
  ];
  for (const p of progressSeed) {
    const lessonId = lessonIdByCode[p.lessonCode];
    if (!lessonId) continue;
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: traineeUser.id, lessonId } },
      update: { completed: p.completed, completedAt: p.completed ? new Date('2026-08-20T10:00:00Z') : null, bookmark: p.bookmark, note: p.note ?? null },
      create: {
        userId: traineeUser.id,
        lessonId,
        completed: p.completed,
        completedAt: p.completed ? new Date('2026-08-20T10:00:00Z') : null,
        bookmark: p.bookmark,
        note: p.note ?? null,
      },
    });
  }

  // ---------------------------------------------------------------- 6. Legacy course + assessment (preserved)
  console.log('→ Legacy course IMD-DRSTC-101 + assessment');
  const course = await prisma.course.upsert({
    where: { code: 'IMD-DRSTC-101' },
    update: { trainerId: trainerUser.id },
    create: {
      title: 'DRSTC: Earth-System Modelling & HPC Parallel Architectures on Pratyush',
      code: 'IMD-DRSTC-101',
      slug: 'drstc-earth-system-modelling-hpc-pratyush',
      description:
        'Direct Recruited Scientists Training Course (DRSTC) flagship module: Master non-hydrostatic atmospheric grid dynamics, numerical time-stepping (CFL criteria), MPI/OpenMP domain decomposition on sovereign supercomputers (Pratyush / Mihir), and GFS/NCUM ensemble assimilation.',
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
            description:
              'Comprehensive breakdown of primitive hydrostatic equations, baroclinic instability, and finite difference grid staggerings.',
            type: 'VIDEO',
            url: 'https://www.youtube.com/watch?v=XVNdacklXCk',
            durationSeconds: 1680,
            fileSize: '165 MB',
            sortOrder: 1,
            isPreview: true,
          },
          {
            title: 'High-Performance Parallel MPI Grid Decomposition Guide (Technical PDF)',
            description:
              'Technical handbook detailing 2D spatial domain splitting, boundary halo exchanges, and NetCDF4 parallel I/O on national supercomputers (Pratyush / Mihir).',
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

  const existingAssessment = await prisma.assessment.findFirst({
    where: { courseId: course.id, title: 'DRSTC: Earth-System Modelling & HPC Certification Exam' },
  });
  let assessment = existingAssessment;
  if (assessment) {
    const dups = await prisma.assessment.findMany({
      where: { courseId: course.id, title: 'DRSTC: Earth-System Modelling & HPC Certification Exam', id: { not: assessment.id } },
    });
    for (const dup of dups) await prisma.assessment.delete({ where: { id: dup.id } });
    if (dups.length > 0) console.log(`Pruned ${dups.length} duplicate assessment(s).`);
    // Backfill: link the legacy assessment to its DRSTC module so the
    // trainee player can surface its questions as practice checkpoints.
    if (!assessment.moduleId && moduleIdByCode['DRSTC-M01']) {
      assessment = await prisma.assessment.update({
        where: { id: assessment.id },
        data: { moduleId: moduleIdByCode['DRSTC-M01'], type: 'PROCTORED', publishedAt: new Date('2026-08-01T09:00:00Z') },
      });
      console.log('Linked DRSTC certification exam to module DRSTC-M01.');
    }
    // Backfill: bank metadata on the legacy questions (competency tags feed
    // exam grading → CompetencyScore updates; indices feed item analysis).
    const qCfl = await prisma.question.findFirst({
      where: { assessmentId: assessment.id, questionText: { startsWith: 'In numerical weather prediction (NWP)' } },
    });
    if (qCfl && !qCfl.competencyTag) {
      await prisma.question.update({
        where: { id: qCfl.id },
        data: { competencyTag: 'NWP', difficulty: 'MEDIUM', bloomsLevel: 'UNDERSTAND', wmoRef: 'WMO-1205-IV.2', usageCount: 46, correctCount: 31, difficultyIndex: 0.67, discriminationIndex: 0.42 },
      });
    }
    const qMpi = await prisma.question.findFirst({
      where: { assessmentId: assessment.id, questionText: { startsWith: 'When scaling atmospheric earth-system models' } },
    });
    if (qMpi && !qMpi.competencyTag) {
      await prisma.question.update({
        where: { id: qMpi.id },
        data: { competencyTag: 'HPC', difficulty: 'HARD', bloomsLevel: 'ANALYZE', wmoRef: 'WMO-1205-IV.2', usageCount: 44, correctCount: 17, difficultyIndex: 0.39, discriminationIndex: 0.51 },
      });
    }
  } else {
    assessment = await prisma.assessment.create({
      data: {
        courseId: course.id,
        moduleId: moduleIdByCode['DRSTC-M01'] ?? null,
        type: 'PROCTORED',
        title: 'DRSTC: Earth-System Modelling & HPC Certification Exam',
        description:
          'Comprehensive timed evaluation testing mastery over non-hydrostatic governing equations, CFL numerical stability criteria, and domain parallelization.',
        timeLimitMinutes: 25,
        passingScorePercentage: 70.0,
        maxAttempts: 3,
        totalQuestions: 2,
        totalWeight: 5.0,
        isPublished: true,
        publishedAt: new Date('2026-08-01T09:00:00Z'),
        questions: {
          create: [
            {
              questionText:
                'In numerical weather prediction (NWP) finite-difference discretization, which condition must be satisfied by the time step (Δt) and grid spacing (Δx) for explicit advection schemes to maintain numerical stability?',
              questionType: 'SINGLE_CHOICE',
              options: [
                { id: 'opt_1', text: 'Courant–Friedrichs–Lewy (CFL) Condition: C = u*(Δt/Δx) ≤ C_max (typically ≤ 1.0)' },
                { id: 'opt_2', text: 'Richardson Number stability limit (Ri > 0.25)' },
                { id: 'opt_3', text: 'Brunt–Väisälä buoyancy frequency threshold (N² > 0)' },
                { id: 'opt_4', text: 'Navier–Stokes Reynolds number equivalence (Re = 1)' },
              ],
              correctOption: 'opt_1',
              weight: 2.5,
              explanation:
                'The CFL condition governs explicit time-stepping stability; if information propagates across a spatial grid cell faster than the time step, numerical divergence occurs.',
              sortOrder: 1,
              competencyTag: 'NWP',
              difficulty: 'MEDIUM',
              bloomsLevel: 'UNDERSTAND',
              wmoRef: 'WMO-1205-IV.2',
              usageCount: 46,
              correctCount: 31,
              difficultyIndex: 0.67,
              discriminationIndex: 0.42,
            },
            {
              questionText:
                'When scaling atmospheric earth-system models on sovereign supercomputers (e.g. Pratyush / Mihir) with thousands of MPI ranks, what is the primary communication bottleneck during spectral transform steps (Legendre / Fourier)?',
              questionType: 'SINGLE_CHOICE',
              options: [
                { id: 'opt_1', text: 'Point-to-point nearest neighbor halo exchange' },
                { id: 'opt_2', text: 'All-to-All (MPI_Alltoall) global communication transpose' },
                { id: 'opt_3', text: 'Local L1 cache memory latency' },
                { id: 'opt_4', text: 'Serial file write to stdout' },
              ],
              correctOption: 'opt_2',
              weight: 2.5,
              explanation:
                'In spectral models, converting between grid point space and spectral harmonic space requires global MPI_Alltoall transposes across all nodes.',
              sortOrder: 2,
              competencyTag: 'HPC',
              difficulty: 'HARD',
              bloomsLevel: 'ANALYZE',
              wmoRef: 'WMO-1205-IV.2',
              usageCount: 44,
              correctCount: 17,
              difficultyIndex: 0.39,
              discriminationIndex: 0.51,
            },
          ],
        },
      },
    });
  }

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: traineeUser.id, courseId: course.id } },
    update: {},
    create: { userId: traineeUser.id, courseId: course.id, status: 'ACTIVE', progressPercentage: 50.0 },
  });

  // ---------------------------------------------------------------- 7. Question bank
  console.log('→ Central question bank (trainer demo + item analysis)');
  const bank = await prisma.questionBank.upsert({
    where: { id: '00000000-0000-4000-8000-0000000000b1' },
    update: { name: 'IMD Central Question Bank', description: 'Curated operational-meteorology items mapped to WMO competencies.' },
    create: {
      id: '00000000-0000-4000-8000-0000000000b1',
      name: 'IMD Central Question Bank',
      description: 'Curated operational-meteorology items mapped to WMO competencies.',
      ownerId: trainerUser.id,
    },
  });
  const bankItems: Array<{
    text: string;
    type: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
    options: Array<{ id: string; text: string }>;
    correct: string | string[];
    tag: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    blooms: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
    wmoRef: string;
    usage: number;
    correctCount: number;
    disc: number;
  }> = [
    {
      text: 'A ZDR column extending 2 km above the environmental freezing level on a dual-pol PPI most directly indicates:',
      type: 'SINGLE_CHOICE',
      options: [
        { id: 'opt_1', text: 'An intense updraft lofting supercooled liquid drops' },
        { id: 'opt_2', text: 'Bright-band melting-layer contamination' },
        { id: 'opt_3', text: 'Anomalous propagation from a nocturnal inversion' },
        { id: 'opt_4', text: 'Attenuation from a hail core' },
      ],
      correct: 'opt_1',
      tag: 'RAD-NOWCAST',
      difficulty: 'MEDIUM',
      blooms: 'APPLY',
      wmoRef: 'WMO-1205-III.3',
      usage: 58,
      correctCount: 36,
      disc: 0.47,
    },
    {
      text: 'Doppler velocity shows a tight inbound/outbound couplet of ±28 m/s with Nyquist velocity 24 m/s. The correct dealiasing inference is:',
      type: 'SINGLE_CHOICE',
      options: [
        { id: 'opt_1', text: 'True couplet of ~52 m/s gate-to-gate shear (tornadic vortex signature class)' },
        { id: 'opt_2', text: 'A folded couplet; unfold using continuity from the environmental wind profile' },
        { id: 'opt_3', text: 'Ground clutter; filter with a GMAP notch' },
        { id: 'opt_4', text: 'Second-trip echo; increase the PRF' },
      ],
      correct: 'opt_2',
      tag: 'RAD-NOWCAST',
      difficulty: 'HARD',
      blooms: 'ANALYZE',
      wmoRef: 'WMO-1205-III.3',
      usage: 41,
      correctCount: 12,
      disc: 0.55,
    },
    {
      text: 'For the southwest monsoon onset over Kerala, IMD requires 60% of 14 designated stations to report ≥2.5 mm rainfall for two consecutive days, alongside westerly depth and OLR criteria.',
      type: 'TRUE_FALSE',
      options: [
        { id: 'opt_1', text: 'True' },
        { id: 'opt_2', text: 'False' },
      ],
      correct: 'opt_1',
      tag: 'SYNOPTIC',
      difficulty: 'EASY',
      blooms: 'REMEMBER',
      wmoRef: 'WMO-1205-II.1',
      usage: 72,
      correctCount: 64,
      disc: 0.21,
    },
    {
      text: 'Which rain-rate relations are preferred in (a) hail-contaminated convection and (b) widespread stratiform rain? (Select all correct pairings.)',
      type: 'MULTI_CHOICE',
      options: [
        { id: 'opt_1', text: 'R(KDP) for hail-contaminated convection' },
        { id: 'opt_2', text: 'R(Z) alone for hail-contaminated convection' },
        { id: 'opt_3', text: 'R(Z) with gauge adjustment for stratiform rain' },
        { id: 'opt_4', text: 'R(Z,ZDR) uncorrected for stratiform rain' },
      ],
      correct: ['opt_1', 'opt_3'],
      tag: 'RAD-NOWCAST',
      difficulty: 'HARD',
      blooms: 'EVALUATE',
      wmoRef: 'WMO-1205-III.4',
      usage: 33,
      correctCount: 9,
      disc: 0.58,
    },
    {
      text: 'A rank histogram of ensemble 24-h rainfall that is strongly U-shaped indicates:',
      type: 'SINGLE_CHOICE',
      options: [
        { id: 'opt_1', text: 'Under-dispersion: the ensemble is overconfident' },
        { id: 'opt_2', text: 'A wet model bias in the ensemble mean' },
        { id: 'opt_3', text: 'Perfect calibration of forecast probabilities' },
        { id: 'opt_4', text: 'Excessive model spin-up in the first 6 hours' },
      ],
      correct: 'opt_1',
      tag: 'NWP',
      difficulty: 'MEDIUM',
      blooms: 'ANALYZE',
      wmoRef: 'WMO-1205-IV.3',
      usage: 39,
      correctCount: 22,
      disc: 0.44,
    },
    {
      text: 'State the colour, phenomenon wording and one action line for a fishermen warning with squally winds 55–65 kmph gusting to 75 kmph along the Kerala coast, valid next 24 hours.',
      type: 'SHORT_ANSWER',
      options: [{ id: 'opt_1', text: 'Free-text answer (trainer graded against rubric)' }],
      correct: 'opt_1',
      tag: 'DISASTER-OPS',
      difficulty: 'MEDIUM',
      blooms: 'CREATE',
      wmoRef: 'WMO-1205-V.1',
      usage: 25,
      correctCount: 18,
      disc: 0.38,
    },
  ];
  let qi = 0;
  for (const q of bankItems) {
    qi += 1;
    const found = await prisma.question.findFirst({ where: { bankId: bank.id, questionText: q.text } });
    if (found) {
      await prisma.question.update({
        where: { id: found.id },
        data: {
          competencyTag: q.tag,
          difficulty: q.difficulty,
          bloomsLevel: q.blooms,
          wmoRef: q.wmoRef,
          usageCount: q.usage,
          correctCount: q.correctCount,
          difficultyIndex: q.usage > 0 ? q.correctCount / q.usage : null,
          discriminationIndex: q.disc,
        },
      });
    } else {
      await prisma.question.create({
        data: {
          bankId: bank.id,
          questionText: q.text,
          questionType: q.type,
          options: q.options,
          correctOption: q.correct,
          weight: 1.0,
          sortOrder: qi,
          competencyTag: q.tag,
          difficulty: q.difficulty,
          bloomsLevel: q.blooms,
          wmoRef: q.wmoRef,
          usageCount: q.usage,
          correctCount: q.correctCount,
          difficultyIndex: q.usage > 0 ? q.correctCount / q.usage : null,
          discriminationIndex: q.disc,
        },
      });
    }
  }

  // ---------------------------------------------------------------- 8. Cohort DRSTC-04
  console.log('→ Cohort DRSTC-04 + sessions + attendance + notes');
  const drstcTrack = await prisma.trainingTrack.findUnique({ where: { code: 'DRSTC' } });
  const delhi = await prisma.station.findUnique({ where: { code: 'DEL' } });
  const cohort = await prisma.cohort.upsert({
    where: { code: 'DRSTC-04' },
    update: {
      name: 'DRSTC 2026 Batch-IV (NWP & Radar)',
      trackId: drstcTrack ? drstcTrack.id : null,
      stationId: delhi ? delhi.id : null,
      status: 'ACTIVE',
      startDate: new Date('2026-07-06T09:00:00Z'),
      endDate: new Date('2026-12-18T18:00:00Z'),
      maxCapacity: 30,
    },
    create: {
      code: 'DRSTC-04',
      name: 'DRSTC 2026 Batch-IV (NWP & Radar)',
      trackId: drstcTrack ? drstcTrack.id : null,
      stationId: delhi ? delhi.id : null,
      status: 'ACTIVE',
      startDate: new Date('2026-07-06T09:00:00Z'),
      endDate: new Date('2026-12-18T18:00:00Z'),
      maxCapacity: 30,
    },
  });
  const members: Array<{
    userId: string;
    attendancePct: number;
    riskFlag: boolean;
    riskReason?: string;
    lastActiveAt: Date;
  }> = [
    { userId: traineeUser.id, attendancePct: 92, riskFlag: false, lastActiveAt: new Date('2026-09-07T15:30:00Z') },
    { userId: genericTrainee.id, attendancePct: 81, riskFlag: false, lastActiveAt: new Date('2026-09-05T11:00:00Z') },
    { userId: priyaTrainee.id, attendancePct: 64, riskFlag: true, riskReason: 'Gap 52% in RAD-NOWCAST; inactive 9 days', lastActiveAt: new Date('2026-08-29T09:00:00Z') },
  ];
  for (const m of members) {
    await prisma.cohortMember.upsert({
      where: { cohortId_userId: { cohortId: cohort.id, userId: m.userId } },
      update: { attendancePct: m.attendancePct, riskFlag: m.riskFlag, riskReason: m.riskReason ?? null, lastActiveAt: m.lastActiveAt },
      create: { cohortId: cohort.id, userId: m.userId, attendancePct: m.attendancePct, riskFlag: m.riskFlag, riskReason: m.riskReason ?? null, lastActiveAt: m.lastActiveAt },
    });
  }
  const sessionDefs: Array<{
    title: string;
    type: 'LIVE_SESSION' | 'EXAM_WINDOW' | 'ASSIGNMENT_DEADLINE';
    startsAt: Date;
    endsAt?: Date;
    location?: string;
  }> = [
    {
      title: 'Live: Dual-Pol QPE walkthrough (DRSTC-M03)',
      type: 'LIVE_SESSION',
      startsAt: new Date('2026-09-12T10:00:00Z'),
      endsAt: new Date('2026-09-12T11:30:00Z'),
      location: 'VC Hall, Mausam Bhavan + virtual',
    },
    {
      title: 'Exam window: DRSTC Earth-System Modelling certification',
      type: 'EXAM_WINDOW',
      startsAt: new Date('2026-09-15T04:00:00Z'),
      endsAt: new Date('2026-09-15T12:00:00Z'),
      location: 'Proctored online',
    },
    {
      title: 'Assignment due: Basin QPF table (MOD-M01)',
      type: 'ASSIGNMENT_DEADLINE',
      startsAt: new Date('2026-09-18T18:30:00Z'),
    },
  ];
  for (const s of sessionDefs) {
    const found = await prisma.cohortSession.findFirst({ where: { cohortId: cohort.id, title: s.title } });
    if (!found) {
      await prisma.cohortSession.create({
        data: { cohortId: cohort.id, title: s.title, type: s.type, startsAt: s.startsAt, endsAt: s.endsAt ?? null, location: s.location ?? null },
      });
    }
  }
  // Past session attendance (marked by trainer)
  const pastSession = await prisma.cohortSession.findFirst({ where: { cohortId: cohort.id, title: sessionDefs[0].title } });
  if (pastSession) {
    const att: Array<{ userId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }> = [
      { userId: traineeUser.id, status: 'PRESENT' },
      { userId: genericTrainee.id, status: 'LATE' },
      { userId: priyaTrainee.id, status: 'ABSENT' },
    ];
    for (const a of att) {
      await prisma.attendance.upsert({
        where: { sessionId_userId: { sessionId: pastSession.id, userId: a.userId } },
        update: { status: a.status },
        create: { sessionId: pastSession.id, userId: a.userId, status: a.status, markedById: trainerUser.id },
      });
    }
  }
  // Trainer-only inline note (RBAC demo)
  const noteFound = await prisma.trainerNote.findFirst({
    where: { trainerId: trainerUser.id, traineeId: priyaTrainee.id, cohortId: cohort.id },
  });
  if (!noteFound) {
    await prisma.trainerNote.create({
      data: {
        trainerId: trainerUser.id,
        traineeId: priyaTrainee.id,
        cohortId: cohort.id,
        note: 'Priya misses velocity-fold signatures consistently; assign DRSTC-M03-L01 micro-lesson + 1:1 doubt slot before exam window.',
      },
    });
  }
  // Remediation pack → Priya (notification + task)
  let pack = await prisma.remediationPack.findFirst({
    where: { trainerId: trainerUser.id, cohortId: cohort.id, title: 'Radar nowcasting booster — Priya' },
  });
  if (!pack) {
    pack = await prisma.remediationPack.create({
      data: {
        trainerId: trainerUser.id,
        cohortId: cohort.id,
        title: 'Radar nowcasting booster — Priya',
        message: 'Complete the two micro-lessons below before the Sept 15 exam window; doubt slot booked Sept 13.',
        lessonIds: ['DRSTC-M03-L01', 'FTC-M01-L01'],
        status: 'SENT',
      },
    });
  }
  await prisma.remediationAssignment.upsert({
    where: { packId_userId: { packId: pack.id, userId: priyaTrainee.id } },
    update: {},
    create: { packId: pack.id, userId: priyaTrainee.id },
  });

  // ---------------------------------------------------------------- 9. Certificates
  console.log('→ Certificates (with public verification IDs)');
  const imtcM1 = moduleIdByCode['IMTC-M01'];
  const drstcM1 = moduleIdByCode['DRSTC-M01'];
  const certDefs = [
    {
      userId: traineeUser.id,
      moduleId: imtcM1,
      title: 'Synoptic Chart Analysis Fundamentals',
      issuedAt: new Date('2026-08-22T10:00:00Z'),
      verificationId: 'c0ffee01-2026-4imd-8cc1-000000000001',
      metadata: { trackCode: 'IMTC', score: 82, grade: 'A' },
    },
    {
      userId: priyaTrainee.id,
      moduleId: imtcM1,
      title: 'Synoptic Chart Analysis Fundamentals',
      issuedAt: new Date('2026-08-22T10:00:00Z'),
      verificationId: 'c0ffee02-2026-4imd-8cc1-000000000002',
      metadata: { trackCode: 'IMTC', score: 76, grade: 'B+' },
    },
  ];
  for (const c of certDefs) {
    if (!c.moduleId) continue;
    await prisma.certificate.upsert({
      where: { verificationId: c.verificationId },
      update: { status: 'VALID', title: c.title },
      create: {
        userId: c.userId,
        moduleId: c.moduleId,
        title: c.title,
        issuedAt: c.issuedAt,
        verificationId: c.verificationId,
        status: 'VALID',
        metadata: c.metadata,
      },
    });
  }
  void drstcM1;

  // ---------------------------------------------------------------- 10. Trainer allocation + matcher run
  console.log('→ 55/30/15 matcher run + allocations');
  await prisma.trainerCohort.upsert({
    where: { trainerId_cohortId: { trainerId: trainerUser.id, cohortId: cohort.id } },
    update: {
      matchScore: 87.4,
      skillOverlapPct: 92,
      ratingScore: 94,
      experienceScore: 70,
      componentScores: { skill: 50.6, rating: 28.2, experience: 8.6, weights: { skill: 55, rating: 30, experience: 15 } },
      recommendationBadge: 'BEST_MATCH',
      bestMatchedDomains: ['NWP', 'HPC'],
      gapAreas: ['COMMS mentoring capacity limited'],
      constraintViolations: [],
      override: false,
    },
    create: {
      trainerId: trainerUser.id,
      cohortId: cohort.id,
      matchScore: 87.4,
      skillOverlapPct: 92,
      ratingScore: 94,
      experienceScore: 70,
      componentScores: { skill: 50.6, rating: 28.2, experience: 8.6, weights: { skill: 55, rating: 30, experience: 15 } },
      recommendationBadge: 'BEST_MATCH',
      bestMatchedDomains: ['NWP', 'HPC'],
      gapAreas: ['COMMS mentoring capacity limited'],
      constraintViolations: [],
      override: false,
    },
  });
  const matcherFound = await prisma.matcherRun.findFirst({
    where: { cohortId: cohort.id, createdById: portalAdmin.id, historicalBatch: null },
  });
  if (!matcherFound) {
    await prisma.matcherRun.create({
      data: {
        cohortId: cohort.id,
        createdById: portalAdmin.id,
        weights: { skill: 55, rating: 30, experience: 15 },
        constraints: { maxTrainees: 25, avoidConsecutive: true, regionPref: 'ANY', excludeOnLeave: true },
        results: [
          { rank: 1, trainer: 'Prof. Vikramaditya Sen', skillOverlapPct: 92, rating: 4.7, cohortsDelivered: 14, composite: 87.4, badge: 'BEST_MATCH' },
          { rank: 2, trainer: 'Senior Faculty Lead', skillOverlapPct: 78, rating: 4.2, cohortsDelivered: 8, composite: 74.1, badge: 'GOOD_FIT' },
          { rank: 3, trainer: 'Dr. Meera Iyer', skillOverlapPct: 64, rating: 4.5, cohortsDelivered: 6, composite: 0, badge: 'EXCLUDED', excludedReason: 'ON_LEAVE' },
        ],
        notes: 'Default 55/30/15 policy weights; on-leave trainer auto-excluded.',
      },
    });
  }

  // ---------------------------------------------------------------- 11. Exam attempt (clean integrity)
  console.log('→ Proctored exam attempt (clean) + integrity events');
  if (assessment) {
    const attemptFound = await prisma.examAttempt.findFirst({
      where: { userId: traineeUser.id, assessmentId: assessment.id, seed: 'seed-demo-v1' },
    });
    let attemptId = attemptFound ? attemptFound.id : null;
    if (!attemptFound) {
      const created = await prisma.examAttempt.create({
        data: {
          userId: traineeUser.id,
          assessmentId: assessment.id,
          seed: 'seed-demo-v1',
          questionOrder: [],
          answers: {},
          score: 4.0,
          percentage: 80,
          submittedAt: new Date('2026-08-25T11:20:00Z'),
          timeSpentSeconds: 1140,
          status: 'GRADED',
          verdict: 'VALID',
          integrityFlag: 'CLEAN',
          riskScore: 4,
          warningCount: 0,
          identityConfirmed: true,
        },
      });
      attemptId = created.id;
    }
    if (attemptId) {
      const evCount = await prisma.integrityEvent.count({ where: { attemptId } });
      if (evCount === 0) {
        await prisma.integrityEvent.createMany({
          data: [
            { attemptId, type: 'EXAM_START', timestamp: new Date('2026-08-25T11:01:00Z'), metadata: { camera: true, fullscreen: true, networkMbps: 42 } },
            { attemptId, type: 'EXAM_SUBMIT', timestamp: new Date('2026-08-25T11:20:00Z'), metadata: { auto: false } },
          ],
        });
      }
    }
  }

  // ---------------------------------------------------------------- 12. Audit log
  console.log('→ Audit log (append-only demo entries)');
  const auditDefs: Array<{ action: string; entityType: string; entityId: string; diff?: object; metadata?: object }> = [
    { action: 'USER_APPROVED', entityType: 'User', entityId: traineeUser.email, diff: { before: { status: 'PENDING' }, after: { status: 'APPROVED' } } },
    { action: 'CERT_ISSUED', entityType: 'Certificate', entityId: 'c0ffee01-2026-4imd-8cc1-000000000001', diff: { after: { module: 'IMTC-M01', score: 82 } } },
    { action: 'EXAM_PUBLISHED', entityType: 'Assessment', entityId: 'DRSTC: Earth-System Modelling & HPC Certification Exam' },
    { action: 'MATCHER_RUN', entityType: 'MatcherRun', entityId: 'DRSTC-04', metadata: { weights: { skill: 55, rating: 30, experience: 15 } } },
    { action: 'OVERRIDE_CREATED', entityType: 'TrainerCohort', entityId: 'DRSTC-04', diff: { after: { justification: 'Demo override record: regional language support requirement.' } } },
    { action: 'ROLE_CHANGED', entityType: 'User', entityId: 'kavya.reddy@imd.gov.in', diff: { before: { role: 'TRAINEE' }, after: { role: 'TRAINER' } } },
  ];
  for (const a of auditDefs) {
    const found = await prisma.auditLog.findFirst({
      where: { actorId: portalAdmin.id, action: a.action, entityType: a.entityType, entityId: a.entityId },
    });
    if (!found) {
      await prisma.auditLog.create({
        data: {
          actorId: portalAdmin.id,
          actorRole: 'ADMIN',
          action: a.action,
          entityType: a.entityType,
          entityId: a.entityId,
          ipAddress: '10.0.0.8',
          diff: a.diff ?? {},
          metadata: a.metadata ?? {},
        },
      });
    }
  }

  // ---------------------------------------------------------------- 13. Notifications + prefs + calendar
  console.log('→ Notifications, preferences, calendar events');
  const notifDefs: Array<{
    userId: string;
    type: 'CERTIFICATE_ISSUED' | 'EXAM_OPENED' | 'REMEDIATION_RECEIVED' | 'COHORT_ASSIGNED' | 'SLA_BREACH';
    title: string;
    body: string;
    link?: string;
  }> = [
    {
      userId: traineeUser.id,
      type: 'CERTIFICATE_ISSUED',
      title: 'Certificate issued: Synoptic Chart Analysis Fundamentals',
      body: 'Your IMTC-M01 certificate is ready. Verification ID c0ffee01-2026-4imd-8cc1-000000000001.',
      link: '/verify/c0ffee01-2026-4imd-8cc1-000000000001',
    },
    {
      userId: traineeUser.id,
      type: 'EXAM_OPENED',
      title: 'Exam window opened: DRSTC Earth-System Modelling',
      body: 'Window: Sept 15, 04:00–12:00 UTC. Complete the identity check and system check before starting.',
      link: '/dashboard/trainee',
    },
    {
      userId: priyaTrainee.id,
      type: 'REMEDIATION_RECEIVED',
      title: 'Remediation pack received: Radar nowcasting booster',
      body: 'Prof. Sen assigned 2 micro-lessons ahead of the Sept 15 exam window.',
      link: '/dashboard/trainee',
    },
    {
      userId: trainerUser.id,
      type: 'COHORT_ASSIGNED',
      title: 'Cohort assigned: DRSTC-04',
      body: 'You are allocated to DRSTC 2026 Batch-IV with match score 87.4 (BEST_MATCH).',
      link: '/dashboard/trainer',
    },
    {
      userId: portalAdmin.id,
      type: 'SLA_BREACH',
      title: 'Approval SLA watch: 2 registrations pending',
      body: 'Rohan Verma (trainee) and Dr. Kavya Reddy (trainer) await review.',
      link: '/dashboard/admin',
    },
  ];
  for (const n of notifDefs) {
    const found = await prisma.notification.findFirst({ where: { userId: n.userId, title: n.title } });
    if (!found) {
      await prisma.notification.create({
        data: { userId: n.userId, type: n.type, title: n.title, body: n.body, link: n.link ?? null },
      });
    }
  }
  await prisma.notificationPreference.upsert({
    where: { userId: traineeUser.id },
    update: {},
    create: {
      userId: traineeUser.id,
      emailEnabled: { CERTIFICATE_ISSUED: true, EXAM_OPENED: true, DEADLINE_REMINDER: true },
      inAppEnabled: { CERTIFICATE_ISSUED: true, EXAM_OPENED: true, REMEDIATION_RECEIVED: true },
    },
  });
  const calDefs = [
    { userId: traineeUser.id, cohortId: cohort.id, title: 'Live: Dual-Pol QPE walkthrough', type: 'LIVE_SESSION' as const, startsAt: new Date('2026-09-12T10:00:00Z'), endsAt: new Date('2026-09-12T11:30:00Z') },
    { userId: traineeUser.id, cohortId: cohort.id, title: 'Exam: DRSTC Earth-System Modelling', type: 'EXAM_WINDOW' as const, startsAt: new Date('2026-09-15T04:00:00Z'), endsAt: new Date('2026-09-15T12:00:00Z') },
    { userId: traineeUser.id, cohortId: cohort.id, title: 'Due: Basin QPF table', type: 'ASSIGNMENT_DEADLINE' as const, startsAt: new Date('2026-09-18T18:30:00Z'), endsAt: null as Date | null },
  ];
  for (const c of calDefs) {
    const found = await prisma.calendarEvent.findFirst({ where: { userId: c.userId, title: c.title } });
    if (!found) {
      await prisma.calendarEvent.create({
        data: { userId: c.userId, cohortId: c.cohortId, title: c.title, type: c.type, startsAt: c.startsAt, endsAt: c.endsAt },
      });
    }
  }

  // ---------------------------------------------------------------- 14. Radar cases
  console.log('→ Radar training cases (Phailin, Delhi squall, Mumbai rain)');
  const cases: Array<{
    code: string;
    title: string;
    description: string;
    phenomenon: string;
    timesteps: object[];
    questions: object[];
  }> = [
    {
      code: 'PHAILIN-2013',
      title: 'Cyclone Phailin Landfall (Oct 2013)',
      description:
        'Very severe cyclonic storm crossing near Gopalpur, Odisha. Trainees replay spiral-band evolution and eye formation, then answer guided MCQs at key timesteps.',
      phenomenon: 'CYCLONE',
      timesteps: [
        { t: 0, label: 'T-12h: outer bands over coastal Odisha', note: 'Z 35–45 dBZ in outer bands; eye wall open to the south' },
        { t: 1, label: 'T-6h: eye contracting to ~28 km', note: 'Symmetric eyewall Z > 50 dBZ; storm-surge guidance raised' },
        { t: 2, label: 'T-0h: landfall near Gopalpur', note: 'Peak winds 200–210 kmph; heaviest swath south of centre' },
        { t: 3, label: 'T+6h: inland decay, heavy rain over Chhattisgarh', note: 'Eyewall collapses; stratiform shield expands' },
      ],
      questions: [
        {
          atStep: 1,
          prompt: 'What feature visible at T-6h signals imminent peak intensity?',
          options: ['Contracting symmetric eyewall with Z > 50 dBZ', 'Bright band at 4 km', 'Ground clutter near the site', 'Velocity dealiasing failure'],
          answer: 0,
          explanation: 'A contracting, symmetric eyewall with high reflectivity is the classic peak-intensity signature.',
        },
        {
          atStep: 2,
          prompt: 'Where does the heaviest rainfall swath sit relative to the centre at landfall?',
          options: ['South of centre', 'North of centre', 'Exactly at the eye', 'Over the sea only'],
          answer: 0,
          explanation: 'In Bay cyclones the heaviest swath is typically south/southwest of the centre with onshore flow.',
        },
      ],
    },
    {
      code: 'DELHI-SQUALL-2023',
      title: 'Delhi Pre-Monsoon Squall (May 2023)',
      description:
        'Severe squall line with 90+ kmph gusts over NCR. Focus: gust-front identification, velocity couplet reading and nowcast lead time.',
      phenomenon: 'SQUALL',
      timesteps: [
        { t: 0, label: 'T-90m: isolated cells over Haryana', note: 'ZDR columns mark growing updrafts' },
        { t: 1, label: 'T-45m: line organisation with gust front', note: 'Thin line of 10–15 dBZ ahead of the cores' },
        { t: 2, label: 'T-0m: squall hits Palam, gust 96 kmph', note: 'Rear-inflow notch visible; velocity couplet tightens' },
      ],
      questions: [
        {
          atStep: 1,
          prompt: 'What is the thin 10–15 dBZ line ahead of the cores?',
          options: ['Gust front (outflow boundary)', 'Bright band', 'Second-trip echo', 'Sun spike'],
          answer: 0,
          explanation: 'The fine line is lofted dust/insects along the gust front — the nowcast trigger for squall warnings.',
        },
      ],
    },
    {
      code: 'MUMBAI-RAIN-2022',
      title: 'Mumbai Extreme Rain Episode (Jul 2022)',
      description:
        'Offshore trough + mid-tropospheric cyclone dumping 250+ mm in 24 h. Focus: QPE underestimation in orographic enhancement and impact messaging.',
      phenomenon: 'EXTREME_RAIN',
      timesteps: [
        { t: 0, label: 'Day 1 00Z: offshore trough deepens', note: 'Widespread 25–35 dBZ stratiform with embedded 45 dBZ cores' },
        { t: 1, label: 'Day 1 12Z: orographic enhancement along the Ghats', note: 'KDP cores > 3°/km; QPE–gauge gap widens' },
        { t: 2, label: 'Day 2 00Z: red warning, local train halt advisory', note: 'Impact table escalates to red for low-lying districts' },
      ],
      questions: [
        {
          atStep: 1,
          prompt: 'Why does R(Z) underestimate rain in this episode?',
          options: ['Orographic drop-size shift plus partial beam blockage', 'Hail contamination', 'Clear-air Bragg scatter', 'Sun interference'],
          answer: 0,
          explanation: 'Ghats orography shifts drop spectra and blocks the beam; R(KDP)-blended relations with gauge adjustment close the gap.',
        },
      ],
    },
  ];
  for (const rc of cases) {
    await prisma.radarCase.upsert({
      where: { code: rc.code },
      update: { title: rc.title, description: rc.description, phenomenon: rc.phenomenon, timesteps: rc.timesteps, questions: rc.questions, competencyTag: 'RAD-NOWCAST', isPublished: true },
      create: {
        code: rc.code,
        title: rc.title,
        description: rc.description,
        phenomenon: rc.phenomenon,
        timesteps: rc.timesteps,
        questions: rc.questions,
        competencyTag: 'RAD-NOWCAST',
        isPublished: true,
      },
    });
  }

  // ---------------------------------------------------------------- 15. RAG documents
  console.log('→ RAG knowledge base documents');
  const docs: Array<{ source: string; section: string; content: string }> = [
    {
      source: 'lesson:DRSTC-M01-L01',
      section: 'Governing equations',
      content:
        'DRSTC-M01-L01: Explicit advection schemes are stable only under the CFL condition C = u·Δt/Δx ≤ C_max (≈1). Halving grid spacing requires halving the time step; 3D cost grows ~8×. MPI domain decomposition with halo exchange carries operational NWP scaling on Pratyush.',
    },
    {
      source: 'lesson:DRSTC-M03-L01',
      section: 'Velocity dealiasing',
      content:
        'DRSTC-M03-L01: Nyquist velocity V_n = PRF·λ/4. Returns beyond ±V_n fold and must be unfolded using spatial continuity anchored on the environmental wind profile and the zero-isodop. Dual-PRF extends V_n at the cost of range.',
    },
    {
      source: 'rubric:WMO-1205-III',
      section: 'Radar competency rubric',
      content:
        'WMO-No.1205 §III rubric: trainees must interpret Z/ZDR/KDP/CC, diagnose velocity folding, classify hydrometeors and issue 0–6 h nowcasts. Passing threshold for IMTC certification is 70% overall with no domain below 50%.',
    },
    {
      source: 'faq:certification',
      section: 'Passing thresholds',
      content:
        'FAQ: IMTC certification requires 70% overall. DRSTC certification exams allow 3 attempts; the highest score counts. Certificates carry a QR code linking to /verify/[certId]; revoked certificates show status REVOKED.',
    },
    {
      source: 'policy:attendance',
      section: 'Attendance policy',
      content:
        'Policy: trainees must maintain 75% attendance in cohort live sessions. Below 75% triggers a risk flag reviewed by the trainer; below 60% blocks exam-window eligibility pending trainer waiver.',
    },
    {
      source: 'policy:proctoring',
      section: 'Proctoring policy',
      content:
        'Policy: proctored exams run fullscreen with 3 fullscreen-exit warnings before auto-submit. Tab blur, copy/paste attempts and suspected DevTools use are logged as integrity events. Risk ≥ 70 flags the attempt for REVIEW.',
    },
    {
      source: 'station:DEL',
      section: 'Station brief',
      content:
        'Station brief DEL (Delhi Lodhi Road): S-band DWR, readiness 88%, cadre 42, top gap RAD-NOWCAST. Cohort DRSTC-04 is hosted here (Jul–Dec 2026).',
    },
  ];
  for (const d of docs) {
    const found = await prisma.document.findFirst({ where: { source: d.source, section: d.section } });
    if (found) {
      await prisma.document.update({ where: { id: found.id }, data: { content: d.content } });
    } else {
      await prisma.document.create({ data: { source: d.source, section: d.section, content: d.content } });
    }
  }

  // ---------------------------------------------------------------- 16. Bulk job sample
  console.log('→ Bulk import job sample');
  const jobFound = await prisma.bulkImportJob.findFirst({
    where: { createdById: portalAdmin.id, fileName: 'officer-roster-jul-2026.csv' },
  });
  if (!jobFound) {
    await prisma.bulkImportJob.create({
      data: {
        type: 'OFFICER_ROSTER',
        status: 'DONE',
        fileName: 'officer-roster-jul-2026.csv',
        totalRows: 120,
        successRows: 117,
        failedRows: 3,
        errors: [
          { row: 44, field: 'email', message: 'Duplicate of existing user' },
          { row: 87, field: 'cadre', message: 'Unknown cadre code' },
          { row: 102, field: 'stationCode', message: 'Unknown station code XXX' },
        ],
        createdById: portalAdmin.id,
      },
    });
  }

  console.log('Seeding completed successfully.');
  const counts = {
    stations: await prisma.station.count(),
    tracks: await prisma.trainingTrack.count(),
    modules: await prisma.trainingModule.count(),
    lessons: await prisma.lesson.count(),
    users: await prisma.user.count(),
    cohorts: await prisma.cohort.count(),
    questions: await prisma.question.count(),
    certificates: await prisma.certificate.count(),
    audit: await prisma.auditLog.count(),
    notifications: await prisma.notification.count(),
    radarCases: await prisma.radarCase.count(),
    documents: await prisma.document.count(),
  };
  console.log('Counts:', JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
