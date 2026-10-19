/**
 * Stage 5 Automated Test Suite: Career Management, Analytics, Interview Intelligence & Admin Insights
 * Tests Application Tracker (CRUD, search, filter, ownership), Career Analytics (safe division, zero states,
 * aggregation), AI Interview Prep (question generation, evaluation, sessions, ownership), and Admin Dashboard.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import {
  InterviewQuestionsOutputSchema,
  InterviewAnswerEvaluationSchema,
  InterviewSessionEvaluationSchema,
} from "../lib/ai/schemas.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/careerpilot-ai";

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

async function runStage5Tests() {
  console.log("==================================================");
  console.log("   CAREERPILOT AI - STAGE 5 TEST SUITE            ");
  console.log("   Career Management, Analytics, Interview & Admin");
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

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  try {
    // -------------------------------------------------------------
    // SETUP TEST USERS
    // -------------------------------------------------------------
    const timestamp = Date.now();
    const user1Email = `candidate_stage5_${timestamp}@university.edu`;
    const user2Email = `competitor_stage5_${timestamp}@university.edu`;
    const adminEmail = `admin_stage5_${timestamp}@careerpilot.ai`;
    const userPass = "Password123";

    // Register User 1
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Elena Rostova",
        email: user1Email,
        password: userPass,
        confirmPassword: userPass,
      }),
    });
    const user1Cookies = await loginUser(user1Email, userPass);

    // Register User 2
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Marcus Vance",
        email: user2Email,
        password: userPass,
        confirmPassword: userPass,
      }),
    });
    const user2Cookies = await loginUser(user2Email, userPass);

    // Register & Elevate Admin User
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "System Admin",
        email: adminEmail,
        password: userPass,
        confirmPassword: userPass,
      }),
    });
    await db.collection("users").updateOne({ email: adminEmail }, { $set: { role: "ADMIN" } });
    const adminCookies = await loginUser(adminEmail, userPass);

    // =============================================================
    // PART 1: APPLICATION TRACKER TESTS
    // =============================================================
    console.log("\n--- PART 1: APPLICATION TRACKER (CRUD & SECURITY) ---");

    // 1. Unauthenticated applications request rejected
    const unauthAppGet = await fetch(`${BASE_URL}/api/applications`);
    assert(unauthAppGet.status === 401, "1. Unauthenticated applications request rejected with 401");

    // 2. Application creation
    const createAppRes = await fetch(`${BASE_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookies },
      body: JSON.stringify({
        company: "Stripe",
        jobTitle: "Senior Frontend Engineer",
        location: "San Francisco, CA (Hybrid)",
        jobType: "FULL_TIME",
        jobUrl: "https://stripe.com/jobs/123",
        salary: "$180,000 - $220,000",
        status: "APPLIED",
        appliedDate: new Date().toISOString(),
        notes: "Referral from college alumni.",
        source: "LinkedIn",
      }),
    });
    const createdAppData = await createAppRes.json();
    assert(createAppRes.status === 201 && createdAppData.application?._id, "2. Application creation succeeds with 201");
    const user1AppId = createdAppData.application?._id;

    // 3. Invalid application data rejected (missing required fields)
    const invalidAppRes = await fetch(`${BASE_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookies },
      body: JSON.stringify({
        company: "", // invalid empty company
        jobTitle: "Dev",
      }),
    });
    assert(invalidAppRes.status === 400, "3. Invalid application data (empty company) rejected with 400");

    // 4. Application retrieval (list)
    const getAppsRes = await fetch(`${BASE_URL}/api/applications`, {
      headers: { Cookie: user1Cookies },
    });
    const appsList = await getAppsRes.json();
    assert(
      getAppsRes.status === 200 && Array.isArray(appsList.applications) && appsList.applications.length === 1,
      "4. Application retrieval returns user's active applications list"
    );

    // 5. Application retrieval by ID
    const getSingleAppRes = await fetch(`${BASE_URL}/api/applications/${user1AppId}`, {
      headers: { Cookie: user1Cookies },
    });
    const singleAppData = await getSingleAppRes.json();
    assert(
      getSingleAppRes.status === 200 && singleAppData.application?.company === "Stripe",
      "5. Single application retrieval succeeds with correct details"
    );

    // 6. Application update
    const updateAppRes = await fetch(`${BASE_URL}/api/applications/${user1AppId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: user1Cookies },
      body: JSON.stringify({
        status: "INTERVIEW",
        interviewDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        notes: "Passed recruiter phone screen, scheduled technical round.",
      }),
    });
    const updatedAppData = await updateAppRes.json();
    assert(
      updateAppRes.status === 200 && updatedAppData.application?.status === "INTERVIEW",
      "6. Application update succeeds and persists new status"
    );

    // 7. User ownership enforced (User 2 tries to access User 1's application -> 404)
    const crossUserGetRes = await fetch(`${BASE_URL}/api/applications/${user1AppId}`, {
      headers: { Cookie: user2Cookies },
    });
    assert(crossUserGetRes.status === 404, "7. User ownership enforced: User 2 cannot view User 1 application (404)");

    // 8. Cross-user application modification rejected
    const crossUserPutRes = await fetch(`${BASE_URL}/api/applications/${user1AppId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: user2Cookies },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    assert(crossUserPutRes.status === 404, "8. Cross-user application modification rejected with 404");

    // 9. Status validation (invalid enum rejected)
    const invalidStatusRes = await fetch(`${BASE_URL}/api/applications/${user1AppId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: user1Cookies },
      body: JSON.stringify({ status: "NON_EXISTENT_STATUS" }),
    });
    assert(invalidStatusRes.status === 400, "9. Status validation: Invalid status enum rejected with 400");

    // 10. Search & Filter validation
    // Add a second application for User 1
    await fetch(`${BASE_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookies },
      body: JSON.stringify({
        company: "Google",
        jobTitle: "Cloud Solutions Architect",
        location: "Mountain View, CA",
        status: "OFFER",
        appliedDate: new Date().toISOString(),
      }),
    });
    const searchRes = await fetch(`${BASE_URL}/api/applications?search=Cloud`, {
      headers: { Cookie: user1Cookies },
    });
    const searchData = await searchRes.json();
    const filterRes = await fetch(`${BASE_URL}/api/applications?status=OFFER`, {
      headers: { Cookie: user1Cookies },
    });
    const filterData = await filterRes.json();
    assert(
      searchData.applications?.length === 1 &&
      searchData.applications[0].company === "Google" &&
      filterData.applications?.length === 1 &&
      filterData.applications[0].status === "OFFER",
      "10. Search & filter queries successfully isolate matching applications"
    );

    // =============================================================
    // PART 2: CAREER ANALYTICS TESTS
    // =============================================================
    console.log("\n--- PART 2: CAREER ANALYTICS ---");

    // 11. Analytics requires authentication
    const unauthAnalyticsRes = await fetch(`${BASE_URL}/api/analytics`);
    assert(unauthAnalyticsRes.status === 401, "11. Unauthenticated analytics request rejected with 401");

    // 12. Analytics returns real structure
    const analyticsRes = await fetch(`${BASE_URL}/api/analytics`, {
      headers: { Cookie: user1Cookies },
    });
    const analyticsData = await analyticsRes.json();
    assert(
      analyticsRes.status === 200 &&
      analyticsData.summary &&
      typeof analyticsData.summary.totalApplications === "number" &&
      Array.isArray(analyticsData.statusDistribution) &&
      Array.isArray(analyticsData.applicationTrend),
      "12. Analytics returns structured metrics conforming to schema"
    );

    // 13. Zero-application analytics works (User 2 has 0 applications)
    const user2AnalyticsRes = await fetch(`${BASE_URL}/api/analytics`, {
      headers: { Cookie: user2Cookies },
    });
    const user2Analytics = await user2AnalyticsRes.json();
    assert(
      user2AnalyticsRes.status === 200 &&
      user2Analytics.summary.totalApplications === 0 &&
      user2Analytics.summary.interviews === 0,
      "13. Zero-application candidate receives valid 0-state analytics response"
    );

    // 14. Percentage calculations do not produce NaN or Infinity
    assert(
      user2Analytics.summary.interviewRate === 0 &&
      user2Analytics.summary.offerRate === 0 &&
      user2Analytics.summary.rejectionRate === 0 &&
      !isNaN(user2Analytics.summary.interviewRate) &&
      isFinite(user2Analytics.summary.interviewRate),
      "14. Safe division ensures zero-application rates remain exactly 0% (no NaN/Infinity)"
    );

    // 15. User isolation verified in analytics (User 1 has 2 apps, User 2 has 0)
    assert(
      analyticsData.summary.totalApplications === 2 &&
      user2Analytics.summary.totalApplications === 0,
      "15. Analytics pipeline strictly isolates data per authenticated userId"
    );

    // =============================================================
    // PART 3: AI INTERVIEW PREPARATION TESTS
    // =============================================================
    console.log("\n--- PART 3: AI INTERVIEW PREPARATION ---");

    // 16. Unauthenticated interview request rejected
    const unauthInterviewGen = await fetch(`${BASE_URL}/api/ai/interview/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionType: "TECHNICAL", difficulty: "MEDIUM" }),
    });
    assert(unauthInterviewGen.status === 401, "16. Unauthenticated interview question generation rejected with 401");

    // 17. Question generation validation (valid request)
    const genQuestionsRes = await fetch(`${BASE_URL}/api/ai/interview/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookies },
      body: JSON.stringify({
        sessionType: "TECHNICAL",
        difficulty: "MEDIUM",
        jobTitle: "Senior Frontend Engineer",
        targetSkills: ["React", "TypeScript", "Performance"],
      }),
    });
    const questionsData = await genQuestionsRes.json();
    assert(
      genQuestionsRes.status === 200 &&
      Array.isArray(questionsData.questions) &&
      questionsData.questions.length > 0,
      "17. Question generation creates tailored interview questions list"
    );

    // 18. AI question schema validation
    const parsedQuestions = InterviewQuestionsOutputSchema.safeParse(questionsData);
    assert(
      parsedQuestions.success && questionsData.questions[0].questionId && questionsData.questions[0].category,
      "18. AI generated questions strictly validate against InterviewQuestionsOutputSchema"
    );

    // 19. Answer evaluation validation
    const sampleQuestion = questionsData.questions[0];
    const evaluateRes = await fetch(`${BASE_URL}/api/ai/interview/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookies },
      body: JSON.stringify({
        question: sampleQuestion.question,
        category: sampleQuestion.category,
        expectedFocus: sampleQuestion.expectedFocus,
        userAnswer: "In my previous role, I optimized React render cycles using memoization and virtualized lists, decreasing TTI by 42%.",
        sessionType: "TECHNICAL",
        difficulty: "MEDIUM",
      }),
    });
    const evalData = await evaluateRes.json();
    assert(
      evaluateRes.status === 200 && evalData.evaluation && typeof evalData.evaluation.score === "number",
      "19. AI answer evaluation returns structured assessment"
    );

    // 20. Score range validation & evaluation schema
    const parsedEval = InterviewAnswerEvaluationSchema.safeParse(evalData.evaluation);
    assert(
      parsedEval.success &&
      evalData.evaluation.score >= 0 &&
      evalData.evaluation.score <= 100 &&
      evalData.evaluation.strengths?.length > 0 &&
      evalData.evaluation.improvedAnswer?.length > 0,
      "20. Evaluation score is bounded [0, 100] and conforms to InterviewAnswerEvaluationSchema"
    );

    // 21. Interview session creation & completion
    const saveSessionRes = await fetch(`${BASE_URL}/api/ai/interview/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookies },
      body: JSON.stringify({
        sessionType: "TECHNICAL",
        difficulty: "MEDIUM",
        jobTitle: "Senior Frontend Engineer",
        company: "Stripe",
        questions: [
          {
            questionId: sampleQuestion.questionId,
            question: sampleQuestion.question,
            category: sampleQuestion.category,
            expectedFocus: sampleQuestion.expectedFocus,
            userAnswer: "In my previous role, I optimized React render cycles using memoization and virtualized lists.",
            evaluation: evalData.evaluation,
          },
        ],
      }),
    });
    const savedSessionData = await saveSessionRes.json();
    assert(
      (saveSessionRes.status === 201 || saveSessionRes.status === 200) && savedSessionData.session?._id,
      "21. Interview session finalized, evaluated, and saved"
    );
    const sessionId = savedSessionData.session?._id;

    // 22. Interview session persistence verified in MongoDB
    const dbSession = await db.collection("interviewsessions").findOne({ _id: new mongoose.Types.ObjectId(sessionId) });
    assert(
      dbSession && dbSession.overallScore >= 0 && dbSession.questions?.length === 1,
      "22. Interview session properly persisted in MongoDB with holistic metrics"
    );

    // 23. Interview session retrieval by ID
    const getSessionRes = await fetch(`${BASE_URL}/api/interview/${sessionId}`, {
      headers: { Cookie: user1Cookies },
    });
    const retrievedSession = await getSessionRes.json();
    assert(
      getSessionRes.status === 200 && retrievedSession.session?._id === sessionId,
      "23. Interview session successfully retrieved via /api/interview/[id]"
    );

    // 24. Ownership protection (User 2 attempts to view User 1 session -> 404)
    const crossSessionRes = await fetch(`${BASE_URL}/api/interview/${sessionId}`, {
      headers: { Cookie: user2Cookies },
    });
    assert(crossSessionRes.status === 404, "24. Ownership protection: User 2 cannot access User 1 interview session (404)");

    // 25. Previous session retrieval (History)
    const historyRes = await fetch(`${BASE_URL}/api/ai/interview/history`, {
      headers: { Cookie: user1Cookies },
    });
    const historyData = await historyRes.json();
    assert(
      historyRes.status === 200 && Array.isArray(historyData.sessions) && historyData.sessions.length >= 1,
      "25. Previous interview sessions successfully retrieved via /api/ai/interview/history"
    );

    // =============================================================
    // PART 4: ADMIN DASHBOARD TESTS
    // =============================================================
    console.log("\n--- PART 4: ADMIN DASHBOARD & SYSTEM INSIGHTS ---");

    // 26. Normal user cannot access admin metrics API -> 403
    const userAdminRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Cookie: user1Cookies },
    });
    assert(userAdminRes.status === 403, "26. Normal user (USER role) rejected from admin metrics API with 403");

    // 27. ADMIN can access admin metrics API
    const adminMetricsRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Cookie: adminCookies },
    });
    const adminMetrics = await adminMetricsRes.json();
    assert(
      adminMetricsRes.status === 200 &&
      adminMetrics.metrics &&
      typeof adminMetrics.metrics.totalUsers === "number",
      "27. ADMIN user successfully accesses /api/admin/metrics with 200"
    );

    // 28. Admin user statistics work
    assert(
      adminMetrics.metrics.totalUsers >= 3 &&
      typeof adminMetrics.metrics.newUsersThisMonth === "number",
      "28. Admin user statistics report real system counts"
    );

    // 29. Admin application statistics work
    assert(
      adminMetrics.metrics.totalApplications >= 2 &&
      typeof adminMetrics.metrics.totalInterviews === "number",
      "29. Admin application statistics report accurate pipeline totals"
    );

    // 30. Sensitive fields are not returned in user management API
    const adminUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: adminCookies },
    });
    const adminUsersData = await adminUsersRes.json();
    const sampleUser = adminUsersData.users?.[0];
    assert(
      adminUsersRes.status === 200 &&
      Array.isArray(adminUsersData.users) &&
      sampleUser &&
      sampleUser.passwordHash === undefined &&
      sampleUser.password === undefined,
      "30. User management API strictly strips password hashes and sensitive credentials"
    );

    // =============================================================
    // PART 5: DASHBOARD & RECENT ACTIVITY
    // =============================================================
    console.log("\n--- PART 5: DASHBOARD INTEGRATION ---");

    // 31. Stage 5 statistics are real
    const appCountUser1 = await db.collection("applications").countDocuments({
      userId: new mongoose.Types.ObjectId(savedSessionData.session.userId),
    });
    const interviewCountUser1 = await db.collection("interviewsessions").countDocuments({
      userId: new mongoose.Types.ObjectId(savedSessionData.session.userId),
    });
    assert(
      appCountUser1 === 2 && interviewCountUser1 === 1,
      "31. Stage 5 MongoDB collections reflect exact user actions"
    );

    // 32. Empty states work (User 2 has 0 applications and 0 sessions)
    const appCountUser2 = await db.collection("applications").countDocuments({
      userId: new mongoose.Types.ObjectId((await db.collection("users").findOne({ email: user2Email }))._id),
    });
    assert(appCountUser2 === 0, "32. Empty states accurately handled when collections contain 0 records for user");

    // =============================================================
    // PART 6: SECURITY & HARDENING
    // =============================================================
    console.log("\n--- PART 6: SECURITY HARDENING ---");

    // 33. No arbitrary userId accepted (Frontend cannot override userId)
    const maliciousAppRes = await fetch(`${BASE_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user2Cookies },
      body: JSON.stringify({
        company: "Spoofed Corp",
        jobTitle: "Attacker",
        userId: savedSessionData.session.userId, // Malicious override
      }),
    });
    const maliciousApp = await maliciousAppRes.json();
    const user2DbId = (await db.collection("users").findOne({ email: user2Email }))._id.toString();
    assert(
      maliciousApp.application?.userId === user2DbId,
      "33. IDOR Protection: Server derives userId strictly from session, discarding client-provided userId"
    );

    // 34. Invalid ObjectId handled cleanly
    const invalidIdRes = await fetch(`${BASE_URL}/api/applications/not-a-valid-object-id`, {
      headers: { Cookie: user1Cookies },
    });
    assert(invalidIdRes.status === 400, "34. Malformed ObjectId rejected with 400 Bad Request");

    // 35. Unauthorized resource deletion rejected
    const unauthorizedDelete = await fetch(`${BASE_URL}/api/applications/${user1AppId}`, {
      method: "DELETE",
      headers: { Cookie: user2Cookies },
    });
    assert(unauthorizedDelete.status === 404, "35. Unauthorized application deletion rejected with 404");

    // 36. Application deletion works for owner
    const legitimateDelete = await fetch(`${BASE_URL}/api/applications/${user1AppId}`, {
      method: "DELETE",
      headers: { Cookie: user1Cookies },
    });
    assert(legitimateDelete.status === 200, "36. Legitimate owner can delete application with 200 OK");

    // 37. AI Input validation (Reject missing or out-of-spec parameters)
    const badAiReq = await fetch(`${BASE_URL}/api/ai/interview/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user1Cookies },
      body: JSON.stringify({ question: "", userAnswer: "" }),
    });
    assert(badAiReq.status === 400, "37. AI service validates payload with Zod and rejects empty questions (400)");

    // 38. Normal user cannot escalate their own role to ADMIN
    const escalateAttempt = await fetch(`${BASE_URL}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: user1Cookies },
      body: JSON.stringify({ role: "ADMIN" }),
    });
    const refreshedUser = await db.collection("users").findOne({ email: user1Email });
    assert(
      refreshedUser.role === "USER",
      "38. Role Escalation Protection: User cannot promote themselves to ADMIN"
    );

    console.log("\n==================================================");
    console.log(`   STAGE 5 TESTS COMPLETE: ${passed}/${total} PASSED`);
    console.log("==================================================\n");

    if (passed < total) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runStage5Tests();
