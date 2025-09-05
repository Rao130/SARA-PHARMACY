// utils/responseHandler.js
export const successResponse = (res, data, statusCode = 200, message = 'Success') => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  
  export const errorResponse = (res, message, statusCode = 500, error = {}) => {
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  };