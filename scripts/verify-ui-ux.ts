#!/usr/bin/env tsx

/**
 * ============================================================================
 * CAPACITYCONNECT UI/UX, DESIGN SYSTEM & CONTRAST E2E VERIFICATION SUITE
 * ============================================================================
 *
 * Programmatically audits and verifies all 5 acceptance tiers from:
 * - ORIGINAL_REQUEST.md (Follow-up — 2026-09-03T17:04:20Z)
 * - PROJECT.md (CapacityConnect Sovereign UI/UX & Design System Overhaul)
 *
 * Tiers:
 * 1. Tier 1: Sovereign Typography & Font Hierarchy (R1)
 * 2. Tier 2: Responsive Navbar Architecture & Dynamic Clearance (R2)
 * 3. Tier 3: Rogue Palette Elimination (#e0234e, #ff4d6d) (R3)
 * 4. Tier 4: Dark Mode Contrast & WCAG AA Compliance (R4)
 * 5. Tier 5: Layout Rhythm & Spacing Standardization (R5)
 *
 * Run:
 *   npx tsx scripts/verify-ui-ux.ts
 *   npm run verify:ui
 *
 * Options:
 *   --tier=<1..5>       Run only tests in the specified tier
 *   --allow-failure     Exit with status 0 even if some tests fail (for pre-milestone scans)
 *   --summary           Output summary table only
 *   --json              Output results as JSON
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ----------------------------------------------------------------------------
// Types & Data Structures
// ----------------------------------------------------------------------------

export type TierNumber = 1 | 2 | 3 | 4 | 5;

export interface TestResult {
  passed: boolean;
  message: string;
  details?: string[];
  diagnostics?: string[];
  durationMs?: number;
}

export interface TestCase {
  id: string;
  tier: TierNumber;
  name: string;
  category: string;
  requirement: string;
  run: () => Promise<TestResult> | TestResult;
}

export interface VerificationReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  passRate: number;
  durationMs: number;
  tierSummaries: Record<TierNumber, { total: number; passed: number; failed: number }>;
  results: Array<{
    id: string;
    tier: TierNumber;
    name: string;
    category: string;
    requirement: string;
    passed: boolean;
    message: string;
    details?: string[];
    diagnostics?: string[];
    durationMs: number;
  }>;
}

// ----------------------------------------------------------------------------
// Utilities
// ----------------------------------------------------------------------------

function readFile(relativePath: string): string {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function getFilesRecursively(dir: string, extensions: string[]): string[] {
  let results: string[] = [];
  const fullDir = path.isAbsolute(dir) ? dir : path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return results;

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, extensions));
    } else if (entry.isFile()) {
      if (extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function countOccurrences(text: string, regex: RegExp): number {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

// ----------------------------------------------------------------------------
// Test Definitions
// ----------------------------------------------------------------------------

export const testSuite: TestCase[] = [
  // ==========================================================================
  // TIER 1: Sovereign Typography & Font Hierarchy (R1)
  // ==========================================================================
  {
    id: 'T1.1',
    tier: 1,
    category: 'Typography',
    name: 'Selection Highlight Harmonization (globals.css)',
    requirement: 'R1: Text selection in globals.css must use sovereign navy (#0b1e36) and warm gold (#c59b48) with zero rogue magenta (#E0234E / #e0234e).',
    run: () => {
      const content = readFile('src/app/globals.css');
      const issues: string[] = [];

      // Check selection highlight does NOT have #E0234E
      const hasRogueSelection = /selection:bg-\[#e0234e\]/i.test(content);
      if (hasRogueSelection) {
        issues.push('Found legacy selection:bg-[#E0234E] in globals.css.');
      }

      // Check selection highlight contains #0b1e36 and #c59b48
      const hasNavySelection = /selection:bg-\[#0b1e36\]/i.test(content) || /selection:text-\[#0b1e36\]/i.test(content);
      const hasGoldSelection = /selection:text-\[#c59b48\]/i.test(content) || /selection:bg-\[#c59b48\]/i.test(content);

      if (!hasNavySelection) {
        issues.push('Selection highlight is missing sovereign navy (#0b1e36).');
      }
      if (!hasGoldSelection) {
        issues.push('Selection highlight is missing warm celestial gold (#c59b48).');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'globals.css selection highlight correctly utilizes sovereign navy (#0b1e36) and warm gold (#c59b48) with zero magenta.'
          : 'Selection highlight does not meet Sovereign Mausam specification.',
        details: issues,
        diagnostics: passed ? undefined : [
          'Required in src/app/globals.css body rule:',
          '  selection:bg-[#0b1e36] selection:text-[#c59b48] dark:selection:bg-[#c59b48] dark:selection:text-[#0b1e36]'
        ]
      };
    }
  },
  {
    id: 'T1.2',
    tier: 1,
    category: 'Typography',
    name: 'Navbar Navigation Links Typography (font-sans)',
    requirement: 'R1: Navbar desktop navigation links must use font-sans (Plus Jakarta Sans) instead of font-mono.',
    run: () => {
      const content = readFile('src/components/layout/Navbar.tsx');
      const issues: string[] = [];

      // Extract navLinkClass definition
      const navLinkMatch = content.match(/const\s+navLinkClass\s*=\s*[\s\S]*?return\s+`([\s\S]*?)`;/);
      if (!navLinkMatch) {
        issues.push('Could not locate navLinkClass helper in Navbar.tsx.');
      } else {
        const linkClassStr = navLinkMatch[1];
        if (linkClassStr.includes('font-mono')) {
          issues.push('navLinkClass helper explicitly includes "font-mono" instead of "font-sans".');
        }
        if (!linkClassStr.includes('font-sans')) {
          issues.push('navLinkClass helper does not include "font-sans".');
        }
      }

      // Check desktop nav container (<nav ...>)
      const navTagMatch = content.match(/<nav\s+className="([^"]+)"/);
      if (navTagMatch && navTagMatch[1].includes('font-mono')) {
        issues.push('Desktop <nav> container has font-mono class.');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Navbar navigation links strictly use proportional font-sans (Plus Jakarta Sans).'
          : 'Navbar navigation links still contain inappropriate font-mono styling.',
        details: issues,
        diagnostics: passed ? undefined : [
          'Refactor navLinkClass in Navbar.tsx to:',
          '  px-2 xl:px-2.5 py-1 rounded-full text-[11px] xl:text-xs font-semibold font-sans tracking-tight'
        ]
      };
    }
  },
  {
    id: 'T1.3',
    tier: 1,
    category: 'Typography',
    name: 'Navbar Mobile Drawer & Header Chrome Typography',
    requirement: 'R1: Mobile navigation drawer, role switcher headers, and chrome badges in Navbar.tsx must not use font-mono.',
    run: () => {
      const content = readFile('src/components/layout/Navbar.tsx');
      const issues: string[] = [];

      // Check mobile drawer wrapper (around line 340)
      const mobileDrawerMatch = content.match(/<motion\.div[^>]*className="[^"]*(xl|lg):hidden[^"]*"/);
      if (mobileDrawerMatch && mobileDrawerMatch[0].includes('font-mono')) {
        issues.push('Mobile navigation drawer container contains "font-mono".');
      }

      // Check role switcher dropdown header
      if (content.includes('Switch Role / Persona') && /Switch Role \/ Persona[\s\S]*?font-mono/.test(content)) {
        // More precise check
        const roleDropdownHeader = content.match(/<div[^>]*font-mono[^>]*>\s*Switch Role \/ Persona/);
        if (roleDropdownHeader) {
          issues.push('Role switcher dropdown header "Switch Role / Persona" contains "font-mono".');
        }
      }

      // Check sign out button
      const signoutMatch = content.match(/Sign Out[\s\S]*?font-mono/) || content.match(/<button[^>]*font-mono[^>]*>[\s\S]*?Sign Out/);
      if (signoutMatch) {
        issues.push('Sign Out button contains "font-mono".');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Navbar mobile drawer and header chrome correctly use font-sans without font-mono.'
          : 'Navbar mobile drawer or header chrome still contains font-mono styling.',
        details: issues
      };
    }
  },
  {
    id: 'T1.4',
    tier: 1,
    category: 'Typography',
    name: 'Preservation of Monospace for Telemetry & Coordinates',
    requirement: 'R1: Weather telemetry, numerical metrics, and radar coordinates in WeatherMetricsHud.tsx, WeatherSearchBar.tsx, and HourlyNowcastStrip.tsx must retain JetBrains Mono (font-mono).',
    run: () => {
      const hudContent = readFile('src/components/radar/WeatherMetricsHud.tsx');
      const searchContent = readFile('src/components/radar/WeatherSearchBar.tsx');
      const stripContent = readFile('src/components/radar/HourlyNowcastStrip.tsx');
      const issues: string[] = [];

      const hudMonoCount = countOccurrences(hudContent, /\bfont-mono\b/g);
      if (hudMonoCount < 8) {
        issues.push(`WeatherMetricsHud.tsx has only ${hudMonoCount} font-mono occurrences (expected >= 8 for telemetry readouts).`);
      }

      const searchMonoCount = countOccurrences(searchContent, /\bfont-mono\b/g);
      if (searchMonoCount < 1) {
        issues.push('WeatherSearchBar.tsx does not contain font-mono for coordinate displays.');
      }

      const stripMonoCount = countOccurrences(stripContent, /\bfont-mono\b/g);
      if (stripMonoCount < 4) {
        issues.push(`HourlyNowcastStrip.tsx has only ${stripMonoCount} font-mono occurrences (expected >= 4 for hourly weather metrics).`);
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? `Legitimate telemetry monospace preserved (WeatherMetricsHud: ${hudMonoCount}, WeatherSearchBar: ${searchMonoCount}, HourlyNowcastStrip: ${stripMonoCount}).`
          : 'Monospace telemetry readouts were inappropriately altered or removed.',
        details: issues
      };
    }
  },
  {
    id: 'T1.5',
    tier: 1,
    category: 'Typography',
    name: 'Global Font Token Architecture (layout.tsx & tailwind.config.js)',
    requirement: 'R1: Application must import and map Plus Jakarta Sans (--font-sans), Outfit (--font-display), and JetBrains Mono (--font-mono).',
    run: () => {
      const layoutContent = readFile('src/app/layout.tsx');
      const tailwindContent = readFile('tailwind.config.js');
      const issues: string[] = [];

      // Check layout.tsx imports & variables
      if (!layoutContent.includes('Plus_Jakarta_Sans') || !layoutContent.includes('--font-sans')) {
        issues.push('layout.tsx is missing Plus_Jakarta_Sans (--font-sans) binding.');
      }
      if (!layoutContent.includes('Outfit') || !layoutContent.includes('--font-display')) {
        issues.push('layout.tsx is missing Outfit (--font-display) binding.');
      }
      if (!layoutContent.includes('JetBrains_Mono') || !layoutContent.includes('--font-mono')) {
        issues.push('layout.tsx is missing JetBrains_Mono (--font-mono) binding.');
      }

      // Check tailwind.config.js
      if (!tailwindContent.includes("'var(--font-sans)'")) {
        issues.push('tailwind.config.js fontFamily.sans is not mapped to var(--font-sans).');
      }
      if (!tailwindContent.includes("'var(--font-display)'")) {
        issues.push('tailwind.config.js fontFamily.display is not mapped to var(--font-display).');
      }
      if (!tailwindContent.includes("'var(--font-mono)'")) {
        issues.push('tailwind.config.js fontFamily.mono is not mapped to var(--font-mono).');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Global font tokens and CSS variables are properly imported, mapped, and configured.'
          : 'Global font token architecture is misconfigured.',
        details: issues
      };
    }
  },

  // ==========================================================================
  // TIER 2: Responsive Navbar Architecture & Dynamic Clearance (R2)
  // ==========================================================================
  {
    id: 'T2.1',
    tier: 2,
    category: 'Navbar Architecture',
    name: 'Desktop Navbar Breakpoint Expansion to lg (1024px+)',
    requirement: 'R2: Desktop navigation must remain expanded on viewports from 1024px (lg) upwards, eliminating premature collapse at xl.',
    run: () => {
      const content = readFile('src/components/layout/Navbar.tsx');
      const issues: string[] = [];

      // Check desktop nav container
      const hasLgNav = /<nav\s+className="[^"]*?(hidden\s+lg:flex|lg:flex)[^"]*?"/.test(content);
      const hasXlNav = /<nav\s+className="[^"]*?hidden\s+xl:flex[^"]*?"/.test(content);

      if (hasXlNav) {
        issues.push('Desktop <nav> is still configured as "hidden xl:flex", collapsing prematurely below 1280px.');
      }
      if (!hasLgNav) {
        issues.push('Desktop <nav> is not configured with "hidden lg:flex" or "lg:flex" for 1024px+ viewports.');
      }

      // Check mobile toggle button
      const hasXlMobileBtn = /className="[^"]*?xl:hidden[^"]*?"[^>]*?onClick=\{\(\)\s*=>\s*setIsMobileMenuOpen/.test(content) ||
                             /onClick=\{\(\)\s*=>\s*setIsMobileMenuOpen[^>]*?className="[^"]*?xl:hidden[^"]*?"/.test(content);
      if (hasXlMobileBtn) {
        issues.push('Mobile menu toggle button is configured with "xl:hidden" instead of "lg:hidden".');
      }

      // Check mobile drawer
      const hasXlDrawer = /className="[^"]*?xl:hidden[^"]*?"[^>]*?max-w-7xl[^>]*?rounded-2xl/.test(content) ||
                          content.includes('pointer-events-auto xl:hidden');
      if (hasXlDrawer) {
        issues.push('Mobile navigation drawer container uses "xl:hidden" instead of "lg:hidden".');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Desktop navbar successfully expanded to lg (1024px+) with responsive density tuning.'
          : 'Desktop navbar still collapses prematurely at xl (1280px).',
        details: issues,
        diagnostics: passed ? undefined : [
          'In src/components/layout/Navbar.tsx:',
          '  1. Replace "hidden xl:flex" with "hidden lg:flex" on <nav>',
          '  2. Replace "xl:hidden" with "lg:hidden" on mobile hamburger button',
          '  3. Replace "xl:hidden" with "lg:hidden" on mobile drawer <motion.div>'
        ]
      };
    }
  },
  {
    id: 'T2.2',
    tier: 2,
    category: 'Navbar Architecture',
    name: 'Persona / Role Switcher Contrast Compliance in Dark Mode',
    requirement: 'R2: Persona/Role switcher dropdown items must not use un-overridden text-[#0b1e36] against dark navy background in dark mode.',
    run: () => {
      const content = readFile('src/components/layout/Navbar.tsx');
      const issues: string[] = [];

      // Extract roleEntries definition
      const roleEntriesMatch = content.match(/const\s+roleEntries\s*=\s*\[([\s\S]*?)\];/);
      if (!roleEntriesMatch) {
        issues.push('Could not locate roleEntries array in Navbar.tsx.');
      } else {
        const entriesStr = roleEntriesMatch[1];

        // Check ADMIN and TRAINEE iconBg
        // Look for text-[#0b1e36] without dark:text-
        const adminEntry = entriesStr.match(/role:\s*['"]ADMIN['"][\s\S]*?iconBg:\s*['"]([^'"]+)['"]/);
        if (adminEntry) {
          const iconBg = adminEntry[1];
          if (iconBg.includes('text-[#0b1e36]') && !iconBg.includes('dark:text-')) {
            issues.push('ADMIN role iconBg has hardcoded text-[#0b1e36] without dark:text- override.');
          }
        }

        const traineeEntry = entriesStr.match(/role:\s*['"]TRAINEE['"][\s\S]*?iconBg:\s*['"]([^'"]+)['"]/);
        if (traineeEntry) {
          const iconBg = traineeEntry[1];
          if (iconBg.includes('text-[#0b1e36]') && !iconBg.includes('dark:text-')) {
            issues.push('TRAINEE role iconBg has hardcoded text-[#0b1e36] without dark:text- override.');
          }
        }

        // Check hoverText turning text to #0b1e36 in dark mode
        if (/hoverText:\s*['"]group-hover:text-\[#0b1e36\]['"]/.test(entriesStr) && !/dark:group-hover:text-/.test(entriesStr)) {
          issues.push('roleEntries hoverText flips text to #0b1e36 on hover without dark mode variant (causes invisible text).');
        }

        // Check colorClass having dark hover
        if (/colorClass:\s*['"]hover:bg-\[#0b1e36\]\/10['"]/.test(entriesStr) && !/dark:hover:bg-/.test(entriesStr)) {
          issues.push('roleEntries colorClass lacks dark:hover:bg- variant.');
        }
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Persona / Role switcher dropdown icons, hover states, and checkmarks meet dark mode contrast standards.'
          : 'Persona / Role switcher contains dark mode contrast regressions.',
        details: issues,
        diagnostics: passed ? undefined : [
          'In roleEntries in Navbar.tsx for ADMIN & TRAINEE:',
          "  iconBg: 'bg-[#0b1e36]/10 border-[#c59b48]/30 text-[#0b1e36] dark:bg-[#c59b48]/20 dark:border-[#c59b48]/40 dark:text-[#dfb76c]',",
          "  hoverText: 'group-hover:text-[#0b1e36] dark:group-hover:text-white',",
          "  colorClass: 'hover:bg-[#0b1e36]/10 dark:hover:bg-white/10'"
        ]
      };
    }
  },
  {
    id: 'T2.3',
    tier: 2,
    category: 'Navbar Architecture',
    name: 'Dynamic Top Clearance System (globals.css)',
    requirement: 'R2: globals.css must establish a standardized dynamic clearance system with --navbar-height and scroll-padding-top.',
    run: () => {
      const content = readFile('src/app/globals.css');
      const issues: string[] = [];

      // Check --navbar-height
      const hasNavbarHeight = /--navbar-height\s*:\s*[^;]+;/.test(content);
      if (!hasNavbarHeight) {
        issues.push('globals.css is missing --navbar-height CSS variable definition (e.g. 4.25rem).');
      }

      // Check scroll-padding-top
      const hasScrollPadding = /scroll-padding-top\s*:\s*var\(--navbar-height\)/.test(content) ||
                              /scroll-padding-top\s*:\s*[^;]+;/.test(content);
      if (!hasScrollPadding) {
        issues.push('globals.css html selector is missing scroll-padding-top offset for anchor navigation.');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Dynamic navbar clearance system is defined in globals.css (--navbar-height & scroll-padding-top).'
          : 'Dynamic navbar clearance system is missing from globals.css.',
        details: issues,
        diagnostics: passed ? undefined : [
          'In src/app/globals.css:',
          '  :root { --navbar-height: 4.25rem; }',
          '  html { scroll-padding-top: var(--navbar-height); }'
        ]
      };
    }
  },
  {
    id: 'T2.4',
    tier: 2,
    category: 'Navbar Architecture',
    name: 'Landing Page Anchor Scroll Clearance Margins (page.tsx)',
    requirement: 'R2: Section anchor targets in src/app/page.tsx must define scroll-mt-24 so headings do not tuck behind the floating navbar pill.',
    run: () => {
      const content = readFile('src/app/page.tsx');
      const issues: string[] = [];

      const anchorTargets = ['problem', 'cadres', 'competency', 'gap', 'algorithm', 'outcomes'];
      let targetsWithScrollMt = 0;

      for (const target of anchorTargets) {
        // Regex checking for id="<target>" accompanied by scroll-mt-
        const regex = new RegExp(`id=["']${target}["'][^>]*?scroll-mt-\\d+|scroll-mt-\\d+[^>]*?id=["']${target}["']`);
        if (regex.test(content)) {
          targetsWithScrollMt++;
        }
      }

      if (targetsWithScrollMt < 4) {
        issues.push(`Only ${targetsWithScrollMt}/${anchorTargets.length} landing section anchors contain scroll-mt-24 clearance offsets.`);
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? `Landing section anchors contain explicit scroll-mt-24 clearance (${targetsWithScrollMt}/${anchorTargets.length} verified).`
          : 'Landing section anchors lack scroll-mt-24 top clearance offset, causing header clipping on anchor clicks.',
        details: issues,
        diagnostics: passed ? undefined : [
          'Add scroll-mt-24 to anchor section tags in src/app/page.tsx:',
          '  <section id="problem" className="... scroll-mt-24">',
          '  <section id="cadres" className="... scroll-mt-24">',
          '  <section id="algorithm" className="... scroll-mt-24">'
        ]
      };
    }
  },

  // ==========================================================================
  // TIER 3: Rogue Palette Elimination (R3)
  // ==========================================================================
  {
    id: 'T3.1',
    tier: 3,
    category: 'Palette Elimination',
    name: 'Purge of Legacy Magenta #e0234e Across src/',
    requirement: 'R3: Codebase in src/ must contain zero occurrences of rogue magenta #e0234e in .tsx, .ts, or .css files.',
    run: () => {
      const files = getFilesRecursively('src', ['.tsx', '.ts', '.css']);
      const violations: Array<{ file: string; line: number; content: string }> = [];

      for (const file of files) {
        const text = fs.readFileSync(file, 'utf8');
        if (/#e0234e/i.test(text)) {
          const lines = text.split('\n');
          lines.forEach((line, idx) => {
            if (/#e0234e/i.test(line)) {
              violations.push({
                file: path.relative(ROOT, file).replace(/\\/g, '/'),
                line: idx + 1,
                content: line.trim()
              });
            }
          });
        }
      }

      const passed = violations.length === 0;
      return {
        passed,
        message: passed
          ? 'Zero occurrences of legacy magenta #e0234e found across all src/ files.'
          : `Found ${violations.length} occurrences of legacy magenta #e0234e across src/.`,
        details: violations.slice(0, 15).map(v => `${v.file}:${v.line} -> ${v.content}`),
        diagnostics: violations.length > 15
          ? [`... and ${violations.length - 15} more occurrences. Replace with Mission Mausam #0b1e36, #c59b48, or #10b981.`]
          : undefined
      };
    }
  },
  {
    id: 'T3.2',
    tier: 3,
    category: 'Palette Elimination',
    name: 'Purge of Legacy Hot Pink #ff4d6d Across src/',
    requirement: 'R3: Codebase in src/ must contain zero occurrences of rogue pink #ff4d6d in .tsx, .ts, or .css files.',
    run: () => {
      const files = getFilesRecursively('src', ['.tsx', '.ts', '.css']);
      const violations: Array<{ file: string; line: number; content: string }> = [];

      for (const file of files) {
        const text = fs.readFileSync(file, 'utf8');
        if (/#ff4d6d/i.test(text)) {
          const lines = text.split('\n');
          lines.forEach((line, idx) => {
            if (/#ff4d6d/i.test(line)) {
              violations.push({
                file: path.relative(ROOT, file).replace(/\\/g, '/'),
                line: idx + 1,
                content: line.trim()
              });
            }
          });
        }
      }

      const passed = violations.length === 0;
      return {
        passed,
        message: passed
          ? 'Zero occurrences of legacy hot pink #ff4d6d found across all src/ files.'
          : `Found ${violations.length} occurrences of legacy hot pink #ff4d6d across src/.`,
        details: violations.slice(0, 15).map(v => `${v.file}:${v.line} -> ${v.content}`),
        diagnostics: violations.length > 15
          ? [`... and ${violations.length - 15} more occurrences. Replace with Mission Mausam #0b1e36, #c59b48, or #dfb76c.`]
          : undefined
      };
    }
  },
  {
    id: 'T3.3',
    tier: 3,
    category: 'Palette Elimination',
    name: 'Purge of Legacy Aurora Gradients in globals.css',
    requirement: 'R3: Aurora and conic glow styles in globals.css must not use legacy magenta/pink color stops.',
    run: () => {
      const content = readFile('src/app/globals.css');
      const issues: string[] = [];

      // Check .text-aurora
      const textAuroraMatch = content.match(/\.text-aurora\s*\{[\s\S]*?\}/);
      if (textAuroraMatch && (textAuroraMatch[0].includes('#e0234e') || textAuroraMatch[0].includes('#ff4d6d'))) {
        issues.push('.text-aurora gradient in globals.css contains #e0234e or #ff4d6d.');
      }

      // Check .btn-conic-glow
      const conicMatch = content.match(/\.btn-conic-glow[\s\S]*?conic-gradient\(([\s\S]*?)\)/);
      if (conicMatch && (conicMatch[0].includes('#e0234e') || conicMatch[0].includes('#ff4d6d'))) {
        issues.push('.btn-conic-glow in globals.css contains legacy pink conic gradient color stops.');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'globals.css gradients (.text-aurora, .btn-conic-glow) have been purged of legacy magenta tokens.'
          : 'globals.css still contains legacy magenta/pink gradient definitions.',
        details: issues
      };
    }
  },
  {
    id: 'T3.4',
    tier: 3,
    category: 'Palette Elimination',
    name: 'Course Catalog & Chat Components Palette Purge',
    requirement: 'R3: Trainee course catalog, chatbot, and chat cards must not contain rogue magenta/pink color tokens.',
    run: () => {
      const targetFiles = [
        'src/app/trainee/courses/page.tsx',
        'src/app/trainee/page.tsx',
        'src/components/chat/CourseChatbot.tsx',
        'src/components/chat/ChatCourseCard.tsx',
        'src/components/chat/ChatSuggestedPills.tsx',
        'src/components/admin/CompetencyRadarCard.tsx',
        'src/components/trainee/TraineeSkillGapCard.tsx'
      ];
      const issues: string[] = [];

      for (const relPath of targetFiles) {
        const text = readFile(relPath);
        if (/#e0234e/i.test(text) || /#ff4d6d/i.test(text)) {
          const e0Count = countOccurrences(text, /#e0234e/gi);
          const ffCount = countOccurrences(text, /#ff4d6d/gi);
          issues.push(`${relPath} contains ${e0Count} #e0234e and ${ffCount} #ff4d6d occurrences.`);
        }
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Course catalog, chatbot, chat cards, and trainee cards successfully purged of rogue magenta/pink tokens.'
          : 'Course catalog or chat components still contain rogue palette references.',
        details: issues
      };
    }
  },

  // ==========================================================================
  // TIER 4: Dark Mode Contrast & WCAG AA Compliance (R4)
  // ==========================================================================
  {
    id: 'T4.1',
    tier: 4,
    category: 'Dark Mode Contrast',
    name: 'Sidebar.tsx Workspace Header Contrast in Dark Mode',
    requirement: 'R4: Workspace headers (IMD {role} Workspace) in Sidebar.tsx must include dark mode contrast styling (dark:text-).',
    run: () => {
      const content = readFile('src/components/layout/Sidebar.tsx');
      const issues: string[] = [];

      // Extract roleColors
      const roleColorsMatch = content.match(/const\s+roleColors\s*=\s*\{([\s\S]*?)\};/);
      if (!roleColorsMatch) {
        issues.push('Could not locate roleColors object in Sidebar.tsx.');
      } else {
        const rcStr = roleColorsMatch[1];
        // Check ADMIN
        const adminMatch = rcStr.match(/ADMIN:\s*\{([\s\S]*?)\}/);
        if (adminMatch && !adminMatch[1].includes('dark:text-')) {
          issues.push('Sidebar.tsx ADMIN roleColor lacks dark:text- variant (renders navy text on dark navy background).');
        }
        // Check TRAINEE
        const traineeMatch = rcStr.match(/TRAINEE:\s*\{([\s\S]*?)\}/);
        if (traineeMatch && !traineeMatch[1].includes('dark:text-')) {
          issues.push('Sidebar.tsx TRAINEE roleColor lacks dark:text- variant (renders navy text on dark navy background).');
        }
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Sidebar.tsx workspace headers have dark:text- variants meeting WCAG AA contrast.'
          : 'Sidebar.tsx workspace headers lack dark mode contrast variants.',
        details: issues,
        diagnostics: passed ? undefined : [
          'In roleColors in src/components/layout/Sidebar.tsx:',
          "  ADMIN: { label: 'text-[#0b1e36] dark:text-[#dfb76c]', badge: 'bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 text-[#0b1e36] dark:text-[#dfb76c] border-[#c59b48]/40' },",
          "  TRAINEE: { label: 'text-[#0b1e36] dark:text-[#dfb76c]', badge: 'bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 text-[#0b1e36] dark:text-[#dfb76c] border-[#c59b48]/40' }"
        ]
      };
    }
  },
  {
    id: 'T4.2',
    tier: 4,
    category: 'Dark Mode Contrast',
    name: 'Sidebar.tsx Active Indicator Pill & Interactive Hover Contrast',
    requirement: 'R4: Sidebar active indicator pill must include dark:bg- and navigation icons must include dark:group-hover:text-.',
    run: () => {
      const content = readFile('src/components/layout/Sidebar.tsx');
      const issues: string[] = [];

      // Check active pill
      const activePillMatch = content.match(/layoutId=\{`sidebar-active-pill-\$\{role\}`\}[\s\S]*?className="([^"]+)"/);
      if (activePillMatch) {
        const pillClasses = activePillMatch[1];
        if (!pillClasses.includes('dark:bg-')) {
          issues.push('Sidebar active indicator pill lacks dark:bg- (blends invisibly into dark background).');
        }
      } else {
        issues.push('Could not locate sidebar-active-pill motion.div in Sidebar.tsx.');
      }

      // Check inactive link hover icon
      const hoverIconMatch = content.match(/group-hover:text-\[#0b1e36\]/);
      if (hoverIconMatch && !content.includes('dark:group-hover:text-')) {
        issues.push('Sidebar navigation link hover icon flips to #0b1e36 without dark:group-hover:text- variant.');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Sidebar.tsx active indicator pill and interactive hover icons properly styled for dark mode.'
          : 'Sidebar.tsx active pill or hover icons fail dark mode contrast.',
        details: issues
      };
    }
  },
  {
    id: 'T4.3',
    tier: 4,
    category: 'Dark Mode Contrast',
    name: 'TechnicalArchitecturePage Dark Mode Classes (/architecture)',
    requirement: 'R4: TechnicalArchitecturePage must provide comprehensive dark mode variants for banners, cards, badges, and headers.',
    run: () => {
      const content = readFile('src/app/architecture/page.tsx');
      const issues: string[] = [];

      // Count dark: class occurrences
      const darkCount = countOccurrences(content, /\bdark:/g);
      if (darkCount < 20) {
        issues.push(`architecture/page.tsx contains only ${darkCount} dark: classes (expected >= 20 across cards, headers, and badges).`);
      }

      // Check top breadcrumb / hero section background
      const topSectionMatch = content.match(/<section[^>]*?bg-slate-50\/80[^>]*?>/);
      if (topSectionMatch && !topSectionMatch[0].includes('dark:bg-')) {
        issues.push('Top breadcrumb section has bg-slate-50/80 without dark:bg- override.');
      }

      // Check pillar cards
      const pillarCardMatch = content.match(/className="[^"]*?border\s+border-slate-200\s+bg-white[^"]*?"/);
      if (pillarCardMatch && !pillarCardMatch[0].includes('dark:bg-')) {
        issues.push('Architectural pillar cards have bg-white without dark:bg- override.');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? `TechnicalArchitecturePage contains comprehensive dark mode styling (${darkCount} dark: variants verified).`
          : 'TechnicalArchitecturePage lacks dark mode classes across major surface and card elements.',
        details: issues
      };
    }
  },
  {
    id: 'T4.4',
    tier: 4,
    category: 'Dark Mode Contrast',
    name: 'Admin Radar & Auth Login Dark Mode Surfaces',
    requirement: 'R4: Admin radar page controls and Login form card surfaces must include dark mode contrast styling.',
    run: () => {
      const radarContent = readFile('src/app/admin/radar/page.tsx');
      const loginContent = readFile('src/app/auth/login/page.tsx');
      const issues: string[] = [];

      // Check radar active band filter buttons
      if (radarContent.includes("filterBand === b ? 'bg-[#0b1e36]") && !radarContent.includes("dark:bg-[#122c4d]")) {
        issues.push('admin/radar/page.tsx active band filter button lacks dark mode elevation (dark:bg-[#122c4d] or border).');
      }

      // Check login page surfaces
      const loginDarkCount = countOccurrences(loginContent, /\bdark:/g);
      if (loginDarkCount < 3) {
        issues.push(`auth/login/page.tsx contains only ${loginDarkCount} dark: classes (expected >= 3 for card and surface).`);
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Admin radar controls and Auth login surfaces meet dark mode contrast standards.'
          : 'Admin radar or Auth login surfaces lack dark mode contrast enhancements.',
        details: issues
      };
    }
  },

  // ==========================================================================
  // TIER 5: Layout & Spacing Rhythms (R5)
  // ==========================================================================
  {
    id: 'T5.1',
    tier: 5,
    category: 'Layout & Spacing',
    name: 'Landing Page Trust Marquee & Journey Container Rhythms (page.tsx)',
    requirement: 'R5: Trust marquee header and badges container in src/app/page.tsx must standardize to canonical max-w-7xl mx-auto px-4 sm:px-6 lg:px-8.',
    run: () => {
      const content = readFile('src/app/page.tsx');
      const issues: string[] = [];

      // Check line 595 trust marquee header
      const marqueeHeaderMatch = content.match(/<div\s+className="max-w-7xl\s+mx-auto\s+px-4\s+text-center\s+mb-3">/);
      if (marqueeHeaderMatch && !marqueeHeaderMatch[0].includes('sm:px-6')) {
        issues.push('Trust marquee title container uses px-4 without responsive gutters (sm:px-6 lg:px-8).');
      }

      // Check line 602 trust badges container
      const badgesContainerMatch = content.match(/max-w-6xl\s+mx-auto\s+px-4/);
      if (badgesContainerMatch) {
        issues.push('Trust badges container uses non-standard max-w-6xl instead of canonical max-w-7xl mx-auto px-4 sm:px-6 lg:px-8.');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Landing page trust marquee and badge containers adhere to max-w-7xl mx-auto px-4 sm:px-6 lg:px-8.'
          : 'Landing page contains container width anomalies (max-w-6xl or missing gutters).',
        details: issues,
        diagnostics: passed ? undefined : [
          'In src/app/page.tsx (around lines 595 & 602):',
          '  Update both containers to: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
        ]
      };
    }
  },
  {
    id: 'T5.2',
    tier: 5,
    category: 'Layout & Spacing',
    name: 'Radar Page Container Width & Gutter Harmonization (RadarPageContent.tsx)',
    requirement: 'R5: Header and main arena in RadarPageContent.tsx must standardize to max-w-7xl mx-auto px-4 sm:px-6 lg:px-8, eliminating 1600px jumps.',
    run: () => {
      const content = readFile('src/components/radar/RadarPageContent.tsx');
      const issues: string[] = [];

      // Check for max-w-[1600px]
      const has1600Header = /max-w-\[1600px\][\s\S]*?mx-auto[\s\S]*?flex/.test(content);
      const has1600Main = /main[\s\S]*?max-w-\[1600px\]/.test(content);

      if (has1600Header) {
        issues.push('RadarPageContent.tsx header uses max-w-[1600px] instead of canonical max-w-7xl mx-auto px-4 sm:px-6 lg:px-8.');
      }
      if (has1600Main) {
        issues.push('RadarPageContent.tsx main container uses max-w-[1600px] instead of canonical max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6.');
      }

      // Check for canonical max-w-7xl
      const has7xlHeader = /<div\s+className="max-w-7xl\s+mx-auto[^"]*?"/.test(content);
      if (!has7xlHeader && !has1600Header) {
        issues.push('RadarPageContent.tsx header is missing max-w-7xl mx-auto container.');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Radar page header and main arena containers harmonized to canonical max-w-7xl gutters.'
          : 'Radar page expands abruptly to 1600px, violating site container width standard.',
        details: issues,
        diagnostics: passed ? undefined : [
          'In src/components/radar/RadarPageContent.tsx:',
          '  Line 182: replace max-w-[1600px] mx-auto with max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
          '  Line 302: replace max-w-[1600px] w-full mx-auto p-3 sm:p-5 lg:p-6 with max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6'
        ]
      };
    }
  },
  {
    id: 'T5.3',
    tier: 5,
    category: 'Layout & Spacing',
    name: 'Canonical Dashboard Container Rhythm Across Portals',
    requirement: 'R5: All dashboard routes (/admin, /trainer, /trainee) must maintain max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6.',
    run: () => {
      const adminContent = readFile('src/app/admin/page.tsx');
      const trainerContent = readFile('src/app/trainer/page.tsx');
      const traineeContent = readFile('src/app/trainee/page.tsx');
      const issues: string[] = [];

      const canonicalRegex = /max-w-7xl\s+mx-auto\s+w-full\s+px-4\s+sm:px-6\s+lg:px-8\s+py-6\s+gap-6/;

      if (!canonicalRegex.test(adminContent)) {
        issues.push('src/app/admin/page.tsx container does not match canonical max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6.');
      }
      if (!canonicalRegex.test(trainerContent)) {
        issues.push('src/app/trainer/page.tsx container does not match canonical max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6.');
      }
      if (!canonicalRegex.test(traineeContent)) {
        issues.push('src/app/trainee/page.tsx container does not match canonical max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6.');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'All dashboard portals (/admin, /trainer, /trainee) adhere to canonical max-w-7xl container rhythm.'
          : 'Dashboard container rhythm divergence detected across role portals.',
        details: issues
      };
    }
  },
  {
    id: 'T5.4',
    tier: 5,
    category: 'Layout & Spacing',
    name: 'Root Layout Top Clearance & Architecture Breadcrumb Clearance',
    requirement: 'R5: Top clearance ensures sticky floating navbar never obscures page titles or breadcrumbs on initial load.',
    run: () => {
      const layoutContent = readFile('src/app/layout.tsx');
      const archContent = readFile('src/app/architecture/page.tsx');
      const issues: string[] = [];

      // Check root layout main container clearance or architecture page top padding
      const hasLayoutClearance = /<main[^>]*?(pt-2|pt-3|pt-4|pt-6)/.test(layoutContent);
      const hasArchClearance = /<section[^>]*?(pt-10|pt-12|py-10|py-12|pt-8)/.test(archContent);

      if (!hasLayoutClearance && !hasArchClearance) {
        issues.push('Neither root layout <main> nor architecture page defines top clearance padding for floating navbar.');
      }

      const passed = issues.length === 0;
      return {
        passed,
        message: passed
          ? 'Top clearance offsets prevent page headers and breadcrumbs from tucking behind floating navbar.'
          : 'Top clearance offset missing, resulting in navbar clashing with page content on load.',
        details: issues
      };
    }
  }
];

// ----------------------------------------------------------------------------
// Runner Engine
// ----------------------------------------------------------------------------

export async function runUiUxVerification(filterTier?: TierNumber): Promise<VerificationReport> {
  const startTime = performance.now();
  const testsToRun = filterTier ? testSuite.filter(t => t.tier === filterTier) : testSuite;

  const results: VerificationReport['results'] = [];
  const tierSummaries: Record<TierNumber, { total: number; passed: number; failed: number }> = {
    1: { total: 0, passed: 0, failed: 0 },
    2: { total: 0, passed: 0, failed: 0 },
    3: { total: 0, passed: 0, failed: 0 },
    4: { total: 0, passed: 0, failed: 0 },
    5: { total: 0, passed: 0, failed: 0 }
  };

  for (const test of testsToRun) {
    const testStart = performance.now();
    let res: TestResult;
    try {
      res = await test.run();
    } catch (err: any) {
      res = {
        passed: false,
        message: `Unhandled test exception: ${err?.message || err}`,
        details: err?.stack ? [err.stack] : undefined
      };
    }
    const durationMs = performance.now() - testStart;

    tierSummaries[test.tier].total++;
    if (res.passed) {
      tierSummaries[test.tier].passed++;
    } else {
      tierSummaries[test.tier].failed++;
    }

    results.push({
      id: test.id,
      tier: test.tier,
      name: test.name,
      category: test.category,
      requirement: test.requirement,
      passed: res.passed,
      message: res.message,
      details: res.details,
      diagnostics: res.diagnostics,
      durationMs
    });
  }

  const durationMs = performance.now() - startTime;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  const passRate = results.length > 0 ? (passedCount / results.length) * 100 : 0;

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedCount,
    failedCount,
    passRate,
    durationMs,
    tierSummaries,
    results
  };
}

// ----------------------------------------------------------------------------
// CLI Display Formatter
// ----------------------------------------------------------------------------

const tierNames: Record<TierNumber, string> = {
  1: 'Tier 1: Sovereign Typography & Font Hierarchy (R1)',
  2: 'Tier 2: Responsive Navbar Architecture & Dynamic Clearance (R2)',
  3: 'Tier 3: Rogue Palette Elimination (#e0234e, #ff4d6d) (R3)',
  4: 'Tier 4: Dark Mode Contrast & WCAG AA Compliance (R4)',
  5: 'Tier 5: Layout Rhythm & Spacing Standardization (R5)'
};

async function cli() {
  const args = process.argv.slice(2);
  const allowFailure = args.some(a => a.includes('--allow-failure'));
  const summaryOnly = args.some(a => a.includes('--summary'));
  const jsonOutput = args.some(a => a.includes('--json'));

  let targetTier: TierNumber | undefined;
  const tierArg = args.find(a => a.includes('--tier='));
  if (tierArg) {
    const val = parseInt(tierArg.split('--tier=')[1], 10);
    if (val >= 1 && val <= 5) {
      targetTier = val as TierNumber;
    }
  }

  if (jsonOutput) {
    const report = await runUiUxVerification(targetTier);
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.failedCount > 0 && !allowFailure ? 1 : 0);
  }

  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   CAPACITYCONNECT UI/UX & DESIGN SYSTEM VERIFICATION SUITE (5 TIERS)        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const report = await runUiUxVerification(targetTier);

  const tiersToDisplay: TierNumber[] = targetTier ? [targetTier] : [1, 2, 3, 4, 5];

  for (const t of tiersToDisplay) {
    const stats = report.tierSummaries[t];
    const tierResults = report.results.filter(r => r.tier === t);
    const tierPassRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0';

    console.log(`\n────────────────────────────────────────────────────────────────────────────────`);
    console.log(`  ${tierNames[t]}`);
    console.log(`  Status: ${stats.passed}/${stats.total} Passed (${tierPassRate}%)`);
    console.log(`────────────────────────────────────────────────────────────────────────────────`);

    if (!summaryOnly) {
      for (const res of tierResults) {
        const icon = res.passed ? '  ✓ PASS' : '  ✗ FAIL';
        const duration = `(${res.durationMs.toFixed(1)}ms)`;
        console.log(`${icon} [${res.id}] ${res.name} ${duration}`);
        console.log(`         ${res.message}`);

        if (!res.passed && res.details && res.details.length > 0) {
          console.log(`         Defects Detected:`);
          for (const d of res.details.slice(0, 5)) {
            console.log(`           • ${d}`);
          }
          if (res.details.length > 5) {
            console.log(`           ... and ${res.details.length - 5} more`);
          }
        }

        if (!res.passed && res.diagnostics && res.diagnostics.length > 0) {
          console.log(`         Remediation:`);
          for (const diag of res.diagnostics) {
            console.log(`           ${diag}`);
          }
        }
      }
    }
  }

  // Summary Table
  console.log('\n================================================================================');
  console.log('                            FINAL VERIFICATION SUMMARY                          ');
  console.log('================================================================================');
  for (const t of tiersToDisplay) {
    const s = report.tierSummaries[t];
    const rate = s.total > 0 ? ((s.passed / s.total) * 100).toFixed(1) : '0.0';
    const tag = s.failed === 0 ? '✓ READY' : `✗ ${s.failed} FAILING`;
    const label = tierNames[t].split(':')[1].trim();
    console.log(`  Tier ${t} (${label.padEnd(46)}): ${s.passed}/${s.total} (${rate.padStart(5)}%) [${tag}]`);
  }
  console.log('--------------------------------------------------------------------------------');
  console.log(`  TOTAL VERIFIED:     ${report.totalTests} checks`);
  console.log(`  PASSED:             ${report.passedCount} checks`);
  console.log(`  FAILED:             ${report.failedCount} checks`);
  console.log(`  PASS RATE:          ${report.passRate.toFixed(1)}%`);
  console.log(`  TOTAL DURATION:     ${report.durationMs.toFixed(2)} ms`);
  console.log('================================================================================\n');

  if (report.failedCount > 0) {
    if (allowFailure) {
      console.log(`⚠️ VERIFICATION REPORT: ${report.failedCount} tests currently failing (running in --allow-failure mode).`);
      process.exit(0);
    } else {
      console.error(`❌ VERIFICATION FAILED: ${report.failedCount} checks failed.`);
      console.error(`   Downstream milestones (M1-M4) must complete their respective fixes to turn all tiers green.`);
      process.exit(1);
    }
  } else {
    console.log('✅ ALL UI/UX & DESIGN SYSTEM ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
    process.exit(0);
  }
}

// Only execute CLI if directly run
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  cli().catch(err => {
    console.error('Fatal verification runner error:', err);
    process.exit(1);
  });
}
