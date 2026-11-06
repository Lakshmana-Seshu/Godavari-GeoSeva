import { Facility } from '../models/Facility.js';
import { CivicIssue } from '../models/CivicIssue.js';

/**
 * Calculates great-circle distance between two coordinates in meters using Haversine formula
 */
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Analyzes spatial coverage across the Godavari Pushkaralu river corridor
 * Grid bounds encompass Rajamahendravaram & Kovvur ghat zones:
 * Lat: 16.9800 to 17.0600, Lng: 81.7400 to 81.8200
 */
export const computeSpatialCoverage = async (gridRows = 4, gridCols = 4) => {
  const minLat = 16.9800;
  const maxLat = 17.0600;
  const minLng = 81.7400;
  const maxLng = 81.8200;

  const latStep = (maxLat - minLat) / gridRows;
  const lngStep = (maxLng - minLng) / gridCols;

  const allFacilities = await Facility.find({ isActive: true }).lean();
  const allIssues = await CivicIssue.find({}).lean();

  const gridCells = [];
  let totalFacilitiesMapped = allFacilities.length;
  let totalIssuesReported = allIssues.length;

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const cellMinLat = minLat + r * latStep;
      const cellMaxLat = cellMinLat + latStep;
      const cellMinLng = minLng + c * lngStep;
      const cellMaxLng = cellMinLng + lngStep;
      const centerLat = (cellMinLat + cellMaxLat) / 2;
      const centerLng = (cellMinLng + cellMaxLng) / 2;

      // Filter facilities located within this cell
      const cellFacilities = allFacilities.filter((f) => {
        if (!f.location || !Array.isArray(f.location.coordinates)) return false;
        const [lng, lat] = f.location.coordinates;
        return lat >= cellMinLat && lat < cellMaxLat && lng >= cellMinLng && lng < cellMaxLng;
      });

      // Filter issues located within this cell
      const cellIssues = allIssues.filter((i) => {
        if (!i.location || !Array.isArray(i.location.coordinates)) return false;
        const [lng, lat] = i.location.coordinates;
        return lat >= cellMinLat && lat < cellMaxLat && lng >= cellMinLng && lng < cellMaxLng;
      });

      const categoryCounts = {
        GHAT: 0,
        TOILET: 0,
        DRINKING_WATER: 0,
        MEDICAL: 0,
        SHELTER: 0,
        EMERGENCY: 0,
        ROAD_ACCESS: 0,
        OTHER: 0
      };

      cellFacilities.forEach((f) => {
        if (categoryCounts[f.category] !== undefined) {
          categoryCounts[f.category]++;
        }
      });

      const openIssuesCount = cellIssues.filter(
        (i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED'
      ).length;

      // Calculate distance to nearest medical and drinking water from cell center
      let nearestMedicalDistMeters = null;
      let nearestWaterDistMeters = null;

      allFacilities.forEach((f) => {
        if (!f.location || !Array.isArray(f.location.coordinates)) return;
        const [fLng, fLat] = f.location.coordinates;
        const dist = calculateDistanceMeters(centerLat, centerLng, fLat, fLng);
        if (f.category === 'MEDICAL') {
          if (nearestMedicalDistMeters === null || dist < nearestMedicalDistMeters) {
            nearestMedicalDistMeters = dist;
          }
        }
        if (f.category === 'DRINKING_WATER') {
          if (nearestWaterDistMeters === null || dist < nearestWaterDistMeters) {
            nearestWaterDistMeters = dist;
          }
        }
      });

      // Coverage Gap Heuristic (Transparent Rules):
      // A cell has a potential coverage gap indicator if:
      // - It has ghats or shelters, but no drinking water within 600m
      // - Or nearest medical facility is > 1500m
      // - Or open issues >= 2
      const gapReasons = [];
      if (categoryCounts.GHAT > 0 && categoryCounts.DRINKING_WATER === 0) {
        gapReasons.push('Bathing Ghat present without immediately mapped drinking water point');
      }
      if (categoryCounts.GHAT > 0 && categoryCounts.TOILET === 0) {
        gapReasons.push('Bathing Ghat present without immediately mapped public toilet');
      }
      if (nearestMedicalDistMeters && nearestMedicalDistMeters > 1500) {
        gapReasons.push(`Nearest medical post is > 1.5km (${(nearestMedicalDistMeters / 1000).toFixed(1)} km)`);
      }
      if (openIssuesCount >= 2) {
        gapReasons.push(`Issue cluster: ${openIssuesCount} unresolved civic issues reported`);
      }

      gridCells.push({
        id: `grid-${r}-${c}`,
        bounds: [
          [cellMinLat, cellMinLng],
          [cellMaxLat, cellMaxLng]
        ],
        center: [centerLat, centerLng],
        facilityCount: cellFacilities.length,
        categoryCounts,
        openIssuesCount,
        nearestMedicalDistMeters,
        nearestWaterDistMeters,
        hasCoverageGap: gapReasons.length > 0,
        gapReasons,
        coverageScore: Math.min(100, cellFacilities.length * 20 - openIssuesCount * 10)
      });
    }
  }

  return {
    zoneName: 'Godavari Corridor (Rajamahendravaram - Kovvur Pushkaralu Sector)',
    gridDimensions: { rows: gridRows, cols: gridCols },
    totalFacilitiesMapped,
    totalIssuesReported,
    cellsWithCoverageGaps: gridCells.filter((c) => c.hasCoverageGap).length,
    methodologyNote:
      'Preliminary spatial analysis based on mapped database records and straight-line proximity heuristics. Final civic coverage requires on-site validation by authorized pushkaralu field inspectors.',
    cells: gridCells
  };
};
