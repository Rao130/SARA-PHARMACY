import cron from 'node-cron';
import PrescriptionSchedule from '../models/PrescriptionSchedule.js';
import User from '../models/User.js';
import { sendNotification } from './pushNotificationService.js';

// Store active timers to avoid duplicates
const activeTimers = new Map();

// Format time to HH:MM AM/PM
const formatTime = (hour, minute) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

// Send notification for a specific schedule
const sendMedicationReminder = async (schedule) => {
  try {
    // Get user's FCM tokens
    const user = await User.findById(schedule.user).select('fcmTokens');
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

    const { medicineName, dosage, times } = schedule;
    const timeString = times.map(t => formatTime(t.hour, t.minute)).join(', ');
    
    // Prepare notification
    const notification = {
      title: '💊 Medication Reminder',
      body: `Time to take ${dosage} of ${medicineName} at ${timeString}`,
      data: {
        type: 'MEDICATION_REMINDER',
        scheduleId: schedule._id.toString(),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      tokens: user.fcmTokens,
    };

    // Send notification
    await sendNotification(notification);
    
    // Update next notification time
    schedule.nextNotification = schedule.calculateNextNotification();
    await schedule.save();
    
    // Reschedule next notification
    scheduleNextNotification(schedule);
    
  } catch (error) {
    console.error('Error sending medication reminder:', error);
  }
};

// Schedule a single notification
const scheduleNextNotification = (schedule) => {
  if (!schedule.isActive || !schedule.nextNotification) {
    activeTimers.delete(schedule._id.toString());
    return;
  }

  const now = new Date();
  const timeUntilNotification = schedule.nextNotification - now;
  
  // If notification is in the future
  if (timeUntilNotification > 0) {
    // Clear existing timer if any
    const existingTimer = activeTimers.get(schedule._id.toString());
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      sendMedicationReminder(schedule);
    }, timeUntilNotification);
    
    activeTimers.set(schedule._id.toString(), timer);
  } else {
    // If notification is in the past, send immediately and schedule next
    sendMedicationReminder(schedule);
  }
};

// Initialize notification scheduler
const initNotificationScheduler = async () => {
  try {
    console.log('Initializing notification scheduler...');
    
    // Load all active schedules
    const now = new Date();
    const activeSchedules = await PrescriptionSchedule.find({
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: now } }
      ]
    });
    
    console.log(`Found ${activeSchedules.length} active schedules`);
    
    // Schedule each active notification
    activeSchedules.forEach(schedule => {
      scheduleNextNotification(schedule);
    });
    
    // Set up periodic check for missed schedules (every 5 minutes)
    cron.schedule('*/5 * * * *', async () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const missedSchedules = await PrescriptionSchedule.find({
        isActive: true,
        nextNotification: { $lte: fiveMinutesAgo },
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: now } }
        ]
      });
      
      if (missedSchedules.length > 0) {
        console.log(`Found ${missedSchedules.length} missed schedules, rescheduling...`);
        missedSchedules.forEach(schedule => {
          scheduleNextNotification(schedule);
        });
      }
    });
    
  } catch (error) {
    console.error('Error initializing notification scheduler:', error);
  }
};

// Clean up timers for a specific schedule
const cleanupScheduleTimers = (scheduleId) => {
  const timer = activeTimers.get(scheduleId);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(scheduleId);
  }
};

export {
  initNotificationScheduler,
  scheduleNextNotification,
  cleanupScheduleTimers
};
