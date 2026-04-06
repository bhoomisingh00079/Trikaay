const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const siteSettingsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: 'settings',
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    contactAddress: {
      type: String,
      default: '',
      trim: true,
    },
    contactAddressSwapnalaya: {
      type: String,
      default: '',
      trim: true,
    },
    socialLinks: {
      facebook: {
        type: String,
        default: '',
        trim: true,
      },
      instagram: {
        type: String,
        default: '',
        trim: true,
      },
      linkedin: {
        type: String,
        default: '',
        trim: true,
      },
      twitter: {
        type: String,
        default: '',
        trim: true,
      },
      youtube: {
        type: String,
        default: '',
        trim: true,
      },
      whatsapp: {
        type: String,
        default: '',
        trim: true,
      },
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook: Encrypt sensitive contact fields before storage
 */
siteSettingsSchema.pre('save', function (next) {
  try {
    if (this.isModified('contactPhone')) {
      this.contactPhone = encrypt(this.contactPhone);
    }
    if (this.isModified('contactEmail')) {
      this.contactEmail = encrypt(this.contactEmail);
    }
    if (this.isModified('contactAddress')) {
      this.contactAddress = encrypt(this.contactAddress);
    }
    if (this.isModified('contactAddressSwapnalaya')) {
      this.contactAddressSwapnalaya = encrypt(this.contactAddressSwapnalaya);
    }
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Post-find hook: Decrypt sensitive contact fields after retrieval
 * Applies to all query methods: find(), findOne(), findById(), etc.
 */
siteSettingsSchema.post('find', function (docs) {
  try {
    if (Array.isArray(docs)) {
      docs.forEach((doc) => {
        if (doc) {
          doc.contactPhone = decrypt(doc.contactPhone);
          doc.contactEmail = decrypt(doc.contactEmail);
          doc.contactAddress = decrypt(doc.contactAddress);
          doc.contactAddressSwapnalaya = decrypt(doc.contactAddressSwapnalaya);
        }
      });
    }
  } catch (error) {
    console.error('Decryption error in post-find hook:', error);
  }
});

/**
 * Post-findOne hook: Decrypt for single document queries
 */
siteSettingsSchema.post('findOne', function (doc) {
  try {
    if (doc) {
      doc.contactPhone = decrypt(doc.contactPhone);
      doc.contactEmail = decrypt(doc.contactEmail);
      doc.contactAddress = decrypt(doc.contactAddress);
      doc.contactAddressSwapnalaya = decrypt(doc.contactAddressSwapnalaya);
    }
  } catch (error) {
    console.error('Decryption error in post-findOne hook:', error);
  }
});

/**
 * Post-findOneAndUpdate hook: Decrypt after update operations
 */
siteSettingsSchema.post('findOneAndUpdate', function (doc) {
  try {
    if (doc) {
      doc.contactPhone = decrypt(doc.contactPhone);
      doc.contactEmail = decrypt(doc.contactEmail);
      doc.contactAddress = decrypt(doc.contactAddress);
      doc.contactAddressSwapnalaya = decrypt(doc.contactAddressSwapnalaya);
    }
  } catch (error) {
    console.error('Decryption error in post-findOneAndUpdate hook:', error);
  }
});

/**
 * Static method: Get or create the singleton settings document
 */
siteSettingsSchema.statics.getSingleton = async function () {
  try {
    let settings = await this.findById('settings');
    if (!settings) {
      settings = new this({ _id: 'settings' });
      await settings.save();
    }
    return settings;
  } catch (error) {
    console.error('Error in getSingleton:', error);
    throw error;
  }
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
