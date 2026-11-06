import { CATEGORY_METADATA } from './formatters';

// Category SVG Path Icons for Google Maps Markers
const getCategorySvgPath = (category) => {
  switch (category) {
    case 'GHAT':
      return `<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>`;
    case 'TOILET':
      return `<path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.7 3 4 3.7 4 4.5V17a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4.5c0-.8-.7-1.5-1.5-1.5-.4 0-.8.2-1 .5L15 6"/><path d="M7 11h10"/>`;
    case 'DRINKING_WATER':
      return `<path d="m12 2.69 5.66 5.66a8 8 0 1 1-11.31 0z"/>`;
    case 'MEDICAL':
      return `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5v6"/><path d="M9 8h6"/>`;
    case 'SHELTER':
      return `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`;
    case 'EMERGENCY':
      return `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`;
    case 'ROAD_ACCESS':
      return `<polygon points="3 11 22 2 13 21 11 13 3 11"/>`;
    default:
      return `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`;
  }
};

/**
 * Creates a Data URI SVG pin icon for Google Maps Marker
 */
export const getGoogleMapFacilityIcon = (category, operationalStatus = 'OPEN', isVerified = true) => {
  const meta = CATEGORY_METADATA[category] || CATEGORY_METADATA.OTHER;
  const bgColor = meta.markerBg || '#0f766e';
  const isDown = operationalStatus === 'CLOSED' || operationalStatus === 'TEMPORARILY_UNAVAILABLE';
  const opacity = isDown ? '0.75' : '1.0';

  const verificationBadgeSvg = !isVerified
    ? `<circle cx="34" cy="8" r="5" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>`
    : '';

  const statusBadgeSvg = isDown
    ? `<circle cx="34" cy="34" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>`
    : '';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
      <defs>
        <filter id="shadow" x="0" y="0" width="40" height="40" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="16" fill="${bgColor}" stroke="#ffffff" stroke-width="2.5" opacity="${opacity}" filter="url(#shadow)"/>
      <g transform="translate(8, 8) scale(1)" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        ${getCategorySvgPath(category)}
      </g>
      ${verificationBadgeSvg}
      ${statusBadgeSvg}
    </svg>
  `.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: typeof google !== 'undefined' && google.maps ? new google.maps.Size(40, 40) : null,
    anchor: typeof google !== 'undefined' && google.maps ? new google.maps.Point(20, 20) : null,
  };
};

/**
 * Creates a Google Maps Marker icon for civic issues
 */
export const getGoogleMapIssueIcon = (status = 'SUBMITTED') => {
  const isResolved = status === 'RESOLVED';
  const bgColor = isResolved ? '#10b981' : '#f97316';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
      <defs>
        <filter id="issueShadow" x="0" y="0" width="34" height="34" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="17" cy="17" r="14" fill="${bgColor}" stroke="#ffffff" stroke-width="2.5" filter="url(#issueShadow)"/>
      <g transform="translate(5, 5)" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <circle cx="12" cy="12" r="9"/>
        <line x1="12" y1="7" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </g>
    </svg>
  `.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: typeof google !== 'undefined' && google.maps ? new google.maps.Size(34, 34) : null,
    anchor: typeof google !== 'undefined' && google.maps ? new google.maps.Point(17, 17) : null,
  };
};

/**
 * Creates user location pulsing blue dot icon
 */
export const getGoogleMapUserLocationIcon = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" fill="#0284c7" fill-opacity="0.25"/>
      <circle cx="14" cy="14" r="7" fill="#0284c7" stroke="#ffffff" stroke-width="2.5"/>
    </svg>
  `.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: typeof google !== 'undefined' && google.maps ? new google.maps.Size(28, 28) : null,
    anchor: typeof google !== 'undefined' && google.maps ? new google.maps.Point(14, 14) : null,
  };
};

