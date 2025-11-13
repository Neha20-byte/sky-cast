// React hook for geolocation functionality
import { useState, useCallback, useEffect } from 'react';
import {
  Coordinates,
  UserLocation,
  LocationPermission,
  GeolocationError,
  GeolocationOptions,
} from '@/types';
import { weatherAPI } from '@/services/weatherApi';
import { useLastLocation } from './useLocalStorage';

interface UseGeolocationOptions extends GeolocationOptions {
  fallbackToCache?: boolean;
  watchPosition?: boolean;
}

interface UseGeolocationReturn {
  location: UserLocation | null;
  permission: LocationPermission;
  isLoading: boolean;
  error: GeolocationError | null;
  isSupported: boolean;
  isWatching: boolean;
  getCurrentLocation: (options?: GeolocationOptions) => Promise<UserLocation>;
  watchCurrentLocation: (options?: GeolocationOptions) => void;
  stopWatching: () => void;
  clearLocation: () => void;
  getLocationName: (coordinates: Coordinates) => Promise<string | null>;
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    fallbackToCache = true,
    watchPosition = false,
  } = options;

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permission, setPermission] = useState<LocationPermission>({
    granted: false,
    state: 'prompt',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const { lastLocation, saveLastLocation, isRecent } = useLastLocation();

  // Check if geolocation is supported
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  // Update permission status
  const updatePermission = useCallback(async () => {
    if (!isSupported) return;

    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermission({
          granted: result.state === 'granted',
          state: result.state as LocationPermission['state'],
        });

        result.addEventListener('change', () => {
          setPermission({
            granted: result.state === 'granted',
            state: result.state as LocationPermission['state'],
          });
        });
      }
    } catch (err) {
      // Some browsers don't support permissions API
      setPermission({
        granted: false,
        state: 'prompt',
      });
    }
  }, [isSupported]);

  // Convert GeolocationPosition to UserLocation
  const positionToUserLocation = useCallback((position: GeolocationPosition): UserLocation => {
    return {
      coordinates: {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      },
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      isCached: false,
    };
  }, []);

  // Convert GeolocationPositionError to GeolocationError
  const positionErrorToGeolocationError = useCallback((err: GeolocationPositionError): GeolocationError => {
    const error = new Error(err.message) as GeolocationError;
    error.code = err.code;
    error.PERMISSION_DENIED = 1;
    error.POSITION_UNAVAILABLE = 2;
    error.TIMEOUT = 3;
    return error;
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async (
    customOptions?: GeolocationOptions
  ): Promise<UserLocation> => {
    if (!isSupported) {
      throw new GeolocationError('NOT_SUPPORTED', 'Geolocation is not supported by this browser');
    }

    setIsLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: customOptions?.enableHighAccuracy ?? enableHighAccuracy,
      timeout: customOptions?.timeout ?? timeout,
      maximumAge: customOptions?.maximumAge ?? maximumAge,
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = positionToUserLocation(position);
          setLocation(userLocation);
          saveLastLocation(userLocation.coordinates.lat, userLocation.coordinates.lon);
          setIsLoading(false);
          resolve(userLocation);
        },
        (positionError) => {
          const geolocationError = positionErrorToGeolocationError(positionError);
          setError(geolocationError);
          setIsLoading(false);
          reject(geolocationError);
        },
        options
      );
    });
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, positionToUserLocation, positionErrorToGeolocationError, saveLastLocation]);

  // Watch current location
  const watchCurrentLocation = useCallback((customOptions?: GeolocationOptions) => {
    if (!isSupported) {
      throw new GeolocationError('NOT_SUPPORTED', 'Geolocation is not supported by this browser');
    }

    // Stop watching if already watching
    if (watchId !== null) {
      stopWatching();
    }

    const options = {
      enableHighAccuracy: customOptions?.enableHighAccuracy ?? enableHighAccuracy,
      timeout: customOptions?.timeout ?? timeout,
      maximumAge: customOptions?.maximumAge ?? maximumAge,
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const userLocation = positionToUserLocation(position);
        setLocation(userLocation);
        saveLastLocation(userLocation.coordinates.lat, userLocation.coordinates.lon);
      },
      (positionError) => {
        const geolocationError = positionErrorToGeolocationError(positionError);
        setError(geolocationError);
      },
      options
    );

    setWatchId(id);
    setIsWatching(true);
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, watchId, positionToUserLocation, positionErrorToGeolocationError, saveLastLocation]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  // Clear current location
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    stopWatching();
  }, [stopWatching]);

  // Get location name from coordinates
  const getLocationName = useCallback(async (coordinates: Coordinates): Promise<string | null> => {
    try {
      const locationData = await weatherAPI.getLocationName(coordinates);
      if (locationData) {
        const parts = [locationData.name];
        if (locationData.state && locationData.state !== locationData.name) {
          parts.push(locationData.state);
        }
        parts.push(locationData.country);
        return parts.join(', ');
      }
      return null;
    } catch (error) {
      console.error('Error getting location name:', error);
      return null;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    updatePermission();

    // Load last known location if available and recent
    if (fallbackToCache && lastLocation && isRecent()) {
      setLocation({
        coordinates: lastLocation.coordinates,
        timestamp: lastLocation.timestamp,
        isCached: true,
      });
    }

    // Start watching if requested
    if (watchPosition && isSupported && permission.granted) {
      watchCurrentLocation();
    }
  }, [
    updatePermission,
    fallbackToCache,
    lastLocation,
    isRecent,
    watchPosition,
    isSupported,
    permission.granted,
    watchCurrentLocation,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  // Watch for permission changes
  useEffect(() => {
    if (watchPosition && permission.granted && !isWatching) {
      watchCurrentLocation();
    } else if (!permission.granted && isWatching) {
      stopWatching();
    }
  }, [watchPosition, permission.granted, isWatching, watchCurrentLocation, stopWatching]);

  return {
    location,
    permission,
    isLoading,
    error,
    isSupported,
    isWatching,
    getCurrentLocation,
    watchCurrentLocation,
    stopWatching,
    clearLocation,
    getLocationName,
  };
}

// Hook for location-based features
export function useLocationFeatures() {
  const { location, getCurrentLocation, getLocationName, isSupported } = useGeolocation();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);

  // Detect current location and get name
  const detectLocation = useCallback(async (): Promise<{ coordinates: Coordinates; name: string } | null> => {
    if (!isSupported) return null;

    setIsDetecting(true);
    setDetectedLocationName(null);

    try {
      const userLocation = await getCurrentLocation();
      const locationName = await getLocationName(userLocation.coordinates);

      if (locationName) {
        setDetectedLocationName(locationName);
      }

      return {
        coordinates: userLocation.coordinates,
        name: locationName || 'Unknown Location',
      };
    } catch (error) {
      console.error('Location detection failed:', error);
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, [isSupported, getCurrentLocation, getLocationName]);

  // Check if location is accurate enough (within reasonable accuracy)
  const isLocationAccurate = useCallback((accuracy?: number): boolean => {
    return !accuracy || accuracy <= 1000; // Within 1km is considered accurate
  }, []);

  // Get distance between two coordinates
  const getDistance = useCallback((coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  return {
    location,
    detectedLocationName,
    isDetecting,
    isSupported,
    detectLocation,
    getLocationName,
    isLocationAccurate,
    getDistance,
  };
}

// Hook for location permissions
export function useLocationPermissions() {
  const [permission, setPermission] = useState<LocationPermission>({
    granted: false,
    state: 'prompt',
  });
  const [isSupported, setIsSupported] = useState(false);

  // Check if geolocation is supported
  useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && 'geolocation' in navigator);
  }, []);

  // Check current permission status
  const checkPermission = useCallback(async (): Promise<LocationPermission> => {
    if (!isSupported) {
      return { granted: false, state: 'prompt' };
    }

    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        const permissionState = {
          granted: result.state === 'granted',
          state: result.state as LocationPermission['state'],
        };
        setPermission(permissionState);
        return permissionState;
      }
    } catch (error) {
      console.error('Error checking geolocation permission:', error);
    }

    return { granted: false, state: 'prompt' };
  }, [isSupported]);

  // Request permission (this will trigger the browser prompt)
  const requestPermission = useCallback(async (): Promise<LocationPermission> => {
    if (!isSupported) {
      return { granted: false, state: 'prompt' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          const permissionState = { granted: true, state: 'granted' as const };
          setPermission(permissionState);
          resolve(permissionState);
        },
        (error) => {
          const permissionState = {
            granted: false,
            state: error.code === 1 ? 'denied' as const : 'prompt' as const,
          };
          setPermission(permissionState);
          resolve(permissionState);
        },
        { timeout: 5000 }
      );
    });
  }, [isSupported]);

  // Initialize on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permission,
    isSupported,
    checkPermission,
    requestPermission,
  };
}