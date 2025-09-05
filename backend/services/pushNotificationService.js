import admin from 'firebase-admin';
import User from '../models/User.js';

// Initialize Firebase Admin SDK with robust env handling
const initializeFirebase = () => {
  try {
    if (admin.apps.length) return; // already initialized

    let serviceAccount = null;

    // Preferred: full JSON in FIREBASE_SERVICE_ACCOUNT
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (e) {
        console.error('Invalid FIREBASE_SERVICE_ACCOUNT JSON. Skipping Firebase initialization.');
        return;
      }
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      // Alternative: discrete fields
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: privateKey,
      };
    } else {
      console.warn('Firebase credentials not provided. Skipping Firebase initialization.');
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized');
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK:', err?.message || err);
  }
};

// Send notification to multiple FCM tokens
const sendNotification = async ({ title, body, data = {}, tokens = [] }) => {
  if (!tokens || tokens.length === 0) return { success: false, error: 'No tokens provided' };
  
  try {
    const message = {
      notification: { title, body },
      data: {
        ...data,
        title,
        body,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        sound: 'default'
      },
      tokens: Array.isArray(tokens) ? tokens : [tokens]
    };
    
    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      if (failedTokens.length > 0) {
        await removeInvalidTokens(failedTokens);
      }
    }
    
    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
    
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

// Remove invalid FCM tokens from users
const removeInvalidTokens = async (tokens) => {
  try {
    await User.updateMany(
      { fcmTokens: { $in: tokens } },
      { $pull: { fcmTokens: { $in: tokens } } }
    );
    console.log(`Removed ${tokens.length} invalid FCM tokens`);
  } catch (error) {
    console.error('Error removing invalid FCM tokens:', error);
  }
};

// Add FCM token to user
const addUserFcmToken = async (userId, token) => {
  try {
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { fcmTokens: token } },
      { new: true, upsert: false }
    );
    return { success: true };
  } catch (error) {
    console.error('Error adding FCM token:', error);
    return { success: false, error: error.message };
  }
};

// Remove FCM token from user
const removeUserFcmToken = async (userId, token) => {
  try {
    await User.findByIdAndUpdate(
      userId,
      { $pull: { fcmTokens: token } },
      { new: true }
    );
    return { success: true };
  } catch (error) {
    console.error('Error removing FCM token:', error);
    return { success: false, error: error.message };
  }
};

export {
  initializeFirebase,
  sendNotification,
  addUserFcmToken,
  removeUserFcmToken
};
