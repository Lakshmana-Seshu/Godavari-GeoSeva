import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  MessageSquare,
  ShieldCheck,
  Radio,
  Sparkles,
} from 'lucide-react';
import { issueApi } from '../api/issueApi';
import { useRealtime } from '../context/RealtimeContext';
import { IssueStatusModal } from '../components/issues/IssueStatusModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ISSUE_STATUS_METADATA, formatDateTime } from '../utils/formatters';

export const IssueManagement = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState(null);

  const { subscribe, isConnected } = useRealtime();

  const fetchIssues = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;

      const res = await issueApi.getIssues(params);
      setIssues(res?.data?.issues || res?.data || []);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Real-time automatic listener for incoming Pilgrim reports
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === 'ISSUE_REPORTED' && event.issue) {
        const incoming = event.issue;
        const incomingId = incoming._id || incoming.id || incoming.referenceCode;
        setNewlyAddedId(incomingId);

        // Prepend directly to list
        setIssues((prev) => {
          const exists = prev.some(
            (i) => i._id === incoming._id || (incoming.referenceCode && i.referenceCode === incoming.referenceCode)
          );
          if (exists) return prev;
          return [incoming, ...prev];
        });

        // Trigger silent background refetch to get populated user fields
        fetchIssues(true);
      } else if (event.type === 'ISSUE_STATUS_UPDATED') {
        fetchIssues(true);
      }
    });

    return () => unsubscribe();
  }, [subscribe, fetchIssues]);

  const handleUpdateStatus = async (id, statusData) => {
    setIsUpdating(true);
    try {
      await issueApi.updateIssueStatus(id, statusData);
      setSelectedIssue(null);
      fetchIssues(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update issue status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
            Grievance Resolution Queue
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Civic Issue Reports & Review
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review crowdsourced pilgrim reports, verify defects, dispatch repair squads, and update resolution statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {isConnected ? 'Real-Time Queue Active' : 'Connecting Stream...'}
          </span>
          <button
            onClick={() => fetchIssues(false)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Reports' : ISSUE_STATUS_METADATA[st]?.label || st}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="DAMAGED_TOILET">Damaged Toilets</option>
            <option value="WATER_UNAVAILABLE">Dry Drinking Water</option>
            <option value="MEDICAL_ACCESS_PROBLEM">Medical Access Issues</option>
            <option value="INCORRECT_FACILITY_LOCATION">Incorrect Location</option>
            <option value="BLOCKED_PEDESTRIAN_ROUTE">Blocked Routes</option>
            <option value="DAMAGED_INFRASTRUCTURE">Damaged Infrastructure</option>
            <option value="MISSING_FACILITY">Missing Facility</option>
            <option value="OTHER">Other Civic Defect</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading submitted grievance reports..." />
      ) : issues.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Reports Found</h3>
          <p className="text-xs text-slate-500">
            There are currently no civic grievances matching the selected filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Incident Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Reported</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((issue) => {
                  const meta = ISSUE_STATUS_METADATA[issue.status] || ISSUE_STATUS_METADATA.SUBMITTED;
                  const coords = issue.location?.coordinates || [81.78, 17.00];
                  const [lng, lat] = coords;
                  const isNew =
                    newlyAddedId &&
                    (newlyAddedId === issue._id ||
                      newlyAddedId === issue.id ||
                      newlyAddedId === issue.referenceCode);

                  return (
                    <tr
                      key={issue._id || issue.referenceCode}
                      className={`transition-all ${
                        isNew
                          ? 'bg-amber-50/80 border-l-4 border-l-amber-500 shadow-xs'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 max-w-sm">
                        <div className="flex items-center gap-2">
                          <strong className="block text-slate-900 font-bold text-sm">
                            {issue.title}
                          </strong>
                          {isNew && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {issue.description}
                        </p>
                        <span className="font-mono text-[10px] text-slate-400 mt-1 block">
                          Ref: {issue.referenceCode || issue._id}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {issue.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {typeof lat === 'number' ? lat.toFixed(4) : lat},{' '}
                        {typeof lng === 'number' ? lng.toFixed(4) : lng}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {formatDateTime(issue.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="px-3 py-1.5 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors shadow-xs"
                        >
                          Review & Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Status Modal */}
      {selectedIssue && (
        <IssueStatusModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};
