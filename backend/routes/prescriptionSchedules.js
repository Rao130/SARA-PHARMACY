import express from 'express';
const router = express.Router();
import {
  getPrescriptionSchedules,
  getPrescriptionSchedule,
  createPrescriptionSchedule,
  updatePrescriptionSchedule,
  deletePrescriptionSchedule,
  snoozePrescription
} from '../controllers/prescriptionSchedules.js';

import { protect } from '../middleware/auth.js';

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(getPrescriptionSchedules)
  .post(createPrescriptionSchedule);

router
  .route('/:id')
  .get(getPrescriptionSchedule)
  .put(updatePrescriptionSchedule)
  .delete(deletePrescriptionSchedule);

router
  .route('/:id/snooze')
  .post(snoozePrescription);

export default router;
