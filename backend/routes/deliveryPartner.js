import express from 'express';
import {
  getAvailableDeliveryPartners,
  getNearbyDeliveryPartners,
  createDeliveryPartner,
  updateDeliveryPartnerLocation,
  updateDeliveryPartnerAvailability,
  getDeliveryPartnerProfile,
  updateDeliveryPartnerRating,
  getAllDeliveryPartners,
  getDeliveryPartnerCurrentOrders
} from '../controllers/deliveryPartner.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with authentication)
router.get('/available', protect, getAvailableDeliveryPartners);
router.get('/nearby', protect, getNearbyDeliveryPartners);
router.get('/profile/:partnerId', protect, getDeliveryPartnerProfile);
router.get('/:partnerId/current-orders', protect, getDeliveryPartnerCurrentOrders);

// Admin only routes
router.get('/', protect, authorize('admin'), getAllDeliveryPartners);
router.post('/', protect, authorize('admin'), createDeliveryPartner);

// Delivery partner routes
router.patch('/:partnerId/location', protect, updateDeliveryPartnerLocation);
router.patch('/:partnerId/availability', protect, updateDeliveryPartnerAvailability);
router.patch('/:partnerId/rating', protect, updateDeliveryPartnerRating);

export default router;