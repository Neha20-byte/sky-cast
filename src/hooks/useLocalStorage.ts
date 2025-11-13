// React hooks for localStorage management
import { useState, useEffect, useCallback } from 'react';
import { UserSettings, City, SearchHistory } from '@/types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '@/types/settings';
import { cacheService } from '@/services/cacheService';

// Hook for managing user settings
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = cacheService.getSettings();
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    cacheService.setSettings(updatedSettings);
  }, [settings]);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    cacheService.setSettings(DEFAULT_SETTINGS);
  }, []);

  // Toggle between temperature units
  const toggleTemperatureUnit = useCallback(() => {
    const newUnit = settings.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    updateSettings({ temperatureUnit: newUnit });
  }, [settings.temperatureUnit, updateSettings]);

  // Toggle theme mode
  const toggleThemeMode = useCallback(() => {
    const modes: Array<UserSettings['themeMode']> = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(settings.themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updateSettings({ themeMode: nextMode });
  }, [settings.themeMode, updateSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    toggleTemperatureUnit,
    toggleThemeMode,
    isLoading,
  };
}

// Hook for managing cities
export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cities from localStorage on mount
  useEffect(() => {
    try {
      const savedCities = cacheService.getCities();
      setCities(savedCities);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a city
  const addCity = useCallback((city: City) => {
    cacheService.addCity(city);
    setCities(prevCities => {
      const existingIndex = prevCities.findIndex(c => c.id === city.id);
      if (existingIndex >= 0) {
        const updatedCities = [...prevCities];
        updatedCities[existingIndex] = { ...city, lastUpdated: new Date().toISOString() };
        return updatedCities;
      }
      return [...prevCities, { ...city, lastUpdated: new Date().toISOString() }];
    });
  }, []);

  // Remove a city
  const removeCity = useCallback((cityId: string) => {
    cacheService.removeCity(cityId);
    setCities(prevCities => prevCities.filter(city => city.id !== cityId));
  }, []);

  // Update a city
  const updateCity = useCallback((updatedCity: City) => {
    cacheService.addCity(updatedCity);
    setCities(prevCities =>
      prevCities.map(city =>
        city.id === updatedCity.id
          ? { ...updatedCity, lastUpdated: new Date().toISOString() }
          : city
      )
    );
  }, []);

  // Reorder cities
  const reorderCities = useCallback((fromIndex: number, toIndex: number) => {
    setCities(prevCities => {
      const newCities = [...prevCities];
      const [movedCity] = newCities.splice(fromIndex, 1);
      newCities.splice(toIndex, 0, movedCity);

      // Save the new order
      cacheService.setCities(newCities);
      return newCities;
    });
  }, []);

  // Clear all cities
  const clearCities = useCallback(() => {
    cacheService.setCities([]);
    setCities([]);
  }, []);

  // Get city by ID
  const getCity = useCallback((cityId: string) => {
    return cities.find(city => city.id === cityId);
  }, [cities]);

  // Check if city exists
  const hasCity = useCallback((cityId: string) => {
    return cities.some(city => city.id === cityId);
  }, [cities]);

  return {
    cities,
    addCity,
    removeCity,
    updateCity,
    reorderCities,
    clearCities,
    getCity,
    hasCity,
    isLoading,
  };
}

// Hook for managing favorites
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = cacheService.getFavorites();
      setFavorites(savedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Add to favorites
  const addToFavorites = useCallback((cityId: string) => {
    cacheService.addToFavorites(cityId);
    setFavorites(prevFavorites => {
      if (!prevFavorites.includes(cityId)) {
        return [...prevFavorites, cityId];
      }
      return prevFavorites;
    });
  }, []);

  // Remove from favorites
  const removeFromFavorites = useCallback((cityId: string) => {
    cacheService.removeFromFavorites(cityId);
    setFavorites(prevFavorites => prevFavorites.filter(id => id !== cityId));
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((cityId: string) => {
    if (favorites.includes(cityId)) {
      removeFromFavorites(cityId);
    } else {
      addToFavorites(cityId);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  // Check if city is favorite
  const isFavorite = useCallback((cityId: string) => {
    return favorites.includes(cityId);
  }, [favorites]);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
  };
}

// Hook for managing search history
export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = cacheService.getSearchHistory();
      setSearchHistory(savedHistory);
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Add to search history
  const addToSearchHistory = useCallback((
    query: string,
    resultCount: number,
    selectedCity?: string
  ) => {
    cacheService.addToSearchHistory(query, resultCount, selectedCity);
    setSearchHistory(prevHistory => {
      const newEntry: SearchHistory = {
        query,
        resultCount,
        timestamp: Date.now(),
        selectedCity,
      };

      // Remove existing entry for same query
      const filteredHistory = prevHistory.filter(entry => entry.query !== query);

      // Add new entry at the beginning
      return [newEntry, ...filteredHistory].slice(0, 20);
    });
  }, []);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    cacheService.clearSearchHistory();
    setSearchHistory([]);
  }, []);

  // Get recent searches (last 5)
  const getRecentSearches = useCallback(() => {
    return searchHistory.slice(0, 5);
  }, [searchHistory]);

  // Get popular searches
  const getPopularSearches = useCallback(() => {
    const searchCounts: Record<string, number> = {};

    searchHistory.forEach(entry => {
      searchCounts[entry.query] = (searchCounts[entry.query] || 0) + 1;
    });

    return Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([query]) => query);
  }, [searchHistory]);

  return {
    searchHistory,
    addToSearchHistory,
    clearSearchHistory,
    getRecentSearches,
    getPopularSearches,
  };
}

// Hook for managing last known location
export function useLastLocation() {
  const [lastLocation, setLastLocation] = useState<{
    coordinates: { lat: number; lon: number };
    timestamp: number;
  } | null>(null);

  // Load last location from localStorage on mount
  useEffect(() => {
    try {
      const savedLocation = cacheService.getLastLocation();
      setLastLocation(savedLocation);
    } catch (error) {
      console.error('Error loading last location:', error);
    }
  }, []);

  // Save last location
  const saveLastLocation = useCallback((lat: number, lon: number) => {
    cacheService.setLastLocation(lat, lon);
    setLastLocation({
      coordinates: { lat, lon },
      timestamp: Date.now(),
    });
  }, []);

  // Clear last location
  const clearLastLocation = useCallback(() => {
    try {
      localStorage.removeItem('skyCastLastLocation');
      setLastLocation(null);
    } catch (error) {
      console.error('Error clearing last location:', error);
    }
  }, []);

  // Check if last location is recent (within last hour)
  const isRecent = useCallback(() => {
    if (!lastLocation) return false;
    const oneHour = 60 * 60 * 1000;
    return Date.now() - lastLocation.timestamp < oneHour;
  }, [lastLocation]);

  return {
    lastLocation,
    saveLastLocation,
    clearLastLocation,
    isRecent,
  };
}

// Hook for data backup and restore
export function useDataBackup() {
  // Export all user data
  const exportData = useCallback(() => {
    try {
      return cacheService.exportData();
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }, []);

  // Import user data
  const importData = useCallback((jsonData: string) => {
    try {
      return cacheService.importData(jsonData);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }, []);

  // Clear all user data
  const clearAllData = useCallback(() => {
    try {
      cacheService.clearAllCache();
      cacheService.setCities([]);
      cacheService.setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('skyCastFavorites');
      localStorage.removeItem('skyCastRecentSearches');
      localStorage.removeItem('skyCastLastLocation');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }, []);

  return {
    exportData,
    importData,
    clearAllData,
  };
}

// Hook for storage statistics
export function useStorageStats() {
  const [stats, setStats] = useState({
    cities: 0,
    favorites: 0,
    cachedWeather: 0,
    cacheSizeKB: 0,
    searchHistory: 0,
  });

  // Calculate storage statistics
  const calculateStats = useCallback(() => {
    try {
      const cities = cacheService.getCities();
      const favorites = cacheService.getFavorites();
      const searchHistory = cacheService.getSearchHistory();
      const cacheStats = cacheService.getCacheStats();

      setStats({
        cities: cities.length,
        favorites: favorites.length,
        cachedWeather: cacheStats.totalCached,
        cacheSizeKB: cacheStats.sizeKB,
        searchHistory: searchHistory.length,
      });
    } catch (error) {
      console.error('Error calculating storage stats:', error);
    }
  }, []);

  // Calculate stats on mount and when storage changes
  useEffect(() => {
    calculateStats();

    // Listen for storage changes
    const handleStorageChange = () => {
      calculateStats();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [calculateStats]);

  return {
    stats,
    refreshStats: calculateStats,
  };
}