import { WmoCodeInfo, WeatherCategory, WeatherSeverity } from '@/types/weather';

/**
 * Standard WMO Weather Interpretation Dictionary (Codes 0 to 99)
 * Maps WMO 4677 synoptic codes to human labels, descriptions, Lucide icon keys,
 * severity classifications, and baseline radar reflectivity estimates (dBZ).
 */
export const WMO_DICTIONARY: Record<number, WmoCodeInfo> = {
  0: {
    code: 0,
    label: 'Clear sky',
    description: 'Cloudless sky with unobstructed solar radiation and high visibility.',
    category: 'clear',
    severity: 'normal',
    iconName: 'Sun',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    estRadarDbz: 0,
  },
  1: {
    code: 1,
    label: 'Mainly clear',
    description: 'Scattered high cirrus or dissolving fair-weather cumulus clouds.',
    category: 'clear',
    severity: 'normal',
    iconName: 'SunMedium',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    estRadarDbz: 0,
  },
  2: {
    code: 2,
    label: 'Partly cloudy',
    description: 'Scattered cumulus or altocumulus clouds covering 30% to 60% of the sky.',
    category: 'clouds',
    severity: 'normal',
    iconName: 'CloudSun',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    estRadarDbz: 0,
  },
  3: {
    code: 3,
    label: 'Overcast',
    description: 'Stratocumulus or stratus cloud deck covering over 80% of the sky.',
    category: 'clouds',
    severity: 'normal',
    iconName: 'Cloud',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    estRadarDbz: 5,
  },
  4: {
    code: 4,
    label: 'Smoke Haze',
    description: 'Atmospheric visibility reduced by suspended smoke particulates.',
    category: 'fog',
    severity: 'advisory',
    iconName: 'CloudFog',
    badgeClass: 'bg-stone-500/20 text-stone-300 border-stone-500/30',
    estRadarDbz: 8,
  },
  5: {
    code: 5,
    label: 'Haze',
    description: 'Fine dry particles suspended in the air reducing horizontal visibility.',
    category: 'fog',
    severity: 'advisory',
    iconName: 'CloudFog',
    badgeClass: 'bg-stone-500/20 text-stone-300 border-stone-500/30',
    estRadarDbz: 8,
  },
  10: {
    code: 10,
    label: 'Mist',
    description: 'Microscopic water droplets in suspension, visibility between 1 km and 5 km.',
    category: 'fog',
    severity: 'normal',
    iconName: 'CloudFog',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    estRadarDbz: 10,
  },
  18: {
    code: 18,
    label: 'Squalls',
    description: 'Sudden, sharp increase in wind speed lasting several minutes with convective gusts.',
    category: 'thunderstorm',
    severity: 'warning',
    iconName: 'Wind',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    estRadarDbz: 35,
  },
  19: {
    code: 19,
    label: 'Funnel Cloud / Tornado',
    description: 'Violent rotating column of air extending from a cumulonimbus cloud base.',
    category: 'thunderstorm',
    severity: 'extreme',
    iconName: 'Tornado',
    badgeClass: 'bg-red-600/30 text-red-200 border-red-500/50 animate-pulse',
    estRadarDbz: 60,
  },
  45: {
    code: 45,
    label: 'Fog',
    description: 'Dense water droplets restricting surface visibility below 1 kilometer.',
    category: 'fog',
    severity: 'advisory',
    iconName: 'CloudFog',
    badgeClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
    estRadarDbz: 10,
  },
  48: {
    code: 48,
    label: 'Depositing rime fog',
    description: 'Supercooled fog freezing on contact with sub-zero ground surfaces.',
    category: 'fog',
    severity: 'advisory',
    iconName: 'CloudFog',
    badgeClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
    estRadarDbz: 12,
  },
  51: {
    code: 51,
    label: 'Light drizzle',
    description: 'Fine, gentle uniform water droplets falling with precipitation rate < 0.5 mm/h.',
    category: 'drizzle',
    severity: 'normal',
    iconName: 'CloudDrizzle',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    estRadarDbz: 18,
  },
  53: {
    code: 53,
    label: 'Moderate drizzle',
    description: 'Continuous steady drizzle with precipitation accumulation 0.5 - 1.5 mm/h.',
    category: 'drizzle',
    severity: 'normal',
    iconName: 'CloudDrizzle',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    estRadarDbz: 22,
  },
  55: {
    code: 55,
    label: 'Dense drizzle',
    description: 'Heavy, dense drizzle significantly wetting roads and reducing visibility.',
    category: 'drizzle',
    severity: 'advisory',
    iconName: 'CloudDrizzle',
    badgeClass: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
    estRadarDbz: 26,
  },
  56: {
    code: 56,
    label: 'Light freezing drizzle',
    description: 'Supercooled drizzle freezing on impact, causing glaze ice accumulation.',
    category: 'drizzle',
    severity: 'advisory',
    iconName: 'CloudSnow',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    estRadarDbz: 22,
  },
  57: {
    code: 57,
    label: 'Dense freezing drizzle',
    description: 'Heavy freezing drizzle causing rapid glaze accumulation and hazardous icing.',
    category: 'drizzle',
    severity: 'warning',
    iconName: 'CloudSnow',
    badgeClass: 'bg-indigo-600/20 text-indigo-300 border-indigo-600/30',
    estRadarDbz: 28,
  },
  61: {
    code: 61,
    label: 'Slight rain',
    description: 'Light stratiform precipitation falling at 0.5 - 2.5 mm/h.',
    category: 'rain',
    severity: 'normal',
    iconName: 'CloudRain',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    estRadarDbz: 24,
  },
  63: {
    code: 63,
    label: 'Moderate rain',
    description: 'Steady stratiform rain with accumulation rates between 2.5 and 7.5 mm/h.',
    category: 'rain',
    severity: 'normal',
    iconName: 'CloudRain',
    badgeClass: 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30',
    estRadarDbz: 34,
  },
  65: {
    code: 65,
    label: 'Heavy rain',
    description: 'Intense rainfall exceeding 7.5 mm/h with localized standing water pooling.',
    category: 'rain',
    severity: 'warning',
    iconName: 'CloudRain',
    badgeClass: 'bg-blue-600/25 text-blue-300 border-blue-500/40',
    estRadarDbz: 44,
  },
  66: {
    code: 66,
    label: 'Light freezing rain',
    description: 'Liquid rain drops that freeze immediately on sub-zero ground surfaces.',
    category: 'rain',
    severity: 'advisory',
    iconName: 'CloudSnow',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    estRadarDbz: 28,
  },
  67: {
    code: 67,
    label: 'Heavy freezing rain',
    description: 'Dangerous freezing downpour causing severe ice storms and powerline accretion.',
    category: 'rain',
    severity: 'warning',
    iconName: 'CloudSnow',
    badgeClass: 'bg-indigo-600/25 text-indigo-300 border-indigo-500/40',
    estRadarDbz: 42,
  },
  71: {
    code: 71,
    label: 'Slight snowfall',
    description: 'Light crystalline snow flurries with low accumulation rate (< 1 cm/h).',
    category: 'snow',
    severity: 'normal',
    iconName: 'CloudSnow',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    estRadarDbz: 20,
  },
  73: {
    code: 73,
    label: 'Moderate snowfall',
    description: 'Steady snowfall with accumulation rates between 1 and 3 cm/h.',
    category: 'snow',
    severity: 'advisory',
    iconName: 'CloudSnow',
    badgeClass: 'bg-teal-600/20 text-teal-300 border-teal-600/30',
    estRadarDbz: 28,
  },
  75: {
    code: 75,
    label: 'Heavy snowfall',
    description: 'Dense snowfall reducing visibility below 400m, rapid snow accumulation.',
    category: 'snow',
    severity: 'warning',
    iconName: 'CloudSnow',
    badgeClass: 'bg-teal-600/30 text-teal-200 border-teal-500/40',
    estRadarDbz: 38,
  },
  77: {
    code: 77,
    label: 'Snow grains',
    description: 'Very small opaque white grains of ice falling from stratiform clouds.',
    category: 'snow',
    severity: 'normal',
    iconName: 'CloudSnow',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    estRadarDbz: 18,
  },
  80: {
    code: 80,
    label: 'Slight rain showers',
    description: 'Brief, localized convective showers of light intensity.',
    category: 'showers',
    severity: 'normal',
    iconName: 'CloudRain',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    estRadarDbz: 26,
  },
  81: {
    code: 81,
    label: 'Moderate rain showers',
    description: 'Convective cell showers with sudden changes in intensity and rapid clearance.',
    category: 'showers',
    severity: 'normal',
    iconName: 'CloudRain',
    badgeClass: 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30',
    estRadarDbz: 36,
  },
  82: {
    code: 82,
    label: 'Violent rain showers',
    description: 'Torrential convective downpours exceeding 25 mm/h with gusty winds.',
    category: 'showers',
    severity: 'warning',
    iconName: 'CloudLightning',
    badgeClass: 'bg-amber-600/25 text-amber-300 border-amber-500/40',
    estRadarDbz: 48,
  },
  85: {
    code: 85,
    label: 'Slight snow showers',
    description: 'Intermittent convective snow bursts with gusty squalls.',
    category: 'snow',
    severity: 'normal',
    iconName: 'CloudSnow',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    estRadarDbz: 22,
  },
  86: {
    code: 86,
    label: 'Heavy snow showers',
    description: 'Intense snow squalls with severe visibility reduction and whiteout conditions.',
    category: 'snow',
    severity: 'warning',
    iconName: 'CloudSnow',
    badgeClass: 'bg-teal-600/25 text-teal-300 border-teal-500/40',
    estRadarDbz: 36,
  },
  95: {
    code: 95,
    label: 'Thunderstorm',
    description: 'Active convective thunderstorm cell with lightning discharges and heavy rain.',
    category: 'thunderstorm',
    severity: 'warning',
    iconName: 'CloudLightning',
    badgeClass: 'bg-purple-600/25 text-purple-300 border-purple-500/40',
    estRadarDbz: 50,
  },
  96: {
    code: 96,
    label: 'Thunderstorm with slight hail',
    description: 'Severe thunderstorm producing small hail stones (< 1 cm diameter).',
    category: 'thunderstorm',
    severity: 'warning',
    iconName: 'CloudHail',
    badgeClass: 'bg-pink-600/25 text-pink-300 border-pink-500/40',
    estRadarDbz: 55,
  },
  99: {
    code: 99,
    label: 'Thunderstorm with heavy hail',
    description: 'Violent supercell storm with severe hail core (> 2 cm), damaging winds, and high reflectivity.',
    category: 'thunderstorm',
    severity: 'extreme',
    iconName: 'Zap',
    badgeClass: 'bg-red-600/30 text-red-200 border-red-500/50 animate-pulse',
    estRadarDbz: 65,
  },
};

/**
 * Retrieve complete WMO interpretation data for any weather code (0 to 99).
 * Handles out-of-bounds, negative, NaN, and unmapped codes gracefully.
 */
export function getWmoDetails(code: number): WmoCodeInfo {
  if (typeof code !== 'number' || isNaN(code) || code < 0) {
    return {
      code: -1,
      label: 'Unknown',
      description: 'Unknown or invalid synoptic weather code.',
      category: 'clouds',
      severity: 'normal',
      iconName: 'Cloud',
      badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      estRadarDbz: 0,
    };
  }

  if (WMO_DICTIONARY[code]) {
    return WMO_DICTIONARY[code];
  }

  // Fallback for unmapped codes
  return {
    code,
    label: 'Variable conditions',
    description: 'Variable atmospheric conditions within typical regional variability.',
    category: 'clouds',
    severity: 'normal',
    iconName: 'Cloud',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    estRadarDbz: 10,
  };
}

/**
 * Alias for getWmoDetails to maintain compatibility across explorer blueprints.
 */
export const getWmoWeatherInfo = getWmoDetails;

/**
 * Maps severity level to semantic UI hex color codes.
 */
export function getSeverityColor(severity: WeatherSeverity | string): string {
  switch (severity?.toLowerCase()) {
    case 'extreme':
      return '#ef4444'; // Red-500
    case 'warning':
      return '#f97316'; // Orange-500
    case 'watch':
      return '#eab308'; // Yellow-500
    case 'advisory':
      return '#38bdf8'; // Sky-400
    case 'normal':
    default:
      return '#10b981'; // Emerald-500
  }
}

/**
 * Maps severity level to Tailwind badge classes.
 */
export function getSeverityBadgeClass(severity: WeatherSeverity | string): string {
  switch (severity?.toLowerCase()) {
    case 'extreme':
      return 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse';
    case 'warning':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'watch':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    case 'advisory':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    case 'normal':
    default:
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  }
}

/**
 * Maps weather category to default Lucide icon name.
 */
export function getCategoryIcon(category: WeatherCategory): string {
  switch (category) {
    case 'clear':
      return 'Sun';
    case 'clouds':
      return 'Cloud';
    case 'fog':
      return 'CloudFog';
    case 'drizzle':
      return 'CloudDrizzle';
    case 'rain':
      return 'CloudRain';
    case 'snow':
      return 'CloudSnow';
    case 'showers':
      return 'CloudRain';
    case 'thunderstorm':
      return 'CloudLightning';
    default:
      return 'Cloud';
  }
}

/**
 * Checks whether the given code represents active precipitation.
 */
export function isPrecipitationCode(code: number): boolean {
  return (
    (code >= 50 && code <= 99) ||
    [20, 21, 22, 23, 24, 25, 26, 27].includes(code)
  );
}

/**
 * Checks whether the code represents severe convective weather (thunderstorms, hail, squalls).
 */
export function isSevereConvectiveCode(code: number): boolean {
  return [18, 19, 82, 86, 95, 96, 97, 98, 99].includes(code);
}
