
'use strict';

// middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,

  handler: (req, res) => {
    const resetTime = req.rateLimit.resetTime;

    const retryAfter = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : 900;

    res.set('Retry-After', String(retryAfter));

    res.status(429).json({
      message: 'Too many requests. Please try again later.',
    });
  },
});

/*
 * Redis-backed store:
 *
 * The default in-memory store keeps counters separately
 * inside each server instance.
 *
 * Behind a load balancer, requests can reach different
 * instances, giving a client N times the intended limit
 * across N instances.
 *
 * Using rate-limit-redis with a shared Redis database
 * centralizes counters so every instance shares the
 * same rate-limit information.
 */
