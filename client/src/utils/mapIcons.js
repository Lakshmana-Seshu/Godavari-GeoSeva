import L from 'leaflet';
import { CATEGORY_METADATA } from './formatters';

const getCategorySvg = (category) => {
  switch (category) {
    case 'GHAT':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;
    case 'TOILET':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.7 3 4 3.7 4 4.5V17a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4.5c0-.8-.7-1.5-1.5-1.5-.4 0-.8.2-1 .5L15 6"/><path d="M7 11h10"/></svg>`;
    case 'DRINKING_WATER':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2.69 5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    case 'MEDICAL':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5v6"/><path d="M9 8h6"/></svg>`;
    case 'SHELTER':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    case 'EMERGENCY':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    case 'ROAD_ACCESS':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`;
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
  }
};

export const createFacilityIcon = (category, operationalStatus = 'OPEN', isVerified = true) => {
  const meta = CATEGORY_METADATA[category] || CATEGORY_METADATA.OTHER;
  const bgColor = meta.markerBg;
  const isInactive = operationalStatus === 'CLOSED' || operationalStatus === 'TEMPORARILY_UNAVAILABLE';
  const opacity = isInactive ? '0.7' : '1.0';

  const html = `
    <div style="background-color: ${bgColor}; opacity: ${opacity}; width: 36px; height: 36px;" class="custom-leaflet-marker flex items-center justify-center relative cursor-pointer">
      ${getCategorySvg(category)}
      ${
        !isVerified
          ? `<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background-color: #f59e0b; border: 2px solid #ffffff; border-radius: 50%;"></span>`
          : ''
      }
      ${
        isInactive
          ? `<span style="position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px; background-color: #ef4444; border: 2px solid #ffffff; border-radius: 50%;"></span>`
          : ''
      }
    </div>
  `;

  return L.divIcon({
    className: 'leaflet-custom-facility-wrapper',
    html: html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

export const createIssueIcon = (status = 'SUBMITTED') => {
  const isResolved = status === 'RESOLVED';
  const bgColor = isResolved ? '#10b981' : '#f97316';

  const html = `
    <div style="background-color: ${bgColor}; width: 32px; height: 32px;" class="custom-leaflet-marker flex items-center justify-center cursor-pointer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'leaflet-custom-issue-wrapper',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

export const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'leaflet-custom-user-wrapper',
    html: `<div class="user-location-marker"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};
