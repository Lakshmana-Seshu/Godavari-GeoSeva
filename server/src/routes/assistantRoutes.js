import express from 'express';
import {
  chatWithAssistant,
  getAssistantAnalytics,
  getAssistantSuggestions
} from '../controllers/assistantController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

// Public Pilgrim Chatbot Endpoint
router.post('/chat', chatWithAssistant);

// Public Suggested Prompts by Language
router.get('/suggestions', getAssistantSuggestions);

// Protected Authority Monitoring Endpoint
router.get('/analytics', requireAuth, requireRole('ADMIN', 'VOLUNTEER'), getAssistantAnalytics);

export default router;

