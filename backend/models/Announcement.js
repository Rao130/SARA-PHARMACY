// models/Announcement.js
import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['offer', 'tip', 'update'], default: 'offer' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', AnnouncementSchema);
