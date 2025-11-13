// Settings and user preferences types for Sky-Cast Weather App

import { ThemeMode, TemperatureUnit } from './weather';
import { City } from './weather';

export interface UserSettings {
  temperatureUnit: TemperatureUnit;
  themeMode: ThemeMode;
  animationsEnabled: boolean;
  notificationsEnabled: boolean;
  autoLocationDetection: boolean;
  refreshInterval: number; // minutes
  preferredLanguage: string;
  clockFormat: '12h' | '24h';
  windSpeedUnit: 'kmh' | 'mph' | 'ms';
  pressureUnit: 'hPa' | 'inHg' | 'mmHg';
  visibilityUnit: 'km' | 'miles';
}

export interface StorageData {
  cities: City[];
  settings: UserSettings;
  lastLocation?: {
    coordinates: { lat: number; lon: number };
    timestamp: number;
  };
  favorites: string[]; // Array of city IDs
  recentSearches: Array<{
    query: string;
    timestamp: number;
  }>;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expires: number;
  key: string;
}

export interface CacheData {
  [key: string]: CacheEntry;
}

export interface WeatherCache {
  [cityId: string]: {
    data: any; // WeatherData
    timestamp: number;
    expires: number;
  };
}

export interface SearchHistory {
  query: string;
  resultCount: number;
  timestamp: number;
  selectedCity?: string;
}

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  temperatureUnit: 'celsius',
  themeMode: 'auto',
  animationsEnabled: true,
  notificationsEnabled: true,
  autoLocationDetection: true,
  refreshInterval: 15, // 15 minutes
  preferredLanguage: 'en',
  clockFormat: '12h',
  windSpeedUnit: 'kmh',
  pressureUnit: 'hPa',
  visibilityUnit: 'km',
};

// LocalStorage keys
export const STORAGE_KEYS = {
  CITIES: 'skyCastCities',
  SETTINGS: 'skyCastSettings',
  CACHE: 'skyCastCache',
  LAST_LOCATION: 'skyCastLastLocation',
  FAVORITES: 'skyCastFavorites',
  RECENT_SEARCHES: 'skyCastRecentSearches',
} as const;

// Animation settings
export interface AnimationSettings {
  enabled: boolean;
  speed: 'slow' | 'normal' | 'fast';
  reducedMotion: boolean; // Respect system preferences
  backgroundAnimations: boolean;
  cardAnimations: boolean;
  transitionDuration: number; // milliseconds
}

// Notification settings
export interface NotificationSettings {
  enabled: boolean;
  weatherAlerts: boolean;
  aqiAlerts: boolean;
  severeWeather: boolean;
  dailySummary: boolean;
  threshold: {
    temperature?: { min?: number; max?: number };
    aqi?: number;
    windSpeed?: number;
  };
}

// Accessibility settings
export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}