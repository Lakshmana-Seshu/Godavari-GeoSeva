import { z } from 'zod';
import { ISSUE_CATEGORIES, ISSUE_STATUS } from '../config/constants.js';

export const issueCreateSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000),
  category: z.enum(ISSUE_CATEGORIES, {
    errorMap: () => ({ message: 'Invalid issue category' })
  }),
  latitude: z.coerce.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  address: z.string().trim().max(300).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  reporterName: z.string().trim().max(100).optional(),
  reporterPhone: z.string().trim().max(20).optional(),
  reporterEmail: z.string().trim().email().optional(),
  reporterContact: z
    .union([
      z.string().transform((str) => {
        try {
          return JSON.parse(str);
        } catch {
          return {};
        }
      }),
      z.object({
        name: z.string().trim().max(100).optional(),
        phone: z.string().trim().max(20).optional(),
        email: z.string().trim().email().optional()
      })
    ])
    .optional()
});

export const issueStatusUpdateSchema = z.object({
  status: z.enum(ISSUE_STATUS, {
    errorMap: () => ({ message: 'Invalid issue status' })
  }),
  comment: z.string().trim().max(500).optional(),
  administrativeNote: z.string().trim().max(1000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
});
