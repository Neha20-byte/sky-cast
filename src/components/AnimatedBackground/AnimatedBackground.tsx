// Animated Background Component for Weather Conditions
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherCondition, TimeOfDay } from '@/types';
import { getWeatherCondition, getDayOrNight } from '@/utils';

interface AnimatedBackgroundProps {
  weatherCondition?: string;
  timestamp?: number;
  timezone?: number;
  sunrise?: number;
  sunset?: number;
  children?: React.ReactNode;
}

export function AnimatedBackground({
  weatherCondition,
  timestamp = Date.now() / 1000,
  timezone = 0,
  sunrise,
  sunset,
  children,
}: AnimatedBackgroundProps) {
  const [currentWeatherImage, setCurrentWeatherImage] = useState<string>('/weather-images/default.jpg');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Determine weather condition and time of day
  const { condition, timeOfDay } = useMemo(() => {
    const cond = weatherCondition
      ? getWeatherCondition(weatherCondition) as WeatherCondition
      : 'clear';

    const tod = sunrise && sunset
      ? getDayOrNight(timestamp, timezone, sunrise, sunset) as TimeOfDay
      : 'day';

    return { condition: cond, timeOfDay: tod };
  }, [weatherCondition, timestamp, timezone, sunrise, sunset]);

  // Get weather-specific background images
  const getWeatherBackground = useMemo(() => {
    const weatherImages: Record<WeatherCondition, Record<TimeOfDay, string[]>> = {
      clear: {
        day: [
          '/weather-images/sunny-day-1.jpg',
          '/weather-images/sunny-day-2.jpg',
          '/weather-images/clear-sky.jpg'
        ],
        night: [
          '/weather-images/clear-night-1.jpg',
          '/weather-images/starry-night.jpg',
          '/weather-images/moonlight.jpg'
        ],
        dawn: [
          '/weather-images/sunrise-1.jpg',
          '/weather-images/dawn-sky.jpg'
        ],
        dusk: [
          '/weather-images/sunset-1.jpg',
          '/weather-images/dusk-sky.jpg'
        ]
      },
      clouds: {
        day: [
          '/weather-images/cloudy-day.jpg',
          '/weather-images/partly-cloudy.jpg',
          '/weather-images/overcast.jpg'
        ],
        night: [
          '/weather-images/cloudy-night.jpg',
          '/weather-images/moon-clouds.jpg'
        ],
        dawn: [
          '/weather-images/cloudy-sunrise.jpg',
          '/weather-images/cloudy-dawn.jpg'
        ],
        dusk: [
          '/weather-images/cloudy-sunset.jpg',
          '/weather-images/cloudy-dusk.jpg'
        ]
      },
      rain: {
        day: [
          '/weather-images/rainy-day.jpg',
          '/weather-images/storm-day.jpg',
          '/weather-images/rain-drops.jpg'
        ],
        night: [
          '/weather-images/rainy-night.jpg',
          '/weather-images/storm-night.jpg'
        ],
        dawn: [
          '/weather-images/rainy-dawn.jpg'
        ],
        dusk: [
          '/weather-images/rainy-dusk.jpg'
        ]
      },
      drizzle: {
        day: ['/weather-images/drizzle-day.jpg'],
        night: ['/weather-images/drizzle-night.jpg'],
        dawn: ['/weather-images/drizzle-dawn.jpg'],
        dusk: ['/weather-images/drizzle-dusk.jpg']
      },
      thunderstorm: {
        day: ['/weather-images/thunderstorm-day.jpg'],
        night: ['/weather-images/thunderstorm-night.jpg'],
        dawn: ['/weather-images/thunderstorm-dawn.jpg'],
        dusk: ['/weather-images/thunderstorm-dusk.jpg']
      },
      snow: {
        day: [
          '/weather-images/snowy-day.jpg',
          '/weather-images/winter-landscape.jpg'
        ],
        night: [
          '/weather-images/snowy-night.jpg',
          '/weather-images/winter-night.jpg'
        ],
        dawn: ['/weather-images/snowy-dawn.jpg'],
        dusk: ['/weather-images/snowy-dusk.jpg']
      },
      mist: {
        day: ['/weather-images/misty-day.jpg'],
        night: ['/weather-images/misty-night.jpg'],
        dawn: ['/weather-images/misty-dawn.jpg'],
        dusk: ['/weather-images/misty-dusk.jpg']
      },
      fog: {
        day: ['/weather-images/foggy-day.jpg'],
        night: ['/weather-images/foggy-night.jpg'],
        dawn: ['/weather-images/foggy-dawn.jpg'],
        dusk: ['/weather-images/foggy-dusk.jpg']
      },
      haze: {
        day: ['/weather-images/hazy-day.jpg'],
        night: ['/weather-images/hazy-night.jpg'],
        dawn: ['/weather-images/hazy-dawn.jpg'],
        dusk: ['/weather-images/hazy-dusk.jpg']
      },
      dust: {
        day: ['/weather-images/dusty-day.jpg'],
        night: ['/weather-images/dusty-night.jpg'],
        dawn: ['/weather-images/dusty-dawn.jpg'],
        dusk: ['/weather-images/dusty-dusk.jpg']
      },
      sand: {
        day: ['/weather-images/sandstorm-day.jpg'],
        night: ['/weather-images/sandstorm-night.jpg'],
        dawn: ['/weather-images/sandstorm-dawn.jpg'],
        dusk: ['/weather-images/sandstorm-dusk.jpg']
      },
      ash: {
        day: ['/weather-images/volcanic-ash.jpg'],
        night: ['/weather-images/volcanic-ash-night.jpg'],
        dawn: ['/weather-images/volcanic-ash-dawn.jpg'],
        dusk: ['/weather-images/volcanic-ash-dusk.jpg']
      },
      squall: {
        day: ['/weather-images/squall.jpg'],
        night: ['/weather-images/squall-night.jpg'],
        dawn: ['/weather-images/squall-dawn.jpg'],
        dusk: ['/weather-images/squall-dusk.jpg']
      },
      tornado: {
        day: ['/weather-images/tornado.jpg'],
        night: ['/weather-images/tornado-night.jpg'],
        dawn: ['/weather-images/tornado-dawn.jpg'],
        dusk: ['/weather-images/tornado-dusk.jpg']
      }
    };

    const images = weatherImages[condition]?.[timeOfDay] || weatherImages.clear.day;
    return images[Math.floor(Math.random() * images.length)];
  }, [condition, timeOfDay]);

  // Update background image when weather changes
  useEffect(() => {
    const newImage = getWeatherBackground;
    if (newImage !== currentWeatherImage) {
      setIsTransitioning(true);
      setImageLoaded(false);

      // Preload new image
      const img = new Image();
      img.onload = () => {
        setTimeout(() => {
          setCurrentWeatherImage(newImage);
          setImageLoaded(true);
          setIsTransitioning(false);
        }, 300); // Short delay for smooth transition
      };
      img.onerror = () => {
        // Fallback to gradient if image fails to load
        setCurrentWeatherImage('/weather-images/default.jpg');
        setImageLoaded(true);
        setIsTransitioning(false);
      };
      img.src = newImage;
    }
  }, [getWeatherBackground, currentWeatherImage]);

  // Get gradient overlay based on weather and time
  const getGradientOverlay = useMemo(() => {
    const gradients = {
      clear: {
        day: 'from-blue-400/20 via-transparent to-yellow-200/20',
        night: 'from-indigo-900/40 via-transparent to-purple-900/40',
        dawn: 'from-orange-400/30 via-pink-300/30 to-yellow-200/20',
        dusk: 'from-purple-600/30 via-pink-500/30 to-orange-400/30'
      },
      clouds: {
        day: 'from-gray-400/20 via-transparent to-blue-300/20',
        night: 'from-gray-800/30 via-transparent to-indigo-900/30',
        dawn: 'from-gray-600/25 via-orange-300/25 to-yellow-200/20',
        dusk: 'from-gray-700/30 via-purple-500/25 to-pink-400/25'
      },
      rain: {
        day: 'from-blue-600/30 via-transparent to-gray-500/30',
        night: 'from-blue-900/40 via-transparent to-gray-800/40',
        dawn: 'from-blue-700/35 via-gray-600/30 to-indigo-500/30',
        dusk: 'from-blue-800/35 via-purple-700/30 to-pink-600/25'
      },
      drizzle: {
        day: 'from-blue-500/25 via-transparent to-gray-400/25',
        night: 'from-blue-800/30 via-transparent to-gray-700/30',
        dawn: 'from-blue-600/28 via-gray-500/25 to-indigo-400/25',
        dusk: 'from-blue-700/28 via-purple-600/25 to-pink-500/20'
      },
      thunderstorm: {
        day: 'from-gray-900/50 via-purple-900/40 to-blue-900/40',
        night: 'from-gray-950/60 via-purple-950/50 to-blue-950/50',
        dawn: 'from-gray-800/45 via-purple-800/40 to-blue-800/35',
        dusk: 'from-gray-850/45 via-purple-850/40 to-blue-850/35'
      },
      snow: {
        day: 'from-blue-100/30 via-white/20 to-gray-200/30',
        night: 'from-blue-900/30 via-gray-100/20 to-white/10',
        dawn: 'from-blue-200/28 via-gray-100/25 to-yellow-100/20',
        dusk: 'from-blue-800/28 via-purple-200/25 to-pink-100/20'
      },
      mist: {
        day: 'from-gray-300/40 via-transparent to-blue-200/30',
        night: 'from-gray-700/50 via-transparent to-indigo-800/40',
        dawn: 'from-gray-500/45 via-orange-200/35 to-yellow-100/30',
        dusk: 'from-gray-600/45 via-purple-300/35 to-pink-200/30'
      },
      fog: {
        day: 'from-gray-400/50 via-transparent to-blue-300/40',
        night: 'from-gray-800/60 via-transparent to-indigo-900/50',
        dawn: 'from-gray-600/55 via-orange-300/45 to-yellow-200/40',
        dusk: 'from-gray-700/55 via-purple-400/45 to-pink-300/40'
      },
      haze: {
        day: 'from-yellow-300/40 via-orange-200/30 to-brown-300/30',
        night: 'from-yellow-900/40 via-orange-800/30 to-brown-900/30',
        dawn: 'from-orange-400/38 via-yellow-300/32 to-red-300/30',
        dusk: 'from-orange-700/38 via-yellow-600/32 to-red-600/30'
      }
    };

    return gradients[condition as keyof typeof gradients]?.[timeOfDay] || gradients.clear.day;
  }, [condition, timeOfDay]);

  // Particle effects for weather
  const renderWeatherParticles = () => {
    const particles = [];
    const particleCount = condition === 'rain' ? 50 : condition === 'snow' ? 30 : 0;

    for (let i = 0; i < particleCount; i++) {
      const delay = Math.random() * 5;
      const duration = condition === 'rain' ? 1 + Math.random() * 2 : 3 + Math.random() * 4;
      const size = condition === 'rain' ? 2 : 4 + Math.random() * 4;
      const left = Math.random() * 100;

      particles.push(
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: condition === 'rain' ? 'rgba(147, 197, 253, 0.6)' : 'rgba(255, 255, 255, 0.8)',
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: '100vh',
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      );
    }
    return particles;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWeatherImage}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: imageLoaded ? 1 : 0,
            scale: imageLoaded ? 1 : 1.1
          }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{
            duration: isTransitioning ? 0.6 : 0,
            ease: 'easeInOut'
          }}
        >
          {/* Fallback gradient if image fails to load */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getGradientOverlay}`}
          />

          {/* Weather Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${currentWeatherImage})` }}
          />

          {/* Overlay for readability */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getGradientOverlay}`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Weather Particles */}
      {['rain', 'snow', 'drizzle'].includes(condition) && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {renderWeatherParticles()}
        </div>
      )}

      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>

      {/* Loading State */}
      {!imageLoaded && (
        <div className="absolute inset-0 z-15 bg-background/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading weather background...</p>
          </div>
        </div>
      )}
    </div>
  );
}