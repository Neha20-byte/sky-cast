// Weather utility functions for Sky-Cast Weather App
import {
  WeatherCondition,
  WeatherData,
  AirQuality,
  DailyForecast,
  TemperatureUnit,
  TimeOfDay,
} from '@/types';

// Weather condition mapping
export const WEATHER_CONDITION_MAP: Record<string, WeatherCondition> = {
  'clear': 'clear',
  'clear sky': 'clear',
  'clouds': 'clouds',
  'few clouds': 'clouds',
  'scattered clouds': 'clouds',
  'broken clouds': 'clouds',
  'overcast clouds': 'clouds',
  'rain': 'rain',
  'shower rain': 'rain',
  'drizzle': 'drizzle',
  'light intensity drizzle': 'drizzle',
  'thunderstorm': 'thunderstorm',
  'thunderstorm with rain': 'thunderstorm',
  'thunderstorm with drizzle': 'thunderstorm',
  'snow': 'snow',
  'light snow': 'snow',
  'heavy snow': 'snow',
  'mist': 'mist',
  'fog': 'fog',
  'haze': 'haze',
  'dust': 'dust',
  'sand': 'sand',
  'ash': 'ash',
  'squall': 'squall',
  'tornado': 'tornado',
};

// Weather icons mapping (Lucide React icons)
export const WEATHER_ICONS = {
  clear: {
    day: 'Sun',
    night: 'Moon',
  },
  clouds: {
    day: 'Cloud',
    night: 'CloudMoon',
  },
  rain: {
    day: 'CloudRain',
    night: 'CloudRain',
  },
  drizzle: {
    day: 'CloudDrizzle',
    night: 'CloudDrizzle',
  },
  thunderstorm: {
    day: 'CloudLightning',
    night: 'CloudLightning',
  },
  snow: {
    day: 'CloudSnow',
    night: 'CloudSnow',
  },
  mist: {
    day: 'CloudFog',
    night: 'CloudFog',
  },
  fog: {
    day: 'CloudFog',
    night: 'CloudFog',
  },
  haze: {
    day: 'SunDim',
    night: 'Moon',
  },
  dust: {
    day: 'Wind',
    night: 'Wind',
  },
  sand: {
    day: 'Wind',
    night: 'Wind',
  },
  ash: {
    day: 'Wind',
    night: 'Wind',
  },
  squall: {
    day: 'Wind',
    night: 'Wind',
  },
  tornado: {
    day: 'Tornado',
    night: 'Tornado',
  },
};

// Background image themes for weather conditions
export const WEATHER_BACKGROUNDS = {
  clear: {
    day: 'sunny-day',
    night: 'clear-night',
    dawn: 'sunrise',
    dusk: 'sunset',
  },
  clouds: {
    day: 'cloudy-day',
    night: 'cloudy-night',
    dawn: 'cloudy-dawn',
    dusk: 'cloudy-dusk',
  },
  rain: {
    day: 'rainy-day',
    night: 'rainy-night',
    dawn: 'rainy-dawn',
    dusk: 'rainy-dusk',
  },
  drizzle: {
    day: 'drizzle',
    night: 'drizzle-night',
    dawn: 'drizzle-dawn',
    dusk: 'drizzle-dusk',
  },
  thunderstorm: {
    day: 'storm',
    night: 'storm-night',
    dawn: 'storm',
    dusk: 'storm',
  },
  snow: {
    day: 'snowy-day',
    night: 'snowy-night',
    dawn: 'snowy-dawn',
    dusk: 'snowy-dusk',
  },
  mist: {
    day: 'misty',
    night: 'misty-night',
    dawn: 'misty-dawn',
    dusk: 'misty-dusk',
  },
  fog: {
    day: 'foggy',
    night: 'foggy-night',
    dawn: 'foggy-dawn',
    dusk: 'foggy-dusk',
  },
  haze: {
    day: 'hazy',
    night: 'hazy-night',
    dawn: 'hazy-dawn',
    dusk: 'hazy-dusk',
  },
};

// Color palettes for weather conditions
export const WEATHER_COLORS = {
  clear: {
    primary: '#FFA500',
    secondary: '#FFD700',
    text: '#2C3E50',
  },
  clouds: {
    primary: '#7F8C8D',
    secondary: '#BDC3C7',
    text: '#2C3E50',
  },
  rain: {
    primary: '#3498DB',
    secondary: '#5DADE2',
    text: '#FFFFFF',
  },
  thunderstorm: {
    primary: '#2C3E50',
    secondary: '#34495E',
    text: '#FFFFFF',
  },
  snow: {
    primary: '#ECF0F1',
    secondary: '#BDC3C7',
    text: '#2C3E50',
  },
  mist: {
    primary: '#95A5A6',
    secondary: '#BDC3C7',
    text: '#2C3E50',
  },
  fog: {
    primary: '#7F8C8D',
    secondary: '#95A5A6',
    text: '#FFFFFF',
  },
  haze: {
    primary: '#F39C12',
    secondary: '#F1C40F',
    text: '#2C3E50',
  },
};

// AQI color mapping
export const AQI_COLORS = {
  1: '#00E400', // Good - Green
  2: '#FFFF00', // Fair - Yellow
  3: '#FF7E00', // Moderate - Orange
  4: '#FF0000', // Poor - Red
  5: '#8F3F97', // Very Poor - Purple
  hazardous: '#7E0023', // Hazardous - Maroon
};

// Get weather condition from OpenWeatherMap description
export function getWeatherCondition(description: string): WeatherCondition {
  const normalizedDesc = description.toLowerCase();
  return WEATHER_CONDITION_MAP[normalizedDesc] || 'clear';
}

// Get weather icon name
export function getWeatherIcon(
  condition: WeatherCondition,
  timeOfDay: TimeOfDay = 'day'
): string {
  const iconMap = WEATHER_ICONS[condition];
  if (!iconMap) return 'Sun';

  // Map dawn/dusk to appropriate icons
  if (timeOfDay === 'dawn' || timeOfDay === 'dusk') {
    return iconMap.night || iconMap.day;
  }

  return iconMap[timeOfDay] || iconMap.day;
}

// Get background theme
export function getWeatherBackground(
  condition: WeatherCondition,
  timeOfDay: TimeOfDay = 'day'
): string {
  const bgMap = WEATHER_BACKGROUNDS[condition as keyof typeof WEATHER_BACKGROUNDS];
  if (!bgMap) {
    // Fallback to clear background for unknown conditions
    const clearBg = WEATHER_BACKGROUNDS.clear;
    return clearBg ? clearBg[timeOfDay] || clearBg.day : 'sunny-day';
  }
  return bgMap[timeOfDay] || bgMap.day;
}

// Get weather color palette
export function getWeatherColors(condition: WeatherCondition) {
  return WEATHER_COLORS[condition as keyof typeof WEATHER_COLORS] || WEATHER_COLORS.clear;
}

// Check if it's currently day or night
export function getDayOrNight(
  timestamp: number,
  timezone: number,
  sunrise: number,
  sunset: number
): TimeOfDay {
  const localHour = new Date((timestamp + timezone) * 1000).getHours();
  const sunriseHour = new Date((sunrise + timezone) * 1000).getHours();
  const sunsetHour = new Date((sunset + timezone) * 1000).getHours();

  if (localHour >= sunriseHour - 1 && localHour < sunriseHour + 1) return 'dawn';
  if (localHour >= sunsetHour - 1 && localHour < sunsetHour + 1) return 'dusk';
  if (localHour >= sunriseHour && localHour < sunsetHour) return 'day';
  return 'night';
}

// Get apparent temperature (feels like)
export function getFeelsLike(
  temp: number,
  humidity: number,
  windSpeed: number,
  temperatureUnit: TemperatureUnit = 'celsius'
): number {
  // Convert to Celsius for calculation
  let tempC = temp;
  if (temperatureUnit === 'fahrenheit') {
    tempC = (temp - 32) * 5/9;
  }

  let feelsLikeC = tempC;

  // Heat index calculation (for high temperatures)
  if (tempC >= 27 && humidity >= 40) {
    const hi = -42.379 + 2.04901523 * tempC + 10.14333127 * humidity
      - 0.22475541 * tempC * humidity - 6.83783e-3 * tempC * tempC
      - 5.481717e-2 * humidity * humidity + 1.22874e-3 * tempC * tempC * humidity
      + 8.5282e-4 * tempC * humidity * humidity - 1.99e-6 * tempC * tempC * humidity * humidity;
    feelsLikeC = hi;
  }
  // Wind chill calculation (for low temperatures)
  else if (tempC <= 10 && windSpeed > 4.8) {
    const wc = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(windSpeed, 0.16)
      + 0.3965 * tempC * Math.pow(windSpeed, 0.16);
    feelsLikeC = wc;
  }

  // Convert back to original unit
  if (temperatureUnit === 'fahrenheit') {
    return (feelsLikeC * 9/5) + 32;
  }
  return feelsLikeC;
}

// Get dew point
export function getDewPoint(temp: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return dewPoint;
}

// Get UV index from weather conditions (approximation)
export function getUVIndex(
  condition: WeatherCondition,
  timestamp: number,
  timezone: number,
  clouds: number
): number {
  const hour = new Date((timestamp + timezone) * 1000).getHours();

  // No UV at night
  if (hour < 6 || hour > 18) return 0;

  // Base UV index (simplified model)
  let baseUV = 0;
  if (hour >= 11 && hour <= 13) {
    baseUV = 9; // Peak UV at noon
  } else if (hour >= 9 && hour <= 15) {
    baseUV = 7;
  } else if (hour >= 7 && hour <= 17) {
    baseUV = 4;
  } else {
    baseUV = 2;
  }

  // Adjust for cloud coverage
  const cloudFactor = 1 - (clouds / 100) * 0.7;
  const adjustedUV = baseUV * cloudFactor;

  // Adjust for weather conditions
  if (condition === 'clear') return Math.round(adjustedUV);
  if (condition === 'clouds') return Math.round(adjustedUV * 0.8);
  if (condition === 'rain' || condition === 'drizzle') return Math.round(adjustedUV * 0.3);
  if (condition === 'thunderstorm') return Math.round(adjustedUV * 0.2);
  if (condition === 'snow') return Math.round(adjustedUV * 0.4);

  return Math.round(adjustedUV);
}

// Get precipitation probability from forecast
export function getPrecipitationProbability(pop: number): string {
  if (pop <= 0.1) return 'No precipitation';
  if (pop <= 0.3) return 'Slight chance';
  if (pop <= 0.6) return 'Possible';
  if (pop <= 0.8) return 'Likely';
  return 'Very likely';
}

// Get comfort level
export function getComfortLevel(
  temp: number,
  humidity: number,
  windSpeed: number
): {
  level: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  description: string;
  color: string;
} {
  // Comfort calculation based on temperature, humidity, and wind
  let score = 100;

  // Temperature score
  if (temp < 10) score -= (10 - temp) * 3;
  else if (temp > 30) score -= (temp - 30) * 2;

  // Humidity score
  if (humidity < 30) score -= (30 - humidity) * 1.5;
  else if (humidity > 70) score -= (humidity - 70) * 1.5;

  // Wind score
  if (windSpeed > 10) score -= (windSpeed - 10) * 2;

  if (score >= 80) {
    return {
      level: 'Excellent',
      description: 'Perfect weather conditions',
      color: '#00E400',
    };
  } else if (score >= 60) {
    return {
      level: 'Good',
      description: 'Comfortable weather',
      color: '#FFFF00',
    };
  } else if (score >= 40) {
    return {
      level: 'Fair',
      description: 'Acceptable conditions',
      color: '#FF7E00',
    };
  } else {
    return {
      level: 'Poor',
      description: 'Uncomfortable weather',
      color: '#FF0000',
    };
  }
}

// Get weather alert level
export function getWeatherAlertLevel(weather: WeatherData): {
  level: 'none' | 'advisory' | 'watch' | 'warning';
  conditions: string[];
} {
  const alerts: string[] = [];
  let level: 'none' | 'advisory' | 'watch' | 'warning' = 'none';

  const condition = getWeatherCondition(weather.weather[0].description);
  const temp = weather.metrics.temperature;
  const windSpeed = weather.metrics.windSpeed;

  // Temperature alerts
  if (temp > 40) {
    alerts.push('Extreme heat');
    level = 'warning';
  } else if (temp > 35) {
    alerts.push('High heat');
    if (level !== 'warning') {
      level = 'advisory';
    }
  } else if (temp < -20) {
    alerts.push('Extreme cold');
    level = 'warning';
  } else if (temp < -10) {
    alerts.push('Low temperature');
    if (level !== 'warning') {
      level = 'advisory';
    }
  }

  // Wind alerts
  if (windSpeed > 25) {
    alerts.push('Strong wind');
    if (level === 'warning') {
      // keep warning
    } else {
      level = 'watch';
    }
  } else if (windSpeed > 15) {
    alerts.push('Windy conditions');
    if (level === 'warning' || level === 'watch') {
      // keep current level
    } else {
      level = 'advisory';
    }
  }

  // Weather condition alerts
  if (condition === 'thunderstorm') {
    alerts.push('Thunderstorm');
    level = 'warning';
  } else if (condition === 'snow' && temp < 0) {
    alerts.push('Snow conditions');
    if (level !== 'warning') {
      level = 'advisory';
    }
  }

  return { level, conditions: alerts };
}

// Get sunrise/sunset times for display
export function getSunTimes(
  sunrise: number,
  sunset: number,
  timezone: number,
  format: '12h' | '24h' = '12h'
): { sunrise: string; sunset: string; dayLength: string } {
  const sunriseDate = new Date((sunrise + timezone) * 1000);
  const sunsetDate = new Date((sunset + timezone) * 1000);

  const formatTime = (date: Date) => {
    if (format === '24h') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const dayLengthMs = sunsetDate.getTime() - sunriseDate.getTime();
  const dayLengthHours = Math.floor(dayLengthMs / (1000 * 60 * 60));
  const dayLengthMinutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    sunrise: formatTime(sunriseDate),
    sunset: formatTime(sunsetDate),
    dayLength: `${dayLengthHours}h ${dayLengthMinutes}m`,
  };
}