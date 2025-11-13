// Search Bar Component with Autocomplete
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, X } from 'lucide-react';
import { useSearchHistory } from '@/hooks';
import { SearchCityResult } from '@/types';

interface SearchBarProps {
  onSearch: (query: string) => Promise<SearchCityResult[]>;
  onAddCity: (city: SearchCityResult) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  onSearch,
  onAddCity,
  isLoading = false,
  placeholder = 'Search for a city...',
  className = '',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchCityResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchHistoryHook = useSearchHistory();
  const searchHistory = searchHistoryHook.searchHistory;
  const addToSearchHistory = searchHistoryHook.addToSearchHistory;
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle search with debounce
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    try {
      const searchResults = await onSearch(searchQuery);
      setResults(searchResults.slice(0, 8)); // Limit to 8 results
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setIsOpen(false);
    }
  }, [onSearch]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, handleSearch]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  // Handle result selection
  const handleSelectResult = useCallback(async (result: SearchCityResult) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);

    // Add to search history
    addToSearchHistory(result.name, 1, `${result.name}, ${result.country}`);

    // Add city
    await onAddCity(result);
  }, [onAddCity, addToSearchHistory]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0 && selectedIndex >= 0) {
      handleSelectResult(results[selectedIndex]);
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Format city display name
  const formatCityName = (result: SearchCityResult) => {
    const parts = [result.name];
    if (result.state && result.state !== result.name) {
      parts.push(result.state);
    }
    parts.push(result.country);
    return parts.join(', ');
  };

  // Get recent searches
  const recentSearches = searchHistory.slice(0, 5);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder-muted-foreground"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg weather-shadow z-50 max-h-80 overflow-y-auto"
          >
            {/* Search Results */}
            {results.length > 0 && (
              <div className="py-1">
                {results.map((result, index) => (
                  <motion.button
                    key={`${result.name}-${result.lat}-${result.lon}-${result.country}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.02 }}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full px-4 py-3 text-left hover:bg-accent/10 focus:bg-accent/10 transition-colors flex items-center space-x-3 ${
                      selectedIndex === index ? 'bg-accent/10' : ''
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground font-medium truncate">
                        {result.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {formatCityName(result)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.lat.toFixed(2)}°, {result.lon.toFixed(2)}°
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {results.length === 0 && query.length === 0 && recentSearches.length > 0 && (
              <div className="py-1">
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Recent Searches
                </div>
                {recentSearches.map((search: any, index: number) => (
                  <motion.button
                    key={`${search.query}-${search.timestamp}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.02 }}
                    onClick={() => {
                      setQuery(search.query);
                      handleSearch(search.query);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-accent/10 focus:bg-accent/10 transition-colors flex items-center space-x-3"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 text-foreground">
                      {search.query}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {search.selectedCity}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* No Results */}
            {results.length === 0 && query.length > 0 && !isLoading && (
              <div className="px-4 py-6 text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No cities found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}

            {/* Empty State */}
            {results.length === 0 && query.length === 0 && recentSearches.length === 0 && !isLoading && (
              <div className="px-4 py-6 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Start typing to search for cities</p>
                <p className="text-sm mt-1">Try "New York", "London", or "Tokyo"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}