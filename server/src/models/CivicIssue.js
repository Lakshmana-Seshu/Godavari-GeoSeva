import mongoose from 'mongoose';
import { ISSUE_CATEGORIES, ISSUE_STATUS } from '../config/constants.js';

const civicIssueSchema = new mongoose.Schema(
  {
    referenceCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Issue category is required'],
      enum: ISSUE_CATEGORIES
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
          message: 'Coordinates must be valid [longitude, latitude]'
        }
      }
    },
    address: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ISSUE_STATUS,
      default: 'SUBMITTED'
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Reporter personal info is kept private and excluded from public serialization
    reporterContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true }
    },
    attachments: [
      {
        type: String
      }
    ],
    administrativeNotes: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        authorName: { type: String },
        note: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    statusHistory: [
      {
        status: { type: String, enum: ISSUE_STATUS, required: true },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        changedByName: { type: String },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

civicIssueSchema.index({ location: '2dsphere' });
civicIssueSchema.index({ status: 1, category: 1, priority: 1 });
civicIssueSchema.index({ createdAt: -1 });

export const CivicIssue = mongoose.model('CivicIssue', civicIssueSchema);
