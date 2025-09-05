import DeliveryPartner from '../models/DeliveryPartner.js';
import User from '../models/User.js';
import { generateUniquePartnerId } from '../utils/helpers.js';

// Get all available delivery partners
export const getAvailableDeliveryPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find({
      isActive: true,
      isAvailable: true
    }).populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      data: partners
    });
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery partners',
      error: error.message
    });
  }
};

// Get delivery partners near a location
export const getNearbyDeliveryPartners = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const partners = await DeliveryPartner.find({
      isActive: true,
      isAvailable: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      data: partners
    });
  } catch (error) {
    console.error('Error fetching nearby partners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby delivery partners',
      error: error.message
    });
  }
};

// Create a new delivery partner
export const createDeliveryPartner = async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      email,
      vehicleType,
      vehicleNumber,
      zone
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if delivery partner already exists for this user
    const existingPartner = await DeliveryPartner.findOne({ userId });
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: 'Delivery partner already exists for this user'
      });
    }

    // Generate unique partner ID
    const partnerId = generateUniquePartnerId();

    const deliveryPartner = new DeliveryPartner({
      userId,
      partnerId,
      name,
      phone,
      email,
      vehicleType,
      vehicleNumber,
      zone: zone || 'central'
    });

    await deliveryPartner.save();

    res.status(201).json({
      success: true,
      message: 'Delivery partner created successfully',
      data: deliveryPartner
    });
  } catch (error) {
    console.error('Error creating delivery partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create delivery partner',
      error: error.message
    });
  }
};

// Update delivery partner location
export const updateDeliveryPartnerLocation = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const partner = await DeliveryPartner.findOneAndUpdate(
      { partnerId },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        lastLocationUpdate: new Date()
      },
      { new: true }
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: partner
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// Update delivery partner availability
export const updateDeliveryPartnerAvailability = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { isAvailable } = req.body;

    const partner = await DeliveryPartner.findOneAndUpdate(
      { partnerId },
      { isAvailable },
      { new: true }
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: partner
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message
    });
  }
};

// Get delivery partner profile
export const getDeliveryPartnerProfile = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const partner = await DeliveryPartner.findOne({ partnerId })
      .populate('userId', 'name email phone')
      .populate('currentOrders');

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Error fetching partner profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery partner profile',
      error: error.message
    });
  }
};

// Update delivery partner rating
export const updateDeliveryPartnerRating = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { rating, orderId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const partner = await DeliveryPartner.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found'
      });
    }

    // Calculate new average rating
    const totalDeliveries = partner.totalDeliveries;
    const currentRating = partner.rating;
    const newRating = ((currentRating * totalDeliveries) + rating) / (totalDeliveries + 1);

    await DeliveryPartner.findOneAndUpdate(
      { partnerId },
      {
        rating: parseFloat(newRating.toFixed(1)),
        totalDeliveries: totalDeliveries + 1
      }
    );

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully'
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rating',
      error: error.message
    });
  }
};

// Get delivery partner current orders
export const getDeliveryPartnerCurrentOrders = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const partner = await DeliveryPartner.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found'
      });
    }

    // Import Order model
    const Order = (await import('../models/Order.js')).default;
    
    const orders = await Order.find({
      deliveryPartner: partner._id,
      status: { $in: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] }
    })
    .populate('user', 'name phone')
    .populate('items.medicine', 'name')
    .sort({ createdAt: -1 });

    // Transform orders for delivery partner app
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      customer: {
        name: order.user.name,
        phone: order.user.phone
      },
      shippingAddress: order.shippingAddress,
      items: order.items.map(item => ({
        name: item.medicine?.name || item.name,
        quantity: item.quantity
      })),
      totalPrice: order.totalPrice,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      createdAt: order.createdAt
    }));

    res.status(200).json({
      success: true,
      data: transformedOrders
    });
  } catch (error) {
    console.error('Error fetching partner orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current orders',
      error: error.message
    });
  }
};

// Get all delivery partners for admin
export const getAllDeliveryPartners = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, zone } = req.query;

    const filter = {};
    if (status) filter.isActive = status === 'active';
    if (zone) filter.zone = zone;

    const partners = await DeliveryPartner.find(filter)
      .populate('userId', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await DeliveryPartner.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        partners,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching all partners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery partners',
      error: error.message
    });
  }
};