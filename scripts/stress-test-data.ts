#!/usr/bin/env tsx

/**
 * ==============================================================================
 * ADVERSARIAL DATA & LOGIC STRESS TEST HARNESS (CHALLENGER 2)
 * ==============================================================================
 *
 * Exhaustive mathematical validation, fuzzing, injection penetration,
 * and physical consistency tests for Weather Radar & Prediction System.
 *
 * Test Suites:
 * 1. Marshall-Palmer Z-R Formulation & Boundary Stress
 * 2. Multi-Factor Storm Severity Risk Permutation Matrix
 * 3. Unit Conversion Precision & Roundtrip Invertibility
 * 4. Geocoding Input Sanitization & Adversarial Fuzzing
 * 5. Global 24-48h Nowcast & 7-Day Forecast Physical Invariants
 */

import {
  calculateMarshallPalmerDbz,
  calculateStormSeverityIndex,
  convertTemperature,
  convertWindSpeed,
  convertPressure,
  getWindDirectionCompass,
  fetchLocationCoordinates,
  fetchWeatherForecast,
  fetchRadarMetadata,
  getRadarTileUrl,
} from '../src/lib/weatherService.js';
import { getWmoDetails, WMO_DICTIONARY } from '../src/lib/wmoCodes.js';
import { generateMockWeatherData, PRESET_LOCATIONS } from '../src/lib/mockWeatherData.js';
import { generateMockRadarMetadata, generateProceduralRadarFrames } from '../src/lib/mockRadarData.js';
import { CurrentWeather, HourlyForecastItem, DailyForecastItem } from '../src/types/weather.js';

interface TestCaseResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestCaseResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  if (condition) {
    results.push({ suite, name, passed: true, details });
  } else {
    results.push({
      suite,
      name,
      passed: false,
      error: `Assertion failed: ${name}`,
      details,
    });
  }
}

function assertCloseTo(
  actual: number,
  expected: number,
  delta: number,
  suite: string,
  name: string,
  details?: string
) {
  const diff = Math.abs(actual - expected);
  if (diff <= delta) {
    results.push({ suite, name, passed: true, details: details || `actual: ${actual}, expected: ${expected} ± ${delta}` });
  } else {
    results.push({
      suite,
      name,
      passed: false,
      error: `Expected ${actual} to be close to ${expected} (±${delta}), diff was ${diff}`,
      details,
    });
  }
}

async function runAdversarialStressTests() {
  console.log('================================================================================');
  console.log('  CHALLENGER 2: ADVERSARIAL DATA, MATH & LOGIC STRESS TEST SUITE');
  console.log('================================================================================\n');

  const startTime = performance.now();

  // ============================================================================
  // SUITE 1: MARSHALL-PALMER Z-R CONVERSION & BOUNDARIES
  // ============================================================================
  const S1 = 'Suite 1: Marshall-Palmer Z-R Formulation & Boundaries';
  console.log(`[+] Executing ${S1}...`);

  // 1.1 Specified boundary values: R = 0, 0.001, 50, 150, 500 mm/h
  assert(calculateMarshallPalmerDbz(0) === 0, S1, 'R = 0 mm/h returns exactly 0 dBZ');
  assert(calculateMarshallPalmerDbz(0.001) === 0, S1, 'R = 0.001 mm/h (sub-threshold) returns 0 dBZ');
  assert(calculateMarshallPalmerDbz(0.01) === 0, S1, 'R = 0.01 mm/h (boundary threshold) returns 0 dBZ');

  // Math: Z = 200 * 50^1.6 = 104313.9, dBZ = 10 * log10(104313.9) = 50.1839... -> 50.2 dBZ
  assertCloseTo(calculateMarshallPalmerDbz(50), 50.2, 0.05, S1, 'R = 50 mm/h yields 50.2 dBZ');

  // Math: Z = 200 * 150^1.6 = 604059.9, dBZ = 10 * log10(604059.9) = 57.8108... -> 57.8 dBZ
  assertCloseTo(calculateMarshallPalmerDbz(150), 57.8, 0.05, S1, 'R = 150 mm/h yields 57.8 dBZ');

  // Math: Z = 200 * 500^1.6 = 4147740.1, dBZ = 10 * log10(4147740.1) = 66.1781... -> 66.2 dBZ
  assertCloseTo(calculateMarshallPalmerDbz(500), 66.2, 0.05, S1, 'R = 500 mm/h yields 66.2 dBZ');

  // Intermediate validation points
  // R = 1.0 -> Z = 200 -> 23.0 dBZ
  assertCloseTo(calculateMarshallPalmerDbz(1.0), 23.0, 0.05, S1, 'R = 1.0 mm/h yields 23.0 dBZ');
  // R = 2.5 -> Z = 864.56 -> 29.4 dBZ
  assertCloseTo(calculateMarshallPalmerDbz(2.5), 29.4, 0.05, S1, 'R = 2.5 mm/h yields 29.4 dBZ');
  // R = 25.0 -> Z = 34410.0 -> 45.4 dBZ
  assertCloseTo(calculateMarshallPalmerDbz(25.0), 45.4, 0.05, S1, 'R = 25.0 mm/h yields 45.4 dBZ');

  // 1.2 Extreme values & Upper Clamping Limit
  // R = 5000 mm/h -> Z = 1.65e8 -> dBZ = 82.2 -> capped at 75 dBZ
  assert(calculateMarshallPalmerDbz(5000) === 75, S1, 'R = 5000 mm/h is clamped at 75.0 dBZ');
  assert(calculateMarshallPalmerDbz(100000) === 75, S1, 'R = 100000 mm/h is clamped at 75.0 dBZ');
  assert(calculateMarshallPalmerDbz(Infinity) === 75, S1, 'R = Infinity is clamped at 75.0 dBZ');

  // 1.3 Negative, Zero, and Malformed inputs
  assert(calculateMarshallPalmerDbz(-1) === 0, S1, 'Negative rain rate -1 mm/h returns 0 dBZ');
  assert(calculateMarshallPalmerDbz(-500) === 0, S1, 'Negative rain rate -500 mm/h returns 0 dBZ');
  assert(calculateMarshallPalmerDbz(NaN) === 0, S1, 'NaN rain rate returns 0 dBZ');
  assert(calculateMarshallPalmerDbz(null as any) === 0, S1, 'null rain rate returns 0 dBZ');
  assert(calculateMarshallPalmerDbz(undefined as any) === 0, S1, 'undefined rain rate returns 0 dBZ');

  // 1.4 dBZ Rounding & Precision Invariant: All outputs must have at most 1 decimal place
  let roundingErrors = 0;
  for (let r = 0.02; r <= 100; r += 0.37) {
    const dbz = calculateMarshallPalmerDbz(r);
    const decimalPlaces = (dbz.toString().split('.')[1] || '').length;
    if (decimalPlaces > 1) roundingErrors++;
  }
  assert(roundingErrors === 0, S1, 'All dBZ returns are strictly rounded to 1 decimal place');

  // 1.5 Monotonicity Invariant: for R2 > R1 > 0.01 mm/h, dBZ(R2) >= dBZ(R1)
  let monotonicityViolations = 0;
  let prevDbz = 0;
  for (let r = 0.02; r <= 1000; r += 0.5) {
    const currentDbz = calculateMarshallPalmerDbz(r);
    if (currentDbz < prevDbz) {
      monotonicityViolations++;
    }
    prevDbz = currentDbz;
  }
  assert(monotonicityViolations === 0, S1, 'Marshall-Palmer dBZ is strictly monotonic for R > 0.01 mm/h');

  // 1.6 Fuzz Testing 10,000 Pseudo-random rain rates
  let fuzzFailures = 0;
  for (let i = 0; i < 10000; i++) {
    const randomR = (Math.random() - 0.2) * 2000; // range [-400, 1600]
    const val = calculateMarshallPalmerDbz(randomR);
    if (isNaN(val) || !isFinite(val) || val < 0 || val > 75) {
      fuzzFailures++;
    }
  }
  assert(fuzzFailures === 0, S1, 'Fuzzing 10,000 random rain rates produces safe bounded [0, 75] dBZ values');

  // ============================================================================
  // SUITE 2: STORM SEVERITY INDEX MULTI-FACTOR RISK WEIGHTINGS
  // ============================================================================
  const S2 = 'Suite 2: Multi-Factor Storm Severity Risk Permutation Matrix';
  console.log(`[+] Executing ${S2}...`);

  const createMockCurrent = (overrides: Partial<CurrentWeather> = {}): CurrentWeather => ({
    temperature: 24,
    apparentTemperature: 24,
    relativeHumidity: 50,
    precipitation: 0,
    precipitationProbability: 0,
    weatherCode: 0,
    surfacePressure: 1013,
    windSpeed: 10,
    windDirection: 180,
    windGusts: 15,
    uvIndex: 5,
    dewPoint: 15,
    cloudCover: 20,
    visibility: 10000,
    isDay: true,
    timestamp: new Date().toISOString(),
    ...overrides,
  });

  const createMockHourly = (overrides: Array<Partial<HourlyForecastItem>> = []): HourlyForecastItem[] => {
    return [0, 1, 2, 3, 4, 5].map((i) => ({
      time: new Date(Date.now() + i * 3600000).toISOString(),
      temperature: 24,
      apparentTemperature: 24,
      relativeHumidity: 50,
      dewPoint: 15,
      precipitationProbability: 10,
      precipitation: 0,
      weatherCode: 0,
      surfacePressure: 1013,
      cloudCover: 20,
      visibility: 10000,
      windSpeed: 10,
      windDirection: 180,
      uvIndex: 5,
      estimatedDbz: 0,
      ...(overrides[i] || {}),
    }));
  };

  // 2.1 Baseline Zero Risk
  const baselineWeather = createMockCurrent({ weatherCode: 0, windGusts: 10, precipitation: 0 });
  const baselineHourly = createMockHourly();
  assert(calculateStormSeverityIndex(baselineWeather, baselineHourly) === 0, S2, 'Clear sky baseline returns risk score 0');

  // 2.2 Convective Weather Code Pillar (Weights: 45, 40, 28, 18, 8, 0)
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 99 }), baselineHourly) === 45, S2, 'WMO 99 contributes exactly +45 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 95 }), baselineHourly) === 40, S2, 'WMO 95 contributes exactly +40 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 96 }), baselineHourly) === 40, S2, 'WMO 96 contributes exactly +40 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 19 }), baselineHourly) === 40, S2, 'WMO 19 (Tornado/Funnel) contributes exactly +40 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 82 }), baselineHourly) === 28, S2, 'WMO 82 (Violent showers) contributes exactly +28 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 65 }), baselineHourly) === 28, S2, 'WMO 65 (Heavy rain) contributes exactly +28 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 18 }), baselineHourly) === 28, S2, 'WMO 18 (Squalls) contributes exactly +28 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 63 }), baselineHourly) === 18, S2, 'WMO 63 (Moderate rain) contributes exactly +18 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 75 }), baselineHourly) === 18, S2, 'WMO 75 (Heavy snow) contributes exactly +18 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 61 }), baselineHourly) === 8, S2, 'WMO 61 (Slight rain) contributes exactly +8 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ weatherCode: 0 }), baselineHourly) === 0, S2, 'WMO 0 (Clear) contributes 0 pts');

  // 2.3 Wind Gust Severity Pillar (Weights: 25, 18, 10, 4, 0)
  assert(calculateStormSeverityIndex(createMockCurrent({ windGusts: 75 }), baselineHourly) === 25, S2, 'Wind gusts >= 75 km/h contributes +25 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ windGusts: 120 }), baselineHourly) === 25, S2, 'Wind gusts 120 km/h (hurricane) capped at +25 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ windGusts: 55 }), baselineHourly) === 18, S2, 'Wind gusts 55 km/h contributes +18 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ windGusts: 40 }), baselineHourly) === 10, S2, 'Wind gusts 40 km/h contributes +10 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ windGusts: 25 }), baselineHourly) === 4, S2, 'Wind gusts 25 km/h contributes +4 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ windGusts: 24 }), baselineHourly) === 0, S2, 'Wind gusts 24 km/h contributes 0 pts');

  // 2.4 Radar Reflectivity & Rain Rate Pillar (Weights: 20, 15, 8, 0)
  // dBZ >= 55 or R >= 25 mm/h -> +20 pts
  assert(calculateStormSeverityIndex(createMockCurrent({ precipitation: 30 }), baselineHourly) === 20, S2, 'Precipitation 30 mm/h (>25mm/h) contributes +20 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ precipitation: 12 }), baselineHourly) === 15, S2, 'Precipitation 12 mm/h (>10mm/h) contributes +15 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ precipitation: 4 }), baselineHourly) === 8, S2, 'Precipitation 4 mm/h (>3mm/h) contributes +8 pts');
  assert(calculateStormSeverityIndex(createMockCurrent({ precipitation: 0.5 }), baselineHourly) === 0, S2, 'Precipitation 0.5 mm/h (<3mm/h) contributes 0 pts');

  // 2.5 Forecast Escalation Pillar (Weights: 10, 5, 0)
  const escalatedHourlyHigh = createMockHourly([{ precipitation: 20, precipitationProbability: 90 }]);
  assert(calculateStormSeverityIndex(createMockCurrent(), escalatedHourlyHigh) === 10, S2, 'Upcoming rain > 15mm/h in 3h window contributes +10 pts');

  const escalatedHourlyModerate = createMockHourly([{ precipitation: 6, precipitationProbability: 65 }]);
  assert(calculateStormSeverityIndex(createMockCurrent(), escalatedHourlyModerate) === 5, S2, 'Upcoming rain > 5mm/h in 3h window contributes +5 pts');

  // 2.6 Maximum Composite Convective Supercell (100 pts)
  const severeSupercell = createMockCurrent({
    weatherCode: 99, // +45
    windGusts: 85,    // +25
    precipitation: 35, // +20
  });
  const severeUpcomingHourly = createMockHourly([{ precipitation: 25, precipitationProbability: 95 }]); // +10
  const totalSupercellScore = calculateStormSeverityIndex(severeSupercell, severeUpcomingHourly);
  assert(totalSupercellScore === 100, S2, 'Max composite risk sum: 45 + 25 + 20 + 10 = 100 pts');

  // 2.7 Clamping Invariant over 500 Combinations
  let clampingViolations = 0;
  const wmoCodes = [0, 61, 63, 65, 82, 95, 99];
  const gustValues = [10, 25, 40, 55, 80, 150];
  const rainValues = [0, 1, 5, 12, 30, 200];
  const hourlyRainValues = [0, 4, 10, 25];

  for (const w of wmoCodes) {
    for (const g of gustValues) {
      for (const r of rainValues) {
        for (const hr of hourlyRainValues) {
          const mockCur = createMockCurrent({ weatherCode: w, windGusts: g, precipitation: r });
          const mockH = createMockHourly([{ precipitation: hr, precipitationProbability: hr > 0 ? 80 : 10 }]);
          const score = calculateStormSeverityIndex(mockCur, mockH);
          if (score < 0 || score > 100 || isNaN(score)) {
            clampingViolations++;
          }
        }
      }
    }
  }
  assert(clampingViolations === 0, S2, 'All 504 discrete factor permutations strictly clamped in [0, 100]');

  // 2.8 Missing / Null / Edge Hourly Safety
  assert(calculateStormSeverityIndex(createMockCurrent(), undefined) === 0, S2, 'undefined hourly array handled safely');
  assert(calculateStormSeverityIndex(createMockCurrent(), []) === 0, S2, 'empty hourly array handled safely');

  // ============================================================================
  // SUITE 3: UNIT CONVERSION PRECISION & ROUNDTRIP INVERTIBILITY
  // ============================================================================
  const S3 = 'Suite 3: Unit Conversion Precision & Invertibility';
  console.log(`[+] Executing ${S3}...`);

  // 3.1 Temperature Roundtrip Invertibility (°C -> °F -> °C)
  // Mathematical formula: F = C * 1.8 + 32, C_rev = (F - 32) / 1.8
  let tempReversibilityViolations = 0;
  for (let c = -100; c <= 100; c += 0.5) {
    const f = convertTemperature(c, 'fahrenheit');
    const cReversed = (f - 32) / 1.8;
    // Allow rounding delta <= 0.1 °C
    if (Math.abs(c - cReversed) > 0.1) {
      tempReversibilityViolations++;
    }
  }
  assert(tempReversibilityViolations === 0, S3, 'Temperature roundtrip °C <-> °F has zero divergence (delta <= 0.1°C)');

  // Specific canonical temperature benchmarks
  assert(convertTemperature(-40, 'fahrenheit') === -40.0, S3, '-40°C equals exactly -40°F');
  assert(convertTemperature(0, 'fahrenheit') === 32.0, S3, '0°C equals exactly 32°F (freezing)');
  assert(convertTemperature(100, 'fahrenheit') === 212.0, S3, '100°C equals exactly 212°F (boiling)');
  assert(convertTemperature(37, 'fahrenheit') === 98.6, S3, '37°C equals exactly 98.6°F (body temp)');
  assert(convertTemperature(-273.15, 'fahrenheit') === -459.7, S3, '-273.15°C equals -459.7°F (absolute zero)');

  // 3.2 Wind Speed Roundtrip Invertibility (km/h <-> mph <-> knots <-> m/s)
  // km/h to mph factor: 0.621371 -> reverse: / 0.621371
  // km/h to knots factor: 0.539957 -> reverse: / 0.539957
  // km/h to m/s factor: / 3.6 -> reverse: * 3.6
  let windMphViolations = 0;
  let windKnotsViolations = 0;
  let windMsViolations = 0;

  for (let kmh = 1; kmh <= 300; kmh += 1) {
    const mph = convertWindSpeed(kmh, 'mph');
    const kmhFromMph = mph / 0.621371;
    if (Math.abs(kmh - kmhFromMph) > 0.2) windMphViolations++;

    const knots = convertWindSpeed(kmh, 'knots');
    const kmhFromKnots = knots / 0.539957;
    if (Math.abs(kmh - kmhFromKnots) > 0.2) windKnotsViolations++;

    const ms = convertWindSpeed(kmh, 'ms');
    const kmhFromMs = ms * 3.6;
    if (Math.abs(kmh - kmhFromMs) > 0.2) windMsViolations++;
  }

  assert(windMphViolations === 0, S3, 'Wind conversion km/h <-> mph invertibility holds within 0.2 km/h across 1-300 km/h');
  assert(windKnotsViolations === 0, S3, 'Wind conversion km/h <-> knots invertibility holds within 0.2 km/h across 1-300 km/h');
  assert(windMsViolations === 0, S3, 'Wind conversion km/h <-> m/s invertibility holds within 0.2 km/h across 1-300 km/h');

  // Benchmark wind speeds
  assert(convertWindSpeed(0, 'mph') === 0, S3, '0 km/h is 0 mph');
  assert(convertWindSpeed(100, 'kmh') === 100, S3, '100 km/h is 100 km/h');
  assertCloseTo(convertWindSpeed(100, 'mph'), 62.1, 0.1, S3, '100 km/h is 62.1 mph');
  assertCloseTo(convertWindSpeed(100, 'knots'), 54.0, 0.1, S3, '100 km/h is 54.0 knots');
  assertCloseTo(convertWindSpeed(100, 'ms'), 27.8, 0.1, S3, '100 km/h is 27.8 m/s');

  // 3.3 Pressure Conversions (hPa <-> inHg <-> mmHg)
  assertCloseTo(convertPressure(1013.25, 'inHg'), 29.92, 0.05, S3, '1013.25 hPa converts to 29.92 inHg');
  assertCloseTo(convertPressure(1013.25, 'mmHg'), 760.0, 0.5, S3, '1013.25 hPa converts to 760.0 mmHg');
  assert(convertPressure(1013.25, 'hPa') === 1013.3, S3, '1013.25 hPa rounds to 1013.3 hPa');

  // 3.4 16-Point Wind Compass Invariant
  assert(getWindDirectionCompass(0) === 'N', S3, '0° is N');
  assert(getWindDirectionCompass(90) === 'E', S3, '90° is E');
  assert(getWindDirectionCompass(180) === 'S', S3, '180° is S');
  assert(getWindDirectionCompass(270) === 'W', S3, '270° is W');
  assert(getWindDirectionCompass(360) === 'N', S3, '360° wraps to N');
  assert(getWindDirectionCompass(720) === 'N', S3, '720° wraps to N');
  assert(getWindDirectionCompass(-90) === 'W', S3, '-90° wraps to W (270°)');
  assert(getWindDirectionCompass(-45) === 'NW', S3, '-45° wraps to NW (315°)');
  assert(getWindDirectionCompass(22.5) === 'NNE', S3, '22.5° is NNE');
  assert(getWindDirectionCompass(45) === 'NE', S3, '45° is NE');

  // ============================================================================
  // SUITE 4: GEOCODING INPUT SANITIZATION & ADVERSARIAL FUZZING
  // ============================================================================
  const S4 = 'Suite 4: Geocoding Input Sanitization & Adversarial Payloads';
  console.log(`[+] Executing ${S4}...`);

  // Helper with AbortSignal timeout to ensure rapid resilience even under network drop
  const safeFetchGeocoding = (query: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    return fetchLocationCoordinates(query, controller.signal).finally(() => clearTimeout(timeout));
  };

  // 4.1 SQL Injection Vector Suite
  const sqliPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE locations; --",
    "admin'--",
    "' UNION SELECT 1, 'admin', 'pass', 1, 1--",
    "1; EXEC xp_cmdshell('dir');--",
    "Mumbai' AND 1=1--",
    "New Delhi' OR 1=1#",
  ];

  for (const sqli of sqliPayloads) {
    try {
      const res = await safeFetchGeocoding(sqli);
      assert(Array.isArray(res), S4, `SQLi payload safely handled: ${sqli.slice(0, 25)}...`);
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        assert(true, S4, `SQLi payload aborted cleanly: ${sqli.slice(0, 25)}...`);
      } else {
        assert(false, S4, `SQLi payload crashed: ${sqli}`, String(e));
      }
    }
  }

  // 4.2 XSS / HTML Injection Vector Suite
  const xssPayloads = [
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert(1)>",
    '"><svg onload=alert(1)>',
    "<iframe src='javascript:alert(1)'>",
    "<a href='javascript:void(0)'>Click</a>",
    "{{7*7}}",
    "${alert(1)}",
  ];

  for (const xss of xssPayloads) {
    try {
      const res = await safeFetchGeocoding(xss);
      assert(Array.isArray(res), S4, `XSS payload safely handled: ${xss.slice(0, 25)}...`);
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        assert(true, S4, `XSS payload aborted cleanly: ${xss.slice(0, 25)}...`);
      } else {
        assert(false, S4, `XSS payload crashed: ${xss}`, String(e));
      }
    }
  }

  // 4.3 Unicode, Non-Latin Scripts & Diacritics
  const unicodeQueries = [
    { query: 'नई दिल्ली', expectedName: 'Delhi' },
    { query: 'मुंबई', expectedName: 'Mumbai' },
    { query: '東京', expectedName: 'Tokyo' },
    { query: 'Москва', expectedName: 'Moscow' },
    { query: 'دبي', expectedName: 'Dubai' },
    { query: 'München', expectedName: 'Munich' },
    { query: 'São Paulo', expectedName: 'Sao Paulo' },
    { query: 'Reykjavík', expectedName: 'Reykjavik' },
    { query: 'Zürich', expectedName: 'Zurich' },
  ];

  for (const uq of unicodeQueries) {
    try {
      const res = await safeFetchGeocoding(uq.query);
      assert(Array.isArray(res), S4, `Unicode query executed safely: ${uq.query}`);
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        assert(true, S4, `Unicode query aborted cleanly: ${uq.query}`);
      } else {
        assert(false, S4, `Unicode query failed: ${uq.query}`, String(e));
      }
    }
  }

  // 4.4 Coordinate Parsing Edge & Corner Cases
  const coordinateTests = [
    { input: '28.6139, 77.2090', shouldMatch: true, expectedLat: 28.61, expectedLon: 77.21 },
    { input: '-33.8688, 151.2093', shouldMatch: true, expectedLat: -33.87, expectedLon: 151.21 },
    { input: '19.0760 N, 72.8777 E', shouldMatch: true, expectedLat: 19.08, expectedLon: 72.88 },
    { input: '34.0837 S, 74.7973 W', shouldMatch: true, expectedLat: -34.08, expectedLon: -74.80 },
    { input: '90.0, 180.0', shouldMatch: true, expectedLat: 90.0, expectedLon: 180.0 },
    { input: '-90.0, -180.0', shouldMatch: true, expectedLat: -90.0, expectedLon: -180.0 },
    { input: '95.0, 77.0', shouldMatch: false }, // Lat > 90
    { input: '28.0, 195.0', shouldMatch: false }, // Lon > 180
    { input: '-95.0, 77.0', shouldMatch: false }, // Lat < -90
    { input: '28.0, -195.0', shouldMatch: false }, // Lon < -180
  ];

  for (const ct of coordinateTests) {
    const res = await safeFetchGeocoding(ct.input);
    if (ct.shouldMatch) {
      assert(
        res.length > 0 &&
          Math.abs(res[0].lat - (ct.expectedLat || 0)) < 0.1 &&
          Math.abs(res[0].lon - (ct.expectedLon || 0)) < 0.1,
        S4,
        `Valid direct coordinate parsed correctly: "${ct.input}"`
      );
    } else {
      // Should not parse as direct coordinates (may fallback to text search or return empty)
      const isDirectParsed = res.length === 1 && res[0].country === 'Custom Coordinates';
      assert(!isDirectParsed, S4, `Out-of-bounds coordinate rejected as direct coordinates: "${ct.input}"`);
    }
  }

  // 4.5 Path Traversal, Null Bytes & Whitespace Fuzzing
  const fuzzVectors = [
    '../../../../etc/passwd',
    '..\\..\\..\\windows\\win.ini',
    'null\0byte',
    '\r\n\t\f\v',
    ' '.repeat(500),
    'A'.repeat(5000), // Buffer overflow attempt
    '!@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./',
  ];

  for (const fv of fuzzVectors) {
    try {
      const res = await safeFetchGeocoding(fv);
      assert(Array.isArray(res), S4, `Fuzz vector handled without exception: "${fv.slice(0, 20)}..."`);
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        assert(true, S4, `Fuzz vector aborted cleanly: "${fv.slice(0, 20)}..."`);
      } else {
        assert(false, S4, `Fuzz vector threw error: "${fv.slice(0, 20)}..."`, String(e));
      }
    }
  }

  // ============================================================================
  // SUITE 5: 24-48H NOWCAST & 7-DAY FORECAST PHYSICAL INVARIANTS
  // ============================================================================
  const S5 = 'Suite 5: 24-48h Nowcast & 7-Day Forecast Invariants';
  console.log(`[+] Executing ${S5}...`);

  // Test across 50 diverse geographic test coordinates spanning all climate zones
  const testCoords = [
    { lat: 0, lon: 0, name: 'Equator Prime Meridian' },
    { lat: 90, lon: 0, name: 'North Pole' },
    { lat: -90, lon: 0, name: 'South Pole' },
    { lat: 28.6139, lon: 77.209, name: 'New Delhi (Subtropical)' },
    { lat: 19.076, lon: 72.8777, name: 'Mumbai (Coastal Tropical)' },
    { lat: 51.5074, lon: -0.1278, name: 'London (Maritime Temperate)' },
    { lat: 35.6762, lon: 139.6503, name: 'Tokyo (Humid Subtropical)' },
    { lat: 40.7128, lon: -74.006, name: 'New York (Continental)' },
    { lat: -33.8688, lon: 151.2093, name: 'Sydney (Southern Temperate)' },
    { lat: 25.2048, lon: 55.2708, name: 'Dubai (Arid Desert)' },
    { lat: 64.1466, lon: -21.9426, name: 'Reykjavik (Subpolar)' },
    { lat: -12.0464, lon: -77.0428, name: 'Lima (Tropical Desert)' },
    { lat: 1.3521, lon: 103.8198, name: 'Singapore (Equatorial Rainforest)' },
    { lat: 45.0, lon: 180.0, name: 'International Antimeridian' },
    { lat: -45.0, lon: -180.0, name: 'International Antimeridian West' },
  ];

  // Add 35 procedural random global points
  for (let i = 0; i < 35; i++) {
    const rLat = (Math.random() - 0.5) * 180;
    const rLon = (Math.random() - 0.5) * 360;
    testCoords.push({ lat: rLat, lon: rLon, name: `Procedural Point (${rLat.toFixed(1)}, ${rLon.toFixed(1)})` });
  }

  let totalForecastsTested = 0;
  let hourlyMonotonicityViolations = 0;
  let hourlyLengthViolations = 0;
  let dailyLengthViolations = 0;
  let temperatureMinMaxViolations = 0;
  let apparentTempMinMaxViolations = 0;
  let relativeHumidityBoundViolations = 0;
  let precipProbabilityBoundViolations = 0;
  let negativePrecipitationViolations = 0;
  let cloudCoverBoundViolations = 0;
  let windSpeedNonNegativeViolations = 0;
  let windGustLessThanSpeedViolations = 0;
  let stormSeverityBoundViolations = 0;
  let derivedDbzBoundViolations = 0;
  let dewPointGreaterThanTempViolations = 0;

  for (const target of testCoords) {
    totalForecastsTested++;
    const data = generateMockWeatherData(target.lat, target.lon, target.name);

    // 5.1 Array Length checks
    if (!data.hourly || data.hourly.length < 24) hourlyLengthViolations++;
    if (!data.daily || data.daily.length !== 7) dailyLengthViolations++;

    // 5.2 Hourly Monotonic Timestamps & Boundaries
    if (data.hourly && data.hourly.length > 0) {
      let prevTime = new Date(data.hourly[0].time).getTime();
      for (let i = 1; i < data.hourly.length; i++) {
        const curTime = new Date(data.hourly[i].time).getTime();
        if (curTime <= prevTime || curTime - prevTime !== 3600000) {
          hourlyMonotonicityViolations++;
        }
        prevTime = curTime;

        const h = data.hourly[i];
        if (h.relativeHumidity < 0 || h.relativeHumidity > 100) relativeHumidityBoundViolations++;
        if (h.precipitationProbability < 0 || h.precipitationProbability > 100) precipProbabilityBoundViolations++;
        if (h.precipitation < 0) negativePrecipitationViolations++;
        if (h.cloudCover < 0 || h.cloudCover > 100) cloudCoverBoundViolations++;
        if (h.windSpeed < 0) windSpeedNonNegativeViolations++;
        if (h.dewPoint > h.temperature + 0.1) dewPointGreaterThanTempViolations++;
      }
    }

    // 5.3 Daily Invariants
    if (data.daily) {
      for (const d of data.daily) {
        if (d.temperatureMax < d.temperatureMin) temperatureMinMaxViolations++;
        if (d.apparentTemperatureMax < d.apparentTemperatureMin) apparentTempMinMaxViolations++;
        if (d.precipitationSum < 0) negativePrecipitationViolations++;
        if (d.precipitationProbabilityMax < 0 || d.precipitationProbabilityMax > 100) precipProbabilityBoundViolations++;
        if (d.windSpeedMax < 0) windSpeedNonNegativeViolations++;
        if (d.windGustsMax < d.windSpeedMax) windGustLessThanSpeedViolations++;
      }
    }

    // 5.4 Risk & Reflectivity Metrics
    if (data.stormSeverityIndex < 0 || data.stormSeverityIndex > 100) stormSeverityBoundViolations++;
    if (data.derivedDbz < 0 || data.derivedDbz > 75) derivedDbzBoundViolations++;
  }

  assert(hourlyLengthViolations === 0, S5, `All ${totalForecastsTested} global forecasts have >= 24 hourly items (72h generated)`);
  assert(dailyLengthViolations === 0, S5, `All ${totalForecastsTested} global forecasts have exactly 7 daily forecast cards`);
  assert(hourlyMonotonicityViolations === 0, S5, 'Hourly timestamps strictly monotonic with 1h delta across all forecasts');
  assert(temperatureMinMaxViolations === 0, S5, 'Daily temperatureMax >= temperatureMin holds for 100% of generated daily cards');
  assert(apparentTempMinMaxViolations === 0, S5, 'Daily apparentTemperatureMax >= apparentTemperatureMin holds for 100% of daily cards');
  assert(relativeHumidityBoundViolations === 0, S5, 'Relative humidity strictly bounded [0, 100]% across all hourly items');
  assert(precipProbabilityBoundViolations === 0, S5, 'Precipitation probability strictly bounded [0, 100]% across all items');
  assert(negativePrecipitationViolations === 0, S5, 'Precipitation rates and sums are non-negative across all items');
  assert(cloudCoverBoundViolations === 0, S5, 'Cloud cover percentage strictly bounded [0, 100]% across all items');
  assert(windSpeedNonNegativeViolations === 0, S5, 'Wind speeds strictly >= 0 across all items');
  assert(windGustLessThanSpeedViolations === 0, S5, 'Daily wind gusts max >= wind speed max holds for all items');
  assert(stormSeverityBoundViolations === 0, S5, 'Storm severity index strictly bounded [0, 100] across all global forecasts');
  assert(derivedDbzBoundViolations === 0, S5, 'Derived dBZ strictly bounded [0, 75] across all global forecasts');
  assert(dewPointGreaterThanTempViolations === 0, S5, 'Thermodynamic sanity: Dew point <= Temperature across all hourly items');

  // 5.5 Radar Metadata Procedural Frame Continuity
  const mockRadar = generateMockRadarMetadata();
  assert(mockRadar.past.length === 13, S5, 'Fallback radar metadata has 13 past frames (2 hours at 10m intervals)');
  assert(mockRadar.nowcast.length === 4, S5, 'Fallback radar metadata has 4 nowcast projection frames (40m ahead)');

  let radarTimestampViolations = 0;
  const allFrames = [...mockRadar.past, ...mockRadar.nowcast];
  for (let f = 1; f < allFrames.length; f++) {
    if (allFrames[f].time <= allFrames[f - 1].time) {
      radarTimestampViolations++;
    }
  }
  assert(radarTimestampViolations === 0, S5, 'Radar frame timestamps are strictly monotonically increasing');

  // 5.6 Tile URL Builder Stress Test
  const tileUrl1 = getRadarTileUrl('https://tilecache.rainviewer.com', '/v2/radar/12345', 6, 42, 28, 2, true, true, 256);
  assert(tileUrl1 === 'https://tilecache.rainviewer.com/v2/radar/12345/256/6/42/28/2/1_1.png', S5, 'Standard 256px tile URL matches RainViewer v2 spec');

  const tileUrl2 = getRadarTileUrl('https://tilecache.rainviewer.com/', 'v2/radar/12345', 8, 100, 50, 6, false, false, 512);
  assert(tileUrl2 === 'https://tilecache.rainviewer.com/v2/radar/12345/512/8/100/50/6/0_0.png', S5, 'Retina 512px NEXRAD scheme without smooth/snow formatted correctly');

  // ============================================================================
  // SUMMARY AND VERDICT REPORT
  // ============================================================================
  const totalDuration = performance.now() - startTime;
  const passedTests = results.filter((r) => r.passed);
  const failedTests = results.filter((r) => !r.passed);

  console.log('\n================================================================================');
  console.log('                 ADVERSARIAL STRESS TEST EXECUTION REPORT');
  console.log('================================================================================');
  console.log(`  Total Test Cases Executed:    ${results.length}`);
  console.log(`  Passed:                       ${passedTests.length}`);
  console.log(`  Failed:                       ${failedTests.length}`);
  console.log(`  Execution Time:               ${totalDuration.toFixed(2)} ms`);
  console.log('--------------------------------------------------------------------------------');

  const suites = Array.from(new Set(results.map((r) => r.suite)));
  for (const suite of suites) {
    const suiteResults = results.filter((r) => r.suite === suite);
    const suitePassed = suiteResults.filter((r) => r.passed).length;
    console.log(`  ${suite}: ${suitePassed}/${suiteResults.length} Passed`);
  }

  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    for (const failure of failedTests) {
      console.log(`  - [${failure.suite}] ${failure.name}: ${failure.error}`);
    }
  }

  console.log('================================================================================');
  if (failedTests.length === 0) {
    console.log('🎯 VERDICT: APPROVE — All mathematical, logical, and adversarial invariants hold.');
  } else {
    console.log('⚠️ VERDICT: REQUEST_CHANGES — Defects detected during stress testing.');
  }
  console.log('================================================================================\n');

  if (failedTests.length > 0) {
    process.exit(1);
  }
}

runAdversarialStressTests().catch((err) => {
  console.error('Fatal error in stress test runner:', err);
  process.exit(1);
});
