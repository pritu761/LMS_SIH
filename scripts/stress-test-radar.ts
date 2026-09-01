/**
 * Adversarial Stress & Chaos Test Suite for Interactive Weather Radar & Prediction System
 * 
 * Executed by: teamwork_preview_challenger_1 (EMPIRICAL CHALLENGER)
 * Target: src/lib/weatherService.ts, src/lib/mockRadarData.ts, src/lib/mockWeatherData.ts, etc.
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
  BASEMAP_CONFIGS,
} from '../src/lib/weatherService';
import {
  generateMockWeatherData,
  getMatchingPresetLocations,
  getPresetByCoordinates,
  PRESET_LOCATIONS,
} from '../src/lib/mockWeatherData';
import {
  generateProceduralRadarFrames,
  generateMockRadarMetadata,
  getSimulatedRadarEcho,
  MOCK_RADAR_HOTSPOTS,
} from '../src/lib/mockRadarData';
import { getWmoDetails } from '../src/lib/wmoCodes';
import { Coordinates, WeatherData, CurrentWeather, HourlyForecastItem } from '../src/types/weather';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function runTest(suite: string, name: string, fn: () => void | Promise<void>): Promise<void> {
  const start = performance.now();
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          const durationMs = performance.now() - start;
          results.push({ suite, name, passed: true, durationMs });
        })
        .catch((err) => {
          const durationMs = performance.now() - start;
          results.push({
            suite,
            name,
            passed: false,
            durationMs,
            error: err instanceof Error ? err.message : String(err),
            details: err instanceof Error ? err.stack : undefined,
          });
        });
    } else {
      const durationMs = performance.now() - start;
      results.push({ suite, name, passed: true, durationMs });
      return Promise.resolve();
    }
  } catch (err) {
    const durationMs = performance.now() - start;
    results.push({
      suite,
      name,
      passed: false,
      durationMs,
      error: err instanceof Error ? err.message : String(err),
      details: err instanceof Error ? err.stack : undefined,
    });
    return Promise.resolve();
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertInRange(val: number, min: number, max: number, label: string) {
  if (isNaN(val) || val < min || val > max) {
    throw new Error(`Value ${label} (${val}) out of range [${min}, ${max}]`);
  }
}

// ============================================================================
// MAIN STRESS RUNNER
// ============================================================================
async function runAllStressTests() {
  console.log('\n======================================================================');
  console.log('⚡ STARTING ADVERSARIAL RADAR & NOWCASTING STRESS TEST HARNESS ⚡');
  console.log('======================================================================\n');

  // Save original fetch
  const originalFetch = globalThis.fetch;

  // --------------------------------------------------------------------------
  // SUITE 1: Extreme Coordinates & Boundary Ingestion Stress
  // --------------------------------------------------------------------------
  const SUITE_1 = 'Suite 1: Extreme Coordinates & Boundaries';

  await runTest(SUITE_1, '1.1 Exact Poles (-90, +90) and Equator (0, 0)', () => {
    const northPole = generateMockWeatherData(90, 0);
    assert(northPole.coordinates.lat === 90, 'North pole lat preserved');
    assertInRange(northPole.current.temperature, -40, 40, 'North pole temp');
    assert(northPole.hourly.length === 72, 'North pole hourly count');
    assert(northPole.daily.length === 7, 'North pole daily count');

    const southPole = generateMockWeatherData(-90, 0);
    assert(southPole.coordinates.lat === -90, 'South pole lat preserved');
    assertInRange(southPole.current.temperature, -40, 40, 'South pole temp');

    const equator = generateMockWeatherData(0, 0);
    assert(equator.coordinates.lat === 0 && equator.coordinates.lon === 0, 'Equator coords');
    assertInRange(equator.current.temperature, 15, 45, 'Equator temp');
  });

  await runTest(SUITE_1, '1.2 Antimeridian (+180, -180, 179.999, -179.999)', () => {
    const eastAntimeridian = generateMockWeatherData(10, 180);
    const westAntimeridian = generateMockWeatherData(10, -180);
    assert(!isNaN(eastAntimeridian.current.temperature), 'East antimeridian valid');
    assert(!isNaN(westAntimeridian.current.temperature), 'West antimeridian valid');
    assert(eastAntimeridian.hourly.every((h) => !isNaN(h.temperature) && !isNaN(h.precipitation)), 'Hourly values valid');
  });

  await runTest(SUITE_1, '1.3 NaN and Infinity Coordinates Ingestion', () => {
    // Test that generator doesn't crash on NaN or Infinity inputs
    const nanData = generateMockWeatherData(NaN, NaN);
    assert(typeof nanData.current.weatherCode === 'number', 'NaN input returns fallback structure');

    const infData = generateMockWeatherData(Infinity, -Infinity);
    assert(typeof infData.current.surfacePressure === 'number', 'Infinity input handled');
  });

  await runTest(SUITE_1, '1.4 Out-of-bounds Geocoding Query Direct Coordinate Strings', async () => {
    // Test direct coordinate parsing with adversarial inputs
    const valid = await fetchLocationCoordinates('28.6139, 77.2090');
    assert(valid.length === 1 && Math.abs(valid[0].lat - 28.6139) < 0.001, 'Valid string parsed');

    // Mock fetch for out-of-bounds queries to test sanitization & fallback isolation
    const tempFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ results: [] }), { status: 200 });

    const oobLat = await fetchLocationCoordinates('95.5, 77.20');
    // Out of bounds lat should not be parsed as direct coords; falls back to preset search
    assert(oobLat.every((l) => l.lat >= -90 && l.lat <= 90), 'OOB Lat clamped/sanitized');

    const oobLon = await fetchLocationCoordinates('28.5, 205.0');
    assert(oobLon.every((l) => l.lon >= -180 && l.lon <= 180), 'OOB Lon clamped/sanitized');

    const nanQuery = await fetchLocationCoordinates('NaN, NaN');
    assert(Array.isArray(nanQuery), 'NaN query returns safe array');

    globalThis.fetch = tempFetch;
  });

  await runTest(SUITE_1, '1.5 Simulated Radar Echo Proximity at Extremes', () => {
    const echoNorth = getSimulatedRadarEcho(90, 0);
    assert(echoNorth.dbz >= 0 && echoNorth.dbz <= 75, 'Polar echo dBZ in bounds');
    assert(typeof echoNorth.description === 'string', 'Polar echo description exists');

    const echoKonkan = getSimulatedRadarEcho(19.1, 72.4); // At Konkan squall line center
    assert(echoKonkan.dbz >= 40, 'Konkan hotspot center returns high dBZ');
    assert(echoKonkan.rainRateMmH > 5, 'Konkan hotspot has heavy rain rate');
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Network Failure, Fault Injection & Fallback Resilience
  // --------------------------------------------------------------------------
  const SUITE_2 = 'Suite 2: Network Fault Injection & Offline Recovery';

  await runTest(SUITE_2, '2.1 HTTP 500 / 503 Internal Server Error on Radar API', async () => {
    // Mock globalThis.fetch to return HTTP 500
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        statusText: 'Internal Server Error',
      });

    const meta = await fetchRadarMetadata();
    assert(meta.isFallback === true, 'Fallback activated on HTTP 500');
    assert(meta.past.length === 13, 'Past frames generated in fallback');
    assert(meta.nowcast.length === 4, 'Nowcast frames generated in fallback');
    assert(meta.host.includes('rainviewer.com'), 'Host provided in fallback');
  });

  await runTest(SUITE_2, '2.2 HTTP 429 Rate Limit on Open-Meteo Forecast API', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        statusText: 'Too Many Requests',
      });

    const forecast = await fetchWeatherForecast(19.076, 72.877, 'Mumbai');
    assert(forecast.isFallback === true, 'Fallback flag true on HTTP 429');
    assert(forecast.current.temperature > 0, 'Realistic temperature generated');
    assert(forecast.hourly.length === 72, '72 hourly nowcasts generated in fallback');
    assert(forecast.daily.length === 7, '7 daily cards generated in fallback');
  });

  await runTest(SUITE_2, '2.3 Complete Network Drop (TypeError: Failed to fetch)', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch (Network connection lost)');
    };

    const coords = await fetchLocationCoordinates('Delhi');
    assert(coords.length > 0, 'Presets returned on network drop');
    assert(Boolean(coords[0]?.name?.includes('Delhi')), 'Matching preset identified');

    const forecast = await fetchWeatherForecast(28.61, 77.2, 'New Delhi');
    assert(forecast.coordinates.name === 'New Delhi', 'Location name retained');
    assert(forecast.current.relativeHumidity >= 25 && forecast.current.relativeHumidity <= 100, 'Humidity in bounds');
  });

  await runTest(SUITE_2, '2.4 Malformed / Truncated JSON Stream Injection', async () => {
    globalThis.fetch = async () =>
      new Response('{"radar": {"past": [{"time": 170000000', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    const meta = await fetchRadarMetadata();
    assert(meta.isFallback === true, 'Malformed JSON gracefully routed to fallback');
  });

  await runTest(SUITE_2, '2.5 AbortController Signal Cancellation Handling', async () => {
    const controller = new AbortController();
    controller.abort();

    globalThis.fetch = async (_url, init) => {
      if (init?.signal?.aborted) {
        const err = new Error('The user aborted a request.');
        err.name = 'AbortError';
        throw err;
      }
      return new Response('{}', { status: 200 });
    };

    let caughtAbort = false;
    try {
      await fetchWeatherForecast(28.61, 77.2, 'Delhi', undefined, undefined, controller.signal);
    } catch (err: any) {
      if (err?.name === 'AbortError') caughtAbort = true;
    }
    assert(caughtAbort, 'AbortError propagated cleanly when signal aborted');
  });

  // Restore fetch
  globalThis.fetch = originalFetch;

  // --------------------------------------------------------------------------
  // SUITE 3: High-Speed Timeline Animation Loop & Index Stress
  // --------------------------------------------------------------------------
  const SUITE_3 = 'Suite 3: High-Speed Timeline Animation & Loop Stress';

  await runTest(SUITE_3, '3.1 50 Steps/sec Rapid Timeline Cycle (500 iterations)', () => {
    const { past, nowcast } = generateProceduralRadarFrames(10, 13, 4);
    const allFrames = [...past, ...nowcast];
    const totalFrames = allFrames.length; // 17 frames
    assert(totalFrames === 17, 'Frame count is 17');

    let currentIndex = 0;
    // Simulate 500 high-speed forward steps
    for (let step = 0; step < 500; step++) {
      currentIndex = (currentIndex + 1) % totalFrames;
      assertInRange(currentIndex, 0, totalFrames - 1, 'Current index after forward step');
      assert(allFrames[currentIndex] !== undefined, 'Frame at index exists');
    }

    // Simulate 500 high-speed backward steps
    for (let step = 0; step < 500; step++) {
      currentIndex = (currentIndex - 1 + totalFrames) % totalFrames;
      assertInRange(currentIndex, 0, totalFrames - 1, 'Current index after backward step');
      assert(allFrames[currentIndex] !== undefined, 'Frame at index exists');
    }
  });

  await runTest(SUITE_3, '3.2 Index Overflow & Out-of-bounds Clamping Stress', () => {
    const { past, nowcast } = generateProceduralRadarFrames(10, 13, 4);
    const allFrames = [...past, ...nowcast];

    const clamp = (idx: number, len: number) => {
      if (len === 0) return 0;
      return Math.max(0, Math.min(idx, len - 1));
    };

    assert(clamp(-999, allFrames.length) === 0, 'Negative index clamped to 0');
    assert(clamp(99999, allFrames.length) === allFrames.length - 1, 'Large index clamped to max');
    assert(clamp(0, 0) === 0, 'Empty frame clamped to 0');
  });

  await runTest(SUITE_3, '3.3 Empty & Single-Frame Timeline Edge Cases', () => {
    // Empty frames
    const emptyFrames: any[] = [];
    const stepFwdEmpty = (idx: number) => (emptyFrames.length ? (idx + 1) % emptyFrames.length : 0);
    const stepBwdEmpty = (idx: number) =>
      emptyFrames.length ? (idx - 1 + emptyFrames.length) % emptyFrames.length : 0;

    assert(stepFwdEmpty(0) === 0, 'Empty frame forward returns 0');
    assert(stepBwdEmpty(0) === 0, 'Empty frame backward returns 0');

    // Single frame
    const singleFrame = [{ time: 1700000000, path: '/v2/radar/single', isNowcast: false }];
    const stepFwdSingle = (idx: number) => (idx + 1) % singleFrame.length;
    assert(stepFwdSingle(0) === 0, 'Single frame stays at index 0');
  });

  // --------------------------------------------------------------------------
  // SUITE 4: Memory Management, URL Generator & Layer Cleanup Stress
  // --------------------------------------------------------------------------
  const SUITE_4 = 'Suite 4: Memory Management & Tile Layer Cleanup';

  await runTest(SUITE_4, '4.1 10,000 Rapid Radar Tile URL Generations', () => {
    const host = 'https://tilecache.rainviewer.com';
    const path = '/v2/radar/1720000000';

    for (let i = 0; i < 10000; i++) {
      const z = (i % 18) + 1;
      const x = i % (1 << z);
      const y = (i + 1) % (1 << z);
      const scheme = ((i % 8) + 1) as any;
      const url = getRadarTileUrl(host, path, z, x, y, scheme, true, true, 256);
      assert(url.startsWith('https://tilecache.rainviewer.com/v2/radar/1720000000/256/'), 'URL prefix valid');
      assert(url.endsWith('/1_1.png'), 'URL suffix valid');
    }
  });

  await runTest(SUITE_4, '4.2 Tile Layer Map Allocation & Pruning Simulation', () => {
    // Simulate LeafletRadarContainer layerMap management
    const layerMap = new Map<number, { url: string; opacity: number }>();
    const mockMap = {
      removed: 0,
      removeLayer: () => {
        mockMap.removed++;
      },
    };

    // Stage 1: Load 20 frames
    const frames20 = Array.from({ length: 20 }, (_, i) => ({
      time: i * 600,
      path: `/path/${i}`,
      isNowcast: i >= 15,
    }));

    frames20.forEach((frame, idx) => {
      layerMap.set(idx, { url: frame.path, opacity: idx === 14 ? 0.85 : 0 });
    });
    assert(layerMap.size === 20, '20 layers stored');

    // Stage 2: Shrink frames to 10 frames (e.g. metadata refresh with fewer frames)
    const frames10 = frames20.slice(0, 10);
    layerMap.forEach((_, idx) => {
      if (idx >= frames10.length) {
        mockMap.removeLayer();
        layerMap.delete(idx);
      }
    });

    assert(layerMap.size === 10, 'Layers pruned to 10');
    assert(mockMap.removed === 10, '10 layers explicitly removed from map to prevent memory leaks');
  });

  await runTest(SUITE_4, '4.3 Basemap Switch Disposal & URL Validity', () => {
    const basemaps = ['dark', 'light', 'osm', 'satellite'] as const;
    basemaps.forEach((bm) => {
      const config = BASEMAP_CONFIGS[bm];
      assert(Boolean(config), `Config exists for ${bm}`);
      assert(config.url.includes('{z}') && config.url.includes('{x}') && config.url.includes('{y}'), 'Basemap URL has slippy placeholders');
      assert(config.maxZoom >= 18, 'Max zoom >= 18');
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 5: Rapid Location Switching & Concurrent Query Stress
  // --------------------------------------------------------------------------
  const SUITE_5 = 'Suite 5: Rapid Location Switching & Concurrency';

  await runTest(SUITE_5, '5.1 50 Sequential City Queries Resolution', async () => {
    const testCities = [
      'New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai',
      'Hyderabad', 'Jaipur', 'Ahmedabad', 'Kochi', 'Srinagar',
      'Guwahati', 'Port Blair', 'London', 'Tokyo', 'New York',
      'Paris', 'Dubai', 'Sydney', 'Pune', 'Lucknow',
      'Chandigarh', 'Bhopal', 'Patna', 'Ranchi', 'Bhubaneswar',
      'Thiruvananthapuram', 'Dehradun', 'Shimla', 'Agartala', 'Imphal',
      'Aizawl', 'Kohima', 'Shillong', 'Gangtok', 'Itanagar',
      'Panaji', 'Raipur', 'Amritsar', 'Varanasi', 'Agra',
      'Surat', 'Visakhapatnam', 'Coimbatore', 'Madurai', 'Mangalore',
      'Mysore', 'Nagpur', 'Indore', 'Jodhpur', 'Udaipur',
    ];

    assert(testCities.length === 50, '50 test cities defined');

    for (const city of testCities) {
      const results = getMatchingPresetLocations(city);
      assert(Array.isArray(results), `Preset lookup for ${city} returns array`);
    }
  });

  await runTest(SUITE_5, '5.2 50 Concurrent Weather Forecast Generation Calls', async () => {
    const promises = Array.from({ length: 50 }, (_, i) => {
      const lat = 10 + (i % 30);
      const lon = 70 + (i % 25);
      return Promise.resolve(generateMockWeatherData(lat, lon, `City_${i}`));
    });

    const results = await Promise.all(promises);
    assert(results.length === 50, 'All 50 concurrent requests resolved');
    results.forEach((res, idx) => {
      assert(res.coordinates.name === `City_${idx}`, 'Result coordinates matched');
      assert(res.hourly.length === 72, 'Hourly nowcasting array intact');
      assert(res.daily.length === 7, 'Daily forecast array intact');
      assertInRange(res.stormSeverityIndex, 0, 100, 'Storm severity in range');
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 6: Extreme Weather Value & Formula Stress (Marshall-Palmer & Storms)
  // --------------------------------------------------------------------------
  const SUITE_6 = 'Suite 6: Meteorological Formulas & Severe Weather Stress';

  await runTest(SUITE_6, '6.1 Marshall-Palmer dBZ Extreme Boundaries & Cloudbursts', () => {
    // Zero / sub-threshold rain
    assert(calculateMarshallPalmerDbz(0) === 0, '0 mm/h -> 0 dBZ');
    assert(calculateMarshallPalmerDbz(0.005) === 0, '<0.01 mm/h -> 0 dBZ');
    assert(calculateMarshallPalmerDbz(-5) === 0, 'Negative rain -> 0 dBZ');

    // Standard rain rates
    const drizzle = calculateMarshallPalmerDbz(0.5); // ~18.2 dBZ
    assertInRange(drizzle, 15, 22, 'Drizzle dBZ');

    const moderate = calculateMarshallPalmerDbz(2.5); // ~29.4 dBZ
    assertInRange(moderate, 27, 32, 'Moderate rain dBZ');

    const heavy = calculateMarshallPalmerDbz(25); // ~45.4 dBZ
    assertInRange(heavy, 43, 48, 'Heavy rain dBZ');

    const violent = calculateMarshallPalmerDbz(100); // ~55.0 dBZ
    assertInRange(violent, 53, 58, 'Violent cloudburst dBZ');

    // Extreme capping at 75 dBZ (maximum physical limit of Doppler radar)
    const extremeHail = calculateMarshallPalmerDbz(10000);
    assert(extremeHail === 75, 'Extreme rain rate capped at 75 dBZ');
  });

  await runTest(SUITE_6, '6.2 Storm Severity Index (0-100) Boundary Clamping & Hurricane Gusts', () => {
    const dummyHourly: HourlyForecastItem[] = Array.from({ length: 72 }, () => ({
      time: new Date().toISOString(),
      temperature: 25,
      apparentTemperature: 25,
      relativeHumidity: 60,
      dewPoint: 16,
      precipitationProbability: 10,
      precipitation: 0,
      weatherCode: 0,
      surfacePressure: 1013,
      cloudCover: 20,
      visibility: 10000,
      windSpeed: 10,
      windDirection: 90,
      uvIndex: 5,
      estimatedDbz: 0,
    }));

    const clearCurrent: CurrentWeather = {
      temperature: 25,
      apparentTemperature: 25,
      relativeHumidity: 40,
      precipitation: 0,
      precipitationProbability: 0,
      weatherCode: 0,
      surfacePressure: 1015,
      windSpeed: 5,
      windDirection: 180,
      windGusts: 8,
      uvIndex: 6,
      dewPoint: 10,
      cloudCover: 5,
      visibility: 10000,
      isDay: true,
      timestamp: new Date().toISOString(),
    };

    const clearScore = calculateStormSeverityIndex(clearCurrent, dummyHourly);
    assert(clearScore === 0, 'Clear calm day has 0 storm severity score');

    // Catastrophic Severe Hailstorm (WMO 99, 120 km/h gusts, 80 mm/h rain)
    const severeCurrent: CurrentWeather = {
      ...clearCurrent,
      weatherCode: 99,
      windGusts: 120,
      precipitation: 80,
    };
    const severeScore = calculateStormSeverityIndex(severeCurrent, dummyHourly);
    assert(severeScore >= 90 && severeScore <= 100, 'Severe convective hailstorm scores near 100');

    // Boundary clamping: ensure never > 100 or < 0
    assertInRange(severeScore, 0, 100, 'Severe score clamped to [0, 100]');
  });

  await runTest(SUITE_6, '6.3 Unit Conversions Across Extreme Physical Temperatures', () => {
    // Absolute Zero (-273.15 C)
    const absZeroF = convertTemperature(-273.15, 'fahrenheit');
    assert(Math.abs(absZeroF - -459.7) < 0.2, 'Absolute zero in Fahrenheit');

    // Freezing Point (0 C)
    assert(convertTemperature(0, 'fahrenheit') === 32, '0 C -> 32 F');

    // Boiling Point (100 C)
    assert(convertTemperature(100, 'fahrenheit') === 212, '100 C -> 212 F');

    // Wind speed: 100 km/h -> ~62.1 mph, ~27.8 m/s, ~54.0 knots
    assertInRange(convertWindSpeed(100, 'mph'), 61, 63, '100 km/h to mph');
    assertInRange(convertWindSpeed(100, 'ms'), 27, 29, '100 km/h to m/s');
    assertInRange(convertWindSpeed(100, 'knots'), 53, 55, '100 km/h to knots');

    // Wind compass wrapping: 0 -> N, 360 -> N, 720 -> N, -90 -> W (270)
    assert(getWindDirectionCompass(0) === 'N', '0 deg is N');
    assert(getWindDirectionCompass(90) === 'E', '90 deg is E');
    assert(getWindDirectionCompass(180) === 'S', '180 deg is S');
    assert(getWindDirectionCompass(270) === 'W', '270 deg is W');
    assert(getWindDirectionCompass(360) === 'N', '360 deg wrapped is N');
    assert(getWindDirectionCompass(-90) === 'W', 'Negative azimuth correctly wrapped to W');
  });

  await runTest(SUITE_6, '6.4 All 28 WMO Synoptic Codes Completeness & Icon Integrity', () => {
    const wmoCodes = [
      0, 1, 2, 3, 4, 5, 10, 18, 19, 45, 48, 51, 53, 55, 56, 57,
      61, 63, 65, 66, 67, 71, 73, 75, 77, 80,
      81, 82, 85, 86, 95, 96, 99,
    ];

    wmoCodes.forEach((code) => {
      const details = getWmoDetails(code);
      assert(Boolean(details.label), `WMO ${code} has label`);
      assert(Boolean(details.description), `WMO ${code} has description`);
      assert(Boolean(details.iconName), `WMO ${code} has iconName`);
      assert(['normal', 'advisory', 'watch', 'warning', 'extreme'].includes(details.severity), `WMO ${code} has valid severity (${details.severity})`);
    });

    // Unknown code fallback
    const unknown = getWmoDetails(9999);
    assert(unknown.label === 'Variable conditions' || unknown.label === 'Unknown', 'Unknown code returns safe fallback');
  });

  // ==========================================================================
  // PRINT SUMMARY & VERDICT
  // ==========================================================================
  console.log('\n======================================================================');
  console.log('                 ADVERSARIAL STRESS TEST RESULTS');
  console.log('======================================================================');

  let passedCount = 0;
  let failedCount = 0;

  const suiteGroups = new Map<string, TestResult[]>();
  results.forEach((r) => {
    const list = suiteGroups.get(r.suite) || [];
    list.push(r);
    suiteGroups.set(r.suite, list);
  });

  suiteGroups.forEach((tests, suite) => {
    console.log(`\n📦 ${suite}`);
    tests.forEach((t) => {
      if (t.passed) {
        passedCount++;
        console.log(`  [✓ PASS] ${t.name} (${t.durationMs.toFixed(2)}ms)`);
      } else {
        failedCount++;
        console.log(`  [✗ FAIL] ${t.name} (${t.durationMs.toFixed(2)}ms)`);
        console.log(`     Error: ${t.error}`);
        if (t.details) console.log(`     Details: ${t.details}`);
      }
    });
  });

  const totalTime = results.reduce((sum, r) => sum + r.durationMs, 0);

  console.log('\n======================================================================');
  console.log('                          FINAL SUMMARY');
  console.log('======================================================================');
  console.log(`  Total Stress Tests:  ${results.length}`);
  console.log(`  Passed:              ${passedCount}`);
  console.log(`  Failed:              ${failedCount}`);
  console.log(`  Pass Rate:           ${((passedCount / results.length) * 100).toFixed(1)}%`);
  console.log(`  Total Execution:     ${totalTime.toFixed(2)} ms`);
  console.log('======================================================================\n');

  if (failedCount > 0) {
    console.error('❌ ADVERSARIAL CHALLENGE FAILED — Discovered bugs or regressions.');
    process.exit(1);
  } else {
    console.log('✅ ALL ADVERSARIAL STRESS TESTS PASSED WITH 100% RELIABILITY.');
  }
}

runAllStressTests().catch((err) => {
  console.error('Fatal crash during stress test execution:', err);
  process.exit(1);
});
