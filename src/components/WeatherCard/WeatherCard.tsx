// Weather Card Component
'use client';

import { motion } from 'framer-motion';
import { X, MapPin, Thermometer, Wind, Droplets, Eye } from 'lucide-react';
import { CityWeather, TemperatureUnit } from '@/types';
import { AQIBadge } from '../AQIBadge';
import { formatTemperature, formatWindSpeed, formatHumidity, formatWeatherDescription, getWeatherIcon, getDayOrNight } from '@/utils';

interface WeatherCardProps {
  city: {
    id: string;
    name: string;
    country: string;
    coordinates: { lat: number; lon: number };
  };
  weather: CityWeather;
  onRemove: () => void;
  temperatureUnit: TemperatureUnit;
}

export function WeatherCard({ city, weather, onRemove, temperatureUnit }: WeatherCardProps) {
  const current = weather.current;
  const condition = current.weather[0];
  const timeOfDay = getDayOrNight(
    current.timestamp,
    current.timezone,
    current.sunTimes.sunrise,
    current.sunTimes.sunset
  );
  const weatherIcon = getWeatherIcon(
    condition.main.toLowerCase() as any,
    timeOfDay
  );

  const getWeatherGradient = () => {
    const weatherType = condition.main.toLowerCase();
    switch (weatherType) {
      case 'clear':
        return 'from-yellow-400 to-orange-500';
      case 'clouds':
        return 'from-gray-400 to-gray-600';
      case 'rain':
      case 'drizzle':
        return 'from-blue-400 to-blue-600';
      case 'snow':
        return 'from-blue-100 to-gray-300';
      case 'thunderstorm':
        return 'from-purple-600 to-gray-800';
      default:
        return 'from-blue-400 to-blue-500';
    }
  };

  return (
    <motion.div
      className="h-48 bg-card border border-border rounded-2xl overflow-hidden weather-shadow group hover:scale-[1.02] transition-transform cursor-pointer"
      layout
      whileHover={{ y: -4 }}
      onClick={() => {
        // TODO: Open weather modal
        console.log('Open weather modal for', city.name);
      }}
    >
      {/* Weather Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getWeatherGradient()} opacity-10`} />

      {/* Content */}
      <div className="relative h-full p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-xs font-medium">{city.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">{city.country}</div>
          </div>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-8 h-8 rounded-lg bg-card/80 hover:bg-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Weather Info */}
        <div className="flex-1 flex items-center space-x-4">
          {/* Weather Icon */}
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
            {weatherIcon === 'Sun' && <div className="w-8 h-8 bg-yellow-400 rounded-full" />}
            {weatherIcon === 'Cloud' && <div className="w-8 h-8 bg-gray-400 rounded-full" />}
            {weatherIcon === 'CloudRain' && <div className="w-8 h-8 bg-blue-400 rounded-full" />}
            {weatherIcon === 'Moon' && <div className="w-8 h-8 bg-gray-300 rounded-full" />}
            {(weatherIcon === 'CloudSnow' || weatherIcon === 'CloudDrizzle') && (
              <div className="w-8 h-8 bg-blue-200 rounded-full" />
            )}
            {weatherIcon === 'CloudLightning' && (
              <div className="w-8 h-8 bg-purple-400 rounded-full" />
            )}
            {weatherIcon === 'CloudFog' && <div className="w-8 h-8 bg-gray-500 rounded-full" />}
            {weatherIcon === 'SunDim' && <div className="w-8 h-8 bg-orange-300 rounded-full" />}
            {weatherIcon === 'Wind' && <div className="w-8 h-8 bg-gray-600 rounded-full" />}
          </div>

          {/* Temperature and Description */}
          <div className="flex-1">
            <div className="text-3xl font-bold text-foreground">
              {formatTemperature(current.metrics.temperature, temperatureUnit)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatWeatherDescription(condition.description)}
            </div>
            <div className="text-xs text-muted-foreground">
              Feels like {formatTemperature(current.metrics.feelsLike, temperatureUnit)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* AQI Badge */}
          <AQIBadge aqi={weather.airQuality.aqi} level={weather.airQuality.level} size="sm" />

          {/* Quick Stats */}
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Wind className="w-3 h-3" />
              <span>{formatWindSpeed(current.metrics.windSpeed)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Droplets className="w-3 h-3" />
              <span>{formatHumidity(current.metrics.humidity)}</span>
            </div>
          </div>
        </div>

        {/* Cached Indicator */}
        {weather.isCached && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full" title="Cached data" />
        )}
      </div>
    </motion.div>
  );
}