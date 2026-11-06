import express from 'express';
import { getUsers, updateUserRole, updateUserStatus } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/', getUsers);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);

export default router;
