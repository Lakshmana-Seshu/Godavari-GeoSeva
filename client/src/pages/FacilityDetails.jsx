import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Clock,
  Phone,
  Users,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';
import { facilityApi } from '../api/facilityApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { DEMO_FACILITIES } from '../data/demoFacilities';
import {
  formatDateTime,
  formatOpeningHours,
  formatCapacity,
  formatAccessibility,
  formatContact,
  getFacilityCoordinates,
} from '../utils/formatters';

export const FacilityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacility = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await facilityApi.getFacilityById(id);
        const fac = res?.data?.facility || res?.data || res?.facility;
        if (fac) {
          setFacility(fac);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Fallback to demo facility
      }

      const demo = DEMO_FACILITIES.find((f) => (f._id || f.id) === id);
      if (demo) {
        setFacility(demo);
      } else {
        setError('Facility record not found or could not be loaded.');
      }
      setIsLoading(false);
    };

    fetchFacility();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner message="Fetching facility geospatial record..." />
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Facility Not Found</h2>
        <p className="text-xs text-slate-600">{error}</p>
        <Link
          to="/facilities"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-800 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Facilities Directory
        </Link>
      </div>
    );
  }

  const [lng, lat] = getFacilityCoordinates(facility);
  const isDemo = facility.dataSource === 'SYNTHETIC_DEMO' || facility.isSyntheticDemo;
  const hoursText = formatOpeningHours(facility.openingHours);
  const capacityText = formatCapacity(facility.capacity);
  const contactText = formatContact(facility.contactInformation);
  const accessibilityText = formatAccessibility(facility.accessibility);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to previous view
        </button>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={facility.category} />
              <StatusBadge status={facility.operationalStatus} />
              <VerificationBadge status={facility.verificationStatus} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {facility.name}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {facility.address || 'Godavari River Sector, Rajamahendravaram'}
            </p>
          </div>

          <a
            href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=%3B${lat}%2C${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-800 text-white rounded-xl text-xs font-bold hover:bg-teal-900 transition-colors shadow-sm self-start"
          >
            <Navigation className="w-4 h-4 text-saffron-400" />
            Navigate on OpenStreetMap
          </a>
        </div>

        {/* Demo banner */}
        {isDemo && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-800">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Demonstration Record:</strong> This facility is generated as synthetic data for the hackathon simulation. Ground confirmation required before official deployment.
            </span>
          </div>
        )}

        {/* Description */}
        {facility.description && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              About this Facility
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {facility.description}
            </p>
          </div>
        )}

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100">
          <div className="p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Operational Hours
            </span>
            <p className="font-semibold text-slate-800 text-sm">
              {hoursText || 'Continuous / 24 Hours'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              Capacity Allowance
            </span>
            <p className="font-semibold text-slate-800 text-sm">
              {capacityText || 'Open Corridor'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              Verified Helpline
            </span>
            <p className="font-semibold text-slate-800 text-sm">
              {contactText || 'Central Pushkaralu Helpline 1077'}
            </p>
          </div>
        </div>

        {/* Accessibility Notes */}
        {accessibilityText && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 space-y-1">
            <span className="font-bold block">Accessibility Amenities:</span>
            <p>{accessibilityText}</p>
          </div>
        )}

        {/* Embedded Map Visualizer */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            GIS Location & OpenStreetMap Footprint
          </h3>
          <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-200">
            <InteractiveMap
              facilities={[facility]}
              selectedFacility={facility}
              center={[lat, lng]}
              zoom={16}
              height="100%"
            />
          </div>
          <p className="text-[11px] font-mono text-slate-500">
            Latitude: {lat.toFixed(6)}, Longitude: {lng.toFixed(6)} • EPSG:4326 WGS84
          </p>
        </div>
      </div>
    </div>
  );
};
