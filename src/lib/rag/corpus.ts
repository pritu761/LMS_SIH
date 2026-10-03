// ============================================================================
// Static knowledge corpus (Phase 3.1A): FAQs + policy documents that rarely
// change. Versioned here in code (CORPUS_VERSION) so re-indexing picks up
// edits; lesson/rubric/station content is indexed from the DB instead.
// Audience gates retrieval: ALL vs TRAINER/ADMIN-only material.
// ============================================================================

export const CORPUS_VERSION = '2026-09-v1';

export type CorpusAudience = 'ALL' | 'STAFF';

export interface CorpusDoc {
  source: string;
  section: string;
  audience: CorpusAudience;
  content: string;
}

export const STATIC_CORPUS: CorpusDoc[] = [
  {
    source: 'faq:certification',
    section: 'Passing thresholds',
    audience: 'ALL',
    content:
      'IMTC certification requires 70% overall with no competency domain below 50%. DRSTC certification exams allow 3 attempts and the highest score counts. Every certificate carries a QR code linking to /verify/[certId]; revoked certificates display status REVOKED and must not be accepted.',
  },
  {
    source: 'faq:enrollment',
    section: 'How to start a track',
    audience: 'ALL',
    content:
      'Browse the public catalog at /catalog without login. Each track page lists modules, learning outcomes, WMO tags and one free sample lesson. Choose "Enroll / Login to Start" to register; an administrator approves the account (usually within 48 hours) before learning unlocks.',
  },
  {
    source: 'faq:verification',
    section: 'Verifying a certificate',
    audience: 'ALL',
    content:
      'Anyone can verify a credential at /verify/[certId] with no login: the page shows holder name, module, issue date and status VALID, REVOKED or EXPIRED. Verification IDs are unguessable UUIDs printed on the certificate PDF.',
  },
  {
    source: 'faq:exams',
    section: 'Proctored exam rules',
    audience: 'ALL',
    content:
      'Proctored exams run fullscreen with identity confirmation. Leaving fullscreen counts as a warning; 3 warnings auto-submit the attempt. Copy, paste and right-click are blocked and logged. Tab blur, suspected devtools use and camera-feed loss raise the integrity risk score; attempts at 70+ are flagged for review. Short-answer items are trainer-graded; objective items score instantly.',
  },
  {
    source: 'policy:attendance',
    section: 'Attendance policy',
    audience: 'ALL',
    content:
      'Trainees must maintain 75% attendance in cohort live sessions. Below 75% triggers a trainer-reviewed risk flag; below 60% blocks exam-window eligibility pending a trainer waiver. Absences are marked per session as present, absent, late or excused.',
  },
  {
    source: 'policy:proctoring',
    section: 'Proctoring policy',
    audience: 'ALL',
    content:
      'Risk model: fullscreen exit +25, copy/paste +15, devtools suspected +20, tab blur +8, camera-feed loss +12. Flags: below 30 CLEAN, 30–69 REVIEW, 70+ FLAGGED. Admins mark attempts VALID, INVALID or ESCALATED; every verdict is written to the append-only audit log.',
  },
  {
    source: 'policy:remediation',
    section: 'Remediation packs',
    audience: 'ALL',
    content:
      'Trainers may send remediation packs of micro-lessons to selected trainees. Packs arrive as in-app notifications and appear as tasks; completion is tracked per trainee.',
  },
  {
    source: 'rubric:WMO-1205-III',
    section: 'Radar competency rubric',
    audience: 'ALL',
    content:
      'WMO-No.1205 section III rubric: trainees must interpret Z, ZDR, KDP and CC, diagnose velocity folding, classify hydrometeors and issue 0–6 hour nowcasts. A ZDR column above the freezing level marks a strong updraft; KDP cores show heavy rain mass; hail shows high Z with near-zero ZDR and low CC.',
  },
  {
    source: 'rubric:WMO-1205-IV',
    section: 'NWP competency rubric',
    audience: 'ALL',
    content:
      'WMO-No.1205 section IV rubric: trainees must use deterministic and ensemble NWP guidance, state the CFL stability condition for explicit schemes (C = u·dt/dx ≤ ~1), and read spread–skill and rank histograms. U-shaped rank histograms mean an under-dispersive, overconfident ensemble.',
  },
  {
    source: 'policy:bulk-ops',
    section: 'Bulk imports (admin)',
    audience: 'STAFF',
    content:
      'Admins import officer rosters, station data and batch assignments via CSV: download the template, upload for row-level validation, review the preview, then confirm. Jobs report Queued, Processing, Done, Failed or Partial; failed rows download as an error CSV. Roster imports create pending accounts with temporary passwords and invites.',
  },
  {
    source: 'policy:matcher',
    section: '55/30/15 matcher policy (admin)',
    audience: 'STAFF',
    content:
      'Trainer allocation blends competency overlap (default 55%), past rating (30%) and cohorts delivered (15%). Sliders are bounded 10–70 and must total 100. The governance band is skill 45–65, rating 20–40, experience 10–25; out-of-band runs need super-admin PIN confirmation. Overrides require mandatory justification and are audit-logged.',
  },
  {
    source: 'faq:demo',
    section: 'Demo mode',
    audience: 'ALL',
    content:
      'The /demo pages (trainee, trainer, admin) run entirely on fictional mock data with no login and no database access. They preview dashboard layouts only; real data appears after sign-in.',
  },
];
