import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Common rate limit configuration
const commonRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  handler: (req, res, next, options) => {
    const error = new Error(options.message);
    error.statusCode = 429;
    error.retryAfter = Math.ceil(options.windowMs / 60000); // in minutes
    next(error);
  },
  keyGenerator: (req) => {
    // Use ipKeyGenerator to properly handle both IPv4 and IPv6
    const ip = ipKeyGenerator(req);
    return `${ip}-${req.method}-${req.path}`;
  }
};

// Rate limiting for login attempts
export const loginLimiter = rateLimit({
  ...commonRateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Only count failed login attempts
  message: 'Too many login attempts from this IP. Please try again later.',
  keyGenerator: (req) => {
    // Use ipKeyGenerator to properly handle both IPv4 and IPv6
    const ip = ipKeyGenerator(req);
    return `login-${ip}-${req.headers['user-agent'] || 'unknown'}`;
  }
});

// Rate limiting for sensitive operations (signup, password reset, etc.)
export const sensitiveLimiter = rateLimit({
  ...commonRateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: 'Too many attempts. Please try again later.',
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    return `sensitive-${ip}-${req.path}`;
  }
});

// General API rate limiting
export const apiLimiter = rateLimit({
  ...commonRateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes per endpoint per IP
  skipFailedRequests: true, // Don't count failed requests
  message: 'Too many requests from this IP. Please try again later.',
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    return `api-${ip}-${req.method}-${req.path}`;
  }
});

// Strict rate limiting for public endpoints
export const strictLimiter = rateLimit({
  ...commonRateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: 'Too many requests. Please slow down.',
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    return `strict-${ip}`;
  }
});

// Rate limiting for file uploads
export const uploadLimiter = rateLimit({
  ...commonRateLimitConfig,
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 20, // 20 uploads per 30 minutes per IP
  message: 'Too many file uploads. Please try again later.',
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    return `upload-${ip}`;
  }
});
