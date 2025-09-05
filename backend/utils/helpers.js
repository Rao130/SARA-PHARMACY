import crypto from 'crypto';

// Generate unique partner ID
export const generateUniquePartnerId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(4).toString('hex');
  return `SP${timestamp}${randomStr}`.toUpperCase();
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Generate estimated delivery time based on distance and traffic
export const calculateEstimatedDeliveryTime = (distance, vehicleType = 'bike') => {
  const baseSpeed = {
    bike: 25, // km/h
    scooter: 20,
    bicycle: 15,
    car: 30
  };
  
  const speed = baseSpeed[vehicleType] || baseSpeed.bike;
  const timeInHours = distance / speed;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  
  // Add buffer time for traffic and stops (20-40 minutes)
  const bufferTime = Math.ceil(Math.random() * 20) + 20;
  
  return timeInMinutes + bufferTime;
};

// Format time in minutes to human readable format
export const formatDeliveryTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
};

// Generate order tracking ID
export const generateTrackingId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(3).toString('hex');
  return `TRK${timestamp}${randomStr}`.toUpperCase();
};

// Validate coordinates
export const isValidCoordinates = (longitude, latitude) => {
  return (
    typeof longitude === 'number' &&
    typeof latitude === 'number' &&
    longitude >= -180 && longitude <= 180 &&
    latitude >= -90 && latitude <= 90
  );
};

// Generate random location within radius (for demo purposes)
export const generateRandomLocationNear = (centerLat, centerLon, radiusKm) => {
  const earthRadius = 6371;
  const radiusInDegrees = radiusKm / earthRadius * (180 / Math.PI);
  
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  
  const newLat = centerLat + x;
  const newLon = centerLon + y;
  
  return {
    latitude: parseFloat(newLat.toFixed(6)),
    longitude: parseFloat(newLon.toFixed(6))
  };
};