import React from 'react';
import { AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { formatDistance } from '../../utils/formatters';

export const CoverageGapsTable = ({ cells = [], onSelectCell = null }) => {
  if (cells.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        No spatial analysis data loaded
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
            <th className="py-3 px-4">Grid Cell</th>
            <th className="py-3 px-4">Mapped Facilities</th>
            <th className="py-3 px-4">Nearest Medical</th>
            <th className="py-3 px-4">Nearest Water</th>
            <th className="py-3 px-4">Open Issues</th>
            <th className="py-3 px-4">Coverage Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {cells.map((cell) => {
            const isGap = cell.hasCoverageGap;
            return (
              <tr
                key={cell.id}
                onClick={() => onSelectCell && onSelectCell(cell)}
                className={`hover:bg-slate-50 transition-colors ${
                  onSelectCell ? 'cursor-pointer' : ''
                }`}
              >
                <td className="py-3 px-4 font-mono font-medium text-slate-800">
                  {cell.id}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  {cell.facilityCount}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {formatDistance(cell.nearestMedicalDistMeters) || 'N/A'}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {formatDistance(cell.nearestWaterDistMeters) || 'N/A'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`font-semibold ${
                      cell.openIssuesCount > 0 ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  >
                    {cell.openIssuesCount}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {isGap ? (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Coverage Gap
                      </span>
                      <p className="text-[10px] text-slate-500 truncate max-w-[220px]">
                        {cell.gapReasons[0]}
                      </p>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Adequate
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
