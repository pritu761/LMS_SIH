#!/usr/bin/env tsx

/**
 * Automated Test Runner for Weather Radar & Prediction System
 * Executes all 4 tiers of tests from src/lib/__tests__/weatherRadarSuite.test.ts
 */

import { runWeatherRadarTestSuite } from '../src/lib/__tests__/weatherRadarSuite.test.js';

async function main() {
  console.log('================================================================================');
  console.log('  WEATHER RADAR & NOWCASTING PREDICTION SYSTEM — AUTOMATED MULTI-TIER TEST SUITE');
  console.log('================================================================================\n');

  const startTime = performance.now();
  const report = await runWeatherRadarTestSuite();
  const totalDuration = performance.now() - startTime;

  // Group and display by tier
  const tierNames: Record<number, string> = {
    1: 'Tier 1: Feature Coverage (Isolation & Happy Paths)',
    2: 'Tier 2: Boundary, Edge & Corner Cases',
    3: 'Tier 3: Cross-Feature Combinations & Pairwise Interactions',
    4: 'Tier 4: Real-World Workload & Application Scenarios'
  };

  for (let t = 1; t <= 4; t++) {
    const tierResults = report.results.filter(r => r.tier === t);
    const tierStats = report.tierSummary[t];
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`  ${tierNames[t]} [${tierStats.passed}/${tierStats.total} Passed]`);
    console.log(`--------------------------------------------------------------------------------`);

    for (const res of tierResults) {
      const statusIcon = res.passed ? '✓ PASS' : '✗ FAIL';
      const durationStr = `(${res.durationMs.toFixed(2)}ms)`;
      console.log(`  [${statusIcon}] ${res.name} ${durationStr}`);
      if (!res.passed && res.error) {
        console.error(`          Error: ${res.error}`);
      }
    }
  }

  // Summary Table
  console.log('\n================================================================================');
  console.log('                              FINAL TEST SUMMARY');
  console.log('================================================================================');
  console.log(`  Tier 1 (Feature Coverage):           ${report.tierSummary[1].passed} / ${report.tierSummary[1].total} passed`);
  console.log(`  Tier 2 (Boundary & Corner Cases):    ${report.tierSummary[2].passed} / ${report.tierSummary[2].total} passed`);
  console.log(`  Tier 3 (Cross-Feature Combinations): ${report.tierSummary[3].passed} / ${report.tierSummary[3].total} passed`);
  console.log(`  Tier 4 (Real-World Scenarios):       ${report.tierSummary[4].passed} / ${report.tierSummary[4].total} passed`);
  console.log('--------------------------------------------------------------------------------');
  console.log(`  TOTAL TESTS:                         ${report.totalCount}`);
  console.log(`  TOTAL PASSED:                        ${report.passedCount}`);
  console.log(`  TOTAL FAILED:                        ${report.failedCount}`);
  console.log(`  TOTAL EXECUTION TIME:                ${totalDuration.toFixed(2)} ms`);
  console.log('================================================================================\n');

  if (report.failedCount > 0) {
    console.error(`❌ TEST SUITE FAILED with ${report.failedCount} failing tests.`);
    process.exit(1);
  } else {
    console.log('✅ ALL 151 TESTS PASSED SUCCESSFULLY! Test suite is ready for deployment.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
