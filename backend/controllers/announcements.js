// controllers/announcements.js
import Announcement from '../models/Announcement.js';
import { broadcast } from '../services/realtime.js';

// GET /api/v1/announcements
// Optional query: since=<ISO string>
export const getAnnouncements = async (req, res) => {
  try {
    const { since } = req.query;
    const query = { active: true };
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        query.createdAt = { $gt: sinceDate };
      }
    }
    const items = await Announcement.find(query).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch announcements', error: err.message });
  }
};

// DELETE /api/v1/announcements/:id
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Announcement.findById(id);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    await Announcement.findByIdAndDelete(id);
    // Broadcast deletion to clients (optional)
    broadcast('announcement:deleted', { _id: id });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete announcement', error: err.message });
  }
};

// POST /api/v1/announcements
// Body: { title, message, type, active }
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type = 'offer', active = true } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'title and message are required' });
    }
    const created = await Announcement.create({ title, message, type, active });
    // Broadcast to all connected clients
    broadcast('announcement:new', created);
    res.status(201).json({ success: true, item: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create announcement', error: err.message });
  }
};
