/**
 * ============================================================================
 * Godavari GeoSeva 2027 — Homepage Hero Slideshow Configuration
 * ============================================================================
 *
 * HOW TO MANAGE SLIDES:
 * 1. Add New Slide:
 *    - Place your image in `client/public/images/slides/your-image.jpg` (or use a direct URL).
 *    - Add a new slide object to the `DEFAULT_SLIDES` array below.
 *
 * 2. Reorder Slides:
 *    - Move the objects up or down in the `DEFAULT_SLIDES` array.
 *    - The first slide (index 0) will be shown initially and preloaded for performance.
 *
 * 3. Remove Slide:
 *    - Delete or comment out any object in `DEFAULT_SLIDES`.
 *
 * 4. Image Format Recommendation:
 *    - Recommended resolution: 1920x1080 (16:9 aspect ratio).
 *    - Supported formats: WebP, AVIF, JPG, PNG, or SVG.
 *    - Images are displayed using `object-fit: cover` with a dark gradient overlay.
 * ============================================================================
 */

export const DEFAULT_SLIDES = [
  {
    id: 'welcome',
    // Local image placed in client/public/images/slides/
    image: '/images/slides/godavari-river-sunset.svg',
    // Photographic high-resolution fallback URL (used if local image fails)
    fallbackImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1920&q=80',
    alt: 'Tranquil Godavari River sunset with historic bridges spanning between Rajamahendravaram and Kovvur',
    badge: 'Official Pushkaralu 2027 Geospatial Portal',
    badgeKey: 'slideshow.slides.welcome.badge',
    heading: 'Godavari GeoSeva 2027',
    headingKey: 'slideshow.slides.welcome.heading',
    subheading: 'Your Digital Guide to Godavari Pushkaralu',
    subheadingKey: 'slideshow.slides.welcome.subheading',
    description:
      'Discover verified locations of river ghats, drinking water facilities, public toilets, medical camps, shelters, and essential civic infrastructure through our interactive GIS mapping platform.',
    descriptionKey: 'slideshow.slides.welcome.description',
    primaryButton: {
      label: 'Explore Facilities',
      to: '/facilities',
      labelKey: 'slideshow.slides.welcome.primaryBtn',
      iconName: 'Layers',
    },
    secondaryButton: {
      label: 'View Interactive Map',
      to: '/map',
      labelKey: 'slideshow.slides.welcome.secondaryBtn',
      iconName: 'Compass',
    },
    attribution: 'Godavari River Corridor, Rajamahendravaram',
  },
  {
    id: 'ghats',
    image: '/images/slides/pushkar-ghat-riverfront.svg',
    fallbackImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1920&q=80',
    alt: 'Illuminated stone steps of Pushkar Ghat with safety barricades along the sacred Godavari River',
    badge: 'Riverfront Safety & Access',
    badgeKey: 'slideshow.slides.ghats.badge',
    heading: 'Sacred Bathing Ghats & Riverfronts',
    headingKey: 'slideshow.slides.ghats.heading',
    subheading: 'Pushkar Ghat, Kotilingala Revu & Goshpada Kshetram',
    subheadingKey: 'slideshow.slides.ghats.subheading',
    description:
      'Navigate safely to 24x7 illuminated ghats equipped with river safety barricades, life-jacket stations, SDRF rescue teams, and dedicated elder and wheelchair ramps.',
    descriptionKey: 'slideshow.slides.ghats.description',
    primaryButton: {
      label: 'View Bathing Ghats',
      to: '/facilities?category=GHAT',
      labelKey: 'slideshow.slides.ghats.primaryBtn',
      iconName: 'Waves',
    },
    secondaryButton: {
      label: 'Open GIS Map',
      to: '/map',
      labelKey: 'slideshow.slides.ghats.secondaryBtn',
      iconName: 'Compass',
    },
    attribution: 'Pushkar Ghat Promenade, East Bank',
  },
  {
    id: 'water',
    image: '/images/slides/drinking-water-sanitation.svg',
    fallbackImage: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=1920&q=80',
    alt: 'Purified drinking water stations and modern eco-friendly sanitation hubs for pilgrims',
    badge: 'Civic Amenities & Free Water',
    badgeKey: 'slideshow.slides.water.badge',
    heading: 'Purified Water & Sanitation Network',
    headingKey: 'slideshow.slides.water.heading',
    subheading: '100% Free RO Water Distribution & Bio-Toilets',
    subheadingKey: 'slideshow.slides.water.subheading',
    description:
      'Locate chilled RO drinking water posts, modern sanitation units, and pilgrim rest areas situated within 200 meters of all riverbanks and transit points.',
    descriptionKey: 'slideshow.slides.water.description',
    primaryButton: {
      label: 'Find Drinking Water',
      to: '/facilities?category=DRINKING_WATER',
      labelKey: 'slideshow.slides.water.primaryBtn',
      iconName: 'Droplets',
    },
    secondaryButton: {
      label: 'Sanitation Facilities',
      to: '/facilities?category=TOILET',
      labelKey: 'slideshow.slides.water.secondaryBtn',
      iconName: 'Bath',
    },
    attribution: 'Kotilingala Revu Civic Hub',
  },
  {
    id: 'medical',
    image: '/images/slides/medical-emergency-camp.svg',
    fallbackImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1920&q=80',
    alt: 'Emergency 24x7 medical station with ambulances and first responder teams for pilgrims',
    badge: 'Health & Rapid Response',
    badgeKey: 'slideshow.slides.medical.badge',
    heading: '24/7 Medical Care & First-Aid Camps',
    headingKey: 'slideshow.slides.medical.heading',
    subheading: 'Primary Health Centers, ORS Hydration & 108 Ambulances',
    subheadingKey: 'slideshow.slides.medical.subheading',
    description:
      'Immediate access to medical assistance, heatstroke recovery units, and emergency helplines connected to district hospitals via dedicated green corridors.',
    descriptionKey: 'slideshow.slides.medical.description',
    primaryButton: {
      label: 'Emergency Helplines',
      to: '/emergency',
      labelKey: 'slideshow.slides.medical.primaryBtn',
      iconName: 'PhoneCall',
    },
    secondaryButton: {
      label: 'Medical Facilities',
      to: '/facilities?category=MEDICAL',
      labelKey: 'slideshow.slides.medical.secondaryBtn',
      iconName: 'HeartPulse',
    },
    attribution: 'Main Riverfront & Kovvur Emergency Posts',
  },
  {
    id: 'heritage',
    image: '/images/slides/godavari-bridges-temple.svg',
    fallbackImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1920&q=80',
    alt: 'Historic Godavari Arch Bridge and ancient temple spires glowing at twilight',
    badge: 'Riverfront Architecture & Connectivity',
    badgeKey: 'slideshow.slides.heritage.badge',
    heading: 'Historic Bridges & Spiritual Landmarks',
    headingKey: 'slideshow.slides.heritage.heading',
    subheading: 'Godavari Arch Bridge, Havelock Walkway & Kovvur Corridor',
    subheadingKey: 'slideshow.slides.heritage.subheading',
    description:
      'Cross the sacred Godavari River with monitored pedestrian pathways, heritage viewpoints, and seamless transit between Rajamahendravaram and Kovvur.',
    descriptionKey: 'slideshow.slides.heritage.description',
    primaryButton: {
      label: 'Explore Corridor Map',
      to: '/map',
      labelKey: 'slideshow.slides.heritage.primaryBtn',
      iconName: 'Compass',
    },
    secondaryButton: {
      label: 'Report Civic Issue',
      to: '/report-issue',
      labelKey: 'slideshow.slides.heritage.secondaryBtn',
      iconName: 'AlertTriangle',
    },
    attribution: 'Rajamahendravaram – Kovvur Bridge Corridor',
  },
];

/**
 * Storage key for custom administrator-configured slides
 */
const STORAGE_KEY = 'geoseva_custom_slides';

/**
 * Retrieves the active slides list.
 * Supports custom admin overrides from localStorage if present; otherwise defaults to `DEFAULT_SLIDES`.
 */
export const getSlides = () => {
  try {
    const custom = localStorage.getItem(STORAGE_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse custom slides from localStorage:', err);
  }
  return DEFAULT_SLIDES;
};

/**
 * Saves a customized slides list (for admin use)
 */
export const saveSlides = (slides) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
    return true;
  } catch (err) {
    console.error('Failed to save slides:', err);
    return false;
  }
};

/**
 * Resets slides to baseline defaults
 */
export const resetSlides = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    return false;
  }
};

