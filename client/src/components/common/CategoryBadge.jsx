import React from 'react';
import {
  Waves,
  Bath,
  Droplets,
  HeartPulse,
  Home,
  AlertTriangle,
  Navigation,
  MapPin,
} from 'lucide-react';
import { CATEGORY_METADATA } from '../../utils/formatters';

const iconMap = {
  Waves,
  Bath,
  Droplets,
  HeartPulse,
  Home,
  AlertTriangle,
  Navigation,
  MapPin,
};

export const CategoryBadge = ({ category, showIcon = true }) => {
  const meta = CATEGORY_METADATA[category] || CATEGORY_METADATA.OTHER;
  const IconComponent = iconMap[meta.iconName] || MapPin;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${meta.bgColor}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      {meta.label}
    </span>
  );
};
