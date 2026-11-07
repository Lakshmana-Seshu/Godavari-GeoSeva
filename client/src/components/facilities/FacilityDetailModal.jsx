import React from 'react';
import {
  X,
  Navigation,
  MapPin,
  Clock,
  Phone,
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  Copy,
  ExternalLink,
  AlertTriangle,
  Info
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  formatDateTime,
  formatDistance,
  formatOpeningHours,
  formatCapacity,
  formatAccessibility,
  formatContact,
  getFacilityCoordinates,
  getFacilityImage,
  CATEGORY_DEFAULT_IMAGES,
} from '../../utils/formatters';

export const FacilityDetailModal = ({ facility, onClose, userLocation = null }) => {
  if (!facility) return null;

  const [lng, lat] = getFacilityCoordinates(facility);

  const getDirectionsUrl = () => {
    if (userLocation) {
      return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${userLocation.lat}%2C${userLocation.lng}%3B${lat}%2C${lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  const copyCoords = () => {
    navigator.clipboard?.writeText(`${lat}, ${lng}`);
    alert(`Coordinates copied to clipboard: ${lat}, ${lng}`);
  };

  const isDemo = facility.dataSource === 'SYNTHETIC_DEMO' || facility.isSyntheticDemo;
  const hoursText = formatOpeningHours(facility.openingHours);
  const capacityText = formatCapacity(facility.capacity);
  const contactText = formatContact(facility.contactInformation);
  const accessibilityText = formatAccessibility(facility.accessibility);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Hero Image Banner */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden">
          <img
            src={getFacilityImage(facility)}
            alt={facility.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const fallback =
                CATEGORY_DEFAULT_IMAGES[facility?.category?.toUpperCase()] ||
                '/images/facilities/default-facility.svg';
              if (e.target.src !== fallback) {
                e.target.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/20" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-xs transition-colors z-10 cursor-pointer shadow-md"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <CategoryBadge category={facility.category} />
              <StatusBadge status={facility.operationalStatus} />
              <VerificationBadge status={facility.verificationStatus} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-sm">{facility.name}</h2>
            <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-1 drop-shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              {facility.address || 'Rajamahendravaram - Kovvur Corridor'}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Corridor Badge */}
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3 text-xs text-teal-900">
            <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
            <div>
              <strong className="font-semibold block">Pushkaralu 2027 Mapped Infrastructure</strong>
              Verified geographic location along the Rajamahendravaram–Kovvur Godavari River corridor.
            </div>
          </div>

          {/* Description */}
          {facility.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Facility Overview
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {facility.description}
              </p>
            </div>
          )}

          {/* Key Specifications Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Facility Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                <Clock className="w-4 h-4 text-river-600 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Opening Hours</span>
                  <span className="font-medium text-slate-800">{hoursText || '24 Hours during Pushkaralu'}</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                <Users className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Estimated Capacity</span>
                  <span className="font-medium text-slate-800">
                    {capacityText || 'Open corridor / Unrestricted'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                <Phone className="w-4 h-4 text-saffron-600 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Verified Contact</span>
                  <span className="font-medium text-slate-800">{contactText || 'Pushkaralu Help Desk 1077'}</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Last Verified</span>
                  <span className="font-medium text-slate-800">{formatDateTime(facility.lastVerifiedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility Info */}
          {accessibilityText && (
            <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs text-teal-900">
              <span className="font-bold block mb-1">Accessibility & Senior Citizen Accommodations:</span>
              <span>{accessibilityText}</span>
            </div>
          )}

          {/* Geographic Coordinates Box */}
          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400">GeoJSON Coordinates (EPSG:4326)</span>
              <button
                onClick={copyCoords}
                className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-medium"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <div className="font-mono text-sm font-semibold text-white tracking-wide">
              Latitude: {lat.toFixed(6)}, Longitude: {lng.toFixed(6)}
            </div>
            {facility.distanceMeters !== undefined && (
              <p className="text-xs text-saffron-400">
                Proximity to you: {formatDistance(facility.distanceMeters)} (straight-line distance)
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-800 text-white rounded-lg text-xs font-bold hover:bg-teal-900 transition-colors shadow-sm"
          >
            <Navigation className="w-4 h-4 text-saffron-400" />
            Navigate with OpenStreetMap
          </a>
        </div>
      </div>
    </div>
  );
};
