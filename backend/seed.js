/**
 * Seed Script for Trikaay MongoDB Database
 * Reads hardcoded data from frontend and populates MongoDB
 * Safe to run multiple times (idempotent)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const AdminUser = require('./models/AdminUser');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('\n🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    console.log('\n🌱 Starting database seed...\n');

    // Seed Admin User
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
      console.log('📝 Seeding Admin User...');
      const hashedPassword = await bcrypt.hash('Test@123', 12);
      await AdminUser.create({
        email: 'trikay@gmail.com',
        passwordHash: hashedPassword,
        role: 'admin',
        lastLogin: null,
      });
      console.log('   ✅ Created admin user');
      console.log('      Email: trikay@gmail.com');
      console.log('      Password: Test@123');
      console.log('      ⚠️  Change this password immediately in production!');
    } else {
      console.log('ℹ️  Admin user already present. Skipping admin seed.');
    }

    console.log('\n✨ Database seed completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Seed error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
  }
}

// Run seed
seedDatabase();
