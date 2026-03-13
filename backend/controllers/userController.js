const User = require('../models/User');

// @desc    Get all users in the organization (Admin only)
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ organizationId: req.user.organizationId })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user's role or status (Admin only)
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { role, isActive, name, email, newPassword } = req.body;

    // Cannot modify a user from another organization
    const user = await User.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id && isActive === false) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (newPassword) user.password = newPassword;

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, updateUser, deleteUser };
