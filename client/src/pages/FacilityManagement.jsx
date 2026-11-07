import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { facilityApi } from '../api/facilityApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { FacilityFormModal } from '../components/facilities/FacilityFormModal';
import { FacilityDetailModal } from '../components/facilities/FacilityDetailModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  formatDateTime,
  CATEGORY_METADATA,
  getFacilityImage,
  CATEGORY_DEFAULT_IMAGES,
} from '../utils/formatters';

export const FacilityManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [operationalStatus, setOperationalStatus] = useState('ALL');
  const [verificationStatus, setVerificationStatus] = useState('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [detailFacility, setDetailFacility] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setEditingFacility(null);
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const fetchFacilities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { limit: 200 };
      if (search.trim()) params.search = search.trim();
      if (category !== 'ALL') params.category = category;
      if (operationalStatus !== 'ALL') params.operationalStatus = operationalStatus;
      if (verificationStatus !== 'ALL') params.verificationStatus = verificationStatus;

      const res = await facilityApi.getFacilities(params);
      const list = Array.isArray(res?.data?.facilities)
        ? res.data.facilities
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.facilities)
        ? res.facilities
        : [];
      setFacilities(list);
    } catch (err) {
      setError('Failed to fetch facilities from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [category, operationalStatus, verificationStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFacilities();
  };

  const handleCreateOrUpdate = async (payload) => {
    setIsSubmitting(true);
    try {
      if (editingFacility) {
        await facilityApi.updateFacility(editingFacility._id, payload);
      } else {
        await facilityApi.createFacility(payload);
      }
      setIsFormOpen(false);
      setEditingFacility(null);
      fetchFacilities();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save facility record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate or remove "${name}" from the GIS database?`)) {
      try {
        await facilityApi.deleteFacility(id);
        fetchFacilities();
      } catch (err) {
        alert('Failed to delete facility.');
      }
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await facilityApi.updateFacility(id, { operationalStatus: newStatus });
      fetchFacilities();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleQuickVerify = async (id, newVerification) => {
    try {
      await facilityApi.updateFacility(id, { verificationStatus: newVerification });
      fetchFacilities();
    } catch (err) {
      alert('Failed to update verification status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
            GIS Master Inventory
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Facility Infrastructure Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update, ground-verify, and deactivate civic infrastructure records.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingFacility(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-800 text-white rounded-xl text-xs font-bold hover:bg-teal-900 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-saffron-400" />
          Register New Facility
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-card">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facilities by name, locality, or landmark..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(CATEGORY_METADATA).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Operational Status
            </label>
            <select
              value={operationalStatus}
              onChange={(e) => setOperationalStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN Only</option>
              <option value="CLOSED">CLOSED Only</option>
              <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
              <option value="UNKNOWN">Status Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Verification State
            </label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Verification States</option>
              <option value="VERIFIED">Verified by Authority</option>
              <option value="PENDING_VERIFICATION">Pending Field Survey</option>
              <option value="UNVERIFIED">Unverified Community Entry</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Facilities Table */}
      {isLoading ? (
        <LoadingSpinner message="Querying facilities collection..." />
      ) : facilities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Facilities Match Filter</h3>
          <p className="text-xs text-slate-500">
            Adjust search keywords or register a new facility above.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Photo & Facility</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Operational Status</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Coordinates</th>
                  <th className="py-3 px-4">Last Verified</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilities.map((fac) => {
                  const [lng, lat] = fac.location?.coordinates || [81.7770, 17.0028];
                  const photoSrc = getFacilityImage(fac);
                  return (
                    <tr key={fac._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setDetailFacility(fac)}
                            className="relative w-14 h-12 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 group cursor-pointer shadow-2xs hover:ring-2 hover:ring-teal-600 transition-all bg-slate-100"
                            title="Click to view facility photo"
                          >
                            <img
                              src={photoSrc}
                              alt={fac.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const fallback =
                                  CATEGORY_DEFAULT_IMAGES[fac?.category?.toUpperCase()] ||
                                  '/images/facilities/default-facility.svg';
                                if (e.target.src !== fallback) {
                                  e.target.src = fallback;
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Eye className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 drop-shadow transition-opacity" />
                            </div>
                          </button>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setDetailFacility(fac)}
                              className="text-left font-bold text-slate-900 text-sm hover:text-teal-800 transition-colors block truncate max-w-xs"
                            >
                              {fac.name}
                            </button>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{fac.address || 'Godavari Corridor'}</span>
                            </span>
                            {fac.dataSource === 'SYNTHETIC_DEMO' && (
                              <span className="inline-block mt-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                Demo Data
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <CategoryBadge category={fac.category} />
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={fac.operationalStatus}
                          onChange={(e) => handleQuickStatusChange(fac._id, e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-teal-700"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="CLOSED">CLOSED</option>
                          <option value="TEMPORARILY_UNAVAILABLE">UNAVAILABLE</option>
                          <option value="UNKNOWN">UNKNOWN</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={fac.verificationStatus}
                          onChange={(e) => handleQuickVerify(fac._id, e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-teal-700"
                        >
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="PENDING_VERIFICATION">PENDING</option>
                          <option value="UNVERIFIED">UNVERIFIED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {formatDateTime(fac.lastVerifiedAt)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailFacility(fac)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingFacility(fac);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700"
                            title="Edit Facility"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(fac._id, fac.name)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                            title="Deactivate Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <FacilityFormModal
        isOpen={isFormOpen}
        facility={editingFacility}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFacility(null);
        }}
        onSubmit={handleCreateOrUpdate}
        isSubmitting={isSubmitting}
      />

      {/* Details Modal */}
      {detailFacility && (
        <FacilityDetailModal
          facility={detailFacility}
          onClose={() => setDetailFacility(null)}
        />
      )}
    </div>
  );
};
