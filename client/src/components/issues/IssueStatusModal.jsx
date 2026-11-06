import React, { useState } from 'react';
import { X, CheckCircle, Clock, MapPin, Send, MessageSquare, AlertTriangle } from 'lucide-react';
import { ISSUE_STATUS_METADATA, formatDateTime } from '../../utils/formatters';

export const IssueStatusModal = ({ issue, onClose, onUpdateStatus, isUpdating = false }) => {
  if (!issue) return null;

  const [status, setStatus] = useState(issue.status);
  const [adminNote, setAdminNote] = useState('');
  const meta = ISSUE_STATUS_METADATA[issue.status] || ISSUE_STATUS_METADATA.SUBMITTED;
  const [lng, lat] = issue.location.coordinates;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStatus(issue._id, {
      status,
      administrativeNote: adminNote.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  {issue.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
                  Current: {meta.label}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{issue.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Report Reference ID: <span className="font-mono text-slate-700">{issue._id}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 text-xs text-slate-700">
            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Description of Reported Issue
              </label>
              <p className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl leading-relaxed text-sm text-slate-800">
                {issue.description}
              </p>
            </div>

            {/* Coordinates & Location */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs">
                <MapPin className="w-4 h-4 text-river-600" />
                <span>Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}</span>
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:underline font-semibold text-[11px]"
              >
                Inspect on OSM
              </a>
            </div>

            {/* Change Status Action */}
            <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider">
                Assign New Resolution Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-teal-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                <option value="SUBMITTED">SUBMITTED (Pending review)</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW (Officer reviewing)</option>
                <option value="VERIFIED">VERIFIED (On-site defect confirmed)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Repair / deployment crew dispatched)</option>
                <option value="RESOLVED">RESOLVED (Action completed)</option>
                <option value="REJECTED">REJECTED (Invalid or duplicate report)</option>
              </select>

              <div>
                <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                  Administrative Note / Dispatch Details
                </label>
                <textarea
                  rows="2"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Field sanitation team dispatched to clear blockages. Water tank replenished at 14:30."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-teal-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            {/* Status History Audit Trail */}
            {issue.statusHistory && issue.statusHistory.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Status Audit Trail
                </label>
                <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                  {issue.statusHistory.map((hist, index) => (
                    <div key={index} className="text-[11px] relative">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{hist.status}</span>
                        <span className="text-slate-400">• {formatDateTime(hist.timestamp)}</span>
                      </div>
                      {hist.note && <p className="text-slate-600 italic mt-0.5">"{hist.note}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-800 text-white rounded-lg text-xs font-bold hover:bg-teal-900 transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-saffron-400" />
              <span>{isUpdating ? 'Updating Record...' : 'Confirm Status Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
