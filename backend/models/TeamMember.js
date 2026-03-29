const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    socialLinks: {
      type: {
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        email: { type: String, default: '' },
      },
      default: {},
    },
    order: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeamMember', teamMemberSchema);
