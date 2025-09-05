// models/Medicine.js
import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    unique: true
  },
  genericName: {
    type: String,
    required: [true, 'Please add a generic name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  // Add these new fields
  strength: {
    type: String,
    required: [true, 'Please add medicine strength (e.g., 500mg, 10ml)'],
    trim: true
  },
  form: {
    type: String,
    required: [true, 'Please select medicine form'],
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'ointment', 'cream', 'gel', 'spray', 'inhaler', 'suppository', 'powder', 'solution', 'suspension'],
    lowercase: true
  },
  // Rest of your existing fields
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['prescription', 'otc', 'herbal', 'ayurvedic', 'homeopathic', 'surgical', 'other']
  },
  manufacturer: {
    type: String,
    required: [true, 'Please add a manufacturer']
  },
  mfgDate: {
    type: Date,
    required: [true, 'Please add manufacturing date']
  },
  // Symptom-related fields
  symptoms: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  uses: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  conditions: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  expiryDate: {
    type: Date,
    required: [true, 'Please add expiry date'],
    validate: {
      validator: function(value) {
        return value > this.mfgDate;
      },
      message: 'Expiry date must be after manufacturing date'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative']
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: [0, 'Minimum stock level cannot be negative']
  },
  prescriptionRequired: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%']
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search
medicineSchema.index({ 
  name: 'text', 
  genericName: 'text', 
  description: 'text',
  manufacturer: 'text',
  tags: 'text'
}, {
  weights: {
    name: 10,
    genericName: 8,
    tags: 5,
    description: 2,
    manufacturer: 3
  },
  name: 'medicine_text_index'
});

// Virtual for checking if stock is low
medicineSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.minStockLevel;
});

// Virtual for checking if medicine is expiring soon (within 3 months)
medicineSchema.virtual('isExpiringSoon').get(function() {
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  return this.expDate <= threeMonthsFromNow;
});

// Static method to get low stock medicines
medicineSchema.statics.getLowStock = function() {
  return this.find({ 
    $expr: { $lte: ['$stock', '$minStockLevel'] } 
  }).sort({ stock: 1 });
};

// Static method to get expiring soon medicines
medicineSchema.statics.getExpiringSoon = function(months = 3) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return this.find({ 
    expDate: { $lte: date },
    expDate: { $gte: new Date() } // Not expired yet
  }).sort({ expDate: 1 });
};

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;