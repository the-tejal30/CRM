const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id)
        .select('-password')
        .populate('organizationId', 'organizationName');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Account deactivated' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin only' });
  }
};

// Ensures the resource being accessed belongs to the user's organization
const verifyTenant = (Model) => async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    if (!resourceId) return next();

    const resource = await Model.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.organizationId.toString() !== req.user.organizationId._id.toString()) {
      return res.status(403).json({ message: 'Access denied: cross-tenant access prohibited' });
    }

    req.resource = resource;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { protect, adminOnly, verifyTenant };
