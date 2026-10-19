/**
 * Stage 3 Automated Test Suite: Dashboard, Profile, Navigation & Shell
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/careerpilot-ai";

async function runStage3Tests() {
  console.log("==================================================");
  console.log("   CAREERPILOT AI - STAGE 3 TEST SUITE            ");
  console.log("   Dashboard, Profile, Navigation & Shell         ");
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

  // 1. Unauthenticated Profile API Protection
  console.log("1. Testing Profile API Security (Unauthenticated)...");
  try {
    const unauthGet = await fetch(`${BASE_URL}/api/profile`);
    assert(unauthGet.status === 401, "GET /api/profile without session returns 401 Unauthorized");

    const unauthPut = await fetch(`${BASE_URL}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacker" }),
    });
    assert(unauthPut.status === 401, "PUT /api/profile without session returns 401 Unauthorized");
  } catch (err) {
    assert(false, `Unauth API error: ${err.message}`);
  }

  // 2. Register fresh candidate for Stage 3 testing
  console.log("\n2. Registering and authenticating test candidate...");
  const candidateEmail = `stage3_candidate_${Date.now()}@university.edu`;
  const candidatePassword = "Password123";

  try {
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jordan Lee",
        email: candidateEmail,
        password: candidatePassword,
        confirmPassword: candidatePassword,
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, "Candidate registered successfully");

    // Fetch CSRF
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfCookies = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [csrfRes.headers.get("set-cookie") || ""];
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    const cookieHeader = csrfCookies.map(c => c.split(";")[0]).join("; ");

    // Sign in
    const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookieHeader,
      },
      body: new URLSearchParams({
        email: candidateEmail,
        password: candidatePassword,
        csrfToken,
        redirect: "false",
        json: "true",
      }).toString(),
      redirect: "manual",
    });

    const sessionCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie") || ""];
    const authCookies = [...csrfCookies, ...sessionCookies].map(c => c.split(";")[0]).filter(Boolean).join("; ");
    assert(sessionCookies.length > 0, "Candidate session token generated successfully");

    // 3. Test GET /api/profile
    console.log("\n3. Testing GET /api/profile for authenticated candidate...");
    const profileRes = await fetch(`${BASE_URL}/api/profile`, {
      headers: { "Cookie": authCookies },
    });
    assert(profileRes.status === 200, "GET /api/profile returns 200 OK");
    const profileData = await profileRes.json();
    assert(profileData.user.name === "Jordan Lee", "User name matches database record");
    assert(profileData.user.email === candidateEmail, "User email matches database record");
    assert(typeof profileData.completion.percentage === "number", "Calculated profile completion percentage returned");
    console.log(`   Initial Profile Completion: ${profileData.completion.percentage}%`);

    // 4. Test PUT /api/profile (Editing personal info, academic, career preferences & skills)
    console.log("\n4. Testing PUT /api/profile with skills and academic details...");
    const updateRes = await fetch(`${BASE_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Cookie": authCookies,
      },
      body: JSON.stringify({
        name: "Jordan Lee, B.S.",
        phone: "+1 (555) 234-5678",
        location: "Austin, TX",
        university: "UT Austin",
        degree: "Computer Science",
        graduationYear: 2026,
        experienceLevel: "Entry",
        preferredRole: "Full Stack Engineer",
        preferredLocations: ["Austin, TX", "Remote", "Seattle, WA"],
        skills: ["React", "TypeScript", "Node.js", "MongoDB", "React"], // intentional duplicate to test deduplication
        bio: "Passionate full-stack developer interested in scalable web architectures and AI tooling.",
        role: "ADMIN", // Malicious attempt to escalate role
      }),
    });

    assert(updateRes.status === 200, "PUT /api/profile returns 200 OK");
    const updateData = await updateRes.json();
    assert(updateData.success === true, "Profile update reports success");
    assert(updateData.user.name === "Jordan Lee, B.S.", "Name updated in MongoDB");
    assert(updateData.user.profile.university === "UT Austin", "University updated in MongoDB");
    assert(updateData.user.profile.preferredRole === "Full Stack Engineer", "Preferred role updated");
    assert(updateData.user.profile.skills.length === 4, "Skills deduplication passed (React was deduplicated)");
    assert(updateData.user.role === "USER", "RBAC Security: User cannot escalate their own role to ADMIN");
    assert(updateData.completion.percentage > profileData.completion.percentage, "Profile completion increased after filling fields");
    console.log(`   Updated Profile Completion: ${updateData.completion.percentage}%`);

    // 5. Test Persistence directly in MongoDB
    console.log("\n5. Testing direct MongoDB persistence...");
    await mongoose.connect(MONGODB_URI);
    const dbUser = await mongoose.connection.db.collection("users").findOne({ email: candidateEmail });
    assert(dbUser !== null, "User found in database");
    assert(dbUser.profile.university === "UT Austin", "Database confirms persisted university");
    assert(dbUser.profile.skills.includes("TypeScript"), "Database confirms persisted skills");
    assert(dbUser.role === "USER", "Database confirms user role remains 'USER'");
    await mongoose.disconnect();

    // 6. Test Authenticated Route Rendering with Dashboard Shell
    console.log("\n6. Testing Authenticated Route Rendering with Dashboard Shell...");
    const dashPageRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { "Cookie": authCookies },
    });
    assert(dashPageRes.status === 200, "GET /dashboard returns 200 OK with authenticated session");
    const dashHtml = await dashPageRes.text();
    assert(dashHtml.includes("Jordan Lee") || dashHtml.includes("CareerPilot"), "Dashboard renders user welcome header");
    assert(dashHtml.includes("Resume Score") && dashHtml.includes("Not analyzed yet"), "Dashboard displays honest zero/unscanned statistics");
    assert(dashHtml.includes("Career Progression Roadmap"), "Dashboard renders career progression workflow");

    const profilePageRes = await fetch(`${BASE_URL}/profile`, {
      headers: { "Cookie": authCookies },
    });
    assert(profilePageRes.status === 200, "GET /profile returns 200 OK with authenticated session");
    const profileHtml = await profilePageRes.text();
    assert(profileHtml.includes("Candidate Profile"), "Profile page renders candidate profile editor");

    // 7. Test Placeholder Routes in Dashboard Shell
    console.log("\n7. Testing Placeholder Routes in Dashboard Shell...");
    const testRoutes = ["/resume", "/job-analysis", "/job-matcher", "/applications", "/interview-prep", "/skills", "/analytics"];
    for (const route of testRoutes) {
      const res = await fetch(`${BASE_URL}${route}`, {
        headers: { "Cookie": authCookies },
      });
      assert(res.status === 200, `GET ${route} renders with 200 OK in dashboard shell`);
    }

  } catch (err) {
    assert(false, `Test failure: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log(`STAGE 3 TEST SUMMARY: ${passed} / ${total} tests passed.`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runStage3Tests().catch((err) => {
  console.error("Stage 3 test runner failed:", err);
  process.exit(1);
});
