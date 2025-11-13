// Air Quality Index calculations for Sky-Cast Weather App
import { AirQuality, AirQualityComponent } from '@/types';

// AQI breakpoints for different pollutants (EPA standard)
interface AQIBreakpoint {
  concentrationLow: number;
  concentrationHigh: number;
  indexLow: number;
  indexHigh: number;
}

const PM25_BREAKPOINTS: AQIBreakpoint[] = [
  { concentrationLow: 0, concentrationHigh: 12.0, indexLow: 0, indexHigh: 50 },
  { concentrationLow: 12.1, concentrationHigh: 35.4, indexLow: 51, indexHigh: 100 },
  { concentrationLow: 35.5, concentrationHigh: 55.4, indexLow: 101, indexHigh: 150 },
  { concentrationLow: 55.5, concentrationHigh: 150.4, indexLow: 151, indexHigh: 200 },
  { concentrationLow: 150.5, concentrationHigh: 250.4, indexLow: 201, indexHigh: 300 },
  { concentrationLow: 250.5, concentrationHigh: 350.4, indexLow: 301, indexHigh: 400 },
  { concentrationLow: 350.5, concentrationHigh: 500.4, indexLow: 401, indexHigh: 500 },
];

const PM10_BREAKPOINTS: AQIBreakpoint[] = [
  { concentrationLow: 0, concentrationHigh: 54, indexLow: 0, indexHigh: 50 },
  { concentrationLow: 55, concentrationHigh: 154, indexLow: 51, indexHigh: 100 },
  { concentrationLow: 155, concentrationHigh: 254, indexLow: 101, indexHigh: 150 },
  { concentrationLow: 255, concentrationHigh: 354, indexLow: 151, indexHigh: 200 },
  { concentrationLow: 355, concentrationHigh: 424, indexLow: 201, indexHigh: 300 },
  { concentrationLow: 425, concentrationHigh: 504, indexLow: 301, indexHigh: 400 },
  { concentrationLow: 505, concentrationHigh: 604, indexLow: 401, indexHigh: 500 },
];

const CO_BREAKPOINTS: AQIBreakpoint[] = [
  { concentrationLow: 0, concentrationHigh: 4.4, indexLow: 0, indexHigh: 50 },
  { concentrationLow: 4.5, concentrationHigh: 9.4, indexLow: 51, indexHigh: 100 },
  { concentrationLow: 9.5, concentrationHigh: 12.4, indexLow: 101, indexHigh: 150 },
  { concentrationLow: 12.5, concentrationHigh: 15.4, indexLow: 151, indexHigh: 200 },
  { concentrationLow: 15.5, concentrationHigh: 30.4, indexLow: 201, indexHigh: 300 },
  { concentrationLow: 30.5, concentrationHigh: 40.4, indexLow: 301, indexHigh: 400 },
  { concentrationLow: 40.5, concentrationHigh: 50.4, indexLow: 401, indexHigh: 500 },
];

const O3_BREAKPOINTS: AQIBreakpoint[] = [
  { concentrationLow: 0, concentrationHigh: 54, indexLow: 0, indexHigh: 50 },
  { concentrationLow: 55, concentrationHigh: 70, indexLow: 51, indexHigh: 100 },
  { concentrationLow: 71, concentrationHigh: 85, indexLow: 101, indexHigh: 150 },
  { concentrationLow: 86, concentrationHigh: 105, indexLow: 151, indexHigh: 200 },
  { concentrationLow: 106, concentrationHigh: 200, indexLow: 201, indexHigh: 300 },
];

const NO2_BREAKPOINTS: AQIBreakpoint[] = [
  { concentrationLow: 0, concentrationHigh: 53, indexLow: 0, indexHigh: 50 },
  { concentrationLow: 54, concentrationHigh: 100, indexLow: 51, indexHigh: 100 },
  { concentrationLow: 101, concentrationHigh: 360, indexLow: 101, indexHigh: 150 },
  { concentrationLow: 361, concentrationHigh: 649, indexLow: 151, indexHigh: 200 },
  { concentrationLow: 650, concentrationHigh: 1249, indexLow: 201, indexHigh: 300 },
  { concentrationLow: 1250, concentrationHigh: 1649, indexLow: 301, indexHigh: 400 },
  { concentrationLow: 1650, concentrationHigh: 2049, indexLow: 401, indexHigh: 500 },
];

const SO2_BREAKPOINTS: AQIBreakpoint[] = [
  { concentrationLow: 0, concentrationHigh: 35, indexLow: 0, indexHigh: 50 },
  { concentrationLow: 36, concentrationHigh: 75, indexLow: 51, indexHigh: 100 },
  { concentrationLow: 76, concentrationHigh: 185, indexLow: 101, indexHigh: 150 },
  { concentrationLow: 186, concentrationHigh: 304, indexLow: 151, indexHigh: 200 },
];

// Calculate AQI for a single pollutant
function calculateSubIndex(
  concentration: number,
  breakpoints: AQIBreakpoint[]
): number {
  for (const bp of breakpoints) {
    if (concentration >= bp.concentrationLow && concentration <= bp.concentrationHigh) {
      const range = bp.indexHigh - bp.indexLow;
      const concentrationRange = bp.concentrationHigh - bp.concentrationLow;
      const concentrationOffset = concentration - bp.concentrationLow;

      return Math.round((range / concentrationRange) * concentrationOffset + bp.indexLow);
    }
  }

  return 0;
}

// Calculate overall AQI from multiple pollutants
export function calculateAQI(components: AirQualityComponent): number {
  const subIndices = [
    calculateSubIndex(components.pm2_5, PM25_BREAKPOINTS),
    calculateSubIndex(components.pm10, PM10_BREAKPOINTS),
    calculateSubIndex(components.co, CO_BREAKPOINTS),
    calculateSubIndex(components.o3, O3_BREAKPOINTS),
    calculateSubIndex(components.no2, NO2_BREAKPOINTS),
    calculateSubIndex(components.so2, SO2_BREAKPOINTS),
  ];

  return Math.max(...subIndices);
}

// Get AQI level and color
export function getAQILevel(aqi: number): {
  level: string;
  color: string;
  description: string;
  healthEffects: string;
  recommendation: string;
} {
  if (aqi <= 50) {
    return {
      level: 'Good',
      color: '#00E400',
      description: 'Air quality is satisfactory',
      healthEffects: 'Little or no risk',
      recommendation: 'Enjoy outdoor activities',
    };
  } else if (aqi <= 100) {
    return {
      level: 'Fair',
      color: '#FFFF00',
      description: 'Air quality is acceptable',
      healthEffects: 'Sensitive individuals may experience minor issues',
      recommendation: 'Unusually sensitive people should consider limiting prolonged outdoor exertion',
    };
  } else if (aqi <= 150) {
    return {
      level: 'Moderate',
      color: '#FF7E00',
      description: 'Members of sensitive groups may experience health effects',
      healthEffects: 'Sensitive individuals may experience minor to moderate symptoms',
      recommendation: 'Sensitive groups should limit prolonged outdoor exertion',
    };
  } else if (aqi <= 200) {
    return {
      level: 'Poor',
      color: '#FF0000',
      description: 'Everyone may begin to experience health effects',
      healthEffects: 'Members of the general public may experience health effects',
      recommendation: 'Everyone should limit prolonged outdoor exertion',
    };
  } else if (aqi <= 300) {
    return {
      level: 'Very Poor',
      color: '#8F3F97',
      description: 'Health warnings of emergency conditions',
      healthEffects: 'Everyone is more likely to be affected',
      recommendation: 'Avoid prolonged outdoor exertion',
    };
  } else {
    return {
      level: 'Hazardous',
      color: '#7E0023',
      description: 'Emergency conditions',
      healthEffects: 'Everyone is likely to be affected',
      recommendation: 'Avoid all outdoor activities',
    };
  }
}

// Get dominant pollutant
export function getDominantPollutant(components: AirQualityComponent): {
  name: string;
  concentration: number;
  aqi: number;
  unit: string;
} {
  const pollutants = [
    { name: 'PM2.5', value: components.pm2_5, breakpoints: PM25_BREAKPOINTS, unit: 'µg/m³' },
    { name: 'PM10', value: components.pm10, breakpoints: PM10_BREAKPOINTS, unit: 'µg/m³' },
    { name: 'CO', value: components.co, breakpoints: CO_BREAKPOINTS, unit: 'mg/m³' },
    { name: 'O₃', value: components.o3, breakpoints: O3_BREAKPOINTS, unit: 'µg/m³' },
    { name: 'NO₂', value: components.no2, breakpoints: NO2_BREAKPOINTS, unit: 'µg/m³' },
    { name: 'SO₂', value: components.so2, breakpoints: SO2_BREAKPOINTS, unit: 'µg/m³' },
  ];

  const dominant = pollutants.reduce((max, pollutant) => {
    const aqi = calculateSubIndex(pollutant.value, pollutant.breakpoints);
    return aqi > max.aqi
      ? { name: pollutant.name, concentration: pollutant.value, aqi, unit: pollutant.unit }
      : max;
  }, { name: '', concentration: 0, aqi: 0, unit: '' });

  return dominant;
}

// Get pollutant-specific information
export function getPollutantInfo(pollutant: string): {
  name: string;
  description: string;
  sources: string[];
  healthEffects: string[];
  whoStandard?: number;
  unit: string;
} {
  const pollutantInfo: Record<string, any> = {
    'PM2.5': {
      name: 'Fine Particulate Matter',
      description: 'Tiny particles with diameters of 2.5 micrometers or less',
      sources: ['Vehicle exhaust', 'Industrial emissions', 'Wildfires', 'Construction'],
      healthEffects: [
        'Can penetrate deep into lungs',
        'Linked to heart and lung diseases',
        'Aggravates asthma',
        'Reduces lung function'
      ],
      whoStandard: 15,
      unit: 'µg/m³',
    },
    'PM10': {
      name: 'Coarse Particulate Matter',
      description: 'Particles with diameters between 2.5 and 10 micrometers',
      sources: ['Dust', 'Pollen', 'Mold spores', 'Industrial processes'],
      healthEffects: [
        'Irritates airways',
        'Coughing and wheezing',
        'Aggravates asthma',
        'Reduces lung function'
      ],
      whoStandard: 45,
      unit: 'µg/m³',
    },
    'CO': {
      name: 'Carbon Monoxide',
      description: 'Colorless, odorless gas produced by incomplete combustion',
      sources: ['Vehicle exhaust', 'Industrial processes', 'Burning wood', 'Power plants'],
      healthEffects: [
        'Reduces oxygen delivery to organs',
        'Headaches and dizziness',
        'Chest pain at high levels',
        'Can be life-threatening'
      ],
      whoStandard: 10,
      unit: 'mg/m³',
    },
    'O₃': {
      name: 'Ozone',
      description: 'Gas composed of three oxygen atoms',
      sources: ['Vehicle emissions', 'Industrial emissions', 'Chemical reactions', 'Sunlight'],
      healthEffects: [
        'Irritates respiratory system',
        'Coughing and throat irritation',
        'Reduces lung function',
        'Aggravates asthma'
      ],
      whoStandard: 100,
      unit: 'µg/m³',
    },
    'NO₂': {
      name: 'Nitrogen Dioxide',
      description: 'Reddish-brown gas with pungent odor',
      sources: ['Vehicle exhaust', 'Power plants', 'Industrial processes', 'Fuel combustion'],
      healthEffects: [
        'Irritates airways',
        'Aggravates respiratory diseases',
        'Increases susceptibility to infections',
        'Forms ozone and particulate matter'
      ],
      whoStandard: 40,
      unit: 'µg/m³',
    },
    'SO₂': {
      name: 'Sulfur Dioxide',
      description: 'Colorless gas with strong, choking odor',
      sources: ['Fossil fuel combustion', 'Industrial processes', 'Volcanic eruptions'],
      healthEffects: [
        'Irritates respiratory system',
        'Coughing and wheezing',
        'Aggravates asthma',
        'Forms acid rain'
      ],
      whoStandard: 20,
      unit: 'µg/m³',
    },
  };

  return pollutantInfo[pollutant] || {
    name: pollutant,
    description: 'Unknown pollutant',
    sources: [],
    healthEffects: [],
    unit: '',
  };
}

// Convert OpenWeatherMap AQI scale (1-5) to US EPA AQI scale (0-500)
export function convertOpenWeatherAQI(owmAQI: number): number {
  const conversion = {
    1: 25,  // Good -> 25
    2: 75,  // Fair -> 75
    3: 125, // Moderate -> 125
    4: 175, // Poor -> 175
    5: 250, // Very Poor -> 250
  };

  return conversion[owmAQI as keyof typeof conversion] || 50;
}

// Check if AQI level is healthy for sensitive groups
export function isHealthyForSensitiveGroups(aqi: number): boolean {
  return aqi <= 100;
}

// Check if AQI level is healthy for general population
export function isHealthyForGeneralPopulation(aqi: number): boolean {
  return aqi <= 50;
}

// Get air quality trend (improving, worsening, stable)
export function getAQITrend(currentAQI: number, previousAQI: number): {
  trend: 'improving' | 'worsening' | 'stable';
  change: number;
  description: string;
} {
  const change = currentAQI - previousAQI;
  const absChange = Math.abs(change);

  let trend: 'improving' | 'worsening' | 'stable';
  let description: string;

  if (absChange <= 5) {
    trend = 'stable';
    description = 'Air quality remains stable';
  } else if (change > 0) {
    trend = 'worsening';
    description = absChange <= 25 ? 'Slightly worsening' : 'Significantly worsening';
  } else {
    trend = 'improving';
    description = absChange <= 25 ? 'Slightly improving' : 'Significantly improving';
  }

  return { trend, change, description };
}

// Format pollutant concentration
export function formatPollutantConcentration(
  pollutant: string,
  concentration: number
): string {
  const unit = getPollutantInfo(pollutant).unit;

  if (concentration < 0.01) {
    return `${concentration.toFixed(3)} ${unit}`;
  } else if (concentration < 1) {
    return `${concentration.toFixed(2)} ${unit}`;
  } else {
    return `${Math.round(concentration)} ${unit}`;
  }
}

// Get health recommendation based on AQI and activity
export function getHealthRecommendation(
  aqi: number,
  activity: 'general' | 'outdoor' | 'exercise' | 'sensitive' = 'general'
): string {
  if (aqi <= 50) {
    return 'Air quality is excellent for all activities';
  } else if (aqi <= 100) {
    if (activity === 'sensitive') {
      return 'Consider reducing prolonged outdoor exertion';
    }
    return 'Generally good for outdoor activities';
  } else if (aqi <= 150) {
    if (activity === 'sensitive') {
      return 'Limit prolonged outdoor exertion';
    }
    if (activity === 'exercise') {
      return 'Consider reducing intense outdoor activities';
    }
    return 'Acceptable for most outdoor activities';
  } else if (aqi <= 200) {
    if (activity === 'outdoor' || activity === 'exercise') {
      return 'Limit prolonged outdoor activities';
    }
    if (activity === 'sensitive') {
      return 'Avoid all outdoor exertion';
    }
    return 'Limit outdoor activities';
  } else {
    return 'Avoid all outdoor activities';
  }
}