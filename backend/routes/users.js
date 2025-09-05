import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getUsers, deleteUser, getCustomerCount } from '../controllers/users.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin'));



// Admin protected routes
router.get('/count', getCustomerCount);

// Admin routes
router.route('/')
  .get(getUsers);

router.route('/:id')
  .delete(deleteUser);

export default router;
