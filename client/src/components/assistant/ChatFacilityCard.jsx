import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ExternalLink, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { CATEGORY_METADATA } from '../../utils/formatters';

export const ChatFacilityCard = ({ facility, onShowOnMap = null }) => {
  const navigate = useNavigate();

  const meta = CATEGORY_METADATA[facility.category] || CATEGORY_METADATA.OTHER;
  const isVerified = facility.verificationStatus === 'VERIFIED';
  const isOpen = facility.operationalStatus === 'OPEN';

  const handleMapAction = () => {
    if (onShowOnMap) {
      onShowOnMap(facility);
    } else {
      // Navigate to explore map with focusFacility query parameter
      navigate(`/map?facilityId=${facility.id || facility._id}&lat=${facility.coordinates.lat}&lng=${facility.coordinates.lng}`);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.lat},${facility.coordinates.lng}`;

  return (
    <div className="bg-white rounded-2xl border border-teal-200/90 shadow-sm p-3.5 space-y-2.5 transition-all hover:border-teal-400 hover:shadow-md text-left">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 text-xs font-bold"
            style={{ backgroundColor: meta.markerBg || '#0f766e' }}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
              {facility.name}
            </h4>
            <span className="text-[10px] text-teal-800 font-semibold">
              {meta.label}
            </span>
          </div>
        </div>

        {facility.distanceText && (
          <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-900 px-2 py-0.5 rounded-full border border-teal-200 flex-shrink-0">
            {facility.distanceText}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        {isVerified && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        )}
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold border ${
            isOpen
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <Clock className="w-3 h-3" />
          {isOpen ? 'Open Now' : 'Check Status'}
        </span>
      </div>

      {/* Address & Exact Coordinates */}
      {facility.address && (
        <p className="text-[11px] text-slate-500 line-clamp-1">
          {facility.address}
        </p>
      )}

      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
        <span className="font-mono text-slate-400">
          {facility.coordinates.lat.toFixed(4)}, {facility.coordinates.lng.toFixed(4)}
        </span>

        <div className="flex items-center gap-1.5">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded text-slate-500 hover:text-teal-800 hover:bg-slate-100 transition-colors"
            title="Directions on Google Maps"
          >
            <Navigation className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleMapAction}
            className="px-2.5 py-1 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <span>Show on Map</span>
            <ExternalLink className="w-3 h-3 text-saffron-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

