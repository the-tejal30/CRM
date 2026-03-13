const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getAnalytics,
  getAIInsight,
} = require('../controllers/leadController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Note: specific routes before :id routes
router.get('/analytics', protect, adminOnly, getAnalytics);
router.post('/ai-insight', protect, getAIInsight);

router.route('/').get(protect, getLeads).post(protect, createLead);
router.route('/:id').get(protect, getLead).put(protect, updateLead).delete(protect, adminOnly, deleteLead);

module.exports = router;
