const Lead = require('../models/Lead');
const Note = require('../models/Note');
const Task = require('../models/Task');
const { generateAIInsight } = require('../utils/aiInsight');

// @desc    Get all leads for the organization
// @route   GET /api/leads
const getLeads = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = { organizationId: req.user.organizationId };

    // Employees only see leads assigned to them
    if (req.user.role === 'Employee') {
      filter.assignedTo = req.user._id;
    }

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email avatarUrl')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Lead.countDocuments(filter),
    ]);

    res.json({ leads, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    })
      .populate('assignedTo', 'name email avatarUrl')
      .populate('createdBy', 'name');

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a lead
// @route   POST /api/leads
const createLead = async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.assignedTo) delete body.assignedTo;  // empty string → omit field
    const lead = await Lead.create({
      ...body,
      organizationId: req.user.organizationId,
      createdBy: req.user._id,
    });
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
const updateLead = async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.assignedTo) delete body.assignedTo;
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email avatarUrl');

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // Cascade delete related notes and tasks
    await Note.deleteMany({ leadId: req.params.id });
    await Task.deleteMany({ leadId: req.params.id });

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/leads/analytics
const getAnalytics = async (req, res) => {
  try {
    // Use raw ObjectId for aggregation pipelines — populated objects don't match in $match
    const orgId = req.user.organizationId._id ?? req.user.organizationId;

    const [totalLeads, wonLeads, statusBreakdown, monthlyRevenue] = await Promise.all([
      Lead.countDocuments({ organizationId: orgId }),
      Lead.countDocuments({ organizationId: orgId, status: 'Won' }),
      Lead.aggregate([
        { $match: { organizationId: orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: { organizationId: orgId, status: 'Won' } },
        {
          $group: {
            _id: { $month: '$updatedAt' },
            revenue: { $sum: '$dealValue' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalRevenue = wonLeads
      ? (await Lead.aggregate([
          { $match: { organizationId: orgId, status: 'Won' } },
          { $group: { _id: null, total: { $sum: '$dealValue' } } },
        ]))[0]?.total || 0
      : 0;

    const recentLeads = await Lead.find({ organizationId: orgId })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueChart = months.map((month, i) => {
      const data = monthlyRevenue.find((m) => m._id === i + 1);
      return { month, revenue: data?.revenue || 0, deals: data?.count || 0 };
    });

    res.json({
      totalLeads,
      wonLeads,
      totalRevenue,
      statusBreakdown,
      revenueChart,
      recentLeads,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI Insight for a lead
// @route   POST /api/leads/ai-insight
const getAIInsight = async (req, res) => {
  try {
    const { leadId, notes, dealValue } = req.body;

    // If leadId provided, verify it belongs to the org
    if (leadId) {
      const lead = await Lead.findOne({ _id: leadId, organizationId: req.user.organizationId });
      if (!lead) return res.status(404).json({ message: 'Lead not found' });
    }

    const insight = await generateAIInsight(notes, dealValue);
    res.json(insight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead, getAnalytics, getAIInsight };
