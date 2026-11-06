import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Compass, AlertCircle, Heart, PhoneCall, Info } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                GS
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Godavari GeoSeva <span className="text-saffron-500">2027</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Geospatial civic infrastructure and facility mapping system designed to safeguard, assist, and guide millions of pilgrims across the Godavari Pushkaralu river corridor.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-950/60 border border-teal-800/50 text-[11px] text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Official Hackathon Prototype 2027
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider text-xs">
              Pilgrim Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/map" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  Interactive GIS Map
                </Link>
              </li>
              <li>
                <Link to="/facilities" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  All Mapped Facilities
                </Link>
              </li>
              <li>
                <Link to="/report-issue" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  Report Civic Issue
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                  Emergency & Helplines
                </Link>
              </li>
            </ul>
          </div>

          {/* Facility Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider text-xs">
              Facility Sectors
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Bathing Ghats (Pushkar, Kotilingala, Saraswati)</li>
              <li>Public Sanitation & Toilets</li>
              <li>Purified Drinking Water Points</li>
              <li>Emergency Medical Centers & First Aid</li>
              <li>Pilgrim Shelters & Holding Areas</li>
            </ul>
          </div>

          {/* Verification & Transparency */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider text-xs">
              Data Freshness & Integrity
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Synthetic demonstration records are explicitly labeled. Verified locations require field inspection sign-off by designated nodal authorities prior to live event deployment.
            </p>
            <div className="p-2.5 rounded bg-slate-800/70 border border-slate-700 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1 text-slate-200 font-medium">
                <Info className="w-3 h-3 text-saffron-400" />
                Rajamahendravaram - Kovvur
              </div>
              <p className="text-[10px] text-slate-400">
                Coordinated with AP State Disaster Management & Municipal Corporation guidelines.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2027 Godavari Pushkaralu GeoSeva System. Built for Civic Impact.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Engineered with Leaflet, MongoDB 2dsphere & React
          </p>
        </div>
      </div>
    </footer>
  );
};
