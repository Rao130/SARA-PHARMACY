import mongoose from 'mongoose';

const timeSchema = new mongoose.Schema({
  hour: { type: Number, required: true, min: 0, max: 23 },
  minute: { type: Number, required: true, min: 0, max: 59 },
  ampm: { type: String, required: true, enum: ['am', 'pm'] }
}, { _id: false });

const PrescriptionScheduleSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  medicineName: { 
    type: String, 
    required: [true, 'Medicine name is required'],
    trim: true
  },
  dosage: { 
    type: String, 
    required: [true, 'Dosage is required'],
    trim: true
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  days: [{
    type: String,
    enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  }],
  times: {
    type: [timeSchema],
    required: [true, 'At least one time is required'],
    validate: [
      (times) => times && times.length > 0,
      'At least one time is required'
    ]
  },
  startDate: { 
    type: Date, 
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: Date,
  notes: String,
  isActive: { 
    type: Boolean, 
    default: true 
  },
  nextNotification: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster querying
PrescriptionScheduleSchema.index({ user: 1, isActive: 1 });
PrescriptionScheduleSchema.index({ nextNotification: 1 });

// Calculate next notification time before saving
PrescriptionScheduleSchema.pre('save', function(next) {
  if (this.isModified('times') || this.isNew) {
    this.nextNotification = this.calculateNextNotification();
  }
  next();
});

// Method to calculate next notification time
PrescriptionScheduleSchema.methods.calculateNextNotification = function() {
  const now = new Date();
  const currentDay = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Convert times to minutes since midnight for comparison
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  let nextTime = null;
  
  // Find next time today or in future
  for (const time of this.times) {
    const time24h = time.ampm === 'pm' && time.hour < 12 ? time.hour + 12 : time.hour;
    const timeMinutes = time24h * 60 + time.minute;
    
    if (this.frequency === 'daily' || 
        (this.frequency === 'weekly' && this.days.includes(currentDay)) ||
        (this.frequency === 'custom' && this.days.includes(currentDay))) {
      
      if (timeMinutes > currentMinutes) {
        nextTime = new Date(now);
        nextTime.setHours(time24h, time.minute, 0, 0);
        break;
      }
    }
  }
  
  // If no more times today, find next day
  if (!nextTime) {
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    
    for (let i = 0; i < 7; i++) {
      const checkDay = nextDay.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      
      if (this.frequency === 'daily' || 
          (this.frequency === 'weekly' && this.days.includes(checkDay)) ||
          (this.frequency === 'custom' && this.days.includes(checkDay))) {
        
        const earliestTime = [...this.times].sort((a, b) => {
          const a24h = a.ampm === 'pm' && a.hour < 12 ? a.hour + 12 : a.hour;
          const b24h = b.ampm === 'pm' && b.hour < 12 ? b.hour + 12 : b.hour;
          return (a24h * 60 + a.minute) - (b24h * 60 + b.minute);
        })[0];
        
        const time24h = earliestTime.ampm === 'pm' && earliestTime.hour < 12 ? 
          earliestTime.hour + 12 : earliestTime.hour;
        
        nextTime = new Date(nextDay);
        nextTime.setHours(time24h, earliestTime.minute, 0, 0);
        break;
      }
      
      nextDay.setDate(nextDay.getDate() + 1);
    }
  }
  
  return nextTime;
};

const PrescriptionSchedule = mongoose.model('PrescriptionSchedule', PrescriptionScheduleSchema);

export default PrescriptionSchedule;
