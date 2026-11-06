import express from 'express';
import { register, login, getMe, logout, adminSetup } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema, adminSetupSchema } from '../validators/authValidator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/me', requireAuth, getMe);
router.post('/logout', logout);
router.post('/admin-setup', validateBody(adminSetupSchema), adminSetup);

export default router;
