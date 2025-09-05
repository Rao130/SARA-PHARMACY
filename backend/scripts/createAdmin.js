import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

// You can override via backend/.env
// ADMIN_EMAIL=admin@sarapharmacy.com
// ADMIN_PASSWORD=admin123
const EMAIL = process.env.ADMIN_EMAIL || 'admin@sarapharmacy.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function createOrPromoteAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');

    // Try to find existing user by email
    let user = await User.findOne({ email: EMAIL }).select('+password');

    if (user) {
      // Promote to admin and optionally reset password
      user.role = 'admin';
      if (PASSWORD) {
        user.password = PASSWORD; // pre-save hook will hash
      }
      await user.save();
      console.log(`Admin user updated: ${EMAIL}`);
    } else {
      // Create new admin user (pre-save hook hashes password)
      await User.create({
        name: 'Admin',
        email: EMAIL,
        password: PASSWORD,
        phone: '9999999999',
        address: 'Admin Address',
        role: 'admin',
      });
      console.log(`Admin user created: ${EMAIL}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating/promoting admin user:', error);
    process.exit(1);
  }
}

createOrPromoteAdmin();
