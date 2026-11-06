import { Facility } from '../models/Facility.js';
import { calculateDistanceMeters } from '../services/geoSpatialService.js';
import { logAudit } from '../services/auditService.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.js';

export const getFacilities = async (req, res, next) => {
  try {
    const {
      category,
      operationalStatus,
      verificationStatus,
      search,
      page = 1,
      limit = DEFAULT_PAGE_SIZE,
      includeInactive = false
    } = req.query;

    const filter = {};

    // By default, only show active facilities unless admin asks
    if (!includeInactive || req.user?.role !== 'ADMIN') {
      filter.isActive = true;
    }

    if (category) {
      filter.category = category;
    }

    if (operationalStatus) {
      filter.operationalStatus = operationalStatus;
    }

    if (verificationStatus) {
      filter.verificationStatus = verificationStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { landmark: searchRegex },
        { description: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit, 10) || DEFAULT_PAGE_SIZE));
    const skip = (pageNum - 1) * limitNum;

    const [facilities, totalCount] = await Promise.all([
      Facility.find(filter)
        .populate('createdBy', 'name role')
        .populate('updatedBy', 'name role')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Facility.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        facilities,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalCount / limitNum)
        }
      },
      facilities,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyFacilities = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5000, category, status, verifiedOnly } = req.query;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const maxDist = parseInt(radius, 10) || 5000;

    const filter = {
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDist
        }
      }
    };

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.operationalStatus = status;
    }

    if (verifiedOnly === true || verifiedOnly === 'true') {
      filter.verificationStatus = 'VERIFIED';
    }

    const facilities = await Facility.find(filter)
      .limit(50)
      .populate('createdBy', 'name role')
      .lean();

    // Attach calculated distance in meters
    const facilitiesWithDistance = facilities.map((fac) => {
      const [fLng, fLat] = fac.location.coordinates;
      const distanceMeters = calculateDistanceMeters(lat, lng, fLat, fLng);
      return {
        ...fac,
        distanceMeters,
        distanceKm: Number((distanceMeters / 1000).toFixed(2))
      };
    });

    return res.status(200).json({
      success: true,
      count: facilitiesWithDistance.length,
      radiusMeters: maxDist,
      searchCenter: { latitude: lat, longitude: lng },
      data: {
        facilities: facilitiesWithDistance
      },
      facilities: facilitiesWithDistance
    });
  } catch (error) {
    next(error);
  }
};

export const getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id)
      .populate('createdBy', 'name email role organization')
      .populate('updatedBy', 'name email role organization');

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: facility
    });
  } catch (error) {
    next(error);
  }
};

export const createFacility = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description,
      latitude,
      longitude,
      address,
      landmark,
      operationalStatus,
      verificationStatus,
      accessibility,
      openingHours,
      contactInformation,
      capacity,
      dataSource
    } = req.body;

    // Field volunteers submit as PENDING_VERIFICATION; only Admins can directly set VERIFIED
    let initialVerification = 'PENDING_VERIFICATION';
    if (req.user.role === 'ADMIN' && verificationStatus) {
      initialVerification = verificationStatus;
    }

    const newFacility = await Facility.create({
      name,
      category,
      description,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // GeoJSON: [lng, lat]
      },
      address,
      landmark,
      operationalStatus: operationalStatus || 'UNKNOWN',
      verificationStatus: initialVerification,
      accessibility,
      openingHours,
      contactInformation,
      capacity,
      dataSource: dataSource || (req.user.role === 'ADMIN' ? 'Pushkaralu Organizing Committee' : 'Field Volunteer Report'),
      lastVerifiedAt: initialVerification === 'VERIFIED' ? new Date() : null,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await logAudit({
      actor: req.user,
      action: 'FACILITY_CREATE',
      resourceType: 'Facility',
      resourceId: newFacility._id,
      changeSummary: `Created facility: "${name}" (${category}) with status ${newFacility.verificationStatus}`,
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Facility registered successfully',
      data: newFacility
    });
  } catch (error) {
    next(error);
  }
};

export const updateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    const {
      name,
      category,
      description,
      latitude,
      longitude,
      address,
      landmark,
      operationalStatus,
      verificationStatus,
      accessibility,
      openingHours,
      contactInformation,
      capacity,
      dataSource,
      isActive
    } = req.body;

    if (name) facility.name = name;
    if (category) facility.category = category;
    if (description !== undefined) facility.description = description;
    if (address) facility.address = address;
    if (landmark !== undefined) facility.landmark = landmark;
    if (operationalStatus) facility.operationalStatus = operationalStatus;
    if (accessibility) facility.accessibility = accessibility;
    if (openingHours) facility.openingHours = openingHours;
    if (contactInformation) facility.contactInformation = contactInformation;
    if (capacity) facility.capacity = capacity;
    if (dataSource) facility.dataSource = dataSource;

    if (latitude !== undefined && longitude !== undefined) {
      facility.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    // Role-based restrictions: Only Admins can change verification status or soft delete/activate
    if (req.user.role === 'ADMIN') {
      if (verificationStatus) {
        facility.verificationStatus = verificationStatus;
        if (verificationStatus === 'VERIFIED') {
          facility.lastVerifiedAt = new Date();
        }
      }
      if (isActive !== undefined) {
        facility.isActive = isActive;
      }
    }

    facility.updatedBy = req.user._id;
    await facility.save();

    await logAudit({
      actor: req.user,
      action: 'FACILITY_UPDATE',
      resourceType: 'Facility',
      resourceId: facility._id,
      changeSummary: `Updated facility: "${facility.name}" - Status: ${facility.operationalStatus}, Verification: ${facility.verificationStatus}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Facility updated successfully',
      data: facility
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Soft delete by deactivating
    facility.isActive = false;
    facility.updatedBy = req.user._id;
    await facility.save();

    await logAudit({
      actor: req.user,
      action: 'FACILITY_DEACTIVATE',
      resourceType: 'Facility',
      resourceId: facility._id,
      changeSummary: `Deactivated facility: "${facility.name}"`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Facility successfully deactivated'
    });
  } catch (error) {
    next(error);
  }
};
