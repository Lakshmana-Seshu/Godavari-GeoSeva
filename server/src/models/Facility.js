import mongoose from 'mongoose';
import { FACILITY_CATEGORIES, FACILITY_STATUS, VERIFICATION_STATUS } from '../config/constants.js';

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: FACILITY_CATEGORIES
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates [longitude, latitude] are required'],
        validate: {
          validator: function (val) {
            return (
              Array.isArray(val) &&
              val.length === 2 &&
              val[0] >= -180 &&
              val[0] <= 180 &&
              val[1] >= -90 &&
              val[1] <= 90
            );
          },
          message: 'Coordinates must be [longitude, latitude] within valid geographic bounds'
        }
      }
    },
    address: {
      type: String,
      required: [true, 'Address or locality is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters']
    },
    landmark: {
      type: String,
      trim: true
    },
    operationalStatus: {
      type: String,
      enum: FACILITY_STATUS,
      default: 'UNKNOWN'
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUS,
      default: 'UNVERIFIED'
    },
    accessibility: {
      wheelchairAccessible: { type: Boolean, default: false },
      rampAvailable: { type: Boolean, default: false },
      elderlyAssistance: { type: Boolean, default: false },
      notes: { type: String, trim: true }
    },
    openingHours: {
      is24Hours: { type: Boolean, default: false },
      openTime: { type: String, trim: true },
      closeTime: { type: String, trim: true },
      notes: { type: String, trim: true }
    },
    contactInformation: {
      phone: { type: String, trim: true },
      inChargeName: { type: String, trim: true },
      emergencyHelpline: { type: String, trim: true }
    },
    capacity: {
      estimatedCapacity: { type: Number, default: 0 },
      unit: { type: String, default: 'persons' }
    },
    lastVerifiedAt: {
      type: Date
    },
    dataSource: {
      type: String,
      required: [true, 'Data source is required'],
      default: 'Demonstration Data (Synthetic - Godavari Pushkaralu 2027 Hackathon)'
    },
    isSyntheticDemo: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    photographs: [
      {
        type: String
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for geospatial queries
facilitySchema.index({ location: '2dsphere' });
// Compound indexes for high performance filtering
facilitySchema.index({ category: 1, verificationStatus: 1, operationalStatus: 1 });
facilitySchema.index({ isActive: 1, category: 1 });
facilitySchema.index({ name: 'text', address: 'text', description: 'text' });

export const Facility = mongoose.model('Facility', facilitySchema);
