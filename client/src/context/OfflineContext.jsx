import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OfflineContext = createContext(null);

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastCachedAt, setLastCachedAt] = useState(() => {
    return localStorage.getItem('geoseva_facilities_cached_at') || null;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveFacilitiesToCache = useCallback((facilities) => {
    try {
      const now = new Date().toISOString();
      localStorage.setItem('geoseva_cached_facilities', JSON.stringify(facilities));
      localStorage.setItem('geoseva_facilities_cached_at', now);
      setLastCachedAt(now);
    } catch (err) {
      console.warn('Failed to cache facilities to localStorage:', err);
    }
  }, []);

  const getCachedFacilities = useCallback(() => {
    try {
      const raw = localStorage.getItem('geoseva_cached_facilities');
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        lastCachedAt,
        saveFacilitiesToCache,
        getCachedFacilities,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
