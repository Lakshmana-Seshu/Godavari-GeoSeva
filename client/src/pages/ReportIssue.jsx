import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  MapPin,
  Locate,
  Upload,
  CheckCircle,
  Copy,
  ArrowRight,
  ShieldAlert,
  Info,
  Check,
  Compass,
  FileText,
  Phone,
  User,
} from 'lucide-react';
import { issueApi } from '../api/issueApi';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRealtime } from '../context/RealtimeContext';

export const ReportIssue = () => {
  const { isLocating, getCurrentLocation } = useGeolocation();
  const { broadcastLocalEvent } = useRealtime();

  const [formData, setFormData] = useState({
    category: 'DAMAGED_TOILET',
    title: '',
    description: '',
    latitude: '17.0005',
    longitude: '81.7800',
    address: '',
    reporterName: '',
    reporterPhone: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const issueCategories = [
    { value: 'DAMAGED_TOILET', label: 'Damaged / Overflowing Toilet' },
    { value: 'WATER_UNAVAILABLE', label: 'Unavailable / Dry Drinking Water Point' },
    { value: 'MEDICAL_ACCESS_PROBLEM', label: 'Medical Post Access / Stretcher Bottleneck' },
    { value: 'INCORRECT_FACILITY_LOCATION', label: 'Incorrect Facility Location on Map' },
    { value: 'BLOCKED_PEDESTRIAN_ROUTE', label: 'Blocked Route / Barricade Hazard' },
    { value: 'DAMAGED_INFRASTRUCTURE', label: 'Broken Railing / Unsafe River Steps' },
    { value: 'MISSING_FACILITY', label: 'Missing Emergency Signage / Facility' },
    { value: 'OTHER', label: 'Other Civic Defect' },
  ];

  const presets = [
    { name: 'Pushkar Ghat Central', lat: '16.9965', lng: '81.7790' },
    { name: 'Kotilingala Ghat', lat: '17.0145', lng: '81.7820' },
    { name: 'Goshpada Ghat (Kovvur)', lat: '17.0150', lng: '81.7285' },
    { name: 'Godavari Arch Bridge Corridor', lat: '17.0010', lng: '81.7650' },
  ];

  // Validate a single field
  const validateField = (name, value) => {
    switch (name) {
      case 'title': {
        const trimmed = (value || '').trim();
        if (!trimmed) return 'Issue title is required.';
        if (trimmed.length < 3) return 'Title must be at least 3 characters long.';
        if (trimmed.length > 150) return 'Title cannot exceed 150 characters.';
        return null;
      }
      case 'description': {
        const trimmed = (value || '').trim();
        if (!trimmed) return 'Detailed description is required.';
        if (trimmed.length < 5) return 'Description must be at least 5 characters long.';
        if (trimmed.length > 2000) return 'Description cannot exceed 2000 characters.';
        return null;
      }
      case 'category': {
        if (!value) return 'Please select an issue category.';
        return null;
      }
      case 'latitude': {
        const lat = parseFloat(value);
        if (isNaN(lat)) return 'Latitude must be a valid number.';
        if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90 degrees.';
        return null;
      }
      case 'longitude': {
        const lng = parseFloat(value);
        if (isNaN(lng)) return 'Longitude must be a valid number.';
        if (lng < -180 || lng > 180) return 'Longitude must be between -180 and 180 degrees.';
        return null;
      }
      case 'reporterPhone': {
        const trimmed = (value || '').trim();
        if (trimmed && !/^[+0-9\s-]{7,15}$/.test(trimmed)) {
          return 'Please enter a valid phone number (or leave blank).';
        }
        return null;
      }
      default:
        return null;
    }
  };

  // Run validation for the whole form
  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) errors[key] = err;
    });
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation if field has been touched
    if (touched[name]) {
      const err = validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: err,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: err,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({
          ...prev,
          photo: 'Photograph size must be under 5MB.',
        }));
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setFieldErrors((prev) => ({
          ...prev,
          photo: 'Only JPG, PNG, and WebP images are supported.',
        }));
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setFieldErrors((prev) => ({ ...prev, photo: null }));
    }
  };

  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      latitude: preset.lat,
      longitude: preset.lng,
    }));
    setFieldErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
    setTouched((prev) => ({ ...prev, latitude: true, longitude: true }));
  };

  const handleUseGps = async () => {
    try {
      const coords = await getCurrentLocation();
      setFormData((prev) => ({
        ...prev,
        latitude: coords.lat.toFixed(6),
        longitude: coords.lng.toFixed(6),
      }));
      setFieldErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
      setTouched((prev) => ({ ...prev, latitude: true, longitude: true }));
    } catch (err) {
      setFieldErrors((prev) => ({
        ...prev,
        latitude: 'Could not retrieve GPS coordinates. Please grant location permissions.',
      }));
    }
  };

  // Check if coordinates are in the Rajamahendravaram-Kovvur Godavari corridor
  const latNum = parseFloat(formData.latitude);
  const lngNum = parseFloat(formData.longitude);
  const isOutsideCorridor =
    !isNaN(latNum) &&
    !isNaN(lngNum) &&
    (latNum < 16.85 || latNum > 17.15 || lngNum < 81.65 || lngNum > 81.88);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage('Please fix the highlighted validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('category', formData.category);
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('latitude', latNum);
      data.append('longitude', lngNum);

      if (formData.address.trim()) {
        data.append('address', formData.address.trim());
      }
      if (formData.reporterName.trim()) {
        data.append('reporterName', formData.reporterName.trim());
      }
      if (formData.reporterPhone.trim()) {
        data.append('reporterPhone', formData.reporterPhone.trim());
      }
      if (photo) {
        data.append('photo', photo);
      }

      const res = await issueApi.reportIssue(data, true);

      const issuePayload =
        res?.data?.issue || res?.data || res?.issue || { referenceCode: res?.referenceCode };
      setSubmitSuccess(issuePayload);

      // Instant cross-tab real-time dispatch to Admin & Volunteer views
      broadcastLocalEvent({
        type: 'ISSUE_REPORTED',
        action: 'CREATE',
        issue: issuePayload,
        summary: `New civic report: "${formData.title}" (${formData.category})`,
        referenceCode: issuePayload.referenceCode,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const backendErrors = {};
        err.response.data.errors.forEach((eItem) => {
          backendErrors[eItem.field] = eItem.message;
        });
        setFieldErrors((prev) => ({ ...prev, ...backendErrors }));
        setErrorMessage(
          err.response.data.message || 'Validation failed. Please correct the indicated fields.'
        );
      } else {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Failed to submit report. Please check server connectivity.';
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefId = () => {
    const code = submitSuccess?.referenceCode || submitSuccess?._id || submitSuccess?.id;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Civic Grievance & Rapid Infrastructure Response
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Report a Pushkaralu Civic Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Help nodal authorities and field volunteers spot broken toilets, dry drinking water points, or blocked pathways along the Rajamahendravaram–Kovvur river corridor.
        </p>
      </div>

      {submitSuccess ? (
        /* Submission Confirmation Card */
        <div className="bg-white rounded-3xl border border-teal-200 shadow-xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Civic Report Successfully Registered!
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your grievance has been logged with coordinates into the Godavari GeoSeva operational queue. Pushkaralu field volunteers and civic engineering teams will review and verify this location.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Unique Report Reference Tracking ID
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-lg font-black text-teal-900">
                {submitSuccess.referenceCode || submitSuccess._id || submitSuccess.id}
              </span>
              <button
                type="button"
                onClick={copyRefId}
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 text-xs font-medium"
                title="Copy Reference"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied && <span className="text-[11px] text-emerald-600 font-semibold">Copied!</span>}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Save this reference ID to track status updates with the Pushkaralu helpline desk or review status online.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess(null);
                setFormData({
                  category: 'DAMAGED_TOILET',
                  title: '',
                  description: '',
                  latitude: '17.0005',
                  longitude: '81.7800',
                  address: '',
                  reporterName: '',
                  reporterPhone: '',
                });
                setPhoto(null);
                setPhotoPreview(null);
                setFieldErrors({});
                setTouched({});
              }}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Submit Another Report
            </button>
            <Link
              to="/map"
              className="px-5 py-2.5 bg-teal-800 text-white rounded-xl text-xs font-bold hover:bg-teal-900 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <span>View on Interactive GIS Map</span>
              <ArrowRight className="w-3.5 h-3.5 text-saffron-400" />
            </Link>
          </div>
        </div>
      ) : (
        /* Issue Submission Form */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
          {/* Top error banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Submission Incomplete:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Issue Category <span className="text-rose-500">*</span>
                </label>
                {fieldErrors.category && (
                  <span className="text-xs text-rose-600 font-medium">{fieldErrors.category}</span>
                )}
              </div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  fieldErrors.category ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white text-sm font-medium`}
              >
                {issueCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Short Summary Title <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formData.title.length}/150
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Drinking Water Tap 3 Leaking and dry near Kotilingala Ghat"
                  maxLength={150}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    fieldErrors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm`}
                />
              </div>
              {fieldErrors.title && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formData.description.length}/2000
                </span>
              </div>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={2000}
                placeholder="Describe the exact location, visual landmarks, extent of damage, safety hazards for pilgrims, or special assistance needed..."
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  fieldErrors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm`}
              />
              {fieldErrors.description && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.description}
                </p>
              )}
            </div>

            {/* Geolocation Section */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-700" />
                    Exact Incident Coordinates (WGS84) <span className="text-rose-500">*</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pinpoint where the defect is located so volunteer dispatchers can find it immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={isLocating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-river-50 text-river-800 border border-river-300 rounded-lg text-xs font-semibold hover:bg-river-100 transition-colors self-start cursor-pointer"
                >
                  <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Acquiring GPS...' : 'Use My Current GPS'}</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3 h-3 text-teal-700" />
                  Quick Corridor Location Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 text-slate-700 font-medium transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coordinate Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Latitude (-90 to +90) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-lg border ${
                      fieldErrors.latitude ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    } bg-white focus:outline-none focus:ring-2 focus:ring-teal-700`}
                  />
                  {fieldErrors.latitude && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">
                      {fieldErrors.latitude}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Longitude (-180 to +180) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-lg border ${
                      fieldErrors.longitude ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    } bg-white focus:outline-none focus:ring-2 focus:ring-teal-700`}
                  />
                  {fieldErrors.longitude && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">
                      {fieldErrors.longitude}
                    </p>
                  )}
                </div>
              </div>

              {/* Corridor proximity notice */}
              {isOutsideCorridor && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>
                    Note: Coordinates are outside the primary Rajamahendravaram–Kovvur event corridor. You can select one of the quick presets above if testing locally.
                  </span>
                </div>
              )}

              {/* Optional Address / Landmark */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Street Address / Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Near Gate 3, Kotilingala Revu, Northern Bank"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            {/* Optional Contact Information */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Reporter Contact (Optional — kept confidential)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="reporterName"
                      value={formData.reporterName}
                      onChange={handleChange}
                      placeholder="e.g. Anjali Devi"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="reporterPhone"
                      value={formData.reporterPhone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+91 98480 12345"
                      className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border ${
                        fieldErrors.reporterPhone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      } bg-white focus:outline-none focus:ring-2 focus:ring-teal-700`}
                    />
                  </div>
                  {fieldErrors.reporterPhone && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">
                      {fieldErrors.reporterPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Photograph Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Attach Supporting Photo (Optional, Max 5MB)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-600 transition-colors">
                {photoPreview ? (
                  <div className="space-y-3">
                    <img
                      src={photoPreview}
                      alt="Issue preview"
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-medium text-slate-700">
                      Click to upload photograph from camera or device
                    </p>
                    <p className="text-[10px] text-slate-400">
                      JPEG, PNG or WebP images supported up to 5MB.
                    </p>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/jpg"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {fieldErrors.photo && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.photo}
                </p>
              )}
            </div>

            {/* Privacy & Anti-spam disclaimer */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Pushkaralu 2027 Operations Safeguard:</strong> Personal contact details are confidential and not displayed on the public map. Submitted reports enter the verification pipeline where volunteers and nodal officers validate reports before dispatching repair units.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Registering Report...' : 'Submit Civic Grievance'}</span>
              <ArrowRight className="w-4 h-4 text-saffron-400" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
