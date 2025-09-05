import express from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById,
  cancelOrder,
  getDashboardStats,
  updateOrderStatusWithTracking,
  assignDeliveryPartner,
  getLiveOrderTracking,
  updateDeliveryPartnerLocation,
  autoProgressOrderStatus
} from '../controllers/orders.js';
import { protect, authorize } from '../middleware/auth.js';
import Order from '../models/Order.js';

const router = express.Router();

// Protected routes
router.use(protect);

// User routes
router.route('/')
  .post(createOrder)
  .get(getUserOrders);

// Admin dashboard stats
router.get('/stats/dashboard', authorize('admin'), getDashboardStats);

// Debug endpoint to check order statuses
router.get('/debug/statuses', authorize('admin'), async (req, res) => {
  try {
    const allOrders = await Order.find({}).select('status createdAt').lean();
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const confirmedCount = await Order.countDocuments({ status: 'confirmed' });
    
    res.json({
      success: true,
      data: {
        totalOrders: allOrders.length,
        confirmedOrders: confirmedCount,
        statusDistribution: statusCounts,
        recentOrders: allOrders.slice(-10).map(o => ({ 
          id: o._id.toString().slice(-8), 
          status: o.status, 
          created: o.createdAt 
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Debug endpoint to manually confirm a pending order (for testing)
router.post('/debug/confirm-first-pending', authorize('admin'), async (req, res) => {
  try {
    const pendingOrder = await Order.findOne({ status: 'pending' });
    if (!pendingOrder) {
      return res.json({ success: false, message: 'No pending orders found' });
    }
    
    const oldStatus = pendingOrder.status;
    pendingOrder.status = 'confirmed';
    pendingOrder.updatedAt = new Date();
    await pendingOrder.save();
    
    // Emit WebSocket event
    if (global.io) {
      const totalConfirmedOrders = await Order.countDocuments({ status: 'confirmed' });
      global.io.to('admin').emit('orderStatusChanged', {
        orderId: pendingOrder._id.toString(),
        oldStatus,
        newStatus: 'confirmed',
        totalConfirmedOrders
      });
    }
    
    res.json({ 
      success: true, 
      message: `Order ${pendingOrder._id.toString().slice(-8)} confirmed`,
      confirmedOrdersCount: await Order.countDocuments({ status: 'confirmed' })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: list pending orders (market-ready accept flow)
router.get('/pending', authorize('admin'), async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: { $in: ['pending'] } })
      .sort('-createdAt')
      .limit(50);
    res.status(200).json({ success: true, data: pendingOrders });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load pending orders' });
  }
});

// Simple status update endpoint (PATCH) - Clean and error-free
router.patch('/:id/status', authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const oldStatus = order.status;
    order.status = req.body.status;
    order.updatedAt = new Date();
    
    await order.save();
    
    // Send real-time update to the user via WebSocket
    if (global.io && oldStatus !== order.status) {
      const roomName = `order:${order._id}`;
      global.io.to(roomName).emit('orderUpdate', {
        orderId: order._id.toString(),
        updates: {
          status: order.status,
          updatedAt: order.updatedAt
        }
      });
      console.log(`📦 Order status updated: ${oldStatus} → ${order.status} (sent to room: ${roomName})`);
      
      // Emit admin dashboard update for total orders count
      const totalOrdersCount = await Order.countDocuments();
      global.io.to('admin').emit('orderStatusChanged', {
        orderId: order._id.toString(),
        oldStatus,
        newStatus: order.status,
        totalOrders: totalOrdersCount
      });
      console.log(`📊 Admin dashboard updated with total orders count: ${totalOrdersCount}`);
    }
    
    res.json({ 
      success: true, 
      message: 'Order status updated successfully',
      data: order 
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// User can view their order; admin can view any
router.route('/:id')
  .get(getOrderById);

// User can cancel their pending order
router.route('/:id/cancel')
  .put(cancelOrder);

// Enhanced tracking routes
router.patch('/:id/status-tracking', authorize('admin'), updateOrderStatusWithTracking);
router.post('/:id/assign-delivery-partner', authorize('admin'), assignDeliveryPartner);
router.get('/:id/live-tracking', getLiveOrderTracking);
router.post('/:id/auto-progress', authorize('admin'), autoProgressOrderStatus);
router.post('/delivery-partner/update-location', authorize('delivery_partner'), updateDeliveryPartnerLocation);

export default router;
