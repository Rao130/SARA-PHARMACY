import PrescriptionSchedule from '../models/PrescriptionSchedule.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    Get all prescription schedules for user
// @route   GET /api/v1/prescription-schedules
// @access  Private
export const getPrescriptionSchedules = asyncHandler(async (req, res, next) => {
  const schedules = await PrescriptionSchedule.find({ user: req.user.id })
    .sort({ nextNotification: 1 });
  
  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules
  });
});

// @desc    Get single prescription schedule
// @route   GET /api/v1/prescription-schedules/:id
// @access  Private
export const getPrescriptionSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await PrescriptionSchedule.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!schedule) {
    return next(
      new ErrorResponse(`No schedule found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: schedule
  });
});

// @desc    Create new prescription schedule
// @route   POST /api/v1/prescription-schedules
// @access  Private
export const createPrescriptionSchedule = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const schedule = await PrescriptionSchedule.create(req.body);

  res.status(201).json({
    success: true,
    data: schedule
  });
});

// @desc    Update prescription schedule
// @route   PUT /api/v1/prescription-schedules/:id
// @access  Private
export const updatePrescriptionSchedule = asyncHandler(async (req, res, next) => {
  let schedule = await PrescriptionSchedule.findById(req.params.id);

  if (!schedule) {
    return next(
      new ErrorResponse(`No schedule with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the schedule
  if (schedule.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this schedule`,
        401
      )
    );
  }

  schedule = await PrescriptionSchedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: schedule
  });
});

// @desc    Delete prescription schedule
// @route   DELETE /api/v1/prescription-schedules/:id
// @access  Private
export const deletePrescriptionSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await PrescriptionSchedule.findById(req.params.id);

  if (!schedule) {
    return next(new ErrorResponse(`No schedule with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the schedule
  if (schedule.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this schedule`, 401));
  }

  try {
    await PrescriptionSchedule.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.error('Failed to delete schedule:', err);
    return next(new ErrorResponse('Failed to delete schedule', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Schedule deleted'
  });
});

// @desc    Snooze next notification
// @route   POST /api/v1/prescription-schedules/:id/snooze
// @access  Private
export const snoozePrescription = asyncHandler(async (req, res, next) => {
  const { minutes = 15 } = req.body;
  
  const schedule = await PrescriptionSchedule.findById(req.params.id);

  if (!schedule) {
    return next(
      new ErrorResponse(`No schedule with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the schedule
  if (schedule.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to snooze this schedule`,
        401
      )
    );
  }

  // Calculate new notification time
  const newNotificationTime = new Date(Date.now() + minutes * 60 * 1000);
  
  schedule.nextNotification = newNotificationTime;
  await schedule.save();

  res.status(200).json({
    success: true,
    data: schedule
  });
});
