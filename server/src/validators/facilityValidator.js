import { z } from 'zod';
import { FACILITY_CATEGORIES, FACILITY_STATUS, VERIFICATION_STATUS } from '../config/constants.js';

export const facilityCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200),
  category: z.enum(FACILITY_CATEGORIES, {
    errorMap: () => ({ message: 'Invalid facility category' })
  }),
  description: z.string().trim().max(2000).optional().default(''),
  latitude: z.coerce.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  address: z.string().trim().min(2, 'Address or locality is required').max(300),
  landmark: z.string().trim().optional(),
  operationalStatus: z.enum(FACILITY_STATUS).optional().default('UNKNOWN'),
  verificationStatus: z.enum(VERIFICATION_STATUS).optional().default('UNVERIFIED'),
  accessibility: z
    .object({
      wheelchairAccessible: z.boolean().optional().default(false),
      rampAvailable: z.boolean().optional().default(false),
      elderlyAssistance: z.boolean().optional().default(false),
      notes: z.string().trim().optional()
    })
    .optional(),
  openingHours: z
    .object({
      is24Hours: z.boolean().optional().default(false),
      openTime: z.string().trim().optional(),
      closeTime: z.string().trim().optional(),
      notes: z.string().trim().optional()
    })
    .optional(),
  contactInformation: z
    .object({
      phone: z.string().trim().optional(),
      inChargeName: z.string().trim().optional(),
      emergencyHelpline: z.string().trim().optional()
    })
    .optional(),
  capacity: z
    .object({
      estimatedCapacity: z.coerce.number().min(0).optional().default(0),
      unit: z.string().trim().optional().default('persons')
    })
    .optional(),
  dataSource: z.string().trim().optional().default('Field Volunteer Survey')
});

export const facilityUpdateSchema = facilityCreateSchema.partial().extend({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional()
});

export const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  radius: z.coerce.number().min(100).max(50000).optional().default(5000), // radius in meters
  category: z.enum(FACILITY_CATEGORIES).optional(),
  status: z.enum(FACILITY_STATUS).optional(),
  verifiedOnly: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional())
});
