import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 30 : 1000, // Generous limit in development
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !isProduction, // Disable limiting during development/evaluation
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

export const reportIssueLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isProduction ? 20 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !isProduction,
  message: {
    success: false,
    message: 'Report submission limit reached. Please wait a few minutes before submitting another report.'
  }
});

export const apiGeneralLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isProduction ? 200 : 5000,
  standardHeaders: true,
  legacyHeaders: false
});
