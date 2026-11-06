import React from 'react';
import { ShieldCheck, Clock, HelpCircle, XCircle } from 'lucide-react';
import { VERIFICATION_STATUS_METADATA } from '../../utils/formatters';

export const VerificationBadge = ({ status }) => {
  const meta = VERIFICATION_STATUS_METADATA[status] || VERIFICATION_STATUS_METADATA.UNVERIFIED;

  const renderIcon = () => {
    switch (status) {
      case 'VERIFIED':
        return <ShieldCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />;
      case 'PENDING_VERIFICATION':
        return <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />;
      case 'REJECTED':
        return <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.badgeClass}`}
    >
      {renderIcon()}
      {meta.label}
    </span>
  );
};
