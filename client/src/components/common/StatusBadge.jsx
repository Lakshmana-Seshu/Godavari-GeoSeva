import React from 'react';
import { OPERATIONAL_STATUS_METADATA } from '../../utils/formatters';

export const StatusBadge = ({ status }) => {
  const meta = OPERATIONAL_STATUS_METADATA[status] || OPERATIONAL_STATUS_METADATA.UNKNOWN;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: meta.indicatorColor }}
      />
      {meta.label}
    </span>
  );
};
