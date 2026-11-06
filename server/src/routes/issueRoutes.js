import express from 'express';
import {
  submitIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  uploadAttachment
} from '../controllers/issueController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBody } from '../middleware/validate.js';
import { issueCreateSchema, issueStatusUpdateSchema } from '../validators/issueValidator.js';
import { reportIssueLimiter } from '../middleware/rateLimiter.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

// Middleware to gracefully handle optional photo upload for multipart form data
const handleIssuePhoto = (req, res, next) => {
  uploadImage.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error processing photo attachment',
        errors: [{ field: 'photo', message: err.message }]
      });
    }
    next();
  });
};

router.post(
  '/',
  reportIssueLimiter,
  handleIssuePhoto,
  optionalAuth,
  validateBody(issueCreateSchema),
  submitIssue
);
router.get('/', optionalAuth, getIssues);

// Image attachment upload
router.post('/attachments', uploadImage.single('file'), uploadAttachment);

router.get('/:id', optionalAuth, getIssueById);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('VOLUNTEER', 'ADMIN'),
  validateBody(issueStatusUpdateSchema),
  updateIssueStatus
);

export default router;
