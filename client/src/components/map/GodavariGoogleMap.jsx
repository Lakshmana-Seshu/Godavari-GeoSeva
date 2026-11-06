import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  Circle,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Compass,
  Search,
  Filter,
  Layers,
  Locate,
  RefreshCw,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Users,
  Phone,
  Maximize2,
  Sliders,
  ChevronDown,
  Info,
  Key,
  Copy,
  Check,
} from 'lucide-react';
import { facilityApi } from '../../api/facilityApi';
import { issueApi } from '../../api/issueApi';
import { useRealtime } from '../../context/RealtimeContext';
import {
  getGoogleMapFacilityIcon,
  getGoogleMapIssueIcon,
  getGoogleMapUserLocationIcon,
} from '../../utils/googleMapIcons';
import {
  CATEGORY_METADATA,
  OPERATIONAL_STATUS_METADATA,
  VERIFICATION_STATUS_METADATA,
  formatDistance,
  formatDateTime,
  isValidGoogleKey,
  formatOpeningHours,
  formatCapacity,
  getFacilityCoordinates,
} from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { DEMO_FACILITIES } from '../../data/demoFacilities';

// ============================================================================
// Geographic Reference Constants for Rajamahendravaram - Kovvur Corridor
// Based on Google Maps Reference: https://maps.app.goo.gl/UXK8xdb1Cayu1QDp8
// ============================================================================
export const RAJAMAHENDRAVARAM_CENTER = { lat: 17.0005, lng: 81.7800 };
export const KOVVUR_CENTER = { lat: 17.0120, lng: 81.7280 };
export const CORRIDOR_MIDPOINT = { lat: 17.0065, lng: 81.7540 };

export const CORRIDOR_BOUNDS = {
  south: 16.9750,
  west: 81.7100,
  north: 17.0420,
  east: 81.8150,
};

export const CORRIDOR_REGIONS = [
  {
    id: 'corridor',
    label: 'Rajamahendravaram–Kovvur Corridor (Full)',
    bounds: CORRIDOR_BOUNDS,
  },
  {
    id: 'rajahmundry',
    label: 'Rajamahendravaram Ghats (East Bank)',
    center: { lat: 17.0040, lng: 81.7780 },
    zoom: 15,
  },
  {
    id: 'kovvur',
    label: 'Kovvur & Goshpada Kshetram (West Bank)',
    center: { lat: 17.0120, lng: 81.7280 },
    zoom: 15,
  },
  {
    id: 'bridges',
    label: 'Godavari Bridges & Access Routes',
    center: { lat: 17.0100, lng: 81.7540 },
    zoom: 14,
  },
];

/**
 * Child controller to interact with the Google Maps instance
 */
const MapViewportController = ({ targetRegion, selectedFacility, userLocation, onMapReady }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (onMapReady) onMapReady(map);

    if (selectedFacility) {
      const [lng, lat] = selectedFacility.location.coordinates;
      map.panTo({ lat, lng });
      map.setZoom(16);
    } else if (targetRegion) {
      if (targetRegion.bounds) {
        map.fitBounds(targetRegion.bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      } else if (targetRegion.center) {
        map.panTo(targetRegion.center);
        map.setZoom(targetRegion.zoom || 14);
      }
    } else {
      map.fitBounds(CORRIDOR_BOUNDS, { top: 50, bottom: 50, left: 50, right: 50 });
    }
  }, [map, targetRegion, selectedFacility]);

  return null;
};

export const GodavariGoogleMap = ({
  initialCategory = 'ALL',
  showIssues = true,
  onFacilityClick = null,
  onMapClick = null,
  isAdmin = false,
  height = '100%',
  onSwitchToLeaflet = null,
  selectedFacility = null,
}) => {
  // Facilities & Issues State
  const [facilities, setFacilities] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // Facility or Issue for InfoWindow
  const [selectedType, setSelectedType] = useState('facility'); // 'facility' | 'issue'
  const [selectedRegion, setSelectedRegion] = useState(CORRIDOR_REGIONS[0]);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Sync external selectedFacility (e.g. from chatbot "Show on Map")
  useEffect(() => {
    if (selectedFacility) {
      setSelectedItem(selectedFacility);
      setSelectedType('facility');
    }
  }, [selectedFacility]);

  // Filters
  const [category, setCategory] = useState(initialCategory);
  const [operationalStatus, setOperationalStatus] = useState('ALL');
  const [verificationStatus, setVerificationStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('');

  // Real-Time Sync State
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'updating' | 'connected' | 'error'
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const isFetchingRef = useRef(false);
  const { subscribe } = useRealtime();

  // User Location State
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // API Key State
  const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('geoseva_gmaps_api_key') || '');
  const rawKey = customApiKey || envApiKey;
  const activeApiKey = isValidGoogleKey(rawKey) ? rawKey : '';
  const [showKeyModal, setShowKeyModal] = useState(!activeApiKey);

  const mapInstanceRef = useRef(null);

  // --------------------------------------------------------------------------
  // Real-Time Facility Data Fetcher (Preserves Current Viewport)
  // --------------------------------------------------------------------------
  const fetchFacilities = useCallback(async (isBackground = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isBackground) setSyncStatus('updating');

    try {
      const params = { limit: 150 };
      if (category !== 'ALL') params.category = category;
      if (operationalStatus !== 'ALL') params.operationalStatus = operationalStatus;
      if (verificationStatus !== 'ALL') params.verificationStatus = verificationStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      let res;
      if (radiusMeters && userLocation) {
        params.latitude = userLocation.lat;
        params.longitude = userLocation.lng;
        params.radius = parseInt(radiusMeters, 10);
        res = await facilityApi.getNearbyFacilities(params);
      } else {
        res = await facilityApi.getFacilities(params);
      }

      const facList = Array.isArray(res?.data?.facilities)
        ? res.data.facilities
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.facilities)
        ? res.facilities
        : [];

      setFacilities(facList.length > 0 ? facList : DEMO_FACILITIES);
      setLastSyncedAt(new Date());
      setSyncStatus('connected');

      // Fetch issues if enabled
      if (showIssues) {
        try {
          const issRes = await issueApi.getIssues({ limit: 100 });
          const issList = Array.isArray(issRes?.data?.issues)
            ? issRes.data.issues
            : Array.isArray(issRes?.data)
            ? issRes.data
            : Array.isArray(issRes?.issues)
            ? issRes.issues
            : [];
          setIssues(issList);
        } catch (e) {
          // ignore issue fetch error in background
        }
      }
    } catch (error) {
      console.warn('Real-time facility synchronization encountered an error:', error.message);
      setFacilities((prev) => (prev.length > 0 ? prev : DEMO_FACILITIES));
      setSyncStatus('error');
    } finally {
      isFetchingRef.current = false;
    }
  }, [category, operationalStatus, verificationStatus, searchQuery, radiusMeters, userLocation, showIssues]);

  // Initial load
  useEffect(() => {
    fetchFacilities(false);
  }, [fetchFacilities]);

  // Periodic 30-Second Refresh & Window Visibility/Focus Sync (Section 5)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFacilities(true);
    }, 30000); // 30-second interval

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchFacilities(true);
      }
    };

    const handleFocus = () => {
      fetchFacilities(true);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchFacilities]);

  // Real-time automatic listener for incoming Pilgrim reports
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (
        event.type === 'ISSUE_REPORTED' ||
        event.type === 'ISSUE_STATUS_UPDATED' ||
        event.type === 'FACILITY_UPDATED'
      ) {
        fetchFacilities(true);
      }
    });

    return () => unsubscribe();
  }, [subscribe, fetchFacilities]);

  // --------------------------------------------------------------------------
  // User Geolocation Handler (Section 7)
  // --------------------------------------------------------------------------
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(coords);
          mapInstanceRef.current.setZoom(15);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError('Location permission denied or unavailable. You can still browse manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // --------------------------------------------------------------------------
  // Search & Navigation
  // --------------------------------------------------------------------------
  const handleSelectFacilityFromSearch = (fac) => {
    setSelectedItem(fac);
    setSelectedType('facility');
    const [lng, lat] = fac.location.coordinates;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(16);
    }
  };

  const getGoogleMapsDirectionsUrl = (destLat, destLng) => {
    if (userLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLng}&travelmode=walking`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  };

  // Filtered facility list for search suggestions
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.address && f.address.toLowerCase().includes(q)) ||
        f.category.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [facilities, searchQuery]);

  // --------------------------------------------------------------------------
  // Render API Key Setup Modal if Key is missing
  // --------------------------------------------------------------------------
  if (!activeApiKey) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white p-8 shadow-card flex flex-col items-center justify-center text-center space-y-5" style={{ height }}>
        <div className="w-14 h-14 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-md">
          <MapPin className="w-8 h-8 text-saffron-400" />
        </div>

        <div className="max-w-md space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            Google Maps Platform Integration
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            To view the live, satellite-accurate Google Maps view of the <strong>Rajamahendravaram–Kovvur Corridor</strong>, please supply your Google Maps JavaScript API key.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Paste AIzaSy... API key here"
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  localStorage.setItem('geoseva_gmaps_api_key', e.target.value.trim());
                  setCustomApiKey(e.target.value.trim());
                }
              }}
              onChange={(e) => {
                if (e.target.value.trim().length > 25) {
                  localStorage.setItem('geoseva_gmaps_api_key', e.target.value.trim());
                  setCustomApiKey(e.target.value.trim());
                }
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Or configure <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="text-slate-600">client/.env</code>.
          </p>
        </div>

        {onSwitchToLeaflet && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onSwitchToLeaflet}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Use OpenStreetMap / Leaflet View Instead
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/90 shadow-card bg-slate-50 flex flex-col" style={{ height }}>
      {/* -------------------------------------------------------------------- */}
      {/* Top Controls Bar: Region Selector, Place Search, Filters & Sync Status */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 z-20 space-y-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Region Selection Control (Section 6) */}
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-800 flex-shrink-0" />
            <div className="relative">
              <select
                value={selectedRegion.id}
                onChange={(e) => {
                  const reg = CORRIDOR_REGIONS.find((r) => r.id === e.target.value);
                  if (reg) setSelectedRegion(reg);
                }}
                className="px-3 py-1.5 pr-8 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer appearance-none"
              >
                {CORRIDOR_REGIONS.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-teal-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Search Bar with Autocomplete Dropdown */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Rajamahendravaram, Kovvur or facility name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-slate-50 focus:bg-white"
            />
            {searchMatches.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100">
                {searchMatches.map((fac) => (
                  <button
                    key={fac._id}
                    onClick={() => {
                      handleSelectFacilityFromSearch(fac);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 hover:bg-teal-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="block text-slate-900 font-semibold">{fac.name}</strong>
                      <span className="text-[10px] text-slate-500">{fac.address || 'Rajamahendravaram Corridor'}</span>
                    </div>
                    <CategoryBadge category={fac.category} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Buttons & Sync Status Indicator */}
          <div className="flex items-center gap-2">
            {/* Locate Me */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                userLocation
                  ? 'bg-river-50 text-river-800 border-river-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Find Facilities Near Me"
            >
              <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-river-600' : 'text-river-600'}`} />
              <span className="hidden sm:inline">{userLocation ? 'GPS Active' : 'Near Me'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchFacilities(false)}
              disabled={syncStatus === 'updating'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs"
              title="Refresh facility data immediately"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'updating' ? 'animate-spin text-teal-700' : 'text-slate-600'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Real-Time Sync Indicator Pill (Section 5 & 12) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
              {syncStatus === 'updating' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  <span className="text-blue-700 font-semibold">Updating...</span>
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-rose-700 font-semibold">Offline (Cached)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-800 font-semibold">Live</span>
                  {lastSyncedAt && (
                    <span className="text-slate-400 hidden md:inline">
                      • {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills & Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                category === 'ALL'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories ({facilities.length})
            </button>
            {Object.entries(CATEGORY_METADATA).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  category === key
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.markerBg }} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Operational & Radius dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={operationalStatus}
              onChange={(e) => setOperationalStatus(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open Only</option>
              <option value="CLOSED">Closed Only</option>
              <option value="TEMPORARILY_UNAVAILABLE">Unavailable</option>
            </select>

            {userLocation && (
              <select
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-teal-50 text-teal-900 font-semibold"
              >
                <option value="">Any Radius</option>
                <option value="500">Within 500m</option>
                <option value="1000">Within 1 km</option>
                <option value="2000">Within 2 km</option>
                <option value="5000">Within 5 km</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Interactive Google Map Canvas (Section 3) */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 relative w-full h-full">
        <APIProvider apiKey={activeApiKey} libraries={['places', 'geometry']}>
          <Map
            defaultCenter={CORRIDOR_MIDPOINT}
            defaultZoom={13}
            mapId="godavari_geoseva_gmap"
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl={true}
            fullscreenControl={true}
            mapTypeControl={true}
            streetViewControl={true}
            className="w-full h-full"
            onClick={(e) => {
              if (isAdmin && onMapClick && e.detail?.latLng) {
                onMapClick({
                  lat: e.detail.latLng.lat,
                  lng: e.detail.latLng.lng,
                });
              }
            }}
          >
            {/* Viewport & Bounds Synchronizer */}
            <MapViewportController
              targetRegion={selectedRegion}
              selectedFacility={selectedItem && selectedType === 'facility' ? selectedItem : null}
              userLocation={userLocation}
              onMapReady={(instance) => {
                mapInstanceRef.current = instance;
              }}
            />

            {/* User GPS Location Marker & Radius Circle */}
            {userLocation && (
              <>
                <Marker
                  position={userLocation}
                  icon={getGoogleMapUserLocationIcon()}
                  title="Your current GPS location"
                  onClick={() => {
                    setSelectedItem({
                      isUser: true,
                      lat: userLocation.lat,
                      lng: userLocation.lng,
                    });
                    setSelectedType('user');
                  }}
                />
                {radiusMeters && (
                  <Circle
                    center={userLocation}
                    radius={parseInt(radiusMeters, 10)}
                    fillColor="#0284c7"
                    fillOpacity={0.08}
                    strokeColor="#0284c7"
                    strokeWeight={1.5}
                  />
                )}
              </>
            )}

            {/* Facility Markers */}
            {facilities.map((fac) => {
              if (!fac.location || !Array.isArray(fac.location.coordinates)) return null;
              const [lng, lat] = fac.location.coordinates;
              const isVerified = fac.verificationStatus === 'VERIFIED';
              const icon = getGoogleMapFacilityIcon(fac.category, fac.operationalStatus, isVerified);

              return (
                <Marker
                  key={fac._id}
                  position={{ lat, lng }}
                  icon={icon}
                  title={`${fac.name} (${fac.category})`}
                  onClick={() => {
                    setSelectedItem(fac);
                    setSelectedType('facility');
                    if (onFacilityClick) onFacilityClick(fac);
                  }}
                />
              );
            })}

            {/* Civic Issue Markers */}
            {showIssues &&
              issues.map((iss) => {
                if (!iss.location || !Array.isArray(iss.location.coordinates)) return null;
                const [lng, lat] = iss.location.coordinates;
                const icon = getGoogleMapIssueIcon(iss.status);

                return (
                  <Marker
                    key={iss._id}
                    position={{ lat, lng }}
                    icon={icon}
                    title={`Civic Issue: ${iss.title}`}
                    onClick={() => {
                      setSelectedItem(iss);
                      setSelectedType('issue');
                    }}
                  />
                );
              })}

            {/* ---------------------------------------------------------------- */}
            {/* Marker InfoWindow Popup (Section 4 & 6) */}
            {/* ---------------------------------------------------------------- */}
            {selectedItem && (
              <InfoWindow
                position={
                  selectedType === 'user'
                    ? { lat: selectedItem.lat, lng: selectedItem.lng }
                    : {
                        lat: getFacilityCoordinates(selectedItem)[1],
                        lng: getFacilityCoordinates(selectedItem)[0],
                      }
                }
                onCloseClick={() => setSelectedItem(null)}
              >
                {selectedType === 'user' ? (
                  <div className="p-2 space-y-1 text-xs">
                    <strong className="block text-teal-900 font-bold">Your Location</strong>
                    <span className="font-mono text-slate-500">
                      Lat: {selectedItem.lat.toFixed(5)}, Lng: {selectedItem.lng.toFixed(5)}
                    </span>
                  </div>
                ) : selectedType === 'issue' ? (
                  <div className="p-3 max-w-[280px] space-y-2 text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {selectedItem.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">{selectedItem.status}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{selectedItem.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{selectedItem.description}</p>
                    <p className="text-[10px] text-slate-400">Reported: {formatDateTime(selectedItem.createdAt)}</p>
                  </div>
                ) : (
                  <div className="p-3 max-w-[300px] space-y-2.5 text-slate-800">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <CategoryBadge category={selectedItem.category} />
                      <StatusBadge status={selectedItem.operationalStatus} />
                    </div>

                    {/* Facility Title & Locality */}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {selectedItem.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{selectedItem.address || 'Rajamahendravaram - Kovvur Corridor'}</span>
                      </p>
                    </div>

                    {/* Description */}
                    {selectedItem.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {selectedItem.description}
                      </p>
                    )}

                    {/* Specs strip */}
                    {(selectedItem.openingHours || selectedItem.capacity) && (
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                        {selectedItem.openingHours && (
                          <div className="flex items-center gap-1 truncate">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{formatOpeningHours(selectedItem.openingHours)}</span>
                          </div>
                        )}
                        {selectedItem.capacity && (
                          <div className="flex items-center gap-1 truncate">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{formatCapacity(selectedItem.capacity)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification and Timestamp */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <VerificationBadge status={selectedItem.verificationStatus} />
                      {selectedItem.distanceMeters !== undefined && (
                        <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[10px]">
                          {formatDistance(selectedItem.distanceMeters)} away
                        </span>
                      )}
                    </div>

                    {/* Synthetic Demo Warning */}
                    {selectedItem.dataSource === 'SYNTHETIC_DEMO' && (
                      <div className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-2 py-1 rounded">
                        Demonstration record: Verify on-site before official operations.
                      </div>
                    )}

                    {/* Exact Coordinates with Copy Action */}
                    {(() => {
                      const [lng, lat] = getFacilityCoordinates(selectedItem);
                      return (
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono">
                          <span className="text-slate-600 truncate">
                            Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const coordStr = `${lat}, ${lng}`;
                              navigator.clipboard?.writeText(coordStr);
                              setCopiedCoords(true);
                              setTimeout(() => setCopiedCoords(false), 2000);
                            }}
                            className="ml-2 flex items-center gap-1 text-teal-800 hover:text-teal-950 font-sans font-bold flex-shrink-0 cursor-pointer"
                            title="Copy exact GPS coordinates for field responders"
                          >
                            {copiedCoords ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                            <span>{copiedCoords ? 'Copied' : 'Copy GPS'}</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* Action: Google Maps Directions Navigation (Section 8) */}
                    <div className="pt-2">
                      <a
                        href={getGoogleMapsDirectionsUrl(
                          getFacilityCoordinates(selectedItem)[1],
                          getFacilityCoordinates(selectedItem)[0]
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-800 text-white rounded-xl text-xs font-bold hover:bg-teal-900 transition-colors shadow-xs"
                      >
                        <Navigation className="w-3.5 h-3.5 text-saffron-400" />
                        Get Directions in Google Maps
                      </a>
                    </div>
                  </div>
                )}
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Floating Map Legend (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md p-3 max-w-xs text-xs space-y-1.5 hidden sm:block">
          <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
            Google Maps GIS Legend
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <span>Bathing Ghat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
              <span>Drinking Water</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>Public Toilet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>Medical Camp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

