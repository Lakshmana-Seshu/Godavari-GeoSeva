import express from 'express';
import {
  getDashboardSummary,
  getFacilityStatistics,
  getIssueStatistics,
  getCoverageAnalysis,
  getAuditLogs
} from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.use(requireAuth);

router.get('/summary', requireRole('ADMIN', 'VOLUNTEER'), getDashboardSummary);
router.get('/facility-statistics', requireRole('ADMIN', 'VOLUNTEER'), getFacilityStatistics);
router.get('/issue-statistics', requireRole('ADMIN', 'VOLUNTEER'), getIssueStatistics);
router.get('/coverage-analysis', requireRole('ADMIN', 'VOLUNTEER'), getCoverageAnalysis);
router.get('/audit-logs', requireRole('ADMIN'), getAuditLogs);

export default router;
