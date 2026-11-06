import express from 'express';
import {
  getFacilities,
  getNearbyFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility
} from '../controllers/facilityController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  facilityCreateSchema,
  facilityUpdateSchema,
  nearbyQuerySchema
} from '../validators/facilityValidator.js';

const router = express.Router();

// Specific routes before generic /:id route
router.get('/nearby', validateQuery(nearbyQuerySchema), getNearbyFacilities);
router.get('/', optionalAuth, getFacilities);
router.get('/:id', optionalAuth, getFacilityById);

router.post(
  '/',
  requireAuth,
  requireRole('VOLUNTEER', 'ADMIN'),
  validateBody(facilityCreateSchema),
  createFacility
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('VOLUNTEER', 'ADMIN'),
  validateBody(facilityUpdateSchema),
  updateFacility
);

router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteFacility);

export default router;
