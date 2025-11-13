// Loading States Component
'use client';

import { motion } from 'framer-motion';

export const LoadingStates = {
  // Weather Card Skeleton
  WeatherCardSkeleton: () => (
    <motion.div
      className="h-48 bg-card border border-border rounded-2xl p-6 weather-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-24 bg-muted rounded animate-shimmer" />
            <div className="h-4 w-16 bg-muted rounded animate-shimmer" />
          </div>
          <div className="h-8 w-8 bg-muted rounded-full animate-shimmer" />
        </div>

        {/* Weather Info */}
        <div className="flex-1 flex items-center space-x-4">
          <div className="h-16 w-16 bg-muted rounded-2xl animate-shimmer" />
          <div className="space-y-2">
            <div className="h-8 w-16 bg-muted rounded animate-shimmer" />
            <div className="h-4 w-20 bg-muted rounded animate-shimmer" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-12 bg-muted rounded-full animate-shimmer" />
          <div className="h-4 w-24 bg-muted rounded animate-shimmer" />
        </div>
      </div>
    </motion.div>
  ),

  // Search Results Skeleton
  SearchSkeleton: () => (
    <div className="space-y-2">
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          className="p-3 bg-muted rounded-lg animate-shimmer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-border rounded-full" />
            <div className="space-y-1">
              <div className="h-4 w-32 bg-border rounded" />
              <div className="h-3 w-24 bg-border rounded" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  ),

  // Inline Loading Spinner
  Spinner: ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    return (
      <div className={`${sizeClasses[size]} border-2 border-accent border-t-transparent rounded-full animate-spin`} />
    );
  },

  // Full Page Loading
  FullPageLoader: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-foreground font-medium">Loading weather data...</p>
        <p className="text-muted-foreground text-sm mt-1">This should only take a moment</p>
      </motion.div>
    </div>
  ),

  // Loading Dots
  Dots: ({ className = '' }: { className?: string }) => (
    <div className={`flex space-x-1 ${className}`}>
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-accent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  ),

  // Pulse Loading
  Pulse: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`animate-pulse-slow ${className}`}>
      {children}
    </div>
  ),

  // Empty State
  EmptyState: ({
    icon,
    title,
    description,
    action
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action}
    </motion.div>
  ),
};

// Individual exports for convenience
export const WeatherCardSkeleton = LoadingStates.WeatherCardSkeleton;
export const SearchSkeleton = LoadingStates.SearchSkeleton;
export const Spinner = LoadingStates.Spinner;
export const FullPageLoader = LoadingStates.FullPageLoader;
export const LoadingDots = LoadingStates.Dots;
export const Pulse = LoadingStates.Pulse;