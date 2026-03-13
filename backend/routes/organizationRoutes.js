const express = require('express');
const router = express.Router();
const {
  getMyOrganization,
  updateOrganization,
  getOrganizationMembers,
} = require('../controllers/organizationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyOrganization);
router.put('/me', protect, adminOnly, updateOrganization);
router.get('/members', protect, getOrganizationMembers); // all roles can view team

module.exports = router;
