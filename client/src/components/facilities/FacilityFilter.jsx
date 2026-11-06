import React from 'react';
import { Search, Filter, RotateCcw, MapPin } from 'lucide-react';
import { CATEGORY_METADATA } from '../../utils/formatters';

export const FacilityFilter = ({
  search = '',
  onSearchChange,
  category = 'ALL',
  onCategoryChange,
  operationalStatus = 'ALL',
  onOperationalStatusChange,
  verificationStatus = 'ALL',
  onVerificationStatusChange,
  radius = '',
  onRadiusChange,
  onReset,
  hasLocation = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-4 space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search facilities by name, locality, or landmark (e.g. Kotilingala, Pushkar Ghat, Water Post 4)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent text-sm placeholder:text-slate-400"
        />
      </div>

      {/* Category Pills */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Facility Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onCategoryChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              category === 'ALL'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {Object.entries(CATEGORY_METADATA).map(([key, item]) => {
            const isSelected = category === key;
            return (
              <button
                key={key}
                onClick={() => onCategoryChange(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.markerBg }}
                />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        {/* Operational Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Operational Status
          </label>
          <select
            value={operationalStatus}
            onChange={(e) => onOperationalStatusChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Operational Only</option>
            <option value="CLOSED">Closed Only</option>
            <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
            <option value="UNKNOWN">Status Unknown</option>
          </select>
        </div>

        {/* Verification Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Verification Status
          </label>
          <select
            value={verificationStatus}
            onChange={(e) => onVerificationStatusChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
          >
            <option value="ALL">All Records</option>
            <option value="VERIFIED">Verified by Authority</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="UNVERIFIED">Unverified Only</option>
          </select>
        </div>

        {/* Proximity Radius */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Proximity Filter {hasLocation ? '(GPS Active)' : '(Requires GPS)'}
          </label>
          <select
            value={radius}
            onChange={(e) => onRadiusChange(e.target.value)}
            disabled={!hasLocation}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">No Distance Limit</option>
            <option value="500">Within 500 Meters</option>
            <option value="1000">Within 1 Kilometer</option>
            <option value="2000">Within 2 Kilometers</option>
            <option value="5000">Within 5 Kilometers</option>
          </select>
        </div>
      </div>

      {/* Reset button bar */}
      <div className="flex justify-end pt-1">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Filters
        </button>
      </div>
    </div>
  );
};
