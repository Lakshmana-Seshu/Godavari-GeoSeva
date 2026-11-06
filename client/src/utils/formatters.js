export const CATEGORY_METADATA = {
  GHAT: {
    label: 'Bathing Ghat',
    color: '#0d9488', // Teal
    bgColor: 'bg-teal-100 text-teal-800 border-teal-200',
    iconName: 'Waves',
    markerBg: '#0d9488',
  },
  TOILET: {
    label: 'Public Toilet',
    color: '#6366f1', // Indigo
    bgColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    iconName: 'Bath',
    markerBg: '#6366f1',
  },
  DRINKING_WATER: {
    label: 'Drinking Water',
    color: '#0284c7', // River Blue
    bgColor: 'bg-sky-100 text-sky-800 border-sky-200',
    iconName: 'Droplets',
    markerBg: '#0284c7',
  },
  MEDICAL: {
    label: 'Medical Camp',
    color: '#e11d48', // Red
    bgColor: 'bg-rose-100 text-rose-800 border-rose-200',
    iconName: 'HeartPulse',
    markerBg: '#e11d48',
  },
  SHELTER: {
    label: 'Temporary Shelter',
    color: '#d97706', // Amber/Saffron
    bgColor: 'bg-amber-100 text-amber-800 border-amber-200',
    iconName: 'Home',
    markerBg: '#d97706',
  },
  EMERGENCY: {
    label: 'Emergency Facility',
    color: '#dc2626', // Red
    bgColor: 'bg-red-100 text-red-800 border-red-200',
    iconName: 'AlertTriangle',
    markerBg: '#dc2626',
  },
  ROAD_ACCESS: {
    label: 'Road & Access Route',
    color: '#4b5563', // Slate
    bgColor: 'bg-slate-100 text-slate-800 border-slate-200',
    iconName: 'Navigation',
    markerBg: '#4b5563',
  },
  OTHER: {
    label: 'Other Civic Service',
    color: '#6b7280', // Gray
    bgColor: 'bg-gray-100 text-gray-800 border-gray-200',
    iconName: 'MapPin',
    markerBg: '#6b7280',
  },
};

export const OPERATIONAL_STATUS_METADATA = {
  OPEN: {
    label: 'Operational / Open',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    indicatorColor: '#10b981',
  },
  CLOSED: {
    label: 'Closed',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    indicatorColor: '#f43f5e',
  },
  TEMPORARILY_UNAVAILABLE: {
    label: 'Temporarily Unavailable',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    indicatorColor: '#f59e0b',
  },
  UNKNOWN: {
    label: 'Status Unknown',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    indicatorColor: '#94a3b8',
  },
};

export const VERIFICATION_STATUS_METADATA = {
  VERIFIED: {
    label: 'Verified by Authority',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
    icon: 'ShieldCheck',
  },
  PENDING_VERIFICATION: {
    label: 'Pending Field Verification',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: 'Clock',
  },
  UNVERIFIED: {
    label: 'Community Submitted (Unverified)',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: 'HelpCircle',
  },
  REJECTED: {
    label: 'Rejected / Invalid',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: 'XCircle',
  },
};

export const ISSUE_STATUS_METADATA = {
  SUBMITTED: {
    label: 'Submitted',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  VERIFIED: {
    label: 'Verified Issue',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  IN_PROGRESS: {
    label: 'Action In Progress',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  RESOLVED: {
    label: 'Resolved',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
  },
};

export const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return null;
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'Not recorded';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Unknown';
  const d = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export const formatOpeningHours = (hours) => {
  if (!hours) return 'Open 24 Hours';
  if (typeof hours === 'string') return hours;
  if (typeof hours === 'object') {
    if (hours.is24Hours) return hours.notes ? `24 Hours (${hours.notes})` : '24 Hours Open';
    if (hours.openTime && hours.closeTime) return `${hours.openTime} - ${hours.closeTime}`;
    if (hours.notes) return hours.notes;
  }
  return 'Hours on-site';
};

export const formatCapacity = (cap) => {
  if (!cap) return null;
  if (typeof cap === 'number') return `${cap.toLocaleString()} pilgrims`;
  if (typeof cap === 'string') return cap;
  if (typeof cap === 'object') {
    const val = cap.estimatedCapacity || cap.capacity || cap.count;
    const unit = cap.unit || 'pilgrims';
    if (val) return `${Number(val).toLocaleString()} ${unit}`;
  }
  return null;
};

export const formatAccessibility = (acc) => {
  if (!acc) return null;
  if (typeof acc === 'string') return acc;
  if (typeof acc === 'object') {
    const parts = [];
    if (acc.wheelchairAccessible) parts.push('Wheelchair Accessible');
    if (acc.rampAvailable) parts.push('Ramp Available');
    if (acc.elderlyAssistance) parts.push('Elderly Assistance');
    if (acc.notes) parts.push(acc.notes);
    return parts.length > 0 ? parts.join(' • ') : null;
  }
  return null;
};

export const formatContact = (contact) => {
  if (!contact) return null;
  if (typeof contact === 'string') return contact;
  if (typeof contact === 'object') {
    const phone = contact.phone || contact.emergencyHelpline;
    const name = contact.inChargeName;
    if (phone && name) return `${phone} (${name})`;
    return phone || name || null;
  }
  return null;
};

export const getFacilityCoordinates = (facility) => {
  if (!facility) return [81.7770, 17.0028];
  if (Array.isArray(facility.location?.coordinates)) {
    return facility.location.coordinates; // [lng, lat]
  }
  if (facility.coordinates) {
    if (Array.isArray(facility.coordinates)) return facility.coordinates;
    if (facility.coordinates.lng !== undefined && facility.coordinates.lat !== undefined) {
      return [facility.coordinates.lng, facility.coordinates.lat];
    }
  }
  return [81.7770, 17.0028];
};

export const isValidGoogleKey = (key) =>
  Boolean(
    key &&
      typeof key === 'string' &&
      key.trim().length > 20 &&
      !key.includes('your_google_maps') &&
      !key.includes('placeholder')
  );
