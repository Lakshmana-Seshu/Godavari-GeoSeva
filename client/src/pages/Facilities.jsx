import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  MapPin,
  Compass,
  AlertCircle,
  Locate,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { facilityApi } from '../api/facilityApi';
import { FacilityCard } from '../components/facilities/FacilityCard';
import { FacilityFilter } from '../components/facilities/FacilityFilter';
import { FacilityDetailModal } from '../components/facilities/FacilityDetailModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useGeolocation } from '../hooks/useGeolocation';
import { useOffline } from '../context/OfflineContext';
import { DEMO_FACILITIES } from '../data/demoFacilities';

/**
 * Great-circle distance between two coordinates in meters (Haversine formula)
 */
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const Facilities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { isOnline, getCachedFacilities, saveFacilitiesToCache } = useOffline();

  // Initialize with cached or demo facilities so the page renders instantly
  const [rawFacilities, setRawFacilities] = useState(() => {
    try {
      const cached = localStorage.getItem('geoseva_cached_facilities');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return DEMO_FACILITIES;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Filters from URL or state
  const initialCategory = searchParams.get('category') || 'ALL';
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [operationalStatus, setOperationalStatus] = useState('ALL');
  const [verificationStatus, setVerificationStatus] = useState('ALL');
  const [radius, setRadius] = useState('');

  const { coordinates: userLocation, isLocating, getCurrentLocation } = useGeolocation();

  // Fetch facilities from API in background or on manual refresh
  const fetchFacilities = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = { limit: 150 };
      const res = await facilityApi.getFacilities(params);

      // Handle array or object pagination structures
      const apiList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.facilities)
        ? res.data.facilities
        : Array.isArray(res?.facilities)
        ? res.facilities
        : Array.isArray(res)
        ? res
        : [];

      // Combine with demo facilities (deduplicating by _id or name)
      const combined = [...apiList];
      DEMO_FACILITIES.forEach((demo) => {
        const exists = combined.some(
          (f) =>
            (f._id && f._id === demo._id) ||
            (f.name && f.name.toLowerCase() === demo.name.toLowerCase())
        );
        if (!exists) {
          combined.push(demo);
        }
      });

      setRawFacilities(combined);
      saveFacilitiesToCache(combined);
    } catch (err) {
      console.warn('API error, preserving current facility records:', err.message);
      // Keep existing rawFacilities intact (already has demo facilities)
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, [saveFacilitiesToCache]);

  useEffect(() => {
    fetchFacilities(false);
  }, [fetchFacilities]);

  // Client-side filtering & proximity distance calculation
  const displayedFacilities = useMemo(() => {
    let result = rawFacilities.filter((fac) => {
      // Category
      if (category !== 'ALL' && fac.category !== category) return false;

      // Operational status
      if (operationalStatus !== 'ALL' && fac.operationalStatus !== operationalStatus) return false;

      // Verification status
      if (verificationStatus !== 'ALL' && fac.verificationStatus !== verificationStatus) return false;

      // Search keyword
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const nameMatch = fac.name?.toLowerCase().includes(q);
        const addrMatch = fac.address?.toLowerCase().includes(q);
        const descMatch = fac.description?.toLowerCase().includes(q);
        const lmkMatch = fac.landmark?.toLowerCase().includes(q);
        const catMatch = fac.category?.toLowerCase().includes(q);
        if (!nameMatch && !addrMatch && !descMatch && !lmkMatch && !catMatch) {
          return false;
        }
      }

      // Radius filter with user GPS
      if (radius && userLocation && fac.location?.coordinates) {
        const [lng, lat] = fac.location.coordinates;
        const dist = calculateDistanceMeters(userLocation.lat, userLocation.lng, lat, lng);
        if (dist > parseInt(radius, 10)) return false;
      }

      return true;
    });

    // Compute distance and sort by proximity if GPS is enabled
    if (userLocation) {
      result = result.map((fac) => {
        if (fac.location?.coordinates) {
          const [lng, lat] = fac.location.coordinates;
          const dist = calculateDistanceMeters(userLocation.lat, userLocation.lng, lat, lng);
          return {
            ...fac,
            distanceMeters: dist,
            distanceText: dist < 1000 ? `${dist} m` : `${(dist / 1000).toFixed(1)} km`,
          };
        }
        return fac;
      });

      result.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
    }

    return result;
  }, [rawFacilities, category, operationalStatus, verificationStatus, search, radius, userLocation]);

  const handleResetFilters = () => {
    setCategory('ALL');
    setSearch('');
    setOperationalStatus('ALL');
    setVerificationStatus('ALL');
    setRadius('');
    setSearchParams({});
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (cat !== 'ALL') {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            Civic Infrastructure Catalog
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            Pushkaralu Mapped Facilities Directory
            <span className="text-xs bg-saffron-100 text-saffron-900 font-extrabold px-2.5 py-0.5 rounded-full border border-saffron-300">
              2027
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified and community-reported facilities across the Godavari River corridor (Rajamahendravaram & Kovvur).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchFacilities(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Refresh facilities list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-bold hover:bg-teal-900 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Compass className="w-4 h-4 text-saffron-400" />
            Switch to GIS Map View
          </button>
        </div>
      </div>

      {/* Pushkaralu Corridor Status Strip */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-4 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-saffron-500/20 border border-saffron-400/40 flex items-center justify-center text-saffron-300 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-saffron-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white">
                Godavari Pushkaralu 2027 Corridor
              </span>
              <span className="text-[10px] bg-saffron-500/20 text-saffron-200 border border-saffron-400/40 font-mono px-2 py-0.5 rounded-full font-bold">
                {displayedFacilities.length} Facilities Active
              </span>
            </div>
            <p className="text-xs text-teal-200 mt-0.5">
              Verified locations across Bathing Ghats, Drinking Water, Medical Camps, Rest Shelters, and Sanitation Units.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-saffron-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-saffron-400 transition-colors shadow-sm cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-950" />
            Explore on GIS Map
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <FacilityFilter
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={handleCategoryChange}
        operationalStatus={operationalStatus}
        onOperationalStatusChange={setOperationalStatus}
        verificationStatus={verificationStatus}
        onVerificationStatusChange={setVerificationStatus}
        radius={radius}
        onRadiusChange={setRadius}
        onReset={handleResetFilters}
        hasLocation={!!userLocation}
      />

      {/* Error or Cache Banner (Only if no facilities are loaded) */}
      {errorMessage && rawFacilities.length === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => fetchFacilities(true)}
            className="text-xs font-bold underline text-amber-900 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Facilities Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading facilities catalog..." />
      ) : displayedFacilities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3 shadow-card">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Facilities Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No mapped infrastructure meets the selected filter parameters. Try clearing your search keyword or switching category.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-900 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 mb-4 gap-2">
            <span className="font-semibold text-slate-700">
              Showing {displayedFacilities.length} of {rawFacilities.length} mapped facilities
            </span>
            {userLocation && (
              <span className="text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 self-start sm:self-auto">
                Distances sorted from your GPS ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFacilities.map((fac) => (
              <FacilityCard
                key={fac._id || fac.id}
                facility={fac}
                userLocation={userLocation}
                onViewOnMap={(target) => {
                  const [lng, lat] = target.location?.coordinates || [81.777, 17.0028];
                  navigate(`/map?facilityId=${target._id || target.id}&lat=${lat}&lng=${lng}`);
                }}
                onSelectDetails={(target) => setSelectedFacility(target)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
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

export default Facilities;
