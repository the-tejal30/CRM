const Task = require('../models/Task');

// @desc    Get all tasks for the organization
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const filter = { organizationId: req.user.organizationId };

    if (req.user.role === 'Employee') {
      filter.assignedTo = req.user._id;
    }

    const { status, leadId } = req.query;
    if (status) filter.status = status;
    if (leadId) filter.leadId = leadId;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('leadId', 'name company')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      organizationId: req.user.organizationId,
      createdBy: req.user._id,
    });
    await task.populate('assignedTo', 'name email');
    await task.populate('leadId', 'name company');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('leadId', 'name company');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
