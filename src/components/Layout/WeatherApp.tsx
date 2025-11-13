// Main Weather App Component
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useWeatherData, useCities, useSettings, useTheme, useGeolocation } from '@/hooks';
import { SearchBar } from '../SearchBar';
import { LocationButton } from '../LocationButton';
import { ThemeToggle } from '../ThemeToggle';
import { WeatherCard } from '../WeatherCard';
import { LoadingStates } from '../LoadingStates';

export function WeatherApp() {
  const { cities, addCity, removeCity } = useCities();
  const { settings } = useSettings();
  const { resolvedTheme } = useTheme();
  const { cityWeather, fetchWeatherForCity, isGlobalLoading, searchCities } = useWeatherData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddCity, setShowAddCity] = useState(false);

  // Fetch weather for all cities on mount and when cities change
  useEffect(() => {
    cities.forEach(city => {
      fetchWeatherForCity(city.id, city.coordinates);
    });
  }, [cities, fetchWeatherForCity]);

  // Handle city search
  const handleCitySearch = useCallback(async (query: string) => {
    if (!query.trim()) return [];

    setIsSearching(true);
    try {
      const results = await searchCities(query);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [searchCities]);

  // Handle adding a new city
  const handleAddCity = useCallback(async (cityData: any) => {
    const newCity = {
      id: `${cityData.lat}-${cityData.lon}`,
      name: cityData.name,
      country: cityData.country,
      state: cityData.state,
      coordinates: { lat: cityData.lat, lon: cityData.lon },
    };

    addCity(newCity);
    await fetchWeatherForCity(newCity.id, newCity.coordinates);
    setShowAddCity(false);
    setSearchQuery('');
  }, [addCity, fetchWeatherForCity]);

  // Handle removing a city
  const handleRemoveCity = useCallback((cityId: string) => {
    removeCity(cityId);
  }, [removeCity]);

  // Get grid layout class based on screen size
  const getGridLayoutClass = () => {
    if (cities.length === 0) return 'grid-cols-1';
    if (cities.length === 1) return 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1';
    if (cities.length === 2) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
    return 'weather-grid';
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="fixed inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            resolvedTheme === 'dark'
              ? 'from-slate-900 via-blue-900 to-slate-900'
              : 'from-blue-50 via-white to-slate-50'
          }`}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      </motion.div>

      {/* Header */}
      <header className="relative z-10 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 weather-shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                ☁️
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sky-Cast</h1>
                <p className="text-sm text-muted-foreground">Immersive Weather Experience</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <SearchBar
                onSearch={handleCitySearch}
                onAddCity={handleAddCity}
                isLoading={isSearching}
                className="w-64"
              />
              <LocationButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Empty State */}
        {cities.length === 0 && !isGlobalLoading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Welcome to Sky-Cast
              </h2>
              <p className="text-muted-foreground mb-6">
                Start by searching for a city or detecting your current location to see the weather.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => setShowAddCity(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus-ring"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Search for a City
                </motion.button>
                <LocationButton variant="secondary" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Weather Grid */}
        {cities.length > 0 && (
          <div className="space-y-6">
            {/* Grid Header */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-foreground">
                {cities.length === 1 ? 'Your Weather' : `${cities.length} Cities`}
              </h2>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </motion.div>

            {/* Weather Cards Grid */}
            <motion.div
              className={`grid ${getGridLayoutClass()}`}
              layout
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <AnimatePresence>
                {cities.map((city, index) => {
                  const weather = cityWeather.get(city.id);
                  const isLoading = !weather && !isGlobalLoading;

                  return (
                    <motion.div
                      key={city.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: 'easeOut',
                      }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      {isLoading ? (
                        <LoadingStates.WeatherCardSkeleton />
                      ) : weather ? (
                        <WeatherCard
                          city={city}
                          weather={weather}
                          onRemove={() => handleRemoveCity(city.id)}
                          temperatureUnit={settings.temperatureUnit}
                        />
                      ) : (
                        <LoadingStates.WeatherCardSkeleton />
                      )}
                    </motion.div>
                  );
                })}

                {/* Add City Card */}
                {cities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: cities.length * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.button
                      onClick={() => setShowAddCity(true)}
                      className="w-full h-48 bg-card/50 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center space-y-3 hover:bg-card/80 hover:border-accent transition-colors focus-ring"
                    >
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-accent" />
                      </div>
                      <span className="text-foreground font-medium">Add City</span>
                      <span className="text-sm text-muted-foreground">Search for a location</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Global Loading State */}
        {isGlobalLoading && cities.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <LoadingStates.WeatherCardSkeleton key={index} />
            ))}
          </div>
        )}
      </main>

      {/* Add City Modal/Overlay */}
      <AnimatePresence>
        {showAddCity && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddCity(false)}
          >
            <motion.div
              className="bg-card rounded-2xl p-6 w-full max-w-md weather-shadow"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Add a New City
              </h3>
              <SearchBar
                onSearch={handleCitySearch}
                onAddCity={handleAddCity}
                isLoading={isSearching}
                placeholder="Search for a city..."
                autoFocus
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowAddCity(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors focus-ring"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}