// scripts/testMedicineModel.js
const mongoose = require('mongoose');
require('dotenv').config();
const Medicine = require('../models/Medicine');

const testMedicine = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create a test medicine
    const medicine = new Medicine({
      name: 'Test Medicine',
      genericName: 'Test Generic',
      description: 'Test Description',
      strength: '500mg',
      form: 'tablet',
      price: 100,
      category: 'otc',
      manufacturer: 'Test Labs',
      mfgDate: new Date('2023-01-01'),
      expDate: new Date('2025-12-31'),
      stock: 50,
      minStockLevel: 10
    });

    await medicine.save();
    console.log('Test medicine created:', medicine);

    // Test virtual fields
    console.log('Is low stock?', medicine.isLowStock); // false
    console.log('Is expiring soon?', medicine.isExpiringSoon); // depends on current date

    // Test static methods
    const lowStock = await Medicine.getLowStock();
    console.log('Low stock medicines:', lowStock);

    const expiringSoon = await Medicine.getExpiringSoon();
    console.log('Expiring soon medicines:', expiringSoon);

    // Test text search
    const searchResults = await Medicine.find({ $text: { $search: 'test' } });
    console.log('Search results:', searchResults);

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testMedicine();