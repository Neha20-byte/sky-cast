// Caching service for Sky-Cast Weather App
import {
  CityWeather,
  WeatherCache,
  CacheEntry,
  UserSettings,
  City,
  SearchHistory,
} from '@/types';

class CacheService {
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SEARCH_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached cities
  private readonly MAX_SEARCH_HISTORY = 20;

  // Weather data caching
  getCachedWeather(cityId: string): CityWeather | null {
    try {
      const cached = localStorage.getItem(`weather_${cityId}`);
      if (!cached) return null;

      const entry: CacheEntry<CityWeather> = JSON.parse(cached);

      if (Date.now() > entry.expires) {
        this.removeCachedWeather(cityId);
        return null;
      }

      return {
        ...entry.data,
        isCached: true,
      };
    } catch (error) {
      console.error('Error reading cached weather data:', error);
      return null;
    }
  }

  setCachedWeather(cityId: string, data: CityWeather): void {
    try {
      const entry: CacheEntry<CityWeather> = {
        data: {
          ...data,
          isCached: false, // Always store as fresh data
        },
        timestamp: Date.now(),
        expires: Date.now() + this.CACHE_DURATION,
        key: cityId,
      };

      localStorage.setItem(`weather_${cityId}`, JSON.stringify(entry));
      this.cleanupExpiredCache();
    } catch (error) {
      console.error('Error caching weather data:', error);
    }
  }

  removeCachedWeather(cityId: string): void {
    try {
      localStorage.removeItem(`weather_${cityId}`);
    } catch (error) {
      console.error('Error removing cached weather data:', error);
    }
  }

  isCacheFresh(cityId: string): boolean {
    try {
      const cached = localStorage.getItem(`weather_${cityId}`);
      if (!cached) return false;

      const entry: CacheEntry = JSON.parse(cached);
      return Date.now() < entry.expires;
    } catch (error) {
      return false;
    }
  }

  // Cities storage
  getCities(): City[] {
    try {
      const cities = localStorage.getItem('skyCastCities');
      return cities ? JSON.parse(cities) : [];
    } catch (error) {
      console.error('Error reading cities:', error);
      return [];
    }
  }

  setCities(cities: City[]): void {
    try {
      localStorage.setItem('skyCastCities', JSON.stringify(cities));
    } catch (error) {
      console.error('Error saving cities:', error);
    }
  }

  addCity(city: City): void {
    const cities = this.getCities();
    const existingIndex = cities.findIndex(c => c.id === city.id);

    if (existingIndex >= 0) {
      cities[existingIndex] = { ...city, lastUpdated: new Date().toISOString() };
    } else {
      cities.push({ ...city, lastUpdated: new Date().toISOString() });
    }

    this.setCities(cities);
  }

  removeCity(cityId: string): void {
    const cities = this.getCities().filter(city => city.id !== cityId);
    this.setCities(cities);
    this.removeCachedWeather(cityId);
  }

  // User settings
  getSettings(): UserSettings | null {
    try {
      const settings = localStorage.getItem('skyCastSettings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error reading settings:', error);
      return null;
    }
  }

  setSettings(settings: UserSettings): void {
    try {
      localStorage.setItem('skyCastSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Search history
  getSearchHistory(): SearchHistory[] {
    try {
      const history = localStorage.getItem('skyCastRecentSearches');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  }

  addToSearchHistory(query: string, resultCount: number, selectedCity?: string): void {
    try {
      const history = this.getSearchHistory();
      const newEntry: SearchHistory = {
        query,
        resultCount,
        timestamp: Date.now(),
        selectedCity,
      };

      // Remove existing entry for same query
      const filteredHistory = history.filter(entry => entry.query !== query);

      // Add new entry at the beginning
      const updatedHistory = [newEntry, ...filteredHistory].slice(0, this.MAX_SEARCH_HISTORY);

      localStorage.setItem('skyCastRecentSearches', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  clearSearchHistory(): void {
    try {
      localStorage.removeItem('skyCastRecentSearches');
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  // Favorites
  getFavorites(): string[] {
    try {
      const favorites = localStorage.getItem('skyCastFavorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  }

  addToFavorites(cityId: string): void {
    try {
      const favorites = this.getFavorites();
      if (!favorites.includes(cityId)) {
        favorites.push(cityId);
        localStorage.setItem('skyCastFavorites', JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }

  removeFromFavorites(cityId: string): void {
    try {
      const favorites = this.getFavorites().filter(id => id !== cityId);
      localStorage.setItem('skyCastFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  isFavorite(cityId: string): boolean {
    return this.getFavorites().includes(cityId);
  }

  // Last known location
  getLastLocation(): { coordinates: { lat: number; lon: number }; timestamp: number } | null {
    try {
      const location = localStorage.getItem('skyCastLastLocation');
      return location ? JSON.parse(location) : null;
    } catch (error) {
      console.error('Error reading last location:', error);
      return null;
    }
  }

  setLastLocation(lat: number, lon: number): void {
    try {
      const location = {
        coordinates: { lat, lon },
        timestamp: Date.now(),
      };
      localStorage.setItem('skyCastLastLocation', JSON.stringify(location));
    } catch (error) {
      console.error('Error saving last location:', error);
    }
  }

  // Cache management
  cleanupExpiredCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach(key => {
        if (key.startsWith('weather_')) {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry = JSON.parse(cached);
            if (now > entry.expires) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }

  clearAllCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('weather_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Cache statistics
  getCacheStats(): {
    totalCached: number;
    expiredCount: number;
    sizeKB: number;
    lastCleanup: number;
  } {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      let weatherKeys = 0;
      let expiredCount = 0;
      let totalSize = 0;

      keys.forEach(key => {
        if (key.startsWith('weather_')) {
          weatherKeys++;
          const cached = localStorage.getItem(key);
          if (cached) {
            totalSize += cached.length;
            const entry: CacheEntry = JSON.parse(cached);
            if (now > entry.expires) {
              expiredCount++;
            }
          }
        }
      });

      return {
        totalCached: weatherKeys,
        expiredCount,
        sizeKB: Math.round(totalSize / 1024),
        lastCleanup: now,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalCached: 0,
        expiredCount: 0,
        sizeKB: 0,
        lastCleanup: Date.now(),
      };
    }
  }

  // Initialize cache service
  initialize(): void {
    this.cleanupExpiredCache();

    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Export data for backup
  exportData(): string {
    try {
      const data = {
        cities: this.getCities(),
        settings: this.getSettings(),
        favorites: this.getFavorites(),
        searchHistory: this.getSearchHistory(),
        lastLocation: this.getLastLocation(),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '{}';
    }
  }

  // Import data from backup
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.cities) this.setCities(data.cities);
      if (data.settings) this.setSettings(data.settings);
      if (data.favorites) localStorage.setItem('skyCastFavorites', JSON.stringify(data.favorites));
      if (data.searchHistory) localStorage.setItem('skyCastRecentSearches', JSON.stringify(data.searchHistory));
      if (data.lastLocation) localStorage.setItem('skyCastLastLocation', JSON.stringify(data.lastLocation));

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Initialize cache service when module loads
if (typeof window !== 'undefined') {
  cacheService.initialize();
}