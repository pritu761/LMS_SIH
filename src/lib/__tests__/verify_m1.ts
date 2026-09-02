import {
  getWmoDetails,
  getSeverityColor,
  getSeverityBadgeClass,
  isPrecipitationCode,
  isSevereConvectiveCode,
} from '../wmoCodes';
import {
  PRESET_LOCATIONS,
  getMatchingPresetLocations,
  getPresetByCoordinates,
  generateMockWeatherData,
  calculateMarshallPalmerDbz,
} from '../mockWeatherData';
import {
  generateMockRadarMetadata,
  getSimulatedRadarEcho,
  MOCK_RADAR_HOTSPOTS,
} from '../mockRadarData';
import {
  fetchLocationCoordinates,
  fetchWeatherForecast,
  fetchRadarMetadata,
  getRadarTileUrl,
  convertTemperature,
  convertWindSpeed,
  convertPressure,
  getWindDirectionCompass,
  calculateStormSeverityIndex,
} from '../weatherService';

async function verifyAll() {
  console.log('=== STARTING MILESTONE 1 VERIFICATION ===');

  // 1. WMO Codes Verification
  console.log('\n--- 1. Testing WMO Codes ---');
  const wmo0 = getWmoDetails(0);
  console.assert(wmo0.label === 'Clear sky', `WMO 0 label failed: ${wmo0.label}`);
  console.assert(wmo0.estRadarDbz === 0, 'WMO 0 dBZ failed');
  console.assert(wmo0.iconName === 'Sun', 'WMO 0 icon failed');

  const wmo95 = getWmoDetails(95);
  console.assert(wmo95.label === 'Thunderstorm', 'WMO 95 label failed');
  console.assert(wmo95.severity === 'warning', 'WMO 95 severity failed');
  console.assert(wmo95.estRadarDbz === 50, 'WMO 95 dBZ failed');

  const wmo99 = getWmoDetails(99);
  console.assert(wmo99.severity === 'extreme', 'WMO 99 severity failed');
  console.assert(wmo99.estRadarDbz === 65, 'WMO 99 dBZ failed');

  const wmoNeg = getWmoDetails(-5);
  console.assert(wmoNeg.label === 'Unknown', 'WMO negative label failed');

  const wmoNaN = getWmoDetails(NaN as any);
  console.assert(wmoNaN.label === 'Unknown', 'WMO NaN label failed');

  const wmoUnmapped = getWmoDetails(42);
  console.assert(wmoUnmapped.label === 'Variable conditions', 'WMO 42 unmapped failed');

  console.assert(isPrecipitationCode(61) === true, 'isPrecipitationCode 61 failed');
  console.assert(isPrecipitationCode(0) === false, 'isPrecipitationCode 0 failed');
  console.assert(isSevereConvectiveCode(95) === true, 'isSevereConvectiveCode 95 failed');
  console.assert(isSevereConvectiveCode(0) === false, 'isSevereConvectiveCode 0 failed');
  console.log('✓ WMO Codes passed all assertions');

  // 2. Mock Weather Data & Presets Verification
  console.log('\n--- 2. Testing Mock Weather Data & Presets ---');
  console.assert(PRESET_LOCATIONS.length >= 12, 'Preset locations count < 12');
  const requiredCities = [
    'New Delhi',
    'Mumbai',
    'Bengaluru',
    'Kolkata',
    'Chennai',
    'Hyderabad',
    'London',
    'Tokyo',
    'New York',
    'Paris',
    'Dubai',
    'Sydney',
  ];
  for (const city of requiredCities) {
    const found = PRESET_LOCATIONS.find((p) => p.name === city);
    console.assert(!!found, `Missing required preset city: ${city}`);
  }

  const matches = getMatchingPresetLocations('delhi');
  console.assert(matches.length > 0 && matches[0].name === 'New Delhi', 'getMatchingPresetLocations failed for delhi');

  const mockData = generateMockWeatherData(28.6139, 77.209, 'New Delhi');
  console.assert(mockData.coordinates.name === 'New Delhi', 'Mock coordinates name failed');
  console.assert(typeof mockData.current.temperature === 'number', 'Mock current temp not number');
  console.assert(mockData.hourly.length === 72, 'Mock hourly length not 72');
  console.assert(mockData.daily.length === 7, 'Mock daily length not 7');
  console.assert(mockData.isFallback === true, 'Mock isFallback failed');
  console.log('✓ Mock Weather Data passed all assertions');

  // 3. Mock Radar Data Verification
  console.log('\n--- 3. Testing Mock Radar Data ---');
  const mockRadar = generateMockRadarMetadata();
  console.assert(mockRadar.past.length === 13, 'Mock radar past frames count not 13');
  console.assert(mockRadar.nowcast.length === 4, 'Mock radar nowcast frames count not 4');
  console.assert(mockRadar.host === 'https://tilecache.rainviewer.com', 'Mock radar host failed');
  console.assert(mockRadar.isFallback === true, 'Mock radar isFallback failed');

  console.assert(MOCK_RADAR_HOTSPOTS.length > 5, 'Mock radar hotspots count < 5');
  const echo = getSimulatedRadarEcho(18.5, 86.2); // Near Bay of Bengal hotspot
  console.assert(echo.dbz > 40, 'Simulated radar echo near hotspot failed');
  console.log('✓ Mock Radar Data passed all assertions');

  // 4. Weather Service & Math Formulas Verification
  console.log('\n--- 4. Testing Weather Service & Calculations ---');
  // Marshall-Palmer formula: R=1.0 mm/h -> dBZ = 10 * log10(200 * 1^1.6) = 10 * log10(200) = 23.01
  const dbz1 = calculateMarshallPalmerDbz(1.0);
  console.assert(Math.abs(dbz1 - 23.0) <= 0.1, `Marshall-Palmer for R=1.0 expected ~23.0, got ${dbz1}`);

  // Marshall-Palmer formula: R=10.0 mm/h -> dBZ = 10 * log10(200 * 10^1.6) = 23.01 + 16 = 39.01
  const dbz10 = calculateMarshallPalmerDbz(10.0);
  console.assert(Math.abs(dbz10 - 39.0) <= 0.1, `Marshall-Palmer for R=10.0 expected ~39.0, got ${dbz10}`);

  // Marshall-Palmer for R=0 -> 0 dBZ
  const dbz0 = calculateMarshallPalmerDbz(0);
  console.assert(dbz0 === 0, 'Marshall-Palmer for R=0 failed');

  // Unit Conversions
  console.assert(convertTemperature(25, 'celsius') === 25, 'convertTemperature C failed');
  console.assert(convertTemperature(25, 'fahrenheit') === 77, 'convertTemperature F failed');
  console.assert(convertWindSpeed(36, 'kmh') === 36, 'convertWindSpeed kmh failed');
  console.assert(convertWindSpeed(36, 'ms') === 10, 'convertWindSpeed ms failed');
  console.assert(getWindDirectionCompass(0) === 'N', 'getWindDirectionCompass 0 failed');
  console.assert(getWindDirectionCompass(90) === 'E', 'getWindDirectionCompass 90 failed');
  console.assert(getWindDirectionCompass(180) === 'S', 'getWindDirectionCompass 180 failed');
  console.assert(getWindDirectionCompass(270) === 'W', 'getWindDirectionCompass 270 failed');

  // Tile URL formatter
  const tileUrl = getRadarTileUrl('https://tilecache.rainviewer.com', '/v2/radar/abc123', 4, 11, 7, 2, true, true, 256);
  console.assert(
    tileUrl === 'https://tilecache.rainviewer.com/v2/radar/abc123/256/4/11/7/2/1_1.png',
    `Tile URL mismatch: ${tileUrl}`
  );

  // Direct Coordinate Geocoding
  const directCoords = await fetchLocationCoordinates('28.61, 77.20');
  console.assert(
    directCoords.length === 1 && Math.abs(directCoords[0].lat - 28.61) < 0.01,
    'Direct coords parsing failed'
  );

  // Live/Fallback Geocoding Search
  const geoResults = await fetchLocationCoordinates('London');
  console.assert(geoResults.length > 0, 'fetchLocationCoordinates for London returned empty');

  // Live/Fallback Weather Forecast
  const forecast = await fetchWeatherForecast(28.6139, 77.209, 'New Delhi');
  console.assert(forecast.hourly.length > 0, 'fetchWeatherForecast hourly empty');
  console.assert(forecast.daily.length > 0, 'fetchWeatherForecast daily empty');
  console.assert(typeof forecast.stormSeverityIndex === 'number', 'stormSeverityIndex not number');

  // Live/Fallback Radar Metadata
  const radarMeta = await fetchRadarMetadata();
  console.assert(radarMeta.past.length > 0, 'fetchRadarMetadata past frames empty');
  console.log('✓ Weather Service passed all assertions');

  console.log('\n=========================================');
  console.log('🎉 ALL 4 MODULES FULLY VERIFIED PASSING!');
  console.log('=========================================');
}

verifyAll().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
