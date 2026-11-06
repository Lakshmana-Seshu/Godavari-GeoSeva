import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORY_METADATA } from '../../utils/formatters';

export const MapLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute bottom-6 right-6 z-[1000] bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-card max-w-xs transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:text-teal-800"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-700" />
          <span>GIS Map Legend</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-slate-100 space-y-2 text-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Facility Categories
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CATEGORY_METADATA).map(([key, item]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white shadow-xs"
                  style={{ backgroundColor: item.markerBg }}
                />
                <span className="text-[11px] text-slate-700 truncate">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
            <p className="font-semibold text-slate-400 uppercase tracking-wider">Status Indicators</p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Closed / Temporarily Down</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">Unverified / Reported Issue</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
