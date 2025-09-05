// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { protect, authorize } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
// io instance is available globally

const router = express.Router();

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: 'user'
    });

    // Create access token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
      { expiresIn: '7d' }
    );

    // Include user data in the response
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token,
      refreshToken
    };



    // Emit real-time WebSocket event for new user registration
    if (global.io) {
      global.io.emit('userRegistered', {
        user: userData,
        totalUsers: await User.countDocuments()
      });
    }

    successResponse(res, { user: userData, token }, 201, 'User registered successfully');
  } catch (err) {
    errorResponse(res, err.message, 400, err);
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return errorResponse(res, 'Please provide an email and password', 400);
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Create access token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
      { expiresIn: '7d' }
    );

    // Prepare user data for response
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    successResponse(res, { 
      user: userData, 
      token, 
      refreshToken 
    }, 200, 'Login successful');
  } catch (err) {
    errorResponse(res, 'Server error', 500, err);
  }
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new access token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    // Return the new token
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    successResponse(res, user, 200, 'User retrieved successfully');
  } catch (err) {
    errorResponse(res, 'Server error', 500, err);
  }
});

// @desc    Update current logged in user's profile
// @route   PUT /api/v1/auth/me
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const updates = {};
    const allowed = ['name', 'email', 'phone', 'address'];
    allowed.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') updates[field] = req.body[field];
    });

    // If password provided, set separately to trigger pre-save hook
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return errorResponse(res, 'User not found', 404);

    Object.assign(user, updates);
    if (req.body.password) {
      user.password = req.body.password;
    }
    await user.save();

    const sanitized = await User.findById(user._id);
    successResponse(res, sanitized, 200, 'Profile updated successfully');
  } catch (err) {
    errorResponse(res, err.message || 'Failed to update profile', 400, err);
  }
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  try {
    // Note: Client should remove FCM token before logging out
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @desc    Add FCM token for push notifications
// @route   POST /api/v1/auth/fcm-token
// @access  Private
router.post('/fcm-token', protect, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return errorResponse(res, 'FCM token is required', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { fcmTokens: token } },
      { new: true, select: '-password' }
    );

    successResponse(res, { user }, 200, 'FCM token added successfully');
  } catch (err) {
    console.error('FCM token error:', err);
    errorResponse(res, 'Failed to add FCM token', 500, err);
  }
});

// @desc    Remove FCM token
// @route   DELETE /api/v1/auth/fcm-token
// @access  Private
router.delete('/fcm-token', protect, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return errorResponse(res, 'FCM token is required', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { fcmTokens: token } },
      { new: true, select: '-password' }
    );

    successResponse(res, { user }, 200, 'FCM token removed successfully');
  } catch (err) {
    console.error('FCM token removal error:', err);
    errorResponse(res, 'Failed to remove FCM token', 500, err);
  }
});

export default router;