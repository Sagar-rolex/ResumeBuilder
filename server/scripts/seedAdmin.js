import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "../configs/db.js";
import User from "../models/User.js";

const { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = process.env;

if (!ADMIN_EMAIL || !ADMIN_NAME || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  console.error("Set ADMIN_EMAIL, ADMIN_NAME, and an ADMIN_PASSWORD of at least 12 characters before seeding.");
  process.exit(1);
}

try {
  await connectDB();
  const email = ADMIN_EMAIL.toLowerCase().trim();
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role !== "admin") {
      throw new Error("The configured admin email already belongs to a non-admin account; no changes were made.");
    }
    console.log("Admin account already exists; no changes made.");
  } else {
    await User.create({
      name: ADMIN_NAME.trim(),
      email,
      password: await bcrypt.hash(ADMIN_PASSWORD, 12),
      role: "admin",
    });
    console.log("Admin account created.");
  }
} catch (error) {
  console.error("Admin provisioning failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
