import {
  WeatherData,
  Coordinates,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  SearchSuggestion,
} from '@/types/weather';

/**
 * 12 Major Indian & International Metropolitan Presets + Regional Centers
 */
export const PRESET_LOCATIONS: SearchSuggestion[] = [
  // 12 Major Core Metros
  {
    id: 'loc_delhi',
    name: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Delhi NCR',
    elevation: 216,
    timezone: 'Asia/Kolkata',
    population: 33000000,
  },
  {
    id: 'loc_mumbai',
    name: 'Mumbai',
    latitude: 19.076,
    longitude: 72.8777,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Maharashtra',
    elevation: 14,
    timezone: 'Asia/Kolkata',
    population: 21000000,
  },
  {
    id: 'loc_bengaluru',
    name: 'Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Karnataka',
    elevation: 920,
    timezone: 'Asia/Kolkata',
    population: 13000000,
  },
  {
    id: 'loc_kolkata',
    name: 'Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    country: 'India',
    countryCode: 'IN',
    admin1: 'West Bengal',
    elevation: 9,
    timezone: 'Asia/Kolkata',
    population: 15000000,
  },
  {
    id: 'loc_chennai',
    name: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Tamil Nadu',
    elevation: 6,
    timezone: 'Asia/Kolkata',
    population: 11500000,
  },
  {
    id: 'loc_hyderabad',
    name: 'Hyderabad',
    latitude: 17.385,
    longitude: 78.4867,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Telangana',
    elevation: 542,
    timezone: 'Asia/Kolkata',
    population: 10500000,
  },
  {
    id: 'loc_london',
    name: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    country: 'United Kingdom',
    countryCode: 'GB',
    admin1: 'Greater London',
    elevation: 25,
    timezone: 'Europe/London',
    population: 9500000,
  },
  {
    id: 'loc_tokyo',
    name: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    country: 'Japan',
    countryCode: 'JP',
    admin1: 'Tokyo Prefecture',
    elevation: 40,
    timezone: 'Asia/Tokyo',
    population: 37000000,
  },
  {
    id: 'loc_newyork',
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    country: 'United States',
    countryCode: 'US',
    admin1: 'New York',
    elevation: 10,
    timezone: 'America/New_York',
    population: 8800000,
  },
  {
    id: 'loc_paris',
    name: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    country: 'France',
    countryCode: 'FR',
    admin1: 'Île-de-France',
    elevation: 35,
    timezone: 'Europe/Paris',
    population: 2100000,
  },
  {
    id: 'loc_dubai',
    name: 'Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    country: 'United Arab Emirates',
    countryCode: 'AE',
    admin1: 'Dubai',
    elevation: 16,
    timezone: 'Asia/Dubai',
    population: 3600000,
  },
  {
    id: 'loc_sydney',
    name: 'Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    country: 'Australia',
    countryCode: 'AU',
    admin1: 'New South Wales',
    elevation: 19,
    timezone: 'Australia/Sydney',
    population: 5300000,
  },
  // Key Indian Regional Hubs
  {
    id: 'loc_srinagar',
    name: 'Srinagar',
    latitude: 34.0837,
    longitude: 74.7973,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Jammu & Kashmir',
    elevation: 1585,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'loc_guwahati',
    name: 'Guwahati',
    latitude: 26.1445,
    longitude: 91.7362,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Assam',
    elevation: 55,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'loc_portblair',
    name: 'Port Blair',
    latitude: 11.6234,
    longitude: 92.7265,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Andaman & Nicobar Islands',
    elevation: 16,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'loc_jaipur',
    name: 'Jaipur',
    latitude: 26.9124,
    longitude: 75.7873,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Rajasthan',
    elevation: 431,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'loc_ahmedabad',
    name: 'Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Gujarat',
    elevation: 53,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'loc_kochi',
    name: 'Kochi',
    latitude: 9.9312,
    longitude: 76.2673,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Kerala',
    elevation: 5,
    timezone: 'Asia/Kolkata',
  },
];

export const MAJOR_LOCATION_PRESETS = PRESET_LOCATIONS;

/**
 * Filters preset locations based on search query matching name, admin1, or country.
 * Returns up to 8 default locations if query is empty.
 * @param query - Search string to filter locations
 * @returns Array of matching SearchSuggestion objects
 */
export function getMatchingPresetLocations(query: string): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return PRESET_LOCATIONS.slice(0, 8);
  return PRESET_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      (loc.admin1 && loc.admin1.toLowerCase().includes(q)) ||
      (loc.country && loc.country.toLowerCase().includes(q)) ||
      (loc.countryCode && loc.countryCode.toLowerCase().includes(q))
  );
}

export const getMatchingFallbackPresets = getMatchingPresetLocations;

/**
 * Finds the nearest preset location to given coordinates within a tolerance threshold.
 * @param lat - Latitude in decimal degrees
 * @param lon - Longitude in decimal degrees
 * @param tolerance - Maximum distance in degrees to match (default: 0.5)
 * @returns Matching SearchSuggestion or undefined if none found within tolerance
 */
export function getPresetByCoordinates(
  lat: number,
  lon: number,
  tolerance = 0.5
): SearchSuggestion | undefined {
  return PRESET_LOCATIONS.find(
    (loc) =>
      Math.abs(loc.latitude - lat) <= tolerance &&
      Math.abs(loc.longitude - lon) <= tolerance
  );
}

/**
 * Marshall-Palmer Reflectivity Formula:
 * Z = 200 * R^1.6
 * dBZ = 10 * log10(Z) = 23.01 + 16 * log10(R)
 */
export function calculateMarshallPalmerDbz(rainRateMmH: number): number {
  if (!rainRateMmH || rainRateMmH <= 0.01) return 0;
  const z = 200 * Math.pow(rainRateMmH, 1.6);
  const dbz = 10 * Math.log10(z);
  return Math.max(0, Math.min(75, Math.round(dbz * 10) / 10));
}

/**
 * Generates a deterministic pseudo-random number from coordinates and seed offset.
 * Uses sine-based hash function for reproducible randomness across same inputs.
 * @param lat - Latitude coordinate
 * @param lon - Longitude coordinate
 * @param seed - Seed offset for variation
 * @returns Pseudo-random value between 0 and 1
 */
function pseudoRandom(lat: number, lon: number, seed: number): number {
  const x = Math.sin(lat * 12.9898 + lon * 78.233 + seed * 37.719) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Procedural deterministic weather data generator.
 * Generates realistic meteorologically sound weather metrics for any point on Earth
 * using coordinate-based algorithmic modeling with diurnal cycles and climate zones.
 * @param lat - Latitude in decimal degrees
 * @param lon - Longitude in decimal degrees
 * @param name - Optional location name
 * @param admin1 - Optional administrative region name
 * @param country - Optional country name
 * @returns Complete WeatherData object with current, hourly (72h), and daily (7d) forecasts
 */
export function generateMockWeatherData(
  lat: number,
  lon: number,
  name?: string,
  admin1?: string,
  country?: string
): WeatherData {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const fractionalHour = currentHour + currentMinute / 60;

  // Resolve location metadata from preset if coordinate is close
  const nearbyPreset = getPresetByCoordinates(lat, lon, 0.4);
  const resolvedName = name || nearbyPreset?.name || `${lat >= 0 ? lat.toFixed(2) + '°N' : Math.abs(lat).toFixed(2) + '°S'}, ${lon >= 0 ? lon.toFixed(2) + '°E' : Math.abs(lon).toFixed(2) + '°W'}`;
  const resolvedAdmin = admin1 || nearbyPreset?.admin1;
  const resolvedCountry = country || nearbyPreset?.country;

  const coordinates: Coordinates = {
    lat,
    lon,
    name: resolvedName,
    admin1: resolvedAdmin,
    country: resolvedCountry,
  };

  // Base temperature model based on latitude and elevation
  const absLat = Math.abs(lat);
  const baseTemp = Math.max(-10, Math.min(38, 36 - absLat * 0.62));
  
  // Diurnal sinusoidal oscillation: lowest around 06:00, peak around 14:30
  const diurnalShift = 6.2 * Math.sin(((fractionalHour - 8.5) * Math.PI) / 12);
  const curTemp = Math.round((baseTemp + diurnalShift) * 10) / 10;

  // Relative humidity inverse relation to temperature
  const curHumidity = Math.max(
    25,
    Math.min(98, Math.round(80 - (curTemp - 14) * 1.8 + pseudoRandom(lat, lon, 1) * 10))
  );

  // Dew point approximation (Magnus formula simplification)
  const curDewPoint = Math.round((curTemp - (100 - curHumidity) / 5) * 10) / 10;

  // Rain probability & rain rate
  const rainSeed = pseudoRandom(lat, lon, 2);
  const isWetClimate = (absLat < 25 && lon > 70 && lon < 100) || rainSeed > 0.65;
  const curRain = isWetClimate ? Math.round((rainSeed * 4.5) * 10) / 10 : 0;
  const curPrecipProb = isWetClimate ? Math.round(55 + rainSeed * 35) : Math.round(rainSeed * 25);

  // Weather code determination
  let curWeatherCode = 0;
  if (curRain > 15) {
    curWeatherCode = 95; // Thunderstorm
  } else if (curRain > 7.5) {
    curWeatherCode = 65; // Heavy rain
  } else if (curRain > 2.0) {
    curWeatherCode = 63; // Moderate rain
  } else if (curRain > 0.2) {
    curWeatherCode = 61; // Slight rain
  } else if (curHumidity > 85 && curTemp < 10) {
    curWeatherCode = 45; // Fog
  } else if (curHumidity > 70) {
    curWeatherCode = 3; // Overcast
  } else if (curHumidity > 50) {
    curWeatherCode = 2; // Partly cloudy
  } else if (curHumidity > 35) {
    curWeatherCode = 1; // Mainly clear
  } else {
    curWeatherCode = 0; // Clear sky
  }

  // Wind metrics
  const windBase = 8 + pseudoRandom(lat, lon, 3) * 12;
  const curWindSpeed = Math.round(windBase * 10) / 10;
  const curWindGusts = Math.round((windBase * 1.5 + pseudoRandom(lat, lon, 4) * 10) * 10) / 10;
  const curWindDir = Math.round(pseudoRandom(lat, lon, 5) * 360);

  // Solar UV Index
  const isDay = fractionalHour >= 6.0 && fractionalHour <= 18.5;
  const curUv = isDay
    ? Math.max(0, Math.round(11 * Math.sin(((fractionalHour - 6) * Math.PI) / 12.5) * (1 - (curWeatherCode > 2 ? 0.5 : 0))))
    : 0;

  // Surface pressure (1013.25 hPa sea-level standard adjusted for latitude)
  const curPressure = Math.round((1013.2 - (absLat > 35 ? 8 : 2) + pseudoRandom(lat, lon, 6) * 6) * 10) / 10;

  // Cloud cover percentage
  const curCloudCover = Math.min(
    100,
    Math.max(5, curRain > 0 ? 85 + Math.round(rainSeed * 15) : Math.round(curHumidity * 0.8))
  );

  // Visibility (meters)
  const curVisibility = curWeatherCode === 45 ? 800 : curRain > 5 ? 4000 : 10000;

  // Apparent temperature (heat index / wind chill approximation)
  let apparentTemp = curTemp;
  if (curTemp >= 26) {
    apparentTemp = Math.round((curTemp + (curHumidity - 50) * 0.12) * 10) / 10;
  } else if (curTemp <= 10) {
    apparentTemp = Math.round((13.12 + 0.6215 * curTemp - 11.37 * Math.pow(curWindSpeed, 0.16) + 0.3965 * curTemp * Math.pow(curWindSpeed, 0.16)) * 10) / 10;
  }

  const derivedDbz = calculateMarshallPalmerDbz(curRain);

  // Composite Storm Severity Index (0 - 100)
  let stormSeverityIndex = 0;
  if ([95, 96, 99].includes(curWeatherCode)) stormSeverityIndex += 45;
  else if ([82, 65, 67].includes(curWeatherCode)) stormSeverityIndex += 30;
  else if ([63, 81].includes(curWeatherCode)) stormSeverityIndex += 15;

  if (curWindGusts > 60) stormSeverityIndex += 25;
  else if (curWindGusts > 40) stormSeverityIndex += 15;

  if (derivedDbz > 45) stormSeverityIndex += 20;
  else if (derivedDbz > 30) stormSeverityIndex += 10;

  if (curRain > 10) stormSeverityIndex += 10;
  stormSeverityIndex = Math.min(100, Math.max(0, stormSeverityIndex));

  const current: CurrentWeather = {
    temperature: curTemp,
    apparentTemperature: apparentTemp,
    relativeHumidity: curHumidity,
    precipitation: curRain,
    precipitationProbability: curPrecipProb,
    weatherCode: curWeatherCode,
    surfacePressure: curPressure,
    windSpeed: curWindSpeed,
    windDirection: curWindDir,
    windGusts: curWindGusts,
    uvIndex: curUv,
    dewPoint: curDewPoint,
    cloudCover: curCloudCover,
    visibility: curVisibility,
    isDay,
    timestamp: now.toISOString(),
  };

  // Generate 72-Hour Continuous Hourly Forecast
  const hourly: HourlyForecastItem[] = [];
  for (let i = 0; i < 72; i++) {
    const hTime = new Date(now.getTime() + i * 3600 * 1000);
    const h = hTime.getHours();
    const hFract = h + hTime.getMinutes() / 60;
    const hDiurnal = 6.2 * Math.sin(((hFract - 8.5) * Math.PI) / 12);
    const hTemp = Math.round((baseTemp + hDiurnal + pseudoRandom(lat, lon, i + 10) * 1.5) * 10) / 10;
    const hHumidity = Math.max(25, Math.min(98, Math.round(80 - (hTemp - 14) * 1.8)));
    const hDewPoint = Math.round((hTemp - (100 - hHumidity) / 5) * 10) / 10;

    const hRainCycle = Math.sin((i + rainSeed * 10) * 0.45);
    const hRainProb = Math.max(5, Math.min(95, Math.round(35 + 45 * hRainCycle)));
    const hRain = hRainProb > 55 ? Math.round(((hRainProb - 55) * 0.14) * 10) / 10 : 0;

    let hCode = 0;
    if (hRain > 8) hCode = 95;
    else if (hRain > 3) hCode = 65;
    else if (hRain > 0.4) hCode = 61;
    else if (hRainProb > 60) hCode = 3;
    else if (hRainProb > 35) hCode = 2;
    else if (hRainProb > 15) hCode = 1;

    const hDbz = calculateMarshallPalmerDbz(hRain);
    const hWind = Math.round((windBase + 4 * Math.sin(i * 0.3)) * 10) / 10;
    const hIsDay = h >= 6 && h <= 18;
    const hUv = hIsDay ? Math.max(0, Math.round(10 * Math.sin(((h - 6) * Math.PI) / 12.5))) : 0;

    hourly.push({
      time: hTime.toISOString(),
      temperature: hTemp,
      apparentTemperature: Math.round((hTemp + (hHumidity > 65 ? 2.5 : -1.0)) * 10) / 10,
      relativeHumidity: hHumidity,
      dewPoint: hDewPoint,
      precipitationProbability: hRainProb,
      precipitation: hRain,
      weatherCode: hCode,
      surfacePressure: Math.round((curPressure + Math.sin(i * 0.2) * 2) * 10) / 10,
      cloudCover: Math.min(100, Math.max(10, Math.round(hRainProb * 0.9 + 10))),
      visibility: hRain > 3 ? 5000 : 10000,
      windSpeed: hWind,
      windDirection: (curWindDir + i * 4) % 360,
      uvIndex: hUv,
      estimatedDbz: hDbz,
    });
  }

  // Generate 7-Day Multi-Day Daily Forecast
  const daily: DailyForecastItem[] = [];
  for (let d = 0; d < 7; d++) {
    const dTime = new Date(now.getTime() + d * 86400 * 1000);
    const dateStr = dTime.toISOString().split('T')[0];
    const dSeed = pseudoRandom(lat, lon, d + 100);

    const maxT = Math.round((baseTemp + 5.5 + dSeed * 3) * 10) / 10;
    const minT = Math.round((baseTemp - 5.5 + dSeed * 2) * 10) / 10;
    const dRainSum = dSeed > 0.4 ? Math.round((dSeed * 12) * 10) / 10 : 0;
    const dProbMax = dRainSum > 0 ? Math.round(50 + dSeed * 45) : Math.round(dSeed * 30);

    let dCode = 0;
    if (dRainSum > 15) dCode = 95;
    else if (dRainSum > 5) dCode = 65;
    else if (dRainSum > 0) dCode = 61;
    else if (dProbMax > 40) dCode = 2;
    else dCode = 0;

    daily.push({
      date: dateStr,
      weatherCode: dCode,
      temperatureMax: maxT,
      temperatureMin: minT,
      apparentTemperatureMax: Math.round((maxT + 2.8) * 10) / 10,
      apparentTemperatureMin: Math.round((minT - 0.8) * 10) / 10,
      precipitationSum: dRainSum,
      precipitationProbabilityMax: dProbMax,
      windSpeedMax: Math.round((curWindSpeed + 6 + dSeed * 8) * 10) / 10,
      windGustsMax: Math.round((curWindGusts + 10 + dSeed * 12) * 10) / 10,
      windDirectionDominant: Math.round((curWindDir + d * 15) % 360),
      uvIndexMax: Math.round((8.5 + dSeed * 2.5) * 10) / 10,
      sunrise: '06:05',
      sunset: '18:45',
    });
  }

  return {
    coordinates,
    current,
    hourly,
    daily,
    stormSeverityIndex,
    derivedDbz,
    isFallback: true,
    lastUpdated: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export const generateMockForecastData = generateMockWeatherData;
