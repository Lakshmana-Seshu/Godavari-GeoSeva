import React from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  Phone,
  Users,
  Eye,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  formatDistance,
  formatDateTime,
  formatOpeningHours,
  formatCapacity,
  formatAccessibility,
  getFacilityCoordinates,
  getFacilityImage,
  CATEGORY_DEFAULT_IMAGES,
} from '../../utils/formatters';

export const FacilityCard = ({
  facility,
  onViewOnMap = null,
  onSelectDetails = null,
  userLocation = null,
}) => {
  const [lng, lat] = getFacilityCoordinates(facility);

  const getDirectionsUrl = () => {
    if (userLocation) {
      return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${userLocation.lat}%2C${userLocation.lng}%3B${lat}%2C${lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  const isDemo = facility?.dataSource === 'SYNTHETIC_DEMO' || facility?.isSyntheticDemo;
  const hoursText = formatOpeningHours(facility?.openingHours);
  const capacityText = formatCapacity(facility?.capacity);
  const accessibilityText = formatAccessibility(facility?.accessibility);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between overflow-hidden group">
      {/* Facility Photograph Banner */}
      <div
        className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onSelectDetails && onSelectDetails(facility)}
      >
        <img
          src={getFacilityImage(facility)}
          alt={facility.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const fallback =
              CATEGORY_DEFAULT_IMAGES[facility?.category?.toUpperCase()] ||
              '/images/facilities/default-facility.svg';
            if (e.target.src !== fallback) {
              e.target.src = fallback;
            }
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto">
            <CategoryBadge category={facility.category} />
          </div>
          <div className="pointer-events-auto">
            <StatusBadge status={facility.operationalStatus} />
          </div>
        </div>

        {/* Bottom Bar on Image */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-[11px] pointer-events-none">
          <span className="font-semibold px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs">
            Pushkaralu 2027
          </span>
          {facility.distanceMeters !== undefined && (
            <span className="font-bold bg-teal-800/90 text-white px-2 py-0.5 rounded backdrop-blur-xs border border-teal-500/30">
              {formatDistance(facility.distanceMeters)} away
            </span>
          )}
        </div>
      </div>

      <div
        className="p-5 space-y-3 cursor-pointer"
        onClick={() => onSelectDetails && onSelectDetails(facility)}
      >
        {/* Title */}
        <div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-900 transition-colors">
            {facility.name}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{facility.address || 'Godavari Corridor, Rajamahendravaram'}</span>
          </p>
        </div>

        {/* Description */}
        {facility.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {facility.description}
          </p>
        )}

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          {hoursText && (
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
              <span className="truncate">{hoursText}</span>
            </div>
          )}
          {capacityText && (
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
              <span className="truncate">{capacityText}</span>
            </div>
          )}
          {accessibilityText && (
            <div className="col-span-2 text-teal-800 bg-teal-50 px-2 py-1 rounded text-[10px] truncate border border-teal-100">
              {accessibilityText}
            </div>
          )}
        </div>

        {/* Verification Status & Distance */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <VerificationBadge status={facility.verificationStatus} />
          {facility.distanceMeters !== undefined && (
            <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px] border border-teal-200">
              {formatDistance(facility.distanceMeters)} away
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors shadow-xs"
        >
          <Navigation className="w-3.5 h-3.5 text-saffron-400" />
          Directions
        </a>

        {onViewOnMap && (
          <button
            onClick={() => onViewOnMap(facility)}
            className="flex items-center gap-1 py-2 px-3 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Locate on GIS Map"
          >
            <MapPin className="w-3.5 h-3.5 text-river-600" />
            <span className="hidden sm:inline">Map</span>
          </button>
        )}

        {onSelectDetails && (
          <button
            onClick={() => onSelectDetails(facility)}
            className="flex items-center gap-1 py-2 px-3 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="View Complete Specifications"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Details</span>
          </button>
        )}
      </div>
    </div>
  );
};
