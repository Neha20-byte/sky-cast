// Weather Modal Component for Detailed City View
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Thermometer, Wind, Droplets, Eye, Gauge, Sunrise, Sunset, Compass, TrendingUp, Heart, Share2, RefreshCw } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CityWeather, TemperatureUnit } from '@/types';
import { formatTemperature, formatWindSpeed, formatHumidity, formatTime, formatDate, getSunTimes, formatAQI, formatWindDirection } from '@/utils';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityWeather: CityWeather;
  temperatureUnit: TemperatureUnit;
  onAddToFavorites?: () => void;
  onRefresh?: () => Promise<void>;
}

export function WeatherModal({
  isOpen,
  onClose,
  cityWeather,
  temperatureUnit,
  onAddToFavorites,
  onRefresh,
}: WeatherModalProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { city, current, forecast, hourlyForecast, dailyForecast, airQuality } = cityWeather;
  const condition = current.weather[0];

  // AQI colors for pie chart
  const aqiColors = {
    'Good': '#00E400',
    'Fair': '#FFFF00',
    'Moderate': '#FF7E00',
    'Poor': '#FF0000',
    'Very Poor': '#8F3F97',
    'Hazardous': '#7E0023'
  };

  // Format data for charts
  const hourlyChartData = hourlyForecast.slice(0, 24).map(item => ({
    time: item.time,
    temperature: item.temperature,
    humidity: item.humidity,
    precipitation: item.precipitation,
    windSpeed: item.windSpeed,
  }));

  const aqiData = [
    { name: 'PM2.5', value: Math.round(airQuality.components.pm2_5), color: '#8884d8' },
    { name: 'PM10', value: Math.round(airQuality.components.pm10), color: '#82ca9d' },
    { name: 'NO₂', value: Math.round(airQuality.components.no2), color: '#ffc658' },
    { name: 'O₃', value: Math.round(airQuality.components.o3), color: '#ff7300' },
    { name: 'SO₂', value: Math.round(airQuality.components.so2), color: '#0088fe' },
    { name: 'CO', value: Math.round(airQuality.components.co), color: '#00c49f' },
  ];

  const sunTimes = getSunTimes(
    current.sunTimes.sunrise,
    current.sunTimes.sunset,
    current.timezone
  );

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative bg-card border border-border rounded-2xl shadow-2xl weather-shadow max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* City Info */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  <h2 className="text-2xl font-bold">{city.name}</h2>
                </div>
                <p className="text-white/80">{city.country}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {onAddToFavorites && (
                  <button
                    onClick={onAddToFavorites}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                )}
                <button className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Current Weather */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-5xl font-bold mb-2">
                  {formatTemperature(current.metrics.temperature, temperatureUnit)}
                </div>
                <p className="text-xl text-white/90 capitalize">
                  {condition.description}
                </p>
                <p className="text-white/70">
                  Feels like {formatTemperature(current.metrics.feelsLike, temperatureUnit)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4" />
                  <span>{formatWindSpeed(current.metrics.windSpeed)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4" />
                  <span>{formatHumidity(current.metrics.humidity)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{(current.visibility / 1000).toFixed(1)} km</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4" />
                  <span>{current.metrics.pressure} hPa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Hourly Forecast Chart */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">24-Hour Forecast</h3>
              <div className="bg-muted rounded-lg p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={hourlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="time"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="temperature"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="Temperature"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Air Quality */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Air Quality Index</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold" style={{ color: aqiColors[airQuality.level as keyof typeof aqiColors] }}>
                      {airQuality.aqi}
                    </span>
                    <span className="text-sm font-medium" style={{ color: aqiColors[airQuality.level as keyof typeof aqiColors] }}>
                      {airQuality.level}
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={aqiData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {aqiData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">Pollutant Breakdown</h4>
                  <div className="space-y-2">
                    {aqiData.map((pollutant) => (
                      <div key={pollutant.name} className="flex items-center justify-between">
                        <span className="text-sm">{pollutant.name}</span>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: pollutant.color }}
                          />
                          <span className="text-sm font-medium">{pollutant.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sun Times */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Sun & Moon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Sunrise className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">Sunrise</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{sunTimes.sunrise}</p>
                  <p className="text-sm text-muted-foreground">Day Length: {sunTimes.dayLength}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Sunset className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Sunset</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{sunTimes.sunset}</p>
                  <p className="text-sm text-muted-foreground">Day Length: {sunTimes.dayLength}</p>
                </div>
              </div>
            </div>

            {/* Wind Direction */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Wind Conditions</h3>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <Wind className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Wind Speed</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {formatWindSpeed(current.metrics.windSpeed)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Direction: {formatWindDirection(current.metrics.windDirection)} ({current.metrics.windDirection}°)
                    </p>
                  </div>
                  <div className="text-4xl">
                    <Compass
                      className="w-16 h-16 text-blue-500"
                      style={{
                        transform: `rotate(${current.metrics.windDirection}deg)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">7-Day Forecast</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {dailyForecast.slice(0, 7).map((day, index) => (
                  <div key={index} className="bg-muted rounded-lg p-4 text-center">
                    <p className="font-medium text-foreground mb-2">{day.dayName}</p>
                    <div className="w-8 h-8 bg-accent/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                      {day.weather.main.toLowerCase() === 'clear' && <div className="w-4 h-4 bg-yellow-400 rounded-full" />}
                      {day.weather.main.toLowerCase() === 'clouds' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                      {day.weather.main.toLowerCase().includes('rain') && <div className="w-4 h-4 bg-blue-400 rounded-full" />}
                      {day.weather.main.toLowerCase().includes('snow') && <div className="w-4 h-4 bg-gray-200 rounded-full" />}
                    </div>
                    <div className="text-sm">
                      <div className="font-bold">{formatTemperature(day.tempMax, temperatureUnit)}</div>
                      <div className="text-muted-foreground">{formatTemperature(day.tempMin, temperatureUnit)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}