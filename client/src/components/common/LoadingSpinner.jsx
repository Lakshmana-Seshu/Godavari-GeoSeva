import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading geospatial data...', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} text-teal-700 animate-spin mb-3`} />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
};
