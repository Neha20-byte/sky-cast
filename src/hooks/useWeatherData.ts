// React hook for weather data management
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CityWeather,
  WeatherError,
  LoadingState,
  Coordinates,
  SearchCityResult,
  TemperatureUnit,
} from '@/types';
import { weatherAPI } from '@/services/weatherApi';
import { cacheService } from '@/services/cacheService';
import { useCities } from './useLocalStorage';
import { getWeatherCondition, getDayOrNight } from '@/utils';

interface UseWeatherDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in minutes
  enableCache?: boolean;
}

interface UseWeatherDataReturn {
  cityWeather: Map<string, CityWeather>;
  loadingStates: Map<string, LoadingState>;
  errors: Map<string, WeatherError>;
  isGlobalLoading: boolean;
  fetchWeatherForCity: (cityId: string, coordinates: Coordinates, units?: TemperatureUnit) => Promise<void>;
  refreshWeatherForCity: (cityId: string) => Promise<void>;
  searchCities: (query: string) => Promise<SearchCityResult[]>;
  removeCityWeather: (cityId: string) => void;
  clearAllWeather: () => void;
  getWeatherForCity: (cityId: string) => CityWeather | undefined;
  getLoadingState: (cityId: string) => LoadingState;
  getError: (cityId: string) => WeatherError | undefined;
}

export function useWeatherData(options: UseWeatherDataOptions = {}): UseWeatherDataReturn {
  const {
    autoRefresh = true,
    refreshInterval = 15,
    enableCache = true,
  } = options;

  const { cities } = useCities();
  const [cityWeather, setCityWeather] = useState<Map<string, CityWeather>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());
  const [errors, setErrors] = useState<Map<string, WeatherError>>(new Map());
  const refreshIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Calculate global loading state
  const isGlobalLoading = Array.from(loadingStates.values()).some(
    state => state === 'loading'
  );

  // Update loading state for a city
  const setLoadingState = useCallback((cityId: string, state: LoadingState) => {
    setLoadingStates(prev => new Map(prev.set(cityId, state)));
  }, []);

  // Update error for a city
  const setError = useCallback((cityId: string, error: WeatherError | null) => {
    setErrors(prev => {
      const newMap = new Map(prev);
      if (error) {
        newMap.set(cityId, error);
      } else {
        newMap.delete(cityId);
      }
      return newMap;
    });
  }, []);

  // Set up auto-refresh for a city
  const setupAutoRefresh = useCallback((cityId: string, coordinates: Coordinates, units: TemperatureUnit) => {
    if (!autoRefresh) return;

    // Clear existing interval
    const existingInterval = refreshIntervals.current.get(cityId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Set up new interval
    const interval = setInterval(async () => {
      try {
        await fetchWeatherData(cityId, coordinates, units, false);
      } catch (error) {
        console.error(`Auto-refresh failed for city ${cityId}:`, error);
      }
    }, refreshInterval * 60 * 1000);

    refreshIntervals.current.set(cityId, interval);
  }, [autoRefresh, refreshInterval]);

  // Fetch weather data from API or cache
  const fetchWeatherData = useCallback(async (
    cityId: string,
    coordinates: Coordinates,
    units: TemperatureUnit = 'celsius',
    forceRefresh: boolean = false
  ): Promise<CityWeather> => {
    setLoadingState(cityId, 'loading');
    setError(cityId, null);

    try {
      // Try to get from cache first (if enabled and not forcing refresh)
      if (enableCache && !forceRefresh) {
        const cachedData = cacheService.getCachedWeather(cityId);
        if (cachedData) {
          setCityWeather(prev => new Map(prev.set(cityId, cachedData)));
          setLoadingState(cityId, 'success');
          return cachedData;
        }
      }

      // Fetch fresh data from API
      const apiUnits = units === 'fahrenheit' ? 'imperial' : 'metric';
      const weatherData = await weatherAPI.getCompleteCityWeather(coordinates, apiUnits);

      // Cache the data
      if (enableCache) {
        cacheService.setCachedWeather(cityId, weatherData);
      }

      // Update state
      setCityWeather(prev => new Map(prev.set(cityId, weatherData)));
      setLoadingState(cityId, 'success');

      return weatherData;
    } catch (error) {
      const weatherError = error instanceof WeatherError
        ? error
        : new WeatherError('FETCH_ERROR', error instanceof Error ? error.message : 'Unknown error');

      setError(cityId, weatherError);
      setLoadingState(cityId, 'error');
      throw weatherError;
    }
  }, [enableCache, setLoadingState, setError]);

  // Fetch weather for a specific city
  const fetchWeatherForCity = useCallback(async (
    cityId: string,
    coordinates: Coordinates,
    units?: TemperatureUnit
  ): Promise<void> => {
    try {
      await fetchWeatherData(cityId, coordinates, units);
      setupAutoRefresh(cityId, coordinates, units || 'celsius');
    } catch (error) {
      // Error is already handled in fetchWeatherData
    }
  }, [fetchWeatherData, setupAutoRefresh]);

  // Refresh weather for a city (force refresh)
  const refreshWeatherForCity = useCallback(async (cityId: string): Promise<void> => {
    const weather = cityWeather.get(cityId);
    if (!weather) {
      throw new WeatherError('NOT_FOUND', 'Weather data not found for this city');
    }

    try {
      await fetchWeatherData(
        cityId,
        weather.city.coordinates,
        'celsius',
        true // Force refresh
      );
    } catch (error) {
      // Error is already handled in fetchWeatherData
    }
  }, [cityWeather, fetchWeatherData]);

  // Search for cities
  const searchCities = useCallback(async (query: string): Promise<SearchCityResult[]> => {
    if (!query.trim()) {
      return [];
    }

    try {
      return await weatherAPI.searchCities(query);
    } catch (error) {
      const weatherError = error instanceof WeatherError
        ? error
        : new WeatherError('SEARCH_ERROR', error instanceof Error ? error.message : 'Search failed');

      throw weatherError;
    }
  }, []);

  // Remove weather data for a city
  const removeCityWeather = useCallback((cityId: string): void => {
    setCityWeather(prev => {
      const newMap = new Map(prev);
      newMap.delete(cityId);
      return newMap;
    });

    setLoadingStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(cityId);
      return newMap;
    });

    setErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(cityId);
      return newMap;
    });

    // Clear auto-refresh interval
    const interval = refreshIntervals.current.get(cityId);
    if (interval) {
      clearInterval(interval);
      refreshIntervals.current.delete(cityId);
    }

    // Clear cache
    cacheService.removeCachedWeather(cityId);
  }, []);

  // Clear all weather data
  const clearAllWeather = useCallback((): void => {
    setCityWeather(new Map());
    setLoadingStates(new Map());
    setErrors(new Map());

    // Clear all intervals
    refreshIntervals.current.forEach(interval => clearInterval(interval));
    refreshIntervals.current.clear();

    // Clear all cache
    cacheService.clearAllCache();
  }, []);

  // Get weather for a specific city
  const getWeatherForCity = useCallback((cityId: string): CityWeather | undefined => {
    return cityWeather.get(cityId);
  }, [cityWeather]);

  // Get loading state for a city
  const getLoadingState = useCallback((cityId: string): LoadingState => {
    return loadingStates.get(cityId) || 'idle';
  }, [loadingStates]);

  // Get error for a city
  const getError = useCallback((cityId: string): WeatherError | undefined => {
    return errors.get(cityId);
  }, [errors]);

  // Initialize weather data for saved cities
  useEffect(() => {
    cities.forEach(city => {
      if (!cityWeather.has(city.id) && getLoadingState(city.id) === 'idle') {
        fetchWeatherForCity(city.id, city.coordinates);
      }
    });
  }, [cities, cityWeather, getLoadingState, fetchWeatherForCity]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      refreshIntervals.current.forEach(interval => clearInterval(interval));
      refreshIntervals.current.clear();
    };
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      // Refresh all cities when coming back online
      cityWeather.forEach((weather, cityId) => {
        if (weather.isCached) {
          refreshWeatherForCity(cityId);
        }
      });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [cityWeather, refreshWeatherForCity]);

  return {
    cityWeather,
    loadingStates,
    errors,
    isGlobalLoading,
    fetchWeatherForCity,
    refreshWeatherForCity,
    searchCities,
    removeCityWeather,
    clearAllWeather,
    getWeatherForCity,
    getLoadingState,
    getError,
  };
}

// Hook for weather data statistics
export function useWeatherStats() {
  const { cityWeather } = useWeatherData();

  const getStats = useCallback(() => {
    const weatherArray = Array.from(cityWeather.values());

    const avgTemperature = weatherArray.length > 0
      ? weatherArray.reduce((sum, weather) => sum + weather.current.metrics.temperature, 0) / weatherArray.length
      : 0;

    const avgHumidity = weatherArray.length > 0
      ? weatherArray.reduce((sum, weather) => sum + weather.current.metrics.humidity, 0) / weatherArray.length
      : 0;

    const avgAQI = weatherArray.length > 0
      ? weatherArray.reduce((sum, weather) => sum + weather.airQuality.aqi, 0) / weatherArray.length
      : 0;

    const weatherConditions = weatherArray.reduce((acc, weather) => {
      const condition = getWeatherCondition(weather.current.weather[0].description);
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const cachedCount = weatherArray.filter(weather => weather.isCached).length;

    return {
      totalCities: weatherArray.length,
      avgTemperature: Math.round(avgTemperature),
      avgHumidity: Math.round(avgHumidity),
      avgAQI: Math.round(avgAQI),
      weatherConditions,
      cachedCount,
      freshCount: weatherArray.length - cachedCount,
    };
  }, [cityWeather]);

  return getStats();
}

// Hook for weather alerts
export function useWeatherAlerts() {
  const { cityWeather } = useWeatherData();

  const getAlerts = useCallback(() => {
    const weatherArray = Array.from(cityWeather.values());
    const alerts: Array<{
      cityId: string;
      cityName: string;
      level: 'advisory' | 'watch' | 'warning';
      conditions: string[];
      aqiLevel?: string;
    }> = [];

    weatherArray.forEach(weather => {
      const temp = weather.current.metrics.temperature;
      const windSpeed = weather.current.metrics.windSpeed;
      const condition = getWeatherCondition(weather.current.weather[0].description);
      const aqi = weather.airQuality.aqi;

      const cityAlerts: string[] = [];
      let level: 'advisory' | 'watch' | 'warning' = 'advisory';

      // Temperature alerts
      if (temp > 40) {
        cityAlerts.push('Extreme heat');
        level = 'warning';
      } else if (temp > 35) {
        cityAlerts.push('High heat');
        level = 'advisory';
      } else if (temp < -20) {
        cityAlerts.push('Extreme cold');
        level = 'warning';
      }

      // Wind alerts
      if (windSpeed > 25) {
        cityAlerts.push('Strong wind');
        level = level === 'warning' ? 'warning' : 'watch';
      }

      // Weather condition alerts
      if (condition === 'thunderstorm') {
        cityAlerts.push('Thunderstorm');
        level = 'warning';
      } else if (condition === 'snow' && temp < 0) {
        cityAlerts.push('Snow conditions');
        level = level === 'warning' ? 'warning' : 'advisory';
      }

      // AQI alerts
      if (aqi > 150) {
        cityAlerts.push('Poor air quality');
        level = level === 'warning' ? 'warning' : 'advisory';
      }

      if (cityAlerts.length > 0) {
        alerts.push({
          cityId: weather.city.id,
          cityName: weather.city.name,
          level,
          conditions: cityAlerts,
          aqiLevel: aqi > 100 ? weather.airQuality.level : undefined,
        });
      }
    });

    return alerts;
  }, [cityWeather]);

  return getAlerts();
}