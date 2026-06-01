import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

(async () => {
  if (!uri) {
    console.error('MONGODB_URI not found in environment');
    process.exit(2);
  }
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB Atlas');
    const db = mongoose.connection.db;
    console.log('Database name:', db.databaseName);
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message || err);
    process.exit(1);
  }
})();