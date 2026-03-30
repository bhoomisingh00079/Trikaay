const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    kind: {
      type: String,
      enum: ['image', 'pdf'],
      required: true,
    },
    category: {
      type: String,
      enum: ['org', 'csr', 'project', 'general', 'certificate'],
      default: 'general',
    },
    title: {
      type: String,
      default: '',
    },
    metadata: {
      type: {
        source: {
          type: String,
          default: 'manual',
        },
        docType: {
          type: String,
          default: '',
        },
        fiscalYear: {
          type: String,
          default: '',
        },
        keywords: [{
          type: String,
          trim: true,
        }],
      },
      default: () => ({}),
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MediaAsset', mediaAssetSchema);