import React from 'react';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';
import { formatDateTime } from '../../utils/formatters';

export const OfflineBanner = () => {
  const { isOnline, lastCachedAt } = useOffline();

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2.5 text-xs font-medium shadow-md sticky top-16 z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-200" />
          <span>
            <strong>Offline Mode:</strong> You are currently disconnected from the network. Showing previously cached facilities data.
            {lastCachedAt && (
              <span className="ml-1 opacity-90">
                (Snapshot from {formatDateTime(lastCachedAt)})
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-amber-100 italic">
            New reports or status changes will sync when connection returns.
          </span>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white text-[11px] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};
