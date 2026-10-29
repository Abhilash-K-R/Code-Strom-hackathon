const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FamilyMember = require('../models/FamilyMember');
const { getIsConnected } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'familymeds_jwt_secret_spiral1_2026';

/**
 * Authentication Middleware
 * Validates Bearer JWT, attaches req.user and req.familyId
 */
const requireAuth = (inMemoryStore) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required (Bearer <token>)' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (getIsConnected()) {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;

      // Find user's family membership
      const membership = await FamilyMember.findOne({ userId: user._id });
      if (membership) {
        req.familyId = membership.familyId.toString();
        req.userRoleInFamily = membership.role;
      }
    } else {
      // In-Memory store fallback
      const user = inMemoryStore.users.find((u) => u.id === decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      const membership = inMemoryStore.familyMembers.find((m) => m.userId === user.id);
      if (membership) {
        req.familyId = membership.familyId;
        req.userRoleInFamily = membership.role;
      }
    }

    next();
  } catch (error) {
    console.error('requireAuth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Ensures the authenticated user belongs to an active family
 */
const requireFamily = (req, res, next) => {
  if (!req.familyId) {
    return res.status(403).json({ error: 'You must create or join a family first.' });
  }
  next();
};

module.exports = {
  requireAuth,
  requireFamily,
  JWT_SECRET,
};

