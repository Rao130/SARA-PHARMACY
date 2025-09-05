import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStockMedicines,
  getExpiringSoonMedicines,
  searchBySymptoms
} from '../controllers/medicines.js';
import { protect, authorize } from '../middleware/auth.js';
import advancedResults from '../middleware/advancedResults.js';
import Medicine from '../models/Medicine.js';

const router = express.Router();

// Multer storage for medicine images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({ storage });

// Public routes
router
  .route('/')
  .get(advancedResults(Medicine), getMedicines);

// Search medicines by symptoms
router
  .route('/search-by-symptoms')
  .post(searchBySymptoms);

router
  .route('/:id')
  .get(getMedicine);

// Protected routes (Admin only)
router.use(protect, authorize('admin'));

router
  .route('/')
  .post(upload.single('image'), createMedicine);

router
  .route('/:id')
  .put(upload.single('image'), updateMedicine)
  .delete(deleteMedicine);

router
  .route('/low-stock')
  .get(getLowStockMedicines);

router
  .route('/expiring-soon')
  .get(getExpiringSoonMedicines);

export default router;
