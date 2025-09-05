import mongoose from 'mongoose';

const DeliveryPartnerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partnerId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'bicycle', 'car'],
    default: 'bike'
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  currentLocation: {
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
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  lastLocationUpdate: {
    type: Date,
    default: Date.now
  },
  zone: {
    type: String,
    default: 'central'
  }
}, {
  timestamps: true
});

// Add geospatial index for location queries
DeliveryPartnerSchema.index({ currentLocation: '2dsphere' });
DeliveryPartnerSchema.index({ isAvailable: 1, isActive: 1 });
DeliveryPartnerSchema.index({ zone: 1 });

const DeliveryPartner = mongoose.model('DeliveryPartner', DeliveryPartnerSchema);

export default DeliveryPartner;