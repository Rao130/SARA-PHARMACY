const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const User = require('./backend/models/User');

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Count all users
    const totalUsers = await User.countDocuments({});
    console.log('Total users in database:', totalUsers);
    
    // Count only customer users (role: 'user')
    const customerCount = await User.countDocuments({ role: 'user' });
    console.log('Total customers (role: user):', customerCount);
    
    // List all users
    const users = await User.find({}).select('name email role createdAt').lean();
    console.log('\nAll users:');
    console.table(users);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
