import { useState, useCallback } from 'react';

export const useGeolocation = () => {
  const [coordinates, setCoordinates] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errMsg = 'Geolocation is not supported by your browser.';
        setError(errMsg);
        reject(new Error(errMsg));
        return;
      }

      setIsLocating(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoordinates(coords);
          setAccuracy(position.coords.accuracy);
          setIsLocating(false);
          resolve(coords);
        },
        (err) => {
          let errMsg = 'Failed to obtain current location.';
          if (err.code === err.PERMISSION_DENIED) {
            errMsg = 'Location permission was denied. Please allow location access or pick manually on the map.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errMsg = 'Location information is currently unavailable.';
          } else if (err.code === err.TIMEOUT) {
            errMsg = 'Request to get location timed out.';
          }
          setError(errMsg);
          setIsLocating(false);
          reject(new Error(errMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setAccuracy(null);
    setError(null);
  }, []);

  return {
    coordinates,
    accuracy,
    error,
    isLocating,
    getCurrentLocation,
    clearLocation,
  };
};
