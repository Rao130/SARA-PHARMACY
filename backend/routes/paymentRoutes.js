import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { initiateUpiPayment, verifyUpiPayment } from '../controllers/paymentController.js';

const router = express.Router();

// UPI Payment Routes
router.post('/upi', protect, initiateUpiPayment);
router.post('/verify', protect, verifyUpiPayment);

export default router;
