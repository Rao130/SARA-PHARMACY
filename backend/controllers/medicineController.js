import Medicine from '../models/Medicine.js';

export const searchMedicinesBySymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || typeof symptoms !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide symptoms as a string'
      });
    }

    // Split symptoms by commas and trim whitespace
    const symptomList = symptoms.split(',').map(s => s.trim().toLowerCase());
    
    // Create a regex pattern to search for any of the symptoms in name, genericName, or description
    const searchPattern = symptomList.map(s => `(${s})`).join('|');
    const regex = new RegExp(searchPattern, 'i');

    // Search for medicines where any symptom matches name, genericName, or description
    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: regex } },
        { genericName: { $regex: regex } },
        { description: { $regex: regex } },
        { tags: { $in: symptomList } },
        { uses: { $in: symptomList } }
      ],
      isActive: true,
      stock: { $gt: 0 } // Only show medicines that are in stock
    })
    .sort({ name: 1 })
    .select('-__v -createdAt -updatedAt');

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });

  } catch (error) {
    console.error('Error searching medicines by symptoms:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
