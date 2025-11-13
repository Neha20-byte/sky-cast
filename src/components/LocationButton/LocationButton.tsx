// Location Detection Button Component
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { useLocationFeatures } from '@/hooks';
import { useCities } from '@/hooks/useLocalStorage';
import { useWeatherData } from '@/hooks/useWeatherData';

interface LocationButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LocationButton({
  variant = 'primary',
  size = 'md',
  className = '',
}: LocationButtonProps) {
  const { detectLocation, isDetecting, isSupported } = useLocationFeatures();
  const { cities, addCity } = useCities();
  const { fetchWeatherForCity } = useWeatherData();
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-card border border-border hover:bg-accent/10 text-foreground',
  };

  const handleDetectLocation = async () => {
    if (!isSupported) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError(null);

    try {
      const locationData = await detectLocation();
      if (locationData) {
        // Check if this location already exists
        const cityId = `${locationData.coordinates.lat}-${locationData.coordinates.lon}`;
        const existingCity = cities.find(city => city.id === cityId);

        if (existingCity) {
          // Refresh existing city's weather
          await fetchWeatherForCity(cityId, existingCity.coordinates);
        } else {
          // Add new city
          const newCity = {
            id: cityId,
            name: locationData.name,
            country: 'Unknown',
            coordinates: locationData.coordinates,
            isDefault: true,
          };

          addCity(newCity);
          await fetchWeatherForCity(cityId, locationData.coordinates);
        }
      }
    } catch (error) {
      setError('Failed to detect location. Please check your permissions.');
      console.error('Location detection failed:', error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={handleDetectLocation}
        disabled={isDetecting || !isSupported}
        className={`flex items-center space-x-2 rounded-lg font-medium transition-all focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]}`}
        whileHover={{ scale: isDetecting ? 1 : 1.02 }}
        whileTap={{ scale: isDetecting ? 1 : 0.98 }}
      >
        {isDetecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}
        <span>
          {isDetecting
            ? 'Detecting...'
            : variant === 'primary'
            ? 'Use My Location'
            : 'Location'
          }
        </span>
      </motion.button>

      {/* Error Tooltip */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-0 mt-2 p-3 bg-card border border-border rounded-lg shadow-lg weather-shadow z-50 min-w-max max-w-xs"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}
    </div>
  );
}