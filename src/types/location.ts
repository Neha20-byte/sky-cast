// Location and geolocation types for Sky-Cast Weather App

import { Coordinates } from './weather';

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

export interface LocationPermission {
  granted: boolean;
  state: 'granted' | 'denied' | 'prompt';
}

export interface UserLocation {
  coordinates: Coordinates;
  accuracy?: number;
  timestamp: number;
  isCached: boolean;
}

export interface LocationSuggestion {
  name: string;
  country: string;
  state?: string;
  coordinates: Coordinates;
  displayName: string;
  population?: number;
  distance?: number; // Distance from user location in km
}

export interface SearchResult {
  cities: LocationSuggestion[];
  total: number;
  hasMore: boolean;
}

export interface LocationCache {
  coordinates: Coordinates;
  timestamp: number;
  expires: number;
}

// Geolocation options
export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// Location search filters
export interface LocationSearchOptions {
  limit?: number;
  country?: string;
  minPopulation?: number;
  excludeCountries?: string[];
}

// Fallback location data for offline mode
export interface FallbackLocation {
  id: string;
  name: string;
  country: string;
  coordinates: Coordinates;
  isDefault: boolean;
  rank: number; // Priority for fallback
}