import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Announcement from '../models/Announcement.js';

dotenv.config();

async function createTestAnnouncement() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create a test announcement
    const testAnnouncement = new Announcement({
      title: 'Special Offer!',
      message: 'Get 20% off on all medicines this week!',
      type: 'offer',
      active: true,
    });

    await testAnnouncement.save();
    console.log('Test announcement created successfully:', testAnnouncement);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test announcement:', error);
    process.exit(1);
  }
}

createTestAnnouncement();
