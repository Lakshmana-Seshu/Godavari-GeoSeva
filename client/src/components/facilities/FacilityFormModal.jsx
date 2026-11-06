import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, Locate, AlertCircle, Info } from 'lucide-react';
import { CATEGORY_METADATA } from '../../utils/formatters';

export const FacilityFormModal = ({
  facility = null,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  userLocation = null,
}) => {
  const isEdit = !!facility;

  const [formData, setFormData] = useState({
    name: '',
    category: 'GHAT',
    description: '',
    latitude: '17.0005',
    longitude: '81.7800',
    address: '',
    operationalStatus: 'OPEN',
    verificationStatus: 'PENDING_VERIFICATION',
    accessibility: '',
    openingHours: '24 Hours',
    contactInformation: '',
    capacity: '',
    dataSource: 'FIELD_SURVEY',
  });

  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (facility) {
      const [lng, lat] = facility.location.coordinates;
      setFormData({
        name: facility.name || '',
        category: facility.category || 'GHAT',
        description: facility.description || '',
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: facility.address || '',
        operationalStatus: facility.operationalStatus || 'OPEN',
        verificationStatus: facility.verificationStatus || 'VERIFIED',
        accessibility: facility.accessibility || '',
        openingHours: facility.openingHours || '',
        contactInformation: facility.contactInformation || '',
        capacity: facility.capacity ? facility.capacity.toString() : '',
        dataSource: facility.dataSource || 'OFFICIAL_MUNICIPAL',
      });
    } else {
      setFormData({
        name: '',
        category: 'GHAT',
        description: '',
        latitude: userLocation ? userLocation.lat.toFixed(6) : '17.0005',
        longitude: userLocation ? userLocation.lng.toFixed(6) : '81.7800',
        address: '',
        operationalStatus: 'OPEN',
        verificationStatus: 'PENDING_VERIFICATION',
        accessibility: '',
        openingHours: '24 Hours',
        contactInformation: '',
        capacity: '',
        dataSource: 'FIELD_SURVEY',
      });
    }
    setFormError(null);
  }, [facility, isOpen, userLocation]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const useCurrentGps = () => {
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        latitude: userLocation.lat.toFixed(6),
        longitude: userLocation.lng.toFixed(6),
      }));
    } else {
      alert('Current location not detected. Please enable GPS.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setFormError('Please enter a valid latitude (-90 to 90).');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setFormError('Please enter a valid longitude (-180 to 180).');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description.trim(),
      latitude: lat,
      longitude: lng,
      address: formData.address.trim(),
      operationalStatus: formData.operationalStatus,
      verificationStatus: formData.verificationStatus,
      accessibility: formData.accessibility.trim(),
      openingHours: formData.openingHours.trim(),
      contactInformation: formData.contactInformation.trim(),
      capacity: formData.capacity ? parseInt(formData.capacity, 10) : undefined,
      dataSource: formData.dataSource,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEdit ? 'Edit Civic Facility' : 'Register New Civic Facility'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? 'Update operational status or specifications for official pushkaralu records'
                  : 'Add a verified or field-surveyed facility to the Godavari GIS database'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facility Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Kotilingala Ghat - Sector A"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                >
                  {Object.entries(CATEGORY_METADATA).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Facilities Offered
              </label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="Details on facilities, changing rooms, ramp access, safety barricades..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  Geospatial Coordinates (WGS84 GeoJSON)
                </span>
                {userLocation && (
                  <button
                    type="button"
                    onClick={useCurrentGps}
                    className="flex items-center gap-1 text-[11px] font-semibold text-river-600 hover:text-river-800"
                  >
                    <Locate className="w-3.5 h-3.5" />
                    Fill GPS Coordinates
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Latitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    required
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="17.000500"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Longitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    required
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="81.780000"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Locality / Road Access / Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Near Kotilingala Temple, Bund Road, Rajamahendravaram"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            {/* Operational & Verification Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operational Status
                </label>
                <select
                  name="operationalStatus"
                  value={formData.operationalStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                >
                  <option value="OPEN">OPEN / Fully Operational</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
                  <option value="UNKNOWN">Status Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Verification Status
                </label>
                <select
                  name="verificationStatus"
                  value={formData.verificationStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                >
                  <option value="VERIFIED">VERIFIED by Authority</option>
                  <option value="PENDING_VERIFICATION">Pending Field Verification</option>
                  <option value="UNVERIFIED">UNVERIFIED (Community)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>

            {/* Hours, Contact, Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  placeholder="24 Hours or 04:00 - 22:00"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact / Helpline
                </label>
                <input
                  type="text"
                  name="contactInformation"
                  value={formData.contactInformation}
                  onChange={handleChange}
                  placeholder="+91 883 244XXXX"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            {/* Accessibility and Data Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accessibility Accommodations
                </label>
                <input
                  type="text"
                  name="accessibility"
                  value={formData.accessibility}
                  onChange={handleChange}
                  placeholder="Wheelchair ramp, braille signage, elderly seating..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Data Source Classification
                </label>
                <select
                  name="dataSource"
                  value={formData.dataSource}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                >
                  <option value="OFFICIAL_MUNICIPAL">Official Municipal Master Plan</option>
                  <option value="FIELD_SURVEY">Pushkaralu Volunteer Field Survey</option>
                  <option value="CROWDSOURCED">Crowdsourced Pilgrim Report</option>
                  <option value="SYNTHETIC_DEMO">Synthetic Hackathon Demo Data</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-800 text-white rounded-lg text-xs font-bold hover:bg-teal-900 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-saffron-400" />
              <span>{isSubmitting ? 'Saving to Database...' : isEdit ? 'Save Changes' : 'Create Facility'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
