import React, { useState, useEffect } from 'react';
import {
  Compass,
  Layers,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  MapPin,
  RefreshCw,
  Info,
  Sliders,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi';
import { facilityApi } from '../api/facilityApi';
import { issueApi } from '../api/issueApi';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { CoverageGapsTable } from '../components/dashboard/CoverageGapsTable';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SpatialAnalytics = () => {
  const [coverageData, setCoverageData] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [issues, setIssues] = useState([]);
  const [gridSize, setGridSize] = useState(4); // 4x4 default
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const fetchSpatialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [covRes, facRes, issRes] = await Promise.all([
        dashboardApi.getCoverageAnalysis({ gridRows: gridSize, gridCols: gridSize }),
        facilityApi.getFacilities({ limit: 100 }),
        issueApi.getIssues({ limit: 100 }),
      ]);

      if (covRes?.data) setCoverageData(covRes.data);
      const facList = Array.isArray(facRes?.data?.facilities)
        ? facRes.data.facilities
        : Array.isArray(facRes?.data)
        ? facRes.data
        : Array.isArray(facRes?.facilities)
        ? facRes.facilities
        : [];
      if (facList.length > 0) setFacilities(facList);

      const issList = Array.isArray(issRes?.data?.issues)
        ? issRes.data.issues
        : Array.isArray(issRes?.data)
        ? issRes.data
        : Array.isArray(issRes?.issues)
        ? issRes.issues
        : [];
      if (issList.length > 0) setIssues(issList);
    } catch (err) {
      setError('Failed to compute spatial coverage analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpatialData();
  }, [gridSize]);

  if (isLoading && !coverageData) {
    return <LoadingSpinner message="Executing MongoDB geospatial grid aggregation..." size="large" />;
  }

  const cells = coverageData?.cells || [];
  const gapCells = cells.filter((c) => c.hasCoverageGap);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-river-700 uppercase tracking-wider block mb-1">
            Geospatial Decision Support
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Spatial Corridor Coverage & Infrastructure Gaps
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic grid analysis identifying potential medical blindspots, water access deficits, and issue clusters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">Grid Resolution:</span>
            <select
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value, 10))}
              className="font-bold text-teal-800 bg-transparent focus:outline-none"
            >
              <option value="3">3 x 3 (9 sectors)</option>
              <option value="4">4 x 4 (16 sectors)</option>
              <option value="5">5 x 5 (25 sectors)</option>
            </select>
          </div>

          <button
            onClick={fetchSpatialData}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-800 text-white rounded-xl text-xs font-bold hover:bg-teal-900 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recompute
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Monitored Corridor
          </span>
          <p className="text-lg font-bold text-slate-900 mt-1">
            Rajamahendravaram - Kovvur
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            Lat: 16.98 - 17.06 | Lng: 81.74 - 81.82
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Identified Gap Indicators
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-600">
              {gapCells.length}
            </span>
            <span className="text-xs text-slate-500">
              of {cells.length} grid sectors
            </span>
          </div>
          <span className="text-[11px] text-rose-700 font-semibold block mt-1">
            Requires field verification or facility dispatch
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Corridor Facilities Mapped
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-teal-800">
              {coverageData?.totalFacilitiesMapped || facilities.length}
            </span>
            <span className="text-xs text-slate-500">
              facilities across sectors
            </span>
          </div>
          <span className="text-[11px] text-teal-700 font-semibold block mt-1">
            {coverageData?.totalIssuesReported || issues.length} active grievance reports
          </span>
        </div>
      </div>

      {/* GIS Map with Coverage Grid Overlay */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Spatial Grid Overlay (Red = Potential Gap, Green = Adequate)
            </h2>
            <p className="text-xs text-slate-500">
              Click any grid cell to view sector breakdown and proximity metrics
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span className="text-slate-600">Adequate Coverage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500"></span>
              <span className="text-slate-600">Coverage Gap Alert</span>
            </div>
          </div>
        </div>

        <div className="h-[460px] w-full rounded-2xl overflow-hidden border border-slate-200">
          <InteractiveMap
            facilities={facilities}
            issues={issues}
            showIssues={true}
            coverageCells={cells}
            showCoverageGrid={true}
            height="100%"
          />
        </div>
      </div>

      {/* Transparent Gap Heuristics Notice */}
      <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
          <Info className="w-4 h-4 text-amber-600" />
          Transparent Analysis Rules & Scientific Limitations
        </div>
        <p className="leading-relaxed text-slate-700">
          A sector is flagged with a <strong>Potential Coverage Gap</strong> if any of the following heuristic rules match:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
          <li>A bathing ghat or shelter exists in the sector without immediately mapped drinking water or public toilets.</li>
          <li>Distance from cell center to the nearest medical camp or first-aid post exceeds <strong>1.5 kilometers</strong>.</li>
          <li>Two or more unresolved civic complaints (dry taps, broken toilets) cluster in the same sector.</li>
        </ul>
        <p className="text-[11px] text-amber-800 italic pt-1">
          * Note: Proximity is calculated using great-circle distance. Analytical indicators are preliminary until verified on-site by pushkaralu municipal field supervisors. An area is not definitively underserved solely because few digital records exist.
        </p>
      </div>

      {/* Detailed Coverage Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Sector-by-Sector Spatial Audit Table
          </h2>
          <p className="text-xs text-slate-500">
            Detailed breakdown of mapped infrastructure and nearest emergency distances per sector
          </p>
        </div>

        <CoverageGapsTable cells={cells} />
      </div>
    </div>
  );
};
