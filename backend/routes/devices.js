// routes/devices.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { registerDeviceToken, unregisterDeviceToken } from '../controllers/devices.js';

const router = express.Router();

// Register FCM token
router.post('/token', protect, registerDeviceToken);

// Unregister FCM token
router.delete('/token', protect, unregisterDeviceToken);

export default router;
