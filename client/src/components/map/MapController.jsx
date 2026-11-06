import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const MapController = ({ center, zoom, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } catch (err) {
        // Fallback to center if bounds invalid
        if (center) {
          map.setView(center, zoom || 14);
        }
      }
    } else if (center) {
      map.setView(center, zoom || 14, { animate: true });
    }
  }, [map, center, zoom, bounds]);

  return null;
};
