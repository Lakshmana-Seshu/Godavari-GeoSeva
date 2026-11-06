import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Layers,
  MapPin,
  AlertCircle,
  PhoneCall,
  ShieldCheck,
  Waves,
  Droplets,
  Bath,
  HeartPulse,
  Home as HomeIcon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { facilityApi } from '../api/facilityApi';
import { GodavariGoogleMap } from '../components/map/GodavariGoogleMap';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { FacilityCard } from '../components/facilities/FacilityCard';
import { FacilityDetailModal } from '../components/facilities/FacilityDetailModal';
import { HeroSlideshow } from '../components/home/HeroSlideshow';
import { useOffline } from '../context/OfflineContext';
import { DEMO_FACILITIES } from '../data/demoFacilities';
import { isValidGoogleKey } from '../utils/formatters';

export const Home = () => {
  const [featuredFacilities, setFeaturedFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const hasValidGoogleKey = isValidGoogleKey(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('geoseva_gmaps_api_key')
  );
  const [previewEngine, setPreviewEngine] = useState(hasValidGoogleKey ? 'google' : 'osm'); // 'google' | 'osm'
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline, getCachedFacilities, saveFacilitiesToCache } = useOffline();

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await facilityApi.getFacilities({ limit: 6, operationalStatus: 'OPEN' });
        const list = Array.isArray(res?.data?.facilities)
          ? res.data.facilities
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.facilities)
          ? res.facilities
          : [];

        if (list && list.length > 0) {
          setFeaturedFacilities(list);
          saveFacilitiesToCache(list);
        } else {
          setFeaturedFacilities(DEMO_FACILITIES.slice(0, 6));
        }
      } catch (err) {
        console.warn('Network fetch failed, falling back to demo records');
        const cached = getCachedFacilities();
        if (cached && cached.length > 0) {
          setFeaturedFacilities(cached.slice(0, 6));
        } else {
          setFeaturedFacilities(DEMO_FACILITIES.slice(0, 6));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const categoryCards = [
    {
      title: 'Bathing Ghats',
      desc: 'Sacred river access, changing enclosures, safety barricades',
      icon: Waves,
      category: 'GHAT',
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
    },
    {
      title: 'Public Toilets',
      desc: 'Sanitation hubs, mobile bio-toilets & accessible facilities',
      icon: Bath,
      category: 'TOILET',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      iconBg: 'bg-indigo-600 text-white',
    },
    {
      title: 'Drinking Water',
      desc: 'Purified RO water points, free distribution kiosks',
      icon: Droplets,
      category: 'DRINKING_WATER',
      color: 'bg-sky-50 text-sky-800 border-sky-200',
      iconBg: 'bg-river-600 text-white',
    },
    {
      title: 'Medical Facilities',
      desc: 'First-aid stations, 24/7 medical camps & ambulance bays',
      icon: HeartPulse,
      category: 'MEDICAL',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      iconBg: 'bg-rose-600 text-white',
    },
    {
      title: 'Shelters & Holding',
      desc: 'Shaded rest areas, waiting zones & luggage counters',
      icon: HomeIcon,
      category: 'SHELTER',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      iconBg: 'bg-saffron-500 text-white',
    },
    {
      title: 'Emergency Services',
      desc: 'Police control rooms, river rescue, lost & found helpdesks',
      icon: AlertTriangle,
      category: 'EMERGENCY',
      color: 'bg-red-50 text-red-800 border-red-200',
      iconBg: 'bg-red-600 text-white',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Homepage Full-Width Hero Slideshow (Section 1) */}
      <HeroSlideshow />

      {/* Facility Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Essential Pilgrim Infrastructure
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any civic sector to view verified locations on the interactive map
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.category}
                  to={`/facilities?category=${card.category}`}
                  className="p-5 rounded-xl border border-slate-200/90 hover:border-teal-600/40 hover:shadow-cardHover transition-all bg-white group flex items-start gap-4"
                >
                  <div className={`p-3 rounded-xl ${card.iconBg} shadow-sm group-hover:scale-105 transition-transform flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-900 transition-colors flex items-center justify-between">
                      {card.title}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Facility Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              Live Geospatial Visualization
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Rajamahendravaram - Kovvur Corridor Map
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Interactive map preview showing verified ghats, medical camps, and drinking water facilities.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setPreviewEngine('google')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  previewEngine === 'google'
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Google Maps
              </button>
              <button
                onClick={() => setPreviewEngine('osm')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  previewEngine === 'osm'
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                OSM View
              </button>
            </div>
            <Link
              to="/map"
              className="flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-900 bg-teal-50 px-3.5 py-2 rounded-lg border border-teal-200"
            >
              Open Full GIS Map View
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="h-[480px] w-full rounded-2xl overflow-hidden shadow-card border border-slate-200">
          {previewEngine === 'google' ? (
            <GodavariGoogleMap
              height="100%"
              onFacilityClick={(fac) => setSelectedFacility(fac)}
              onSwitchToLeaflet={() => setPreviewEngine('osm')}
            />
          ) : (
            <InteractiveMap
              facilities={featuredFacilities}
              onSelectFacility={(fac) => setSelectedFacility(fac)}
              height="100%"
            />
          )}
        </div>
      </section>

      {/* How the Platform Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold text-saffron-400 uppercase tracking-wider block mb-2">
              Architecture & Civic Mission
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Bridging Pilgrims, Field Volunteers & Authorities
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Designed to ensure rapid response, zero infrastructure blindness, and accessible civic support during peak festival footfall.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold text-lg border border-teal-500/30">
                1
              </div>
              <h3 className="font-bold text-base text-white">Location-Aware Discovery</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pilgrims locate nearest bathing ghats, clean drinking water points, and first-aid camps with explicit GPS-based proximity search and OpenStreetMap routing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-saffron-500/20 text-saffron-400 flex items-center justify-center font-bold text-lg border border-saffron-500/30">
                2
              </div>
              <h3 className="font-bold text-base text-white">Crowdsourced Issue Reporting</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Anyone can report broken toilets, dry taps, or blocked paths with geolocation. Reports generate trackable reference IDs with audit trails.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-river-500/20 text-river-400 flex items-center justify-center font-bold text-lg border border-river-500/30">
                3
              </div>
              <h3 className="font-bold text-base text-white">GIS Spatial Gap Analytics</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Authorities run automated grid analysis across the river corridor to identify coverage gaps, medical blindspots, and issue clusters before congestion occurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Report Issue & Emergency Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Civic Reporting Card */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Notice Broken Infrastructure or Blocked Routes?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Help our field volunteer squads keep Godavari Pushkaralu clean and safe. Report damaged toilets, dry drinking water taps, or access bottlenecks in under 60 seconds.
              </p>
            </div>
            <Link
              to="/report-issue"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition-colors shadow-xs"
            >
              Submit a Civic Report
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Emergency Info Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 shadow-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-rose-950">
                Emergency Facilities & Pushkaralu Helplines
              </h3>
              <p className="text-xs text-rose-900 leading-relaxed">
                Direct access to disaster management nodal helplines, river rescue teams, medical emergency camps, and official lost-and-found booths.
              </p>
            </div>
            <Link
              to="/emergency"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-rose-700 text-white font-bold text-xs hover:bg-rose-800 transition-colors shadow-xs"
            >
              View Pushkaralu Emergency Directory
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <FacilityDetailModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}
    </div>
  );
};
