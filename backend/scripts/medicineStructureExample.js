// This script shows you how to add medicines with symptom data to your database
// You can use this as a reference when adding medicines through your admin panel

const EXAMPLE_MEDICINE_WITH_SYMPTOMS = {
  name: "Paracetamol 500mg",
  genericName: "Acetaminophen",
  description: "Used to treat fever and mild to moderate pain",
  strength: "500mg",
  form: "tablet",
  price: 25,
  category: "otc",
  manufacturer: "Generic Pharma",
  mfgDate: new Date("2024-01-01"),
  expiryDate: new Date("2026-01-01"),
  stock: 100,
  prescriptionRequired: false,
  
  // IMPORTANT: These fields are used by the symptom checker
  symptoms: [
    "fever",
    "headache", 
    "pain",
    "toothache",
    "muscle pain",
    "arthritis",
    "migraine"
  ],
  
  uses: [
    "fever reducer",
    "pain relief", 
    "headache treatment",
    "toothache relief"
  ],
  
  tags: [
    "fever",
    "pain", 
    "headache",
    "analgesic",
    "antipyretic"
  ],
  
  conditions: [
    "fever",
    "headache",
    "pain"
  ]
};

// Example symptoms for different medicine types:

// Pain & Fever Medicines
const PAIN_FEVER_SYMPTOMS = [
  "fever", "headache", "pain", "toothache", "muscle pain", 
  "joint pain", "arthritis", "migraine", "period pain"
];

// Respiratory Medicines  
const RESPIRATORY_SYMPTOMS = [
  "cough", "cold", "sore throat", "runny nose", "sneezing",
  "congestion", "bronchitis", "asthma", "wheezing"
];

// Digestive Medicines
const DIGESTIVE_SYMPTOMS = [
  "stomach pain", "nausea", "indigestion", "heartburn", 
  "acid reflux", "diarrhea", "constipation", "bloating"
];

// Allergy Medicines
const ALLERGY_SYMPTOMS = [
  "allergies", "hives", "itching", "skin rash", "hay fever",
  "seasonal allergies", "nasal congestion"
];

// Anti-inflammatory Medicines
const ANTI_INFLAMMATORY_SYMPTOMS = [
  "inflammation", "swelling", "pain", "arthritis", 
  "joint pain", "muscle pain"
];

console.log("Example medicine structure:", EXAMPLE_MEDICINE_WITH_SYMPTOMS);
console.log("\nCommon symptom categories:");
console.log("Pain & Fever:", PAIN_FEVER_SYMPTOMS);
console.log("Respiratory:", RESPIRATORY_SYMPTOMS);
console.log("Digestive:", DIGESTIVE_SYMPTOMS);
console.log("Allergies:", ALLERGY_SYMPTOMS);
console.log("Anti-inflammatory:", ANTI_INFLAMMATORY_SYMPTOMS);

