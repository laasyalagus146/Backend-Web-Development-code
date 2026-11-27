
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = require('../db/prisma');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');

const router = express.Router();

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 3600000);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'strict',
  path: '/'
};

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password'
        }
      });
    }

    const sessionId = crypto.randomBytes(32).toString('hex');

    sessionStore.create(sessionId, {
      userId: user.id,
      expiresAt: Date.now() + SESSION_TTL_MS
    });

    res.cookie('sid', sessionId, {
      ...cookieOptions,
      signed: true,
      maxAge: SESSION_TTL_MS
    });

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get('/me', requireSession, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      sessionStore.destroy(req.sessionId);

      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized'
        }
      });
    }

    return res.status(200).json({ user });

  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', (req, res, next) => {
  try {
    const sessionId = req.signedCookies.sid;

    if (sessionId) {
      sessionStore.destroy(sessionId);
    }

    res.clearCookie('sid', cookieOptions);

    return res.status(200).json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
