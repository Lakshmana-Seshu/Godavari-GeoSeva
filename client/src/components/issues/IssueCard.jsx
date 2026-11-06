import React from 'react';
import { AlertCircle, Clock, MapPin, Eye, CheckCircle, Navigation } from 'lucide-react';
import { ISSUE_STATUS_METADATA, formatDateTime } from '../../utils/formatters';

export const IssueCard = ({ issue, onSelectDetails = null, onViewOnMap = null }) => {
  const meta = ISSUE_STATUS_METADATA[issue.status] || ISSUE_STATUS_METADATA.SUBMITTED;
  const [lng, lat] = issue.location.coordinates;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-5 space-y-3 hover:shadow-cardHover transition-all flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {issue.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
            {meta.label}
          </span>
        </div>

        <h4 className="font-bold text-sm text-slate-900 leading-snug">
          {issue.title}
        </h4>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {issue.description}
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateTime(issue.createdAt)}
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
            <MapPin className="w-3 h-3 text-slate-400" />
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        {onViewOnMap && (
          <button
            onClick={() => onViewOnMap(issue)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-1"
            title="Locate on Map"
          >
            <MapPin className="w-3.5 h-3.5 text-river-600" />
            <span className="text-[11px]">Map</span>
          </button>
        )}
        {onSelectDetails && (
          <button
            onClick={() => onSelectDetails(issue)}
            className="px-3 py-1.5 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors flex items-center gap-1 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            Review & Update
          </button>
        )}
      </div>
    </div>
  );
};
