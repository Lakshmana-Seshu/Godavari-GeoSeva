import React, { useState, useEffect } from 'react';
import {
  Compass,
  Layers,
  AlertCircle,
  Eye,
  Filter,
  RefreshCw,
  MapPin,
  Plus,
} from 'lucide-react';
import { facilityApi } from '../api/facilityApi';
import { issueApi } from '../api/issueApi';
import { dashboardApi } from '../api/dashboardApi';
import { useRealtime } from '../context/RealtimeContext';
import { GodavariGoogleMap } from '../components/map/GodavariGoogleMap';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { FacilityDetailModal } from '../components/facilities/FacilityDetailModal';
import { FacilityFormModal } from '../components/facilities/FacilityFormModal';
import { IssueStatusModal } from '../components/issues/IssueStatusModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { isValidGoogleKey } from '../utils/formatters';

export const AdminMap = () => {
  const [facilities, setFacilities] = useState([]);
  const [issues, setIssues] = useState([]);
  const [coverageData, setCoverageData] = useState(null);
  const [showIssues, setShowIssues] = useState(true);
  const [showCoverageGrid, setShowCoverageGrid] = useState(false);
  const hasValidGoogleKey = isValidGoogleKey(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('geoseva_gmaps_api_key')
  );
  const [mapEngine, setMapEngine] = useState(hasValidGoogleKey ? 'google' : 'osm'); // 'google' | 'osm'
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Admin New Facility Modal from Map Click
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { subscribe } = useRealtime();

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [facRes, issRes, covRes] = await Promise.all([
        facilityApi.getFacilities({ limit: 150 }),
        issueApi.getIssues({ limit: 150 }),
        dashboardApi.getCoverageAnalysis({ gridRows: 4, gridCols: 4 }),
      ]);

      const facList = Array.isArray(facRes?.data?.facilities)
        ? facRes.data.facilities
        : Array.isArray(facRes?.data)
        ? facRes.data
        : Array.isArray(facRes?.facilities)
        ? facRes.facilities
        : [];
      if (facList.length > 0) setFacilities(facList);

      const issList = Array.isArray(issRes?.data?.issues)
        ? issRes.data.issues
        : Array.isArray(issRes?.data)
        ? issRes.data
        : Array.isArray(issRes?.issues)
        ? issRes.issues
        : [];
      if (issList.length > 0) setIssues(issList);
      if (covRes?.data) setCoverageData(covRes.data);
    } catch (err) {
      console.error('Failed to load admin map records:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (
        event.type === 'ISSUE_REPORTED' ||
        event.type === 'ISSUE_STATUS_UPDATED' ||
        event.type === 'FACILITY_UPDATED'
      ) {
        fetchData(true);
      }
    });

    return () => unsubscribe();
  }, [subscribe]);

  const handleUpdateIssueStatus = async (id, statusData) => {
    try {
      await issueApi.updateIssueStatus(id, statusData);
      setSelectedIssue(null);
      fetchData();
    } catch (err) {
      alert('Failed to update issue status');
    }
  };

  const handleMapClick = (coords) => {
    // Admin clicks on map -> open facility registration modal with exact clicked coordinates
    setClickedLocation(coords);
    setIsFormOpen(true);
  };

  const handleCreateFacility = async (payload) => {
    setIsSubmitting(true);
    try {
      await facilityApi.createFacility(payload);
      setIsFormOpen(false);
      setClickedLocation(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create facility');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-800" />
            Authority Integrated GIS Map (Rajamahendravaram–Kovvur)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click anywhere on the map to drop a verified facility pin. Click existing markers to inspect or update.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Engine Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
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
              OSM / Leaflet
            </button>
          </div>

          <button
            onClick={() => {
              setClickedLocation(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 text-white text-xs font-bold rounded-xl hover:bg-teal-900 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-saffron-400" />
            Add Facility
          </button>

          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Map
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[calc(100vh-14rem)] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-card relative">
        {mapEngine === 'google' ? (
          <GodavariGoogleMap
            height="100%"
            isAdmin={true}
            showIssues={showIssues}
            onFacilityClick={(fac) => setSelectedFacility(fac)}
            onMapClick={handleMapClick}
            onSwitchToLeaflet={() => setMapEngine('osm')}
          />
        ) : (
          <InteractiveMap
            facilities={facilities}
            issues={issues}
            showIssues={showIssues}
            coverageCells={coverageData?.cells || []}
            showCoverageGrid={showCoverageGrid}
            selectedFacility={selectedFacility}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
            height="100%"
          />
        )}
      </div>

      {/* Facility Details Modal */}
      {selectedFacility && (
        <FacilityDetailModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}

      {/* Add Facility from Map Click Modal */}
      <FacilityFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setClickedLocation(null);
        }}
        onSubmit={handleCreateFacility}
        isSubmitting={isSubmitting}
        userLocation={clickedLocation}
      />

      {/* Issue Review Modal */}
      {selectedIssue && (
        <IssueStatusModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdateStatus={handleUpdateIssueStatus}
        />
      )}
    </div>
  );
};
