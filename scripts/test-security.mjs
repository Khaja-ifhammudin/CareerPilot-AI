/**
 * Complete Security & Hardening Verification Suite
 * CareerPilot AI — Stage 2 Security Audit
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
dotenv.config({ path: path.resolve(ROOT_DIR, ".env.local") });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/careerpilot-ai";

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failedCount++;
  }
}

async function loginUser(email, password) {
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [csrfRes.headers.get("set-cookie") || ""];
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const cookieHeader = csrfCookies.map((c) => c.split(";")[0]).join("; ");

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader,
    },
    body: new URLSearchParams({
      email,
      password,
      csrfToken,
      redirect: "false",
      json: "true",
    }).toString(),
    redirect: "manual",
  });

  const sessionCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie") || ""];
  return [...csrfCookies, ...sessionCookies].map((c) => c.split(";")[0]).filter(Boolean).join("; ");
}

async function runSecuritySuite() {
  console.log("==================================================");
  console.log("   CAREERPILOT AI - SECURITY & HARDENING SUITE    ");
  console.log("==================================================");

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const testUserEmail = `secuser_${Date.now()}@test.ai`;
  const testUserPass = "SecPassword2026!";
  const testSalt = await bcrypt.genSalt(12);
  const testHash = await bcrypt.hash(testUserPass, testSalt);

  const testUserInsert = await db.collection("users").insertOne({
    name: "Security Test Candidate",
    email: testUserEmail,
    passwordHash: testHash,
    role: "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const testUserId = testUserInsert.insertedId.toString();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@khaja.ai";
  const adminPassword = process.env.ADMIN_PASSWORD || "KhajaAdmin2026!";

  try {
    // -------------------------------------------------------------------
    // 1. SECURITY HEADERS VERIFICATION
    // -------------------------------------------------------------------
    console.log("\n--- 1. HTTP SECURITY HEADERS ---");
    const headRes = await fetch(`${BASE_URL}/login`);
    const headers = headRes.headers;

    assert(headers.get("x-frame-options") === "DENY", "1.1 Clickjacking protection: X-Frame-Options is DENY");
    assert(headers.get("x-content-type-options") === "nosniff", "1.2 MIME sniffing protection: X-Content-Type-Options is nosniff");
    assert(headers.get("referrer-policy") === "strict-origin-when-cross-origin", "1.3 Referrer leakage protection: Referrer-Policy configured");
    assert(headers.get("x-xss-protection") === "1; mode=block", "1.4 Legacy browser XSS protection: X-XSS-Protection enabled");
    assert(headers.has("permissions-policy"), "1.5 Feature restriction: Permissions-Policy configured");

    // -------------------------------------------------------------------
    // 2. REGEX INJECTION & SPECIAL CHARACTER SANITIZATION
    // -------------------------------------------------------------------
    console.log("\n--- 2. REGEX INJECTION & INPUT SANITIZATION ---");
    const userCookie = await loginUser(testUserEmail, testUserPass);
    const adminCookie = await loginUser(adminEmail, adminPassword);

    // Search query with regex special chars that previously threw 500 SyntaxError
    const specialQuery = "C++ [Remote] (Frontend) *?+";
    const appSearchRes = await fetch(`${BASE_URL}/api/applications?search=${encodeURIComponent(specialQuery)}`, {
      headers: { Cookie: userCookie },
    });
    assert(appSearchRes.status === 200, "2.1 Applications search with unescaped regex special chars returns 200 without crashing");

    const adminSearchRes = await fetch(`${BASE_URL}/api/admin/users?search=${encodeURIComponent("(Admin)+[0-9]")}`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminSearchRes.status === 200, "2.2 Admin user search with unescaped regex special chars returns 200 without crashing");

    // -------------------------------------------------------------------
    // 3. ADMIN AUTHORIZATION & RBAC ENFORCEMENT
    // -------------------------------------------------------------------
    console.log("\n--- 3. ADMIN AUTHORIZATION & ROLE PRIVILEGES ---");
    const normalUserAdminMetrics = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Cookie: userCookie },
    });
    assert(normalUserAdminMetrics.status === 403, "3.1 Normal USER role rejected from /api/admin/metrics with 403 Forbidden");

    const normalUserAdminUsers = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: userCookie },
    });
    assert(normalUserAdminUsers.status === 403, "3.2 Normal USER role rejected from /api/admin/users with 403 Forbidden");

    const adminMetrics = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminMetrics.status === 200, "3.3 Verified ADMIN user successfully accesses /api/admin/metrics with 200 OK");

    // -------------------------------------------------------------------
    // 4. ROLE ESCALATION RESISTANCE
    // -------------------------------------------------------------------
    console.log("\n--- 4. ROLE ESCALATION RESISTANCE ---");
    const escalateAttempt = await fetch(`${BASE_URL}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({ role: "ADMIN", name: "Hacker Name" }),
    });
    const escalateData = await escalateAttempt.json();
    assert(escalateData.user && escalateData.user.role === "USER", "4.1 Profile update cannot escalate USER to ADMIN role");

    const checkDbRole = await db.collection("users").findOne({ _id: testUserInsert.insertedId });
    assert(checkDbRole.role === "USER", "4.2 MongoDB role remains strictly USER");

    // -------------------------------------------------------------------
    // 5. MULTI-TENANT IDOR DATA ISOLATION
    // -------------------------------------------------------------------
    console.log("\n--- 5. MULTI-TENANT IDOR DATA ISOLATION ---");
    // Create an application for test user
    const appCreateRes = await fetch(`${BASE_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        company: "Security Corp",
        jobTitle: "Security Analyst",
        status: "APPLIED",
      }),
    });
    const appCreateData = await appCreateRes.json();
    const createdAppId = appCreateData.application?._id || appCreateData.application?.id;

    // Login as a second user and attempt cross-tenant access
    const user2Email = `secuser2_${Date.now()}@test.ai`;
    await db.collection("users").insertOne({
      name: "Attacker User",
      email: user2Email,
      passwordHash: testHash,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const user2Cookie = await loginUser(user2Email, testUserPass);

    const crossRead = await fetch(`${BASE_URL}/api/applications/${createdAppId}`, {
      headers: { Cookie: user2Cookie },
    });
    assert(crossRead.status === 404, "5.1 IDOR read attempt by another user returns 404 Not Found");

    const crossUpdate = await fetch(`${BASE_URL}/api/applications/${createdAppId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: user2Cookie },
      body: JSON.stringify({ company: "Tampered Corp" }),
    });
    assert(crossUpdate.status === 404, "5.2 IDOR modification attempt returns 404 Not Found");

    const crossDelete = await fetch(`${BASE_URL}/api/applications/${createdAppId}`, {
      method: "DELETE",
      headers: { Cookie: user2Cookie },
    });
    assert(crossDelete.status === 404, "5.3 IDOR delete attempt returns 404 Not Found");

    // -------------------------------------------------------------------
    // 6. PASSWORD HASH PROTECTION & ZERO CREDENTIAL LEAKAGE
    // -------------------------------------------------------------------
    console.log("\n--- 6. CREDENTIAL LEAKAGE PREVENTION ---");
    const userListRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: adminCookie },
    });
    const userListData = await userListRes.json();
    const leakedHashInList = (userListData.users || []).some((u) => u.passwordHash !== undefined || u.password !== undefined);
    assert(!leakedHashInList, "6.1 Admin user directory strictly strips password hashes");

    const profileRes = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Cookie: userCookie },
    });
    const profileData = await profileRes.json();
    assert(profileData.user.passwordHash === undefined, "6.2 User profile response does not expose passwordHash");

    // -------------------------------------------------------------------
    // 7. FILE UPLOAD SECURITY (PDF ONLY, SIZE, PRIVATE STORAGE)
    // -------------------------------------------------------------------
    console.log("\n--- 7. FILE UPLOAD SECURITY ---");
    const fakeExeForm = new FormData();
    fakeExeForm.append("file", new Blob([Buffer.from("MZ malicious exe")], { type: "application/x-msdownload" }), "malware.exe");
    const exeUploadRes = await fetch(`${BASE_URL}/api/resume/upload`, {
      method: "POST",
      headers: { Cookie: userCookie },
      body: fakeExeForm,
    });
    assert(exeUploadRes.status === 400, "7.1 Executable (.exe) upload rejected with 400 Bad Request");

    const spoofedPdfForm = new FormData();
    spoofedPdfForm.append("file", new Blob([Buffer.from("<html>not a pdf</html>")], { type: "application/pdf" }), "fake.pdf");
    const spoofUploadRes = await fetch(`${BASE_URL}/api/resume/upload`, {
      method: "POST",
      headers: { Cookie: userCookie },
      body: spoofedPdfForm,
    });
    assert(spoofUploadRes.status === 400, "7.2 Spoofed PDF failing magic bytes check rejected with 400 Bad Request");

    // -------------------------------------------------------------------
    // 8. RESPONSIBLE AI & TRANSPARENCY
    // -------------------------------------------------------------------
    console.log("\n--- 8. AI RELIABILITY & TRANSPARENCY ---");
    // Verify fallback tagging: if GEMINI_API_KEY is unset, AI evaluation output includes isFallback: true
    const jobMatchRes = await fetch(`${BASE_URL}/api/ai/job-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        jobDescription: "Senior Full Stack TypeScript Developer needed with React and Node experience for enterprise cloud SaaS.",
      }),
    });
    const jobMatchData = await jobMatchRes.json();
    assert(jobMatchRes.status === 200 && jobMatchData.success, "8.1 AI Job Match endpoint returns valid structured response");
    if (jobMatchData.match?.isFallback) {
      assert(jobMatchData.match.isFallback === true, "8.2 Deterministic fallback is explicitly flagged with isFallback: true");
      assert(typeof jobMatchData.match.fallbackReason === "string", "8.3 Fallback notice details reason to candidate");
    } else {
      assert(jobMatchData.match?.isFallback === false, "8.2 Live Gemini analysis marked with isFallback: false");
    }

    // -------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------
    await db.collection("users").deleteMany({ email: { $in: [testUserEmail, user2Email] } });
    if (createdAppId) {
      await db.collection("applications").deleteOne({ _id: new mongoose.Types.ObjectId(createdAppId) });
    }
    console.log("\n✅ Security test artifacts cleaned up.");

  } catch (err) {
    console.error("Test execution exception:", err);
    failedCount++;
  } finally {
    await mongoose.disconnect();
  }

  console.log("\n==================================================");
  console.log(`SECURITY TEST SUMMARY: ${passedCount} passed, ${failedCount} failed.`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSecuritySuite();
