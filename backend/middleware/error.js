// middleware/error.js
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log to console for dev
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:'.red, err.stack);
    console.error('Error Details:'.yellow, {
      name: err.name,
      code: err.code,
      statusCode: error.statusCode,
      message: error.message
    });
  }

  // Handle different types of errors
  switch (true) {
    // Rate limiting error
    case err.statusCode === 429:
      error.message = err.message || 'Too many requests, please try again later';
      error.retryAfter = err.retryAfter || '15 minutes';
      break;
      
    // Mongoose bad ObjectId
    case err.name === 'CastError':
      error.message = `Resource not found with id of ${err.value}`;
      error.statusCode = 404;
      break;
      
    // Mongoose duplicate key
    case err.code === 11000: {
      const field = Object.keys(err.keyValue)?.[0] || 'field';
      error.message = `Duplicate ${field} value entered`;
      error.statusCode = 400;
      error.errors = { [field]: `This ${field} is already in use` };
      break;
    }
      
    // Mongoose validation error
    case err.name === 'ValidationError':
      error.message = 'Validation failed';
      error.statusCode = 400;
      error.errors = Object.values(err.errors).reduce((acc, { path, message }) => ({
        ...acc,
        [path]: message
      }), {});
      break;
      
    // JWT errors
    case err.name === 'JsonWebTokenError':
      error.message = 'Invalid token';
      error.statusCode = 401;
      break;
      
    case err.name === 'TokenExpiredError':
      error.message = 'Token expired';
      error.statusCode = 401;
      break;
      
    // Default error handling
    default:
      // Don't leak error details in production
      if (process.env.NODE_ENV === 'production' && !error.isOperational) {
        error.message = 'Something went wrong';
      }
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(error.retryAfter && { retryAfter: error.retryAfter }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Wrapper for async/await error handling
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};