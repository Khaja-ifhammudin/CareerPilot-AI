/**
 * Development Admin Seed Utility for CareerPilot AI
 *
 * Usage:
 *   node scripts/seed-admin.mjs <email> <password> [name]
 *
 * Or using environment variables:
 *   ADMIN_EMAIL=admin@careerpilot.ai ADMIN_PASSWORD=SecureAdminPassword123 node scripts/seed-admin.mjs
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load .env.local if present
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/careerpilot-ai";
const email = (process.argv[2] || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.argv[3] || process.env.ADMIN_PASSWORD || "";
const name = process.argv[4] || process.env.ADMIN_NAME || "System Administrator";

async function seedAdmin() {
  if (!email || !password) {
    console.error(`
❌ Error: Missing required admin credentials!

Usage:
  node scripts/seed-admin.mjs <email> <password> [name]

Example:
  node scripts/seed-admin.mjs admin@careerpilot.ai SecureAdmin2026 "Lead Admin"

Password must be at least 8 characters with 1 uppercase letter and 1 number.
`);
    process.exit(1);
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    console.error("❌ Error: Password must be at least 8 characters, contain at least 1 uppercase letter and 1 number.");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);

  const UserSchema = new mongoose.Schema(
    {
      name: String,
      email: { type: String, unique: true, lowercase: true },
      passwordHash: String,
      role: { type: String, default: "USER" },
    },
    { timestamps: true }
  );

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const existingUser = await User.findOne({ email });

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  if (existingUser) {
    existingUser.role = "ADMIN";
    existingUser.passwordHash = passwordHash;
    if (name) existingUser.name = name;
    await existingUser.save();
    console.log(`✅ Success: Existing user '${email}' was upgraded to ADMIN with the provided password.`);
  } else {
    await User.create({
      name,
      email,
      passwordHash,
      role: "ADMIN",
    });
    console.log(`✅ Success: New ADMIN account created for '${email}' (Role: ADMIN).`);
  }

  await mongoose.disconnect();
  console.log("Database connection closed. You can now log in at /login with these admin credentials.");
}

seedAdmin().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
