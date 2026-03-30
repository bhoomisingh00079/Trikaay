const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    marathiTitle: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    shortDescriptionEn: {
      type: String,
      default: '',
      trim: true,
    },
    fullDescriptionEn: {
      type: String,
      default: '',
      trim: true,
    },
    shortDescriptionMr: {
      type: String,
      default: '',
      trim: true,
    },
    fullDescriptionMr: {
      type: String,
      default: '',
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    projectNumber: {
      type: Number,
      required: false,
      unique: true,
      sparse: true,
      min: 1,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    images: [{
      type: String,
    }],
    link: {
      type: String,
      default: '',
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
