const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inviteCode: {
      type: String,
      unique: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Generate a unique invite code before saving
const crypto = require('crypto');
organizationSchema.pre('save', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(5).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
