// Theme Toggle Component
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ThemeToggle({
  variant = 'button',
  size = 'md',
  className = '',
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const icons = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    auto: <Monitor className="w-4 h-4" />,
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'System', icon: Monitor },
  ];

  if (variant === 'button') {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`relative ${sizeClasses[size]} rounded-lg bg-card border border-border hover:bg-accent/10 transition-all focus-ring flex items-center justify-center ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={`Current theme: ${theme}. Click to change.`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-foreground"
          >
            {theme === 'auto' ? (
              resolvedTheme === 'dark' ? icons.dark : icons.light
            ) : (
              icons[theme as keyof typeof icons]
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} rounded-lg bg-card border border-border hover:bg-accent/10 transition-all focus-ring flex items-center justify-center relative`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-foreground"
          >
            {theme === 'auto' ? (
              resolvedTheme === 'dark' ? icons.dark : icons.light
            ) : (
              icons[theme as keyof typeof icons]
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg weather-shadow z-50 min-w-[140px] overflow-hidden"
            >
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;

                return (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      setTheme(option.value as any);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-accent/10 transition-colors ${
                      isSelected ? 'bg-accent/20' : ''
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4 text-foreground" />
                    <span className="text-foreground">{option.label}</span>
                    {isSelected && (
                      <div className="w-2 h-2 bg-accent rounded-full ml-auto" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}