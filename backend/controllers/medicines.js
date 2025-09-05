import Medicine from '../models/Medicine.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { broadcast } from '../services/realtime.js';

// @desc    Get all medicines
// @route   GET /api/v1/medicines
// @access  Public
export const getMedicines = async (req, res, next) => {
  try {
    const { data } = res.advancedResults;
    successResponse(res, data, 200, 'Medicines retrieved successfully');
  } catch (err) {
    errorResponse(res, 'Server error', 500, err);
  }
};

// @desc    Get single medicine
// @route   GET /api/v1/medicines/:id
// @access  Public
export const getMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    successResponse(res, medicine, 200, 'Medicine retrieved successfully');
  } catch (err) {
    errorResponse(res, 'Server error', 500, err);
  }
};

// @desc    Create new medicine
// @route   POST /api/v1/medicines
// @access  Private/Admin
export const createMedicine = async (req, res, next) => {
  try {
    // Attach uploaded image filename if present
    if (req.file && req.file.filename) {
      req.body.image = req.file.filename;
    }
    
    // Handle expiry date field name discrepancy
    if (req.body.expDate && !req.body.expiryDate) {
      req.body.expiryDate = req.body.expDate;
      delete req.body.expDate;
    }
    
    const medicine = await Medicine.create(req.body);
    
    // Broadcast medicine addition to all connected admin clients
    broadcast('medicine:added', medicine);
    
    successResponse(res, medicine, 201, 'Medicine created successfully');
  } catch (err) {
    errorResponse(res, 'Error creating medicine', 400, err);
  }
};

// @desc    Update medicine
// @route   PUT /api/v1/medicines/:id
// @access  Private/Admin
export const updateMedicine = async (req, res, next) => {
  try {
    let medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    if (req.file && req.file.filename) {
      req.body.image = req.file.filename;
    }
    
    // Handle expiry date field name discrepancy
    if (req.body.expDate && !req.body.expiryDate) {
      req.body.expiryDate = req.body.expDate;
      delete req.body.expDate;
    }
    
    medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Broadcast medicine update to all connected admin clients
    broadcast('medicine:updated', medicine);

    successResponse(res, medicine, 200, 'Medicine updated successfully');
  } catch (err) {
    errorResponse(res, 'Error updating medicine', 400, err);
  }
};

// @desc    Delete medicine
// @route   DELETE /api/v1/medicines/:id
// @access  Private/Admin
export const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    await medicine.remove();
    
    // Broadcast medicine deletion to all connected admin clients
    broadcast('medicine:deleted', { _id: req.params.id });
    
    successResponse(res, {}, 200, 'Medicine deleted successfully');
  } catch (err) {
    errorResponse(res, 'Error deleting medicine', 500, err);
  }
};

// @desc    Get low stock medicines
// @route   GET /api/v1/medicines/low-stock
// @access  Private/Admin
export const getLowStockMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({
      stock: { $lte: { $min: ['$minStockLevel', 10] } }
    });

    successResponse(res, medicines, 200, 'Low stock medicines retrieved successfully');
  } catch (err) {
    errorResponse(res, 'Server error', 500, err);
  }
};

// @desc    Get expiring soon medicines
// @route   GET /api/v1/medicines/expiring-soon
// @access  Private/Admin
export const getExpiringSoonMedicines = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 3;
    const date = new Date();
    date.setMonth(date.getMonth() + months);

    const medicines = await Medicine.find({
      expiryDate: { $lte: date },
      expiryDate: { $gte: new Date() }
    }).sort('expiryDate');

    successResponse(res, medicines, 200, `Medicines expiring within ${months} months retrieved successfully`);
  } catch (err) {
    errorResponse(res, 'Server error', 500, err);
  }
};

// @desc    Search medicines by symptoms
// @route   POST /api/v1/medicines/search-by-symptoms
// @access  Public
export const searchBySymptoms = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || typeof symptoms !== 'string') {
      return errorResponse(res, 'Please provide symptoms to search', 400);
    }

    // Split symptoms by comma and trim whitespace
    const symptomTerms = symptoms.split(',').map(s => s.trim().toLowerCase());
    
    // Create a more comprehensive search query
    const searchQuery = {
      $or: [
        // Search in symptoms array (exact matches)
        { symptoms: { $in: symptomTerms } },
        // Search in conditions array (exact matches)
        { conditions: { $in: symptomTerms } },
        // Search in uses array (exact matches)
        { uses: { $in: symptomTerms } },
        // Search in tags array (exact matches)
        { tags: { $in: symptomTerms } },
        // Search in name and genericName (partial matches)
        { 
          $or: [
            { name: { $regex: new RegExp(symptomTerms.join('|'), 'i') } },
            { genericName: { $regex: new RegExp(symptomTerms.join('|'), 'i') } }
          ]
        },
        // Search in description (partial matches)
        { description: { $regex: new RegExp(symptomTerms.join('|'), 'i') } }
      ],
      // Only show active medicines with stock
      isActive: { $ne: false },
      stock: { $gt: 0 }
    };

    const medicines = await Medicine.find(searchQuery)
      .select('name genericName description price form strength manufacturer stock prescriptionRequired image discount symptoms uses tags')
      .sort({ name: 1 })
      .limit(20); // Limit results to prevent overwhelming response

    // Add relevance score based on how well symptoms match
    const medicinesWithScore = medicines.map(medicine => {
      let score = 0;
      const medicineData = medicine.toObject();
      
      // Check exact matches in symptoms array
      if (medicine.symptoms) {
        const symptomMatches = medicine.symptoms.filter(s => 
          symptomTerms.some(term => s.includes(term) || term.includes(s))
        );
        score += symptomMatches.length * 10;
      }
      
      // Check exact matches in uses array
      if (medicine.uses) {
        const useMatches = medicine.uses.filter(u => 
          symptomTerms.some(term => u.includes(term) || term.includes(u))
        );
        score += useMatches.length * 8;
      }
      
      // Check exact matches in tags array
      if (medicine.tags) {
        const tagMatches = medicine.tags.filter(t => 
          symptomTerms.some(term => t.includes(term) || term.includes(t))
        );
        score += tagMatches.length * 5;
      }
      
      // Check partial matches in name/genericName
      if (medicine.name && symptomTerms.some(term => 
        medicine.name.toLowerCase().includes(term)
      )) {
        score += 3;
      }
      
      if (medicine.genericName && symptomTerms.some(term => 
        medicine.genericName.toLowerCase().includes(term)
      )) {
        score += 2;
      }
      
      return {
        ...medicineData,
        relevanceScore: score
      };
    });

    // Sort by relevance score (highest first)
    medicinesWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);

    successResponse(res, medicinesWithScore, 200, 'Medicines retrieved successfully');
  } catch (err) {
    console.error('Error searching medicines by symptoms:', err);
    errorResponse(res, 'Error searching medicines', 500, err);
  }
};