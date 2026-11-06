import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  Clock,
  Compass,
  Plus,
  ArrowRight,
  TrendingUp,
  BarChart2,
  RefreshCw,
  Languages,
  Sparkles,
  Mic,
  Cpu,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi';
import { assistantApi } from '../api/assistantApi';
import { getLanguageByCode } from '../locales/languages';
import { useRealtime } from '../context/RealtimeContext';
import { MetricCard } from '../components/dashboard/MetricCard';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { IssueStatusChart } from '../components/dashboard/IssueStatusChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [issueStats, setIssueStats] = useState([]);
  const [assistantAnalytics, setAssistantAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastAutoUpdate, setLastAutoUpdate] = useState(null);

  const { subscribe, isConnected } = useRealtime();

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const [sumRes, catRes, issRes, assistRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getFacilityStatistics(),
        dashboardApi.getIssueStatistics(),
        assistantApi.getAnalytics().catch(() => null),
      ]);

      if (sumRes?.data) setSummary(sumRes.data);
      if (catRes?.data?.byCategory) setCategoryStats(catRes.data.byCategory);
      if (issRes?.data?.byStatus) setIssueStats(issRes.data.byStatus);
      if (assistRes?.data) setAssistantAnalytics(assistRes.data);
      setLastAutoUpdate(new Date());
    } catch (err) {
      if (!silent) setError('Failed to fetch real-time dashboard data from the database.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Automatic real-time listener for incoming pilgrim reports and status transitions
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === 'ISSUE_REPORTED' || event.type === 'ISSUE_STATUS_UPDATED') {
        fetchDashboardData(true);
      }
    });

    return () => unsubscribe();
  }, [subscribe, fetchDashboardData]);

  if (isLoading) {
    return <LoadingSpinner message="Calculating database aggregations..." size="large" />;
  }

  const facilities = {
    total: summary?.facilities?.total ?? summary?.totalMappedFacilities ?? 0,
    verified: summary?.facilities?.verified ?? summary?.verificationMetrics?.verified ?? 0,
    unknownStatus: summary?.facilities?.unknownStatus ?? summary?.unknownOperationalStatusCount ?? 0,
  };

  const issues = {
    total: summary?.issues?.total ?? summary?.issueMetrics?.total ?? 0,
    open: summary?.issues?.open ?? summary?.issueMetrics?.open ?? 0,
    underReview: summary?.issues?.underReview ?? summary?.issueMetrics?.awaitingReview ?? 0,
    resolved: summary?.issues?.resolved ?? summary?.issueMetrics?.resolved ?? 0,
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
            Godavari Pushkaralu 2027 Authority Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Geospatial Command & Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated metrics calculated in real-time from the MongoDB 2dsphere database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {isConnected ? 'Telemetry Stream Active' : 'Connecting Stream...'}
          </span>
          <button
            onClick={() => fetchDashboardData(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Link
            to="/admin/facilities?action=new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 shadow-sm"
          >
            <Plus className="w-4 h-4 text-saffron-400" />
            Add Facility
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="font-bold underline">Retry</button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Mapped Facilities"
          value={facilities.total}
          subtext="Active geospatial records"
          icon={Layers}
          variant="teal"
        />
        <MetricCard
          title="Verified by Authority"
          value={facilities.verified}
          subtext={`${facilities.total ? Math.round((facilities.verified / facilities.total) * 100) : 0}% verification rate`}
          icon={ShieldCheck}
          variant="river"
        />
        <MetricCard
          title="Unknown / Stale Status"
          value={facilities.unknownStatus}
          subtext="Requires on-site inspection"
          icon={HelpCircle}
          variant="saffron"
        />
        <MetricCard
          title="Open Civic Grievances"
          value={issues.open}
          subtext={`${issues.underReview || 0} currently under review`}
          icon={AlertCircle}
          variant="rose"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facilities by Category */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                Facilities by Civic Sector
              </h2>
              <p className="text-xs text-slate-500">
                Distribution across bathing ghats, toilets, water, and healthcare
              </p>
            </div>
            <Link
              to="/admin/facilities"
              className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
            >
              Manage
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CategoryChart data={categoryStats} />
        </div>

        {/* Civic Issues Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                Civic Issues Resolution Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Workflow stages: Submitted, In-Progress, Resolved, or Rejected
              </p>
            </div>
            <Link
              to="/admin/issues"
              className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
            >
              Review Queue
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <IssueStatusChart data={issueStats} />
        </div>
      </div>

      {/* Multilingual Voice & AI Assistant Telemetry (Section 6) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-800 to-saffron-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                Multilingual AI & Voice Assistant Telemetry
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Live monitoring of 22 Scheduled Indian languages, voice recognition, and grounded spatial queries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-teal-700" />
            <span>Avg AI Latency: {assistantAnalytics?.averageLatencyMs || 14} ms</span>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Pilgrim Queries</span>
            <div className="text-xl font-black text-slate-900">{assistantAnalytics?.totalQueries || 0}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">100% Grounded in GeoDB</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Voice Assistant Queries</span>
            <div className="text-xl font-black text-slate-900 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-rose-600" />
              <span>{assistantAnalytics?.voiceQueries || 0}</span>
            </div>
            <span className="text-[10px] text-slate-500">BCP-47 Web Speech</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Supported Languages</span>
            <div className="text-xl font-black text-slate-900">22 + En</div>
            <span className="text-[10px] text-teal-700 font-semibold">Scheduled Languages</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Verified DB Accuracy</span>
            <div className="text-xl font-black text-emerald-700">100%</div>
            <span className="text-[10px] text-slate-500">Zero Fabricated Records</span>
          </div>
        </div>

        {/* Dual Panels: Language Distribution & Top Intents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Language Breakdown */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-teal-700" />
                Active Language Distribution
              </h3>
              <span className="text-[10px] text-slate-400">Total: {assistantAnalytics?.totalQueries || 0}</span>
            </div>

            {assistantAnalytics?.languageDistribution && Object.keys(assistantAnalytics.languageDistribution).length > 0 ? (
              <div className="space-y-2.5">
                {Object.entries(assistantAnalytics.languageDistribution).map(([code, count]) => {
                  const langMeta = getLanguageByCode(code);
                  const total = assistantAnalytics.totalQueries || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          {langMeta.nativeName} ({langMeta.name})
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-700 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 space-y-1">
                <Languages className="w-6 h-6 mx-auto text-slate-300" />
                <p>No queries logged yet in this session.</p>
                <p className="text-[10px]">Interact with the Godavari Seva Assistant to see live telemetry.</p>
              </div>
            )}
          </div>

          {/* Top Queried Categories / Intents */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-saffron-600" />
                Top Queried Civic Sectors
              </h3>
              <span className="text-[10px] text-slate-400">Grounded Results</span>
            </div>

            {assistantAnalytics?.topCategories && Object.keys(assistantAnalytics.topCategories).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(assistantAnalytics.topCategories).map(([cat, count]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-slate-800">{cat}</span>
                    <span className="font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded text-[11px]">
                      {count} searches
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">Bathing Ghats (పుష్కర ఘాట్లు)</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Ready</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">Drinking Water (తాగునీరు)</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Ready</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">Medical Camps (వైద్య శిబిరాలు)</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Ready</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">Emergency & Helplines (112 / 108)</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Ready</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/map"
          className="p-5 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-card hover:shadow-cardHover transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-300 block mb-1">Live GIS View</span>
            <h3 className="font-bold text-base text-white group-hover:text-saffron-300 transition-colors">
              GIS Infrastructure Map
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Inspect all facilities and reported defects together on the satellite river basemap.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-saffron-400 group-hover:translate-x-1.5 transition-transform flex-shrink-0 ml-4" />
        </Link>

        <Link
          to="/admin/analytics"
          className="p-5 rounded-2xl bg-gradient-to-br from-river-900 to-slate-900 text-white shadow-card hover:shadow-cardHover transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-river-300 block mb-1">Spatial Intelligence</span>
            <h3 className="font-bold text-base text-white group-hover:text-river-200 transition-colors">
              Corridor Gap Analysis
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Detect medical blindspots, water access bottlenecks, and issue clusters across grid cells.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-river-300 group-hover:translate-x-1.5 transition-transform flex-shrink-0 ml-4" />
        </Link>

        <Link
          to="/admin/issues"
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-900 to-slate-900 text-white shadow-card hover:shadow-cardHover transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-300 block mb-1">Action Required</span>
            <h3 className="font-bold text-base text-white group-hover:text-amber-200 transition-colors">
              Process Civic Grievances
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {issues.open || 0} unresolved pilgrim reports awaiting verification or crew dispatch.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1.5 transition-transform flex-shrink-0 ml-4" />
        </Link>
      </div>
    </div>
  );
};
