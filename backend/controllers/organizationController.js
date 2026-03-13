const Organization = require('../models/Organization');
const User = require('../models/User');

// @desc    Get current organization details
// @route   GET /api/organizations/me
const getMyOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organizationId)
      .populate('createdBy', 'name email');
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update organization details (Admin only)
// @route   PUT /api/organizations/me
const updateOrganization = async (req, res) => {
  try {
    const { organizationName, logoUrl, website, industry } = req.body;
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    if (organizationName) org.organizationName = organizationName;
    if (typeof logoUrl !== 'undefined') org.logoUrl = logoUrl;
    if (typeof website !== 'undefined') org.website = website;
    if (typeof industry !== 'undefined') org.industry = industry;
    await org.save();
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all members of current organization (Admin only)
// @route   GET /api/organizations/members
const getOrganizationMembers = async (req, res) => {
  try {
    const members = await User.find({ organizationId: req.user.organizationId })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyOrganization, updateOrganization, getOrganizationMembers };
