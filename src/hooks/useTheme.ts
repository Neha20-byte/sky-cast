// React hook for theme management
import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '@/types';

interface UseThemeOptions {
  defaultTheme?: ThemeMode;
  enableSystem?: boolean;
  storageKey?: string;
}

interface UseThemeReturn {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
}

export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
  const {
    defaultTheme = 'auto',
    enableSystem = true,
    storageKey = 'skyCastTheme',
  } = options;

  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Get system theme
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';

    // Check for CSS media query support
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, []);

  // Resolve theme based on current setting and system preference
  const getResolvedTheme = useCallback((currentTheme: ThemeMode): 'light' | 'dark' => {
    if (currentTheme === 'auto') {
      return enableSystem ? getSystemTheme() : 'light';
    }
    return currentTheme;
  }, [enableSystem, getSystemTheme]);

  // Get resolved theme
  const resolvedTheme = getResolvedTheme(theme);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey) as ThemeMode;
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme from storage:', error);
    }
  }, [storageKey]);

  // Update system theme when it changes
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [enableSystem]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add the resolved theme class
    root.classList.add(resolvedTheme);

    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', resolvedTheme);

    // Set color scheme CSS custom property
    root.style.setProperty('color-scheme', resolvedTheme);
  }, [resolvedTheme]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.error('Error saving theme to storage:', error);
    }
  }, [theme, storageKey]);

  // Set theme
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  // Toggle between themes
  const toggleTheme = useCallback(() => {
    setThemeState(currentTheme => {
      if (currentTheme === 'light') return 'dark';
      if (currentTheme === 'dark') return 'auto';
      return 'light';
    });
  }, []);

  // Reset theme to default
  const resetTheme = useCallback(() => {
    setThemeState(defaultTheme);
  }, [defaultTheme]);

  return {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
    toggleTheme,
    resetTheme,
  };
}

// Hook for theme-based styling
export function useThemeStyles() {
  const { resolvedTheme } = useTheme();

  // Get theme-aware colors
  const getColors = useCallback(() => {
    const colors = {
      light: {
        background: 'rgb(249 250 251)',
        foreground: 'rgb(17 24 39)',
        muted: 'rgb(243 244 246)',
        accent: 'rgb(59 130 246)',
        border: 'rgb(229 231 235)',
        shadow: 'rgba(0, 0, 0, 0.1)',
      },
      dark: {
        background: 'rgb(17 24 39)',
        foreground: 'rgb(249 250 251)',
        muted: 'rgb(31 41 55)',
        accent: 'rgb(96 165 250)',
        border: 'rgb(55 65 81)',
        shadow: 'rgba(0, 0, 0, 0.3)',
      },
    };

    return colors[resolvedTheme];
  }, [resolvedTheme]);

  // Get theme-aware gradients
  const getGradients = useCallback(() => {
    const gradients = {
      light: {
        primary: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(37 99 235) 100%)',
        secondary: 'linear-gradient(135deg, rgb(249 250 251) 0%, rgb(243 244 246) 100%)',
        weather: {
          sunny: 'linear-gradient(135deg, rgb(251 191 36) 0%, rgb(245 158 11) 100%)',
          cloudy: 'linear-gradient(135deg, rgb(156 163 175) 0%, rgb(107 114 128) 100%)',
          rainy: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(37 99 235) 100%)',
          snowy: 'linear-gradient(135deg, rgb(243 244 246) 0%, rgb(229 231 235) 100%)',
        },
      },
      dark: {
        primary: 'linear-gradient(135deg, rgb(96 165 250) 0%, rgb(37 99 235) 100%)',
        secondary: 'linear-gradient(135deg, rgb(31 41 55) 0%, rgb(17 24 39) 100%)',
        weather: {
          sunny: 'linear-gradient(135deg, rgb(217 119 6) 0%, rgb(180 83 9) 100%)',
          cloudy: 'linear-gradient(135deg, rgb(75 85 99) 0%, rgb(55 65 81) 100%)',
          rainy: 'linear-gradient(135deg, rgb(55 65 81) 0%, rgb(31 41 55) 100%)',
          snowy: 'linear-gradient(135deg, rgb(55 65 81) 0%, rgb(75 85 99) 100%)',
        },
      },
    };

    return gradients[resolvedTheme];
  }, [resolvedTheme]);

  // Get theme-aware animations
  const getAnimations = useCallback(() => {
    const animations = {
      light: {
        card: {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -20, opacity: 0 },
          transition: { duration: 0.3, ease: 'easeOut' },
        },
        background: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5, ease: 'easeInOut' },
        },
      },
      dark: {
        card: {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -20, opacity: 0 },
          transition: { duration: 0.3, ease: 'easeOut' },
        },
        background: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5, ease: 'easeInOut' },
        },
      },
    };

    return animations[resolvedTheme];
  }, [resolvedTheme]);

  return {
    theme: resolvedTheme,
    colors: getColors(),
    gradients: getGradients(),
    animations: getAnimations(),
  };
}

// Hook for detecting reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

// Hook for theme transition animations
export function useThemeTransition() {
  const { theme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    // Add a small delay to ensure the transition is visible
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, []);

  // Trigger transition when theme changes
  useEffect(() => {
    startTransition();
  }, [theme, startTransition]);

  return {
    isTransitioning,
    transitionClass: isTransitioning ? 'theme-transitioning' : '',
  };
}