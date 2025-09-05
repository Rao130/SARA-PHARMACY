import express from 'express';
import { protect } from '../middleware/auth.js';
import { searchMedicinesBySymptoms } from '../controllers/medicineController.js';

const router = express.Router();

// Search medicines by symptoms
// POST /api/medicines/search-by-symptoms
router.post('/search-by-symptoms', protect, searchMedicinesBySymptoms);

export default router;
