import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, X, Radio } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';

export const RealtimeAlertBanner = () => {
  const { activeAlert, dismissAlert, isConnected } = useRealtime();

  if (!activeAlert) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white border-2 border-amber-500/80 rounded-2xl shadow-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  New Incident Reported
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1 leading-snug line-clamp-1">
                {activeAlert.title}
              </h4>
            </div>
          </div>
          <button
            onClick={dismissAlert}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
          <span className="font-mono text-amber-400 font-bold">
            {activeAlert.referenceCode || 'REF-NEW'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={dismissAlert}
              className="px-2.5 py-1 text-slate-400 hover:text-slate-200 text-xs font-semibold"
            >
              Dismiss
            </button>
            <Link
              to="/admin/issues"
              onClick={dismissAlert}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs text-xs"
            >
              <span>Inspect Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

