import React, { useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Rectangle,
  Tooltip,
} from 'react-leaflet';
import {
  Navigation,
  ExternalLink,
  Info,
  Clock,
  Compass,
  CheckCircle,
  AlertTriangle,
  Locate,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { MapController } from './MapController';
import { MapLegend } from './MapLegend';
import { createFacilityIcon, createIssueIcon, createUserLocationIcon } from '../../utils/mapIcons';
import {
  formatDistance,
  formatDateTime,
  CATEGORY_METADATA,
  OPERATIONAL_STATUS_METADATA,
  getFacilityCoordinates,
} from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { CategoryBadge } from '../common/CategoryBadge';

// Godavari River Rajamahendravaram-Kovvur Corridor Default Coordinates
export const DEFAULT_CORRIDOR_CENTER = [17.0005, 81.7800];
export const DEFAULT_MAP_ZOOM = 13;

export const InteractiveMap = ({
  facilities = [],
  issues = [],
  showIssues = false,
  userLocation = null,
  radiusMeters = null,
  selectedFacility = null,
  onSelectFacility = null,
  center = DEFAULT_CORRIDOR_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  coverageCells = [],
  showCoverageGrid = false,
  onLocateMe = null,
  isLocating = false,
  height = '100%',
}) => {
  // Compute map bounds safely if facilities exist
  const mapBounds = useMemo(() => {
    if (selectedFacility) {
      const [lng, lat] = getFacilityCoordinates(selectedFacility);
      return [
        [lat - 0.005, lng - 0.005],
        [lat + 0.005, lng + 0.005],
      ];
    }
    const validFacilities = facilities.filter(Boolean);
    if (validFacilities.length > 0) {
      const lats = validFacilities.map((f) => getFacilityCoordinates(f)[1]);
      const lngs = validFacilities.map((f) => getFacilityCoordinates(f)[0]);
      return [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];
    }
    return null;
  }, [facilities, selectedFacility]);

  // Construct OSM walking directions link
  const getDirectionsUrl = (destLat, destLng) => {
    if (userLocation) {
      return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${userLocation.lat}%2C${userLocation.lng}%3B${destLat}%2C${destLng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm" style={{ height }}>
      {/* Quick Map Bar Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
        {onLocateMe && (
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md rounded-lg shadow-card text-xs font-semibold text-slate-700 hover:text-teal-900 hover:bg-slate-50 transition-all border border-slate-200"
            title="Locate my position via GPS"
          >
            <Locate className={`w-4 h-4 text-river-600 ${isLocating ? 'animate-spin text-teal-600' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'My Location'}</span>
          </button>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController
          center={
            selectedFacility
              ? [getFacilityCoordinates(selectedFacility)[1], getFacilityCoordinates(selectedFacility)[0]]
              : center
          }
          zoom={selectedFacility ? 16 : zoom}
          bounds={!selectedFacility ? mapBounds : null}
        />

        {/* Base Map: OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}.png"
          maxZoom={19}
        />

        {/* User Current Location Marker & Accuracy/Radius Ring */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon()}
            >
              <Popup>
                <div className="p-2 text-xs">
                  <strong className="text-teal-900 block font-semibold">Your Location</strong>
                  <span className="text-slate-500">
                    {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                  </span>
                </div>
              </Popup>
            </Marker>
            {radiusMeters && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radiusMeters}
                pathOptions={{
                  fillColor: '#0284c7',
                  fillOpacity: 0.08,
                  color: '#0284c7',
                  weight: 1.5,
                  dashArray: '4, 6',
                }}
              />
            )}
          </>
        )}

        {/* Coverage Grid Overlay for GIS Spatial Analysis */}
        {showCoverageGrid &&
          coverageCells.map((cell) => {
            const isGap = cell.hasCoverageGap;
            return (
              <Rectangle
                key={cell.id}
                bounds={cell.bounds}
                pathOptions={{
                  color: isGap ? '#ef4444' : '#10b981',
                  weight: 1.5,
                  fillColor: isGap ? '#ef4444' : '#10b981',
                  fillOpacity: isGap ? 0.22 : 0.08,
                }}
              >
                <Tooltip direction="top" opacity={0.95}>
                  <div className="text-xs p-1">
                    <p className="font-bold text-slate-800">
                      Grid Sector {cell.id}
                    </p>
                    <p className="text-slate-600">
                      Mapped Facilities: <strong>{cell.facilityCount}</strong>
                    </p>
                    {isGap && (
                      <p className="text-rose-600 font-semibold mt-0.5">
                        {cell.gapReasons[0]}
                      </p>
                    )}
                  </div>
                </Tooltip>
              </Rectangle>
            );
          })}

        {/* Facilities Markers */}
        {facilities.map((facility) => {
          const [lng, lat] = getFacilityCoordinates(facility);
          const isVerified = facility.verificationStatus === 'VERIFIED';
          const isSelected = selectedFacility && selectedFacility._id === facility._id;

          return (
            <Marker
              key={facility._id}
              position={[lat, lng]}
              icon={createFacilityIcon(facility.category, facility.operationalStatus, isVerified)}
              eventHandlers={{
                click: () => {
                  if (onSelectFacility) onSelectFacility(facility);
                },
              }}
            >
              <Popup className="facility-popup-custom">
                <div className="p-3 max-w-[280px] space-y-2 text-slate-800">
                  <div className="flex items-start justify-between gap-1.5">
                    <CategoryBadge category={facility.category} />
                    <StatusBadge status={facility.operationalStatus} />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {facility.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {facility.description || facility.address}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <VerificationBadge status={facility.verificationStatus} />
                    {facility.distanceMeters !== undefined && (
                      <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {formatDistance(facility.distanceMeters)} away
                      </span>
                    )}
                  </div>

                  {facility.dataSource === 'SYNTHETIC_DEMO' && (
                    <div className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-2 py-1 rounded">
                      Demo record: Verify on-site before official operations.
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={getDirectionsUrl(lat, lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-saffron-400" />
                      Get Directions
                    </a>
                    {onSelectFacility && (
                      <button
                        onClick={() => onSelectFacility(facility)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                        title="View Full Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Civic Issues Markers (if enabled) */}
        {showIssues &&
          issues.map((issue) => {
            const coords = issue?.location?.coordinates;
            if (!coords || !Array.isArray(coords) || coords.length < 2) return null;
            const [lng, lat] = coords;
            return (
              <Marker
                key={issue._id}
                position={[lat, lng]}
                icon={createIssueIcon(issue.status)}
              >
                <Popup>
                  <div className="p-3 max-w-[260px] space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {issue.category}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {issue.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900">{issue.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{issue.description}</p>
                    <p className="text-[10px] text-slate-400">
                      Reported {formatDateTime(issue.createdAt)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Map Legend Floating Widget */}
      <MapLegend />
    </div>
  );
};
