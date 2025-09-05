// routes/announcements.js
import express from 'express';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcements.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public: list active announcements (offers/tips)
router.get('/', getAnnouncements);

// Admin: create a new announcement
router.post('/', protect, authorize('admin'), createAnnouncement);

// Admin: delete an announcement
router.delete('/:id', protect, authorize('admin'), deleteAnnouncement);

export default router;
