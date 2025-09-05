// controllers/devices.js
import { addUserFcmToken, removeUserFcmToken } from '../services/pushNotificationService.js';

// POST /api/v1/devices/token
// Body: { token: string }
export const registerDeviceToken = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body || {};
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'token is required' });
    }

    const result = await addUserFcmToken(userId, token);
    if (!result.success) return res.status(500).json({ success: false, message: result.error || 'Failed to save token' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to register device token', error: err.message });
  }
};

// DELETE /api/v1/devices/token
// Body: { token: string }
export const unregisterDeviceToken = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body || {};
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'token is required' });
    }

    const result = await removeUserFcmToken(userId, token);
    if (!result.success) return res.status(500).json({ success: false, message: result.error || 'Failed to remove token' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to unregister device token', error: err.message });
  }
};
