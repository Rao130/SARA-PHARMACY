// scripts/migrateMedicineSchema.js
const mongoose = require('mongoose');
require('dotenv').config();
const Medicine = require('../models/Medicine');

const migrate = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB...');

    // Add the new fields to all existing documents
    const result = await Medicine.updateMany(
      { 
        $or: [
          { strength: { $exists: false } },
          { form: { $exists: false } }
        ]
      },
      { 
        $set: { 
          strength: 'N/A',
          form: 'tablet' 
        } 
      }
    );

    console.log(`Updated ${result.nModified} medicine records`);

    // Create text index
    await Medicine.collection.dropIndex('medicine_text_index').catch(() => {});
    await Medicine.createIndexes();
    console.log('Created text index for search');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();