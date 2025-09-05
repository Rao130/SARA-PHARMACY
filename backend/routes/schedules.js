import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

/**
 * @route   GET /api/schedules
 * @desc    Get all schedules
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    try {
      // TODO: Implement schedule retrieval logic
      res.status(200).json({ message: 'Schedules route is working' });
    } catch (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).json({ message: 'Server error' });
    }
  })
);

export default router;
