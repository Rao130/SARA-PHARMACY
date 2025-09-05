import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import mongoose from 'mongoose';

// @desc    Get all users (for admin)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password -fcmTokens -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });

    // Get order counts for each user (you'll need to implement this based on your orders model)
    const usersWithOrderCounts = users.map(user => ({
      ...user._doc,
      orderCount: 0, // Replace with actual order count logic
    }));

    successResponse(res, usersWithOrderCounts, 200, 'Users retrieved successfully');
  } catch (err) {
    errorResponse(res, 'Server error', 500, err);
  }
};

// @desc    Delete user (for admin)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await user.remove();
    
    // Emit real-time WebSocket event for user deletion
    if (global.io) {
      global.io.emit('userDeleted', {
        userId: req.params.id,
        totalUsers: await User.countDocuments({ role: 'user' })
      });
    }
    
    successResponse(res, null, 200, 'User deleted successfully');
  } catch (err) {
    errorResponse(res, 'Server error', 500, err);
  }
};

// @desc    Get total number of customers
// @route   GET /api/v1/users/count
// @access  Private/Admin
export const getCustomerCount = async (req, res) => {
  try {
    console.log('Fetching customer count...');
    const count = await User.countDocuments({ role: 'user' });
    console.log('Total customers found:', count);
    successResponse(res, { count }, 200, 'Customer count retrieved successfully');
  } catch (err) {
    console.error('Error fetching customer count:', err);
    errorResponse(res, 'Server error', 500, err);
  }
};
