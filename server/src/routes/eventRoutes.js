import express from 'express';
import { registerSSEClient } from '../services/realtimeService.js';

const router = express.Router();

// Real-Time Server-Sent Events stream for Admin & Volunteer clients
router.get('/stream', registerSSEClient);

// Status check
router.get('/status', (req, res) => {
  res.json({
    success: true,
    service: 'Godavari GeoSeva Realtime Stream',
    activeSubscribers: true,
    timestamp: new Date().toISOString()
  });
});

export default router;

