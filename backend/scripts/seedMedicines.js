require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

// Load environment variables
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' }); // Ensure it loads the root .env file

const sampleMedicines = [
  {
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    description: 'For fever and pain relief',
    strength: '500mg',
    form: 'tablet',
    price: 5.00,
    category: 'otc',
    manufacturer: 'Cipla',
    mfgDate: new Date('2024-01-01'),
    expDate: new Date('2025-12-31'),
    batchNumber: 'BATCH001',
    stock: 1000,
    minStock: 100,
    quantity: 1000,
    minQuantity: 100
  },
  {
    name: 'Azithral 500mg',
    genericName: 'Azithromycin',
    description: 'Antibiotic for bacterial infections',
    strength: '500mg',
    form: 'tablet',
    price: 120.00,
    category: 'prescription',
    manufacturer: 'Alembic',
    mfgDate: new Date('2024-02-01'),
    expDate: new Date('2025-11-30'),
    batchNumber: 'BATCH002',
    stock: 500,
    minStock: 50,
    quantity: 500,
    minQuantity: 50
  },
  {
    name: 'Zerodol SP',
    genericName: 'Aceclofenac + Paracetamol + Serratiopeptidase',
    description: 'Pain relief and anti-inflammatory',
    strength: '100mg + 325mg + 15mg',
    form: 'tablet',
    price: 85.00,
    category: 'prescription',
    manufacturer: 'Ipca',
    mfgDate: new Date('2024-03-01'),
    expDate: new Date('2026-02-28'),
    batchNumber: 'BATCH003',
    stock: 750,
    minStock: 75,
    quantity: 750,
    minQuantity: 75
  }
];

const seedMedicines = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    
    // Clear existing medicines
    await Medicine.deleteMany({});
    console.log('Cleared existing medicines');

    // Add sample medicines
    const createdMedicines = await Medicine.insertMany(sampleMedicines);
    console.log(`Added ${createdMedicines.length} sample medicines`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding medicines:', error);
    process.exit(1);
  }
};

seedMedicines();
