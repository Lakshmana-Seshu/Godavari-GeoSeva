import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  List,
  Map as MapIcon,
  Locate,
  AlertCircle,
  RefreshCw,
  Info,
  Navigation,
  Compass,
  Layers,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { facilityApi } from '../api/facilityApi';
import { GodavariGoogleMap } from '../components/map/GodavariGoogleMap';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { FacilityCard } from '../components/facilities/FacilityCard';
import { FacilityDetailModal } from '../components/facilities/FacilityDetailModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useGeolocation } from '../hooks/useGeolocation';
import { useOffline } from '../context/OfflineContext';
import { DEMO_FACILITIES } from '../data/demoFacilities';
import { isValidGoogleKey } from '../utils/formatters';

export const ExploreMap = () => {
  const [facilities, setFacilities] = useState(() => {
    try {
      const cached = localStorage.getItem('geoseva_cached_facilities');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEMO_FACILITIES;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'split' | 'list'
  const hasValidGoogleKey = isValidGoogleKey(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('geoseva_gmaps_api_key')
  );
  const [mapEngine, setMapEngine] = useState(hasValidGoogleKey ? 'google' : 'osm'); // 'google' | 'osm'
  const [mapSize, setMapSize] = useState('compact'); // 'compact' (440px) | 'standard' (540px) | 'tall' (680px)
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [searchParams] = useSearchParams();

  // Geolocation
  const { coordinates: userLocation, error: geoError, isLocating, getCurrentLocation } = useGeolocation();
  const { isOnline, getCachedFacilities, saveFacilitiesToCache } = useOffline();

  // Load facilities for directory & split view
  const fetchFacilitiesList = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await facilityApi.getFacilities({ limit: 100 });
      let list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.facilities)
        ? res.data.facilities
        : [];

      if (!list || list.length === 0) {
        list = DEMO_FACILITIES;
      }

      setFacilities(list);
      saveFacilitiesToCache(list);

      // Check URL query parameters for direct facility navigation (from Chatbot / external links)
      const targetId = searchParams.get('facilityId');
      if (targetId && list.length > 0) {
        const found = list.find((f) => (f._id || f.id) === targetId);
        if (found) {
          setSelectedFacility(found);
        }
      }
    } catch (err) {
      const cached = getCachedFacilities();
      const list = cached && cached.length > 0 ? cached : DEMO_FACILITIES;
      setFacilities(list);

      const targetId = searchParams.get('facilityId');
      if (targetId && list.length > 0) {
        const found = list.find((f) => (f._id || f.id) === targetId);
        if (found) {
          setSelectedFacility(found);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, saveFacilitiesToCache, getCachedFacilities]);

  useEffect(() => {
    fetchFacilitiesList();
  }, [fetchFacilitiesList]);

  // Height mapping based on selected map size
  const getMapHeightStyle = () => {
    if (viewMode === 'split') return 'h-[600px]';
    switch (mapSize) {
      case 'compact':
        return 'h-[440px] sm:h-[480px]';
      case 'standard':
        return 'h-[540px] sm:h-[580px]';
      case 'tall':
        return 'h-[680px] sm:h-[720px]';
      default:
        return 'h-[480px]';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header & GIS Engine Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            GIS
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
              Rajamahendravaram–Kovvur GIS Portal
              <span className="text-[10px] bg-teal-100 text-teal-800 font-extrabold px-2 py-0.5 rounded-full border border-teal-300">
                {mapEngine === 'google' ? 'Google Maps' : 'OSM / Leaflet'}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Interactive geospatial mapping of Pushkaralu facilities, ghats, and bridges across the Godavari corridor
            </p>
          </div>
        </div>

        {/* Action Controls: Engine, Size & View Switchers */}
        <div className="flex flex-wrap items-center gap-2.5 justify-end">
          {/* Map Size Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase px-2 hidden sm:inline">Size:</span>
            <button
              onClick={() => setMapSize('compact')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                mapSize === 'compact'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Compact map height (440px)"
            >
              Compact
            </button>
            <button
              onClick={() => setMapSize('standard')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                mapSize === 'standard'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Standard map height (540px)"
            >
              Medium
            </button>
            <button
              onClick={() => setMapSize('tall')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                mapSize === 'tall'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Expanded map height (680px)"
            >
              Expanded
            </button>
          </div>

          {/* Engine Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setMapEngine('google')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                mapEngine === 'google'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Google Maps
            </button>
            <button
              onClick={() => setMapEngine('osm')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                mapEngine === 'osm'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OSM
            </button>
          </div>

          {/* View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all hidden md:inline-block ${
                viewMode === 'split'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Directory
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Box */}
      {(viewMode === 'map' || viewMode === 'split') && (
        <div className={`w-full ${viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : ''}`}>
          {/* Map Column */}
          <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'w-full'} ${getMapHeightStyle()} rounded-2xl overflow-hidden shadow-card border border-slate-200 relative`}>
            {mapEngine === 'google' ? (
              <GodavariGoogleMap
                height="100%"
                selectedFacility={selectedFacility}
                onFacilityClick={(fac) => setSelectedFacility(fac)}
                onSwitchToLeaflet={() => setMapEngine('osm')}
              />
            ) : (
              <InteractiveMap
                facilities={facilities}
                selectedFacility={selectedFacility}
                onSelectFacility={(fac) => setSelectedFacility(fac)}
                height="100%"
              />
            )}
          </div>

          {/* Split View Side Panel */}
          {viewMode === 'split' && (
            <div className="lg:col-span-5 h-[600px] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-800">
                  Facilities Along Corridor ({facilities.length})
                </h3>
                <span className="text-xs text-teal-700 font-semibold">Rajamahendravaram - Kovvur</span>
              </div>

              {isLoading ? (
                <LoadingSpinner message="Loading facilities list..." />
              ) : (
                <div className="space-y-3">
                  {facilities.map((fac) => (
                    <FacilityCard
                      key={fac._id}
                      facility={fac}
                      userLocation={userLocation}
                      onViewOnMap={(target) => setSelectedFacility(target)}
                      onSelectDetails={(target) => setSelectedFacility(target)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Facilities Directory List Section (Shown below map in map view, or standalone in list view) */}
      {(viewMode === 'list' || viewMode === 'map') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Mapped Infrastructure & Facilities Directory
              </h2>
              <p className="text-xs text-slate-500">
                All confirmed and volunteer-verified locations across the Godavari Pushkaralu river corridor
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Showing {facilities.length} mapped records
            </span>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading facilities directory..." />
          ) : facilities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No facilities available in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {facilities.slice(0, viewMode === 'map' ? 6 : facilities.length).map((fac) => (
                <FacilityCard
                  key={fac._id}
                  facility={fac}
                  userLocation={userLocation}
                  onViewOnMap={(target) => {
                    setSelectedFacility(target);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSelectDetails={(target) => setSelectedFacility(target)}
                />
              ))}
            </div>
          )}

          {viewMode === 'map' && facilities.length > 6 && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setViewMode('list')}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors"
              >
                View All {facilities.length} Facilities in Directory
              </button>
            </div>
          )}
        </div>
      )}

      {/* Facility Details Modal */}
      {selectedFacility && (
        <FacilityDetailModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          userLocation={userLocation}
        />
      )}
    </div>
  );
};
