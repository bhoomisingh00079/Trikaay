/**
 * Seed Script for Trikaay MongoDB Database
 * Always resets the admin user to the credentials below.
 */
console.log("THIS IS THE NEW SEED FILE");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import model
const AdminUser = require("./models/AdminUser");

async function seedDatabase() {
  try {
    console.log("\n🔄 Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected successfully");
    console.log("\n🌱 Starting database seed...\n");

    // Delete existing admin with this email
    const deleted = await AdminUser.deleteOne({
      email: "trikay@gmail.com",
    });

    if (deleted.deletedCount > 0) {
      console.log("🗑️ Existing admin deleted.");
    } else {
      console.log("ℹ️ No existing admin found.");
    }

    // Create new password hash
    const hashedPassword = await bcrypt.hash("Test@123", 12);

    // Create fresh admin
    const admin = await AdminUser.create({
      email: "trikay@gmail.com",
      passwordHash: hashedPassword,
      role: "admin",
      lastLogin: null,
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("-------------------------------------");
    console.log("Email    :", admin.email);
    console.log("Password : Test@123");
    console.log("Role     :", admin.role);
    console.log("-------------------------------------");

    console.log("\n✨ Database seed completed successfully!\n");

  } catch (error) {
    console.error("\n❌ Seed error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed\n");
  }
}

// Run seed
seedDatabase();