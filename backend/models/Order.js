import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    id: String,
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    update_time: String,
    email_address: String,
    upi_id: String,
    transaction_id: String,
    payment_gateway: String,
    payment_response: Object
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'packed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // Delivery tracking fields
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner'
  },
  estimatedDeliveryTime: {
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  deliveryLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  deliveryTracking: [{
    status: {
      type: String,
      enum: ['confirmed', 'preparing', 'packed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    message: String
  }],
  deliveryInstructions: {
    type: String,
    maxlength: 500
  },
  deliveryPhoto: {
    type: String // URL to delivery proof photo
  }
}, {
  timestamps: true
});

// Add indexes
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ deliveryPartner: 1 });
OrderSchema.index({ 'deliveryLocation': '2dsphere' }); // For geospatial queries
OrderSchema.index({ 'deliveryTracking.location': '2dsphere' });

const Order = mongoose.model('Order', OrderSchema);

export default Order;