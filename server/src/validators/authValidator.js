import { z } from 'zod';
import { USER_ROLES } from '../config/constants.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Public registration allows PILGRIM or VOLUNTEER (volunteer accounts start as active or pending review)
  // ADMIN role cannot be self-assigned!
  role: z.enum(['PILGRIM', 'VOLUNTEER']).optional().default('PILGRIM'),
  phone: z.string().trim().optional(),
  organization: z.string().trim().optional()
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const adminSetupSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Admin password must be at least 8 characters'),
  setupSecret: z.string().min(1, 'Setup secret is required')
});
