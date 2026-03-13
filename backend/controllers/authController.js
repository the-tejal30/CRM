const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const PendingOtp = require('../models/PendingOtp');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const isEmailConfigured = () =>
  !!(process.env.APPS_SCRIPT_URL &&
  process.env.APPS_SCRIPT_URL !== 'your_apps_script_web_app_url_here');

const sendOtpEmail = async (to, otp, subject) => {
  if (!isEmailConfigured()) return false;
  const res = await fetch(process.env.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: to,
      otp,
      subject,
      secret: process.env.APPS_SCRIPT_SECRET,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return true;
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, action, organizationName, inviteCode, emailOtp } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Verify email OTP if email service is configured
    if (isEmailConfigured()) {
      if (!emailOtp) return res.status(400).json({ message: 'Email verification required', requireOtp: true });
      const pending = await PendingOtp.findOne({ email });
      if (!pending || pending.otp !== emailOtp) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }
      await PendingOtp.deleteOne({ email });
    }

    let organization;
    if (action === 'create') {
      if (!organizationName) return res.status(400).json({ message: 'Organization name is required' });
      const orgExists = await Organization.findOne({ organizationName });
      if (orgExists) return res.status(400).json({ message: 'Organization name already taken' });
      organization = await Organization.create({ organizationName });
    } else if (action === 'join') {
      if (!inviteCode) return res.status(400).json({ message: 'Invite code is required' });
      organization = await Organization.findOne({ inviteCode: inviteCode.toUpperCase() });
      if (!organization) return res.status(404).json({ message: 'Invalid invite code' });
    } else {
      return res.status(400).json({ message: 'action must be "create" or "join"' });
    }

    const userRole = action === 'create' ? 'Admin' : (role === 'Admin' ? 'Employee' : role || 'Employee');
    const user = await User.create({ name, email, password, role: userRole, organizationId: organization._id });

    if (action === 'create') {
      organization.createdBy = user._id;
      await organization.save();
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: organization._id,
      organizationName: organization.organizationName,
      orgLogoUrl: organization.logoUrl || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP to verify email before registration
// @route   POST /api/auth/send-registration-otp
const sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    if (!isEmailConfigured()) {
      return res.status(503).json({ message: 'Email service not configured on the server.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await PendingOtp.findOneAndUpdate({ email }, { otp, createdAt: new Date() }, { upsert: true });
    await sendOtpEmail(email, otp, 'Verify your CRM Pro email');
    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('organizationId', 'organizationName inviteCode logoUrl');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(401).json({ message: 'Account has been deactivated' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      organizationId: user.organizationId._id,
      organizationName: user.organizationId.organizationName,
      orgLogoUrl: user.organizationId.logoUrl || '',
      inviteCode: user.organizationId.inviteCode,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('organizationId', 'organizationName inviteCode');
  res.json(user);
};

// @desc    Update own profile
// @route   PUT /api/auth/profile
const updateMyProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (typeof avatarUrl !== 'undefined') user.avatarUrl = avatarUrl;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      const match = await user.matchPassword(currentPassword);
      if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
      user.password = newPassword;
    }

    await user.save();
    const org = await Organization.findById(user.organizationId);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      organizationId: user.organizationId,
      organizationName: org?.organizationName,
      orgLogoUrl: org?.logoUrl || '',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email address' });

    if (!isEmailConfigured()) {
      return res.status(503).json({
        message: 'Email service not configured. Ask your admin to reset your password from the Team page.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, otp, 'Your CRM Pro Password Reset OTP');
    res.json({ message: 'OTP sent to your email address' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, OTP and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const user = await User.findOne({ email, resetOtp: otp });
    if (!user) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.resetOtpExpiry < new Date()) return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateMyProfile, forgotPassword, resetPassword, sendRegistrationOtp };
