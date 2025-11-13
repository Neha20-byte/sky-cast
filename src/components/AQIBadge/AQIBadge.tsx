// AQI Badge Component
'use client';

import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';

interface AQIBadgeProps {
  aqi: number;
  level: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function AQIBadge({ aqi, level, size = 'md', showIcon = true }: AQIBadgeProps) {
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-900';
  };

  const getAQITextColor = (aqi: number) => {
    if (aqi <= 100) return 'text-foreground';
    return 'text-white';
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.div
      className={`
        ${getAQIColor(aqi)} ${getAQITextColor(aqi)}
        ${sizeClasses[size]}
        rounded-full font-medium flex items-center space-x-1
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Air Quality Index: ${aqi} - ${level}`}
    >
      {showIcon && <Wind className="w-3 h-3" />}
      <span>{aqi}</span>
    </motion.div>
  );
}