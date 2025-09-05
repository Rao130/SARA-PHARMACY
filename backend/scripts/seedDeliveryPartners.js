import mongoose from 'mongoose';
import DeliveryPartner from '../models/DeliveryPartner.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const seedDeliveryPartners = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Create demo delivery partner users
    const partnerUsers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.delivery@sarapharmacy.com',
        password: await bcrypt.hash('deliverypartner123', 12),
        phone: '+91 9876543210',
        address: 'Delivery Partner Address 1',
        role: 'user'
      },
      {
        name: 'Amit Singh',
        email: 'amit.delivery@sarapharmacy.com',
        password: await bcrypt.hash('deliverypartner123', 12),
        phone: '+91 9876543211',
        address: 'Delivery Partner Address 2',
        role: 'user'
      },
      {
        name: 'Suresh Patel',
        email: 'suresh.delivery@sarapharmacy.com',
        password: await bcrypt.hash('deliverypartner123', 12),
        phone: '+91 9876543212',
        address: 'Delivery Partner Address 3',
        role: 'user'
      },
      {
        name: 'Vijay Sharma',
        email: 'vijay.delivery@sarapharmacy.com',
        password: await bcrypt.hash('deliverypartner123', 12),
        phone: '+91 9876543213',
        address: 'Delivery Partner Address 4',
        role: 'user'
      }
    ];

    // Insert or update users
    const createdUsers = [];
    for (const userData of partnerUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created user: ${user.name}`);
      } else {
        console.log(`User already exists: ${user.name}`);
      }
      createdUsers.push(user);
    }

    // Create delivery partners
    const deliveryPartnersData = [
      {
        userId: createdUsers[0]._id,
        partnerId: 'SP001',
        name: 'Rajesh Kumar',
        phone: '+91 9876543210',
        email: 'rajesh.delivery@sarapharmacy.com',
        vehicleType: 'bike',
        vehicleNumber: 'DL-01-AB-1234',
        currentLocation: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        },
        zone: 'central',
        rating: 4.8,
        totalDeliveries: 150,
        isActive: true,
        isAvailable: true
      },
      {
        userId: createdUsers[1]._id,
        partnerId: 'SP002',
        name: 'Amit Singh',
        phone: '+91 9876543211',
        email: 'amit.delivery@sarapharmacy.com',
        vehicleType: 'scooter',
        vehicleNumber: 'DL-02-CD-5678',
        currentLocation: {
          type: 'Point',
          coordinates: [77.2167, 28.6167] // Delhi coordinates
        },
        zone: 'north',
        rating: 4.6,
        totalDeliveries: 120,
        isActive: true,
        isAvailable: true
      },
      {
        userId: createdUsers[2]._id,
        partnerId: 'SP003',
        name: 'Suresh Patel',
        phone: '+91 9876543212',
        email: 'suresh.delivery@sarapharmacy.com',
        vehicleType: 'bike',
        vehicleNumber: 'DL-03-EF-9012',
        currentLocation: {
          type: 'Point',
          coordinates: [77.2100, 28.6100] // Delhi coordinates
        },
        zone: 'south',
        rating: 4.9,
        totalDeliveries: 200,
        isActive: true,
        isAvailable: true
      },
      {
        userId: createdUsers[3]._id,
        partnerId: 'SP004',
        name: 'Vijay Sharma',
        phone: '+91 9876543213',
        email: 'vijay.delivery@sarapharmacy.com',
        vehicleType: 'bicycle',
        vehicleNumber: 'DL-04-GH-3456',
        currentLocation: {
          type: 'Point',
          coordinates: [77.2200, 28.6200] // Delhi coordinates
        },
        zone: 'east',
        rating: 4.7,
        totalDeliveries: 80,
        isActive: true,
        isAvailable: false // One unavailable partner
      }
    ];

    // Insert or update delivery partners
    for (const partnerData of deliveryPartnersData) {
      let partner = await DeliveryPartner.findOne({ partnerId: partnerData.partnerId });
      if (!partner) {
        partner = await DeliveryPartner.create(partnerData);
        console.log(`Created delivery partner: ${partner.name}`);
      } else {
        await DeliveryPartner.findOneAndUpdate(
          { partnerId: partnerData.partnerId },
          partnerData,
          { new: true }
        );
        console.log(`Updated delivery partner: ${partnerData.name}`);
      }
    }

    console.log('✅ Delivery partners seeded successfully!');
    console.log('Available delivery partners:');
    const partners = await DeliveryPartner.find({ isActive: true }).populate('userId', 'name email');
    partners.forEach(partner => {
      console.log(`- ${partner.name} (${partner.partnerId}) - ${partner.vehicleType} - ${partner.isAvailable ? 'Available' : 'Busy'}`);
    });

  } catch (error) {
    console.error('Error seeding delivery partners:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedDeliveryPartners();