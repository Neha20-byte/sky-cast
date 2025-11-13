// Utility functions for formatting weather data
import {
  TemperatureUnit,
  Coordinates,
  WeatherCondition,
  TimeOfDay,
} from '@/types';

export const temperatureConverters = {
  celsius: {
    toFahrenheit: (celsius: number) => (celsius * 9/5) + 32,
    fromFahrenheit: (fahrenheit: number) => (fahrenheit - 32) * 5/9,
    symbol: '°C',
  },
  fahrenheit: {
    toCelsius: (fahrenheit: number) => (fahrenheit - 32) * 5/9,
    fromCelsius: (celsius: number) => (celsius * 9/5) + 32,
    symbol: '°F',
  },
};

export function formatTemperature(
  temp: number,
  unit: TemperatureUnit = 'celsius'
): string {
  const value = unit === 'fahrenheit' ?
    temperatureConverters.celsius.toFahrenheit(temp) :
    temp;

  return `${Math.round(value)}${temperatureConverters[unit].symbol}`;
}

export function formatWindSpeed(
  speed: number,
  unit: 'kmh' | 'mph' | 'ms' = 'kmh'
): string {
  let value: number;
  let symbol: string;

  switch (unit) {
    case 'kmh':
      // Convert from m/s to km/h
      value = speed * 3.6;
      symbol = 'km/h';
      break;
    case 'mph':
      // Convert from m/s to mph
      value = speed * 2.237;
      symbol = 'mph';
      break;
    case 'ms':
    default:
      value = speed;
      symbol = 'm/s';
      break;
  }

  return `${Math.round(value)} ${symbol}`;
}

export function formatPressure(
  pressure: number,
  unit: 'hPa' | 'inHg' | 'mmHg' = 'hPa'
): string {
  let value: number;
  let symbol: string;

  switch (unit) {
    case 'inHg':
      // Convert from hPa to inHg
      value = pressure * 0.02953;
      symbol = 'inHg';
      break;
    case 'mmHg':
      // Convert from hPa to mmHg
      value = pressure * 0.75006;
      symbol = 'mmHg';
      break;
    case 'hPa':
    default:
      value = pressure;
      symbol = 'hPa';
      break;
  }

  return `${Math.round(value)} ${symbol}`;
}

export function formatVisibility(
  visibility: number,
  unit: 'km' | 'miles' = 'km'
): string {
  let value: number;
  let symbol: string;

  // Convert from meters
  switch (unit) {
    case 'miles':
      value = visibility / 1609.344;
      symbol = 'mi';
      break;
    case 'km':
    default:
      value = visibility / 1000;
      symbol = 'km';
      break;
  }

  return value < 1 ? `${(value * 1000).toFixed(0)} m` : `${value.toFixed(1)} ${symbol}`;
}

export function formatTime(
  timestamp: number,
  timezone: number = 0,
  format: '12h' | '24h' = '12h'
): string {
  const date = new Date((timestamp + timezone) * 1000);

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
}

export function formatDate(
  timestamp: number,
  timezone: number = 0,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = new Date((timestamp + timezone) * 1000);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };

  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = Math.abs(now - timestamp);

  if (diff < 60) {
    return 'just now';
  }

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(diff / 3600);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(diff / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function formatWindDirection(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];

  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function formatCoordinates(coordinates: Coordinates): string {
  return `${coordinates.lat.toFixed(4)}°${coordinates.lat >= 0 ? 'N' : 'S'}, ${coordinates.lon.toFixed(4)}°${coordinates.lon >= 0 ? 'E' : 'W'}`;
}

export function formatDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return Math.round(R * c * 10) / 10; // Distance in kilometers, rounded to 1 decimal
}

export function formatAQI(aqi: number): string {
  if (aqi <= 50) return `${aqi} - Good`;
  if (aqi <= 100) return `${aqi} - Moderate`;
  if (aqi <= 150) return `${aqi} - Unhealthy for Sensitive`;
  if (aqi <= 200) return `${aqi} - Unhealthy`;
  if (aqi <= 300) return `${aqi} - Very Unhealthy`;
  return `${aqi} - Hazardous`;
}

export function formatUVI(uvi: number): { value: string; level: string; color: string } {
  let level: string;
  let color: string;

  if (uvi <= 2) {
    level = 'Low';
    color = '#00E400';
  } else if (uvi <= 5) {
    level = 'Moderate';
    color = '#FFFF00';
  } else if (uvi <= 7) {
    level = 'High';
    color = '#FF7E00';
  } else if (uvi <= 10) {
    level = 'Very High';
    color = '#FF0000';
  } else {
    level = 'Extreme';
    color = '#8F3F97';
  }

  return {
    value: uvi.toFixed(1),
    level,
    color,
  };
}

export function formatHumidity(humidity: number): string {
  return `${Math.round(humidity)}%`;
}

export function formatCloudCoverage(coverage: number): string {
  return `${Math.round(coverage)}%`;
}

export function formatPrecipitationChance(chance: number): string {
  return `${Math.round(chance)}%`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Capitalize first letter of each word
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Format weather description
export function formatWeatherDescription(description: string): string {
  return capitalizeWords(description.replace(/-/g, ' '));
}

// Format city name with country
export function formatCityLocation(name: string, country: string, state?: string): string {
  if (state && state !== country) {
    return `${name}, ${state}, ${country}`;
  }
  return `${name}, ${country}`;
}

// Get time of day from timestamp and timezone
export function getTimeOfDay(timestamp: number, timezone: number = 0, sunrise?: number, sunset?: number): TimeOfDay {
  const localTime = (timestamp + timezone) * 1000;
  const hour = new Date(localTime).getHours();

  if (sunrise && sunset) {
    const sunriseTime = (sunrise + timezone) * 1000;
    const sunsetTime = (sunset + timezone) * 1000;
    const sunriseHour = new Date(sunriseTime).getHours();
    const sunsetHour = new Date(sunsetTime).getHours();

    if (hour >= sunriseHour - 1 && hour < sunriseHour + 1) return 'dawn';
    if (hour >= sunsetHour - 1 && hour < sunsetHour + 1) return 'dusk';
  }

  return (hour >= 6 && hour < 18) ? 'day' : 'night';
}