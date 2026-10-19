/**
 * Automated Verification Script for CareerPilot AI Stage 2
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/careerpilot-ai";

async function runTests() {
  console.log("==================================================");
  console.log("   CAREERPILOT AI - STAGE 2 AUTH & DB TEST SUITE  ");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  // 1. Test MongoDB Direct Connection
  console.log("1. Testing MongoDB connection...");
  try {
    await mongoose.connect(MONGODB_URI);
    assert(mongoose.connection.readyState === 1, "Connected to MongoDB successfully");
    await mongoose.disconnect();
  } catch (err) {
    assert(false, `MongoDB connection failed: ${err.message}`);
  }

  // 2. Test Registration API
  console.log("\n2. Testing User Registration API...");
  const testEmail = `candidate_${Date.now()}@university.edu`;
  const testPassword = "Password123";

  try {
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Candidate",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });

    const regData = await regRes.json();
    assert(regRes.status === 201, `Registration returned HTTP 201 (got ${regRes.status})`);
    assert(regData.success === true, "Registration returned success: true");
    assert(regData.user && regData.user.email === testEmail.toLowerCase(), "User email matched");
    assert(regData.user.role === "USER", "Default role assigned is 'USER'");
    assert(!regData.user.passwordHash && !regData.user.password, "Password hash is NOT exposed in response");
  } catch (err) {
    assert(false, `Registration request error: ${err.message}`);
  }

  // 3. Test Duplicate Registration Prevention
  console.log("\n3. Testing Duplicate Email Registration Prevention...");
  try {
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate Candidate",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });

    assert(dupRes.status === 409, `Duplicate registration correctly rejected with HTTP 409 (got ${dupRes.status})`);
    const dupData = await dupRes.json();
    assert(dupData.error && dupData.error.includes("already exists"), "Duplicate registration returns friendly error message");
  } catch (err) {
    assert(false, `Duplicate test error: ${err.message}`);
  }

  // 4. Test Weak Password / Validation Rejection
  console.log("\n4. Testing Input Validation (Weak Password)...");
  try {
    const weakRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Weak Candidate",
        email: "weak@university.edu",
        password: "weak",
        confirmPassword: "weak",
      }),
    });

    assert(weakRes.status === 400, `Weak password correctly rejected with HTTP 400 (got ${weakRes.status})`);
  } catch (err) {
    assert(false, `Validation test error: ${err.message}`);
  }

  // 5. Test Unauthenticated Route Protection (Middleware)
  console.log("\n5. Testing Route Protection without Authentication...");
  try {
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      redirect: "manual",
    });

    const isRedirect = dashRes.status === 307 || dashRes.status === 302 || dashRes.status === 308;
    const location = dashRes.headers.get("location") || "";
    assert(
      isRedirect && location.includes("/login"),
      `Unauthenticated /dashboard redirected to /login (Status: ${dashRes.status}, Location: ${location})`
    );

    const adminRes = await fetch(`${BASE_URL}/admin`, {
      redirect: "manual",
    });
    const isAdminRedirect = adminRes.status === 307 || adminRes.status === 302 || adminRes.status === 308;
    const adminLocation = adminRes.headers.get("location") || "";
    assert(
      isAdminRedirect && adminLocation.includes("/login"),
      `Unauthenticated /admin redirected to /login (Status: ${adminRes.status}, Location: ${adminLocation})`
    );
  } catch (err) {
    assert(false, `Route protection test error: ${err.message}`);
  }

  // 6. Test NextAuth CSRF and Auth Endpoints
  console.log("\n6. Testing NextAuth API Endpoints...");
  try {
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    assert(csrfRes.status === 200, "GET /api/auth/csrf returned HTTP 200");
    assert(typeof csrfData.csrfToken === "string" && csrfData.csrfToken.length > 0, "CSRF token generated successfully");

    const sessionRes = await fetch(`${BASE_URL}/api/auth/session`);
    assert(sessionRes.status === 200, "GET /api/auth/session returned HTTP 200");
  } catch (err) {
    assert(false, `Auth endpoint error: ${err.message}`);
  }

  // 7. Test Admin User in Database
  console.log("\n7. Testing Admin Account & Role Verification...");
  try {
    await mongoose.connect(MONGODB_URI);
    const adminUser = await mongoose.connection.db.collection("users").findOne({ email: "admin@careerpilot.ai" });
    assert(adminUser !== null, "Admin account exists in database");
    assert(adminUser.role === "ADMIN", "Admin user has role: 'ADMIN'");
    const isPasswordValid = await bcrypt.compare("AdminPassword123", adminUser.passwordHash);
    assert(isPasswordValid, "Admin password hash verifies successfully with bcrypt");
    await mongoose.disconnect();
  } catch (err) {
    assert(false, `Admin verification error: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} / ${total} tests passed.`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
