import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { generateUniquePartnerId } from '../utils/helpers.js';

// Create new order
export const createOrder = async (req, res) => {
  console.log('=== NEW ORDER REQUEST ===');
  console.log('User ID:', req.user?.id);
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { items, paymentMethod, shippingAddress } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate payment method
    const validPaymentMethods = ['cod', 'upi', 'card'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return errorResponse(res, 'Invalid payment method', 400);
    }

    // Basic input validation to avoid 500s on bad payloads
    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 'Cart is empty or items missing', 400);
    }

    for (const item of items) {
      if (!item || !item.medicine) {
        return errorResponse(res, 'Item is missing medicine id', 400);
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return errorResponse(res, 'Quantity must be a positive integer', 400);
      }
    }

    // Calculate totals and update inventory
    let itemsPrice = 0;
    const orderItems = [];
    
    // For UPI payments, set initial payment status
    const isUPIPayment = paymentMethod === 'upi';

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return errorResponse(res, `Medicine not found: ${item.medicine}`, 404);
      }

      if (medicine.stock < item.quantity) {
        return errorResponse(res, `Insufficient stock for ${medicine.name}`, 400);
      }

      // Update stock
      medicine.stock -= item.quantity;
      await medicine.save();

      const itemTotal = medicine.price * item.quantity;
      itemsPrice += itemTotal;

      orderItems.push({
        medicine: item.medicine,
        name: medicine.name,
        quantity: item.quantity,
        price: medicine.price,
      });
    }

    // Validate shippingAddress object as per model
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return errorResponse(res, 'Shipping address is required', 400);
    }

    const { address, city, postalCode, country } = shippingAddress;
    const requiredFields = { address, city, postalCode, country };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return errorResponse(res, `Missing required fields in shipping address: ${missingFields.join(', ')}`, 400);
    }

    const taxPrice = 0; // adjust if tax logic exists
    const shippingPrice = 0; // adjust if shipping logic exists
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Create order per schema
    const orderData = {
      user: userId,
      items: orderItems,
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country
      },
      paymentMethod,
      itemsPrice,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: itemsPrice,
      isPaid: isUPIPayment,
      isDelivered: false,
      status: isUPIPayment ? 'confirmed' : 'pending',
      paymentStatus: isUPIPayment ? 'completed' : 'pending',
      paymentResult: {
        status: isUPIPayment ? 'completed' : 'pending',
        update_time: new Date().toISOString(),
        payment_gateway: isUPIPayment ? 'UPI' : 'COD'
      }
    };

    // Log the order data for debugging
    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
    
    const order = new Order(orderData);
    
    try {
      console.log('Attempting to save order...');
      await order.save();
      console.log('Order saved successfully:', order._id);
    } catch (saveError) {
      console.error('Error saving order:', saveError);
      console.error('Validation errors:', saveError.errors);
      console.error('Error name:', saveError.name);
      console.error('Error code:', saveError.code);
      throw saveError; // Re-throw to be caught by the outer catch
    }

    // Emit real-time WebSocket event for new order
    if (global.io) {
      const totalOrdersCount = await Order.countDocuments();
      const newOrderForAdmin = await Order.findById(order._id).populate('user', 'name email');
      global.io.to('admin').emit('orderCreated', {
        newOrder: newOrderForAdmin,
        totalOrders: totalOrdersCount  // Send total orders count
      });
      console.log('📦 Order created WebSocket event emitted to admin room with total orders count:', totalOrdersCount);
    }

    // For UPI payments, update the order status after a short delay to simulate payment processing
    if (isUPIPayment) {
      setTimeout(async () => {
        try {
          order.paymentStatus = 'completed';
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentResult = {
            ...order.paymentResult,
            status: 'completed',
            update_time: new Date().toISOString(),
            transaction_id: `TXN${Date.now()}`,
            upi_id: `UPI${Date.now()}`
          };
          await order.save();
        } catch (error) {
          console.error('Error updating UPI payment status:', error);
        }
      }, 3000);
    }

    console.log('Sending success response for order:', order._id);
    successResponse(res, order, 201, 'Order created successfully');
  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    errorResponse(res, error.message || 'Error creating order', 500, error);
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.medicine', 'name image')
      .sort('-createdAt');
    successResponse(res, orders, 200, 'Orders retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Error fetching orders', 500, error);
  }
};

// Get a single order by id (user can see own order; admin can see any)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.medicine', 'name image')
      .populate('user', 'name email phone');
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && String(order.user._id) !== String(req.user.id)) {
      return errorResponse(res, 'Not authorized to view this order', 403);
    }
    successResponse(res, order, 200, 'Order retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Error fetching order', 500, error);
  }
};

// User: Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Check if user owns the order or is an admin
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && String(order.user) !== String(req.user.id)) {
      return errorResponse(res, 'Not authorized to cancel this order', 403);
    }
    
    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return errorResponse(res, `Cannot cancel order in ${order.status} status`, 400);
    }
    
    // Update order status to cancelled
    order.status = 'cancelled';
    order.updatedAt = Date.now();
    
    // Return items to inventory
    for (const item of order.items) {
      try {
        const medicine = await Medicine.findById(item.medicine);
        if (medicine) {
          medicine.stock += item.quantity;
          await medicine.save();
          console.log(`Returned ${item.quantity} of ${medicine.name} to inventory`);
        }
      } catch (err) {
        console.error(`Error returning item to inventory: ${err.message}`);
        // Continue with cancellation even if inventory update fails
      }
    }
    
    const updatedOrder = await order.save();
    
    // Emit real-time update via Socket.io
    if (global.io) {
      const roomName = `order:${updatedOrder._id}`;
      global.io.to(roomName).emit('orderUpdate', {
        orderId: updatedOrder._id.toString(),
        updates: {
          status: updatedOrder.status,
          updatedAt: updatedOrder.updatedAt
        }
      });
      
      // Emit order cancelled event for admin dashboard
      const totalOrdersCount = await Order.countDocuments();
      global.io.to('admin').emit('orderCancelled', {
        orderId: updatedOrder._id,
        totalOrders: totalOrdersCount  // Send total orders count
      });
      console.log('📦 Order cancelled WebSocket event emitted to admin room with total orders count:', totalOrdersCount);
    }
    
    successResponse(res, updatedOrder, 200, 'Order cancelled successfully');
  } catch (err) {
    errorResponse(res, 'Server error', 500, err);
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get total customers
    const totalCustomers = await User.countDocuments({ role: 'user' });
    
    // Get total revenue (sum of all paid orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get total orders (all orders in database)
    const totalOrders = await Order.countDocuments();
    console.log('📊 Dashboard Stats - Total orders count:', totalOrders);
    
    // Additional debugging - check all orders
    const allOrdersCount = await Order.countDocuments();
    const allStatuses = await Order.find({}).select('status').lean();
    console.log('📊 Total orders in DB:', allOrdersCount);
    console.log('📊 All order statuses:', allStatuses.map(o => o.status));
    
    // Count by status
    const statusCounts = {};
    allStatuses.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    console.log('📊 Status distribution:', statusCounts);

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Calculate profit (assuming 30% profit margin for demo)
    const totalProfit = totalRevenue * 0.3;

    successResponse(res, {
      totalCustomers,
      totalRevenue,
      totalProfit,
      totalOrders,
      monthlyRevenue,
      // Debug info
      debug: {
        allOrdersCount,
        statusDistribution: statusCounts,
        confirmedOrdersQuery: totalOrders
      }
    }, 200, 'Dashboard stats retrieved successfully');
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    errorResponse(res, 'Error getting dashboard statistics', 500, err);
  }
};

// Advanced Order Tracking Functions

// Update order status with location tracking
export const updateOrderStatusWithTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, message } = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    const oldStatus = order.status;
    order.status = status;
    
    // Add tracking entry
    const trackingEntry = {
      status,
      timestamp: new Date(),
      message: message || `Order ${status.replace('_', ' ')}`
    };
    
    if (location && location.coordinates) {
      trackingEntry.location = {
        type: 'Point',
        coordinates: location.coordinates
      };
    }
    
    order.deliveryTracking.push(trackingEntry);
    
    // Set estimated delivery time based on status
    if (status === 'confirmed') {
      order.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    } else if (status === 'out_for_delivery') {
      order.estimatedDeliveryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    } else if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }
    
    await order.save();
    
    // Emit real-time update
    if (global.io) {
      const roomName = `order:${order._id}`;
      global.io.to(roomName).emit('orderTrackingUpdate', {
        orderId: order._id.toString(),
        status: order.status,
        tracking: trackingEntry,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      });
      
      // Emit to admin dashboard
      global.io.to('admin').emit('orderStatusChanged', {
        orderId: order._id.toString(),
        oldStatus,
        newStatus: order.status,
        totalOrders: await Order.countDocuments()
      });
    }
    
    successResponse(res, order, 200, 'Order status updated successfully');
  } catch (error) {
    console.error('Error updating order status:', error);
    errorResponse(res, 'Error updating order status', 500, error);
  }
};

// Assign delivery partner to order
export const assignDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPartnerId, autoAssign, partnerData, quickCreate } = req.body;
    
    console.log('📦 Assign delivery partner request:', { id, quickCreate, partnerData });
    
    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    let deliveryPartner;
    
    if (quickCreate && partnerData) {
      // Quick create new delivery partner
      console.log('🚀 Creating new delivery partner:', partnerData.name);
      
      // Import required modules
      // const bcrypt = await import('bcryptjs');
      // const { generateUniquePartnerId } = await import('../utils/helpers.js');

      // Generate email from name if not provided
      const email = partnerData.email || `${partnerData.name.toLowerCase().replace(/\s+/g, '')}@delivery.sara.com`;
      const vehicleNumber = partnerData.vehicleNumber || `DL-${Date.now().toString().slice(-4)}`;

      // Create user account for delivery partner
      const hashedPassword = await bcrypt.hash('delivery123', 12);
      const newUser = await User.create({
        name: partnerData.name,
        email: email,
        password: hashedPassword,
        phone: partnerData.phone,
        address: 'Delivery Partner Address',
        role: 'user'
      });
      
      console.log('✅ User account created:', newUser._id);

      // Create delivery partner
      deliveryPartner = await DeliveryPartner.create({
        userId: newUser._id,
        partnerId: generateUniquePartnerId(),
        name: partnerData.name,
        phone: partnerData.phone,
        email: email,
        vehicleType: partnerData.vehicleType || 'bike',
        vehicleNumber: vehicleNumber,
        currentLocation: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Default Delhi coordinates
        },
        zone: 'central',
        rating: 5.0,
        totalDeliveries: 0,
        isActive: true,
        isAvailable: true
      });

      console.log(`✅ Created new delivery partner: ${deliveryPartner.name} (${deliveryPartner.partnerId})`);
    } else if (autoAssign) {
      // Find nearest available delivery partner
      const customerLocation = order.shippingAddress.coordinates || [77.1025, 28.7041]; // Default Delhi
      
      deliveryPartner = await DeliveryPartner.findOne({
        isActive: true,
        isAvailable: true,
        currentLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: customerLocation
            },
            $maxDistance: 10000 // 10km radius
          }
        }
      });
      
      if (!deliveryPartner) {
        return errorResponse(res, 'No delivery partner available in your area', 404);
      }
    } else {
      deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);
      if (!deliveryPartner) {
        return errorResponse(res, 'Delivery partner not found', 404);
      }
    }
    
    // Assign delivery partner
    order.deliveryPartner = deliveryPartner._id;
    order.status = 'assigned';
    order.estimatedDeliveryTime = new Date(Date.now() + 25 * 60 * 1000); // 25 minutes
    
    // Add tracking entry
    order.deliveryTracking.push({
      status: 'assigned',
      timestamp: new Date(),
      message: `Assigned to ${deliveryPartner.name}`,
      location: deliveryPartner.currentLocation
    });
    
    await order.save();
    
    // Update delivery partner
    deliveryPartner.currentOrders.push(order._id);
    deliveryPartner.isAvailable = deliveryPartner.currentOrders.length < 3; // Max 3 orders
    await deliveryPartner.save();
    
    // Emit real-time updates
    if (global.io) {
      const roomName = `order:${order._id}`;
      global.io.to(roomName).emit('deliveryPartnerAssigned', {
        orderId: order._id.toString(),
        deliveryPartner: {
          name: deliveryPartner.name,
          phone: deliveryPartner.phone,
          profilePhoto: deliveryPartner.profilePhoto,
          vehicleType: deliveryPartner.vehicleType,
          vehicleNumber: deliveryPartner.vehicleNumber,
          rating: deliveryPartner.rating
        },
        estimatedDeliveryTime: order.estimatedDeliveryTime
      });
    }
    
    successResponse(res, {
      order,
      deliveryPartner: {
        name: deliveryPartner.name,
        phone: deliveryPartner.phone,
        profilePhoto: deliveryPartner.profilePhoto,
        rating: deliveryPartner.rating
      }
    }, 200, `Delivery partner ${deliveryPartner.name} assigned successfully`);
  } catch (error) {
    console.error('Error assigning delivery partner:', error);
    errorResponse(res, 'Error assigning delivery partner', 500, error);
  }
};

// Get live order tracking
// Auto-progress order status (for demo/testing)
export const autoProgressOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Define status progression
    const statusProgression = {
      confirmed: 'preparing',
      preparing: 'packed', 
      packed: 'assigned',
      assigned: 'picked_up',
      picked_up: 'in_transit',
      in_transit: 'out_for_delivery',
      out_for_delivery: 'delivered'
    };

    const nextStatus = statusProgression[order.status];
    if (!nextStatus) {
      return res.status(400).json({
        success: false,
        message: `Cannot progress from status: ${order.status}`
      });
    }

    // Update order status
    order.status = nextStatus;
    
    // Add tracking entry
    if (!order.deliveryTracking) {
      order.deliveryTracking = [];
    }
    
    order.deliveryTracking.push({
      status: nextStatus,
      timestamp: new Date(),
      message: `Order ${nextStatus.replace('_', ' ')} automatically`,
      location: order.deliveryLocation || { coordinates: [77.2090, 28.6139] }
    });

    await order.save();

    // Emit real-time update
    if (global.io) {
      global.io.to(`order:${orderId}`).emit('orderTrackingUpdate', {
        orderId,
        status: nextStatus,
        tracking: order.deliveryTracking[order.deliveryTracking.length - 1],
        estimatedDeliveryTime: order.estimatedDeliveryTime
      });
      
      console.log(`[WebSocket] Order ${orderId} status updated to ${nextStatus}`);
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${nextStatus}`,
      data: {
        orderId,
        status: nextStatus,
        previousStatus: statusProgression[nextStatus] || 'unknown'
      }
    });
  } catch (error) {
    console.error('Error auto-progressing order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to progress order status',
      error: error.message
    });
  }
};

export const getLiveOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('deliveryPartner', 'name phone profilePhoto vehicleType vehicleNumber rating currentLocation')
      .populate('user', 'name phone');
      
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    // Check if user owns the order or is admin
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && String(order.user._id) !== String(req.user.id)) {
      return errorResponse(res, 'Not authorized to view this order', 403);
    }
    
    // Calculate time remaining
    let timeRemaining = null;
    if (order.estimatedDeliveryTime && order.status !== 'delivered') {
      timeRemaining = Math.max(0, Math.floor((order.estimatedDeliveryTime - new Date()) / 1000));
    }
    
    const trackingData = {
      order: {
        _id: order._id,
        status: order.status,
        createdAt: order.createdAt,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        actualDeliveryTime: order.actualDeliveryTime,
        timeRemaining,
        totalPrice: order.totalPrice,
        items: order.items
      },
      deliveryPartner: order.deliveryPartner,
      tracking: order.deliveryTracking,
      shippingAddress: order.shippingAddress
    };
    
    successResponse(res, trackingData, 200, 'Order tracking retrieved successfully');
  } catch (error) {
    console.error('Error getting order tracking:', error);
    errorResponse(res, 'Error getting order tracking', 500, error);
  }
};

// Update delivery partner location
export const updateDeliveryPartnerLocation = async (req, res) => {
  try {
    const { latitude, longitude, orderId } = req.body;
    
    console.log('🗺️ Location update request:', { latitude, longitude, orderId });
    
    if (!latitude || !longitude) {
      return errorResponse(res, 'Latitude and longitude are required', 400);
    }
    
    // Find the order and delivery partner
    const order = await Order.findById(orderId).populate('deliveryPartner');
    if (!order || !order.deliveryPartner) {
      return errorResponse(res, 'Order or delivery partner not found', 404);
    }
    
    const deliveryPartner = await DeliveryPartner.findById(order.deliveryPartner._id);
    if (!deliveryPartner) {
      return errorResponse(res, 'Delivery partner not found', 404);
    }
    
    // Update delivery partner location
    deliveryPartner.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    deliveryPartner.lastLocationUpdate = new Date();
    await deliveryPartner.save();
    
    console.log(`🗺️ Updated location for ${deliveryPartner.name}: ${latitude}, ${longitude}`);
    
    // Emit location update to customer via WebSocket
    if (global.io) {
      const roomName = `order:${orderId}`;
      global.io.to(roomName).emit('deliveryPartnerLocationUpdate', {
        orderId: orderId,
        location: {
          latitude,
          longitude
        },
        timestamp: new Date(),
        partnerName: deliveryPartner.name
      });
      
      console.log(`🗺️ Location update sent to room: ${roomName}`);
    }
    
    successResponse(res, {
      location: { latitude, longitude },
      timestamp: new Date(),
      partnerName: deliveryPartner.name
    }, 200, 'Location updated successfully');
  } catch (error) {
    console.error('Error updating delivery partner location:', error);
    errorResponse(res, 'Error updating location', 500, error);
  }
};