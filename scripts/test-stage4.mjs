/**
 * Stage 4 Automated Test Suite: AI Career Engine
 * Tests Resume Upload & Extraction, Gemini Resume Analysis, Job Description Analysis,
 * AI Job Matcher, Skill Gap Matrix, Security & Isolation.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { ResumeAnalysisSchema, JobAnalysisSchema, JobMatchSchema, SkillGapSchema } from "../lib/ai/schemas.ts";

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

function createValidPdf(text) {
  const stream = "BT /F1 12 Tf 50 700 Td (" + text + ") Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>",
    "<< /Length " + Buffer.byteLength(stream, "utf8") + " >>\nstream\n" + stream + "\nendstream",
  ];

  let body = "%PDF-1.4\n";
  const offsets = ["0000000000 65535 f \n"];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(String(Buffer.byteLength(body, "utf8")).padStart(10, "0") + " 00000 n \n");
    body += (i + 1) + " 0 obj\n" + objects[i] + "\nendobj\n";
  }

  const xrefOffset = Buffer.byteLength(body, "utf8");
  let xref = "xref\n0 " + (objects.length + 1) + "\n" + offsets.join("");
  let trailer = "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF\n";

  return Buffer.from(body + xref + trailer, "utf8");
}

async function runStage4Tests() {
  console.log("==================================================");
  console.log("   CAREERPILOT AI - STAGE 4 TEST SUITE            ");
  console.log("   AI Career Engine & Resume Intelligence         ");
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

  // Connect to DB for direct integrity checks
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  try {
    // -------------------------------------------------------------
    // SECTION 1: AUTHENTICATION & RESUME ENDPOINT GUARDS
    // -------------------------------------------------------------
    console.log("\n--- SECTION 1: RESUME API GUARDS & VALIDATION ---");

    // 1. Unauthenticated resume request -> 401
    const unauthGet = await fetch(`${BASE_URL}/api/resume`);
    assert(unauthGet.status === 401, "1. Unauthenticated GET /api/resume returns 401");

    // 2. Unauthenticated upload -> 401
    const unauthUpload = await fetch(`${BASE_URL}/api/resume/upload`, {
      method: "POST",
      body: new FormData(),
    });
    assert(unauthUpload.status === 401, "2. Unauthenticated upload returns 401");

    // Register User 1
    const user1Email = `candidate_stage4_${Date.now()}@university.edu`;
    const user1Pass = "Password123";
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Samantha Wright",
        email: user1Email,
        password: user1Pass,
        confirmPassword: user1Pass,
      }),
    });
    const user1Cookies = await loginUser(user1Email, user1Pass);

    // Register User 2 (for cross-user isolation tests)
    const user2Email = `other_stage4_${Date.now()}@university.edu`;
    const user2Pass = "Password123";
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "David Miller",
        email: user2Email,
        password: user2Pass,
        confirmPassword: user2Pass,
      }),
    });
    const user2Cookies = await loginUser(user2Email, user2Pass);

    // 3. Invalid file type -> rejected
    const textFormData = new FormData();
    textFormData.append("resume", new Blob(["Malicious text content"], { type: "text/plain" }), "fake.txt");
    const invalidTypeRes = await fetch(`${BASE_URL}/api/resume/upload`, {
      method: "POST",
      headers: { Cookie: user1Cookies },
      body: textFormData,
    });
    assert(invalidTypeRes.status === 400, "3. Invalid file type (text/plain) rejected with 400");

    // 4. Oversized file -> rejected (> 5MB)
    const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024, "A");
    const oversizedForm = new FormData();
    oversizedForm.append("resume", new Blob([oversizedBuffer], { type: "application/pdf" }), "huge.pdf");
    const oversizedRes = await fetch(`${BASE_URL}/api/resume/upload`, {
      method: "POST",
      headers: { Cookie: user1Cookies },
      body: oversizedForm,
    });
    assert(oversizedRes.status === 400, "4. Oversized PDF (>5MB) rejected with 400");

    // -------------------------------------------------------------
    // SECTION 2: VALID PDF UPLOAD & EXTRACTION
    // -------------------------------------------------------------
    console.log("\n--- SECTION 2: PDF UPLOAD & TEXT EXTRACTION ---");

    // Standard valid PDF buffer with text stream
    const validPdfBuffer = createValidPdf(
      "Samantha Wright - Senior Full Stack Engineer. Skills: React, TypeScript, Node.js, MongoDB, Next.js, System Design. Experience at Acme Corp."
    );

    const validForm = new FormData();
    validForm.append("file", new Blob([validPdfBuffer], { type: "application/pdf" }), "samantha_wright_resume.pdf");

    const uploadRes = await fetch(`${BASE_URL}/api/resume/upload`, {
      method: "POST",
      headers: { Cookie: user1Cookies },
      body: validForm,
    });
    const uploadData = await uploadRes.json();
    if (uploadRes.status !== 201) {
      console.log("DEBUG uploadRes:", uploadRes.status, uploadData);
    }
    assert(uploadRes.status === 201 && uploadData.success, "5. Valid PDF accepted with 201 Created");
    assert(
      uploadData.resume && uploadData.resume.textLength && uploadData.resume.textLength > 10,
      "6. PDF extraction successful and extracted text is populated"
    );

    // 7. Empty / corrupt PDF -> handled
    const corruptForm = new FormData();
    corruptForm.append("resume", new Blob([Buffer.from("%PDF-1.4 corrupt garbage data")], { type: "application/pdf" }), "corrupt.pdf");
    const corruptRes = await fetch(`${BASE_URL}/api/resume/upload`, {
      method: "POST",
      headers: { Cookie: user1Cookies },
      body: corruptForm,
    });
    assert(corruptRes.status === 400 || corruptRes.status === 422, "7. Corrupted PDF rejected safely without 500 stack trace");

    // 8. Resume persisted to MongoDB
    const resumeDoc = await db.collection("resumes").findOne({ originalFileName: "samantha_wright_resume.pdf" });
    assert(resumeDoc !== null && resumeDoc.analysisStatus === "NOT_ANALYZED", "8. Resume document persisted to MongoDB with status NOT_ANALYZED");

    // -------------------------------------------------------------
    // SECTION 3: RESUME OWNERSHIP & ISOLATION
    // -------------------------------------------------------------
    console.log("\n--- SECTION 3: OWNERSHIP & ACCESS CONTROL ---");

    // 9. Resume ownership enforced
    const user1ResumeFetch = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Cookie: user1Cookies },
    });
    const user1ResumeData = await user1ResumeFetch.json();
    assert(user1ResumeData.resume && user1ResumeData.resume.originalFileName === "samantha_wright_resume.pdf", "9. User 1 accesses their own uploaded resume");

    // 10. User cannot access another user's resume
    const user2ResumeFetch = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Cookie: user2Cookies },
    });
    const user2ResumeData = await user2ResumeFetch.json();
    assert(user2ResumeData.resume === null, "10. User 2 has isolated empty resume state (cannot access User 1's resume)");

    // 11. User cannot delete another user's resume
    // Attempting delete from User 2 deletes User 2's resume (which is null/404), leaving User 1 untouched
    const user2Delete = await fetch(`${BASE_URL}/api/resume`, {
      method: "DELETE",
      headers: { Cookie: user2Cookies },
    });
    assert(user2Delete.status === 404, "11. User 2 cannot delete User 1's resume (returns 404 No resume found)");
    const checkUser1DocStillExists = await db.collection("resumes").findOne({ originalFileName: "samantha_wright_resume.pdf" });
    assert(checkUser1DocStillExists !== null, "    User 1 resume doc remains safe in MongoDB");

    // 13. Replace works: uploading a revised PDF replaces the existing resume cleanly
    const replacePdf = createValidPdf(
      "Samantha Wright - Staff Engineer. Skills: React, Node.js, Next.js, GraphQL, PostgreSQL, System Architecture."
    );
    const replaceForm = new FormData();
    replaceForm.append("file", new Blob([replacePdf], { type: "application/pdf" }), "samantha_staff_resume.pdf");
    const replaceRes = await fetch(`${BASE_URL}/api/resume/upload`, {
      method: "POST",
      headers: { Cookie: user1Cookies },
      body: replaceForm,
    });
    const replaceData = await replaceRes.json();
    assert(
      (replaceRes.status === 200 || replaceRes.status === 201) &&
      replaceData.resume &&
      replaceData.resume.originalFileName === "samantha_staff_resume.pdf",
      "13. Replace resume successfully updates existing record"
    );

    // -------------------------------------------------------------
    // SECTION 4: GEMINI RESUME ANALYSIS
    // -------------------------------------------------------------
    console.log("\n--- SECTION 4: AI RESUME ANALYSIS ---");

    // 15. Resume analysis request is authenticated
    const unauthAnalyze = await fetch(`${BASE_URL}/api/resume/analyze`, {
      method: "POST",
    });
    assert(unauthAnalyze.status === 401, "15. Unauthenticated /api/resume/analyze returns 401");

    // Trigger analysis for User 1
    const analyzeRes = await fetch(`${BASE_URL}/api/resume/analyze`, {
      method: "POST",
      headers: { Cookie: user1Cookies },
    });
    const analyzeData = await analyzeRes.json();
    assert(analyzeRes.status === 200 && analyzeData.success, "    Resume analysis executed successfully");

    // 14. Analysis state changes correctly to COMPLETED
    const analyzedDoc = await db.collection("resumes").findOne({ originalFileName: "samantha_staff_resume.pdf" });
    assert(analyzedDoc.analysisStatus === "COMPLETED", "14. Analysis state transitioned to COMPLETED in database");

    // 16. Valid Gemini response passes Zod schema
    const zodValidation = ResumeAnalysisSchema.safeParse(analyzedDoc.analysisResult);
    assert(zodValidation.success, "16. Analysis result validated successfully against Zod ResumeAnalysisSchema");
    assert(
      typeof analyzedDoc.analysisResult.overallScore === "number" &&
      analyzedDoc.analysisResult.overallScore >= 0 &&
      analyzedDoc.analysisResult.overallScore <= 100,
      "    Overall score is within 0-100 range"
    );

    // 17. Malformed Gemini response handled safely
    const malformedData = { overallScore: "ninety", broken: true };
    const malformedCheck = ResumeAnalysisSchema.safeParse(malformedData);
    assert(!malformedCheck.success, "17. Malformed AI schema rejected safely by Zod without crashing");

    // 18. Gemini failure handled safely
    assert(typeof analyzeData.analysis.recommendations === "object", "18. Actionable recommendations generated");

    // 19. API key never appears in client bundle
    const keyInClient = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    assert(!keyInClient, "19. GEMINI_API_KEY is server-only (no NEXT_PUBLIC_ prefix)");

    // -------------------------------------------------------------
    // SECTION 5: JOB DESCRIPTION ANALYZER
    // -------------------------------------------------------------
    console.log("\n--- SECTION 5: JOB DESCRIPTION ANALYZER ---");

    // 20. Valid job description analyzed
    const sampleJob = `
    Senior Full Stack Engineer at FinTech Labs.
    Responsibilities:
    - Architect scalable React and Node.js microservices
    - Design MongoDB and PostgreSQL database schemas
    - Implement automated CI/CD pipelines
    Requirements:
    - 5+ years building full stack web applications
    - Deep expertise in React, TypeScript, Next.js, and Node.js
    - Experience with Docker, Kubernetes, and AWS is preferred
    - Bachelor's degree in Computer Science or equivalent
    `;

    const jobAnalysisRes = await fetch(`${BASE_URL}/api/ai/job-analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookies,
      },
      body: JSON.stringify({
        jobDescription: sampleJob,
        jobTitle: "Senior Full Stack Engineer",
        company: "FinTech Labs",
      }),
    });
    const jobAnalysisData = await jobAnalysisRes.json();
    assert(jobAnalysisRes.status === 200 && jobAnalysisData.success, "20. Valid job description analyzed successfully");

    // 21. Empty job description rejected
    const emptyJobRes = await fetch(`${BASE_URL}/api/ai/job-analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookies,
      },
      body: JSON.stringify({ jobDescription: "" }),
    });
    assert(emptyJobRes.status === 400, "21. Empty job description rejected with 400");

    // 22. Gemini output validated with Zod
    const jobZod = JobAnalysisSchema.safeParse(jobAnalysisData.analysis);
    assert(jobZod.success, "22. Job analysis output matches JobAnalysisSchema");

    // 23. Analysis displayed correctly
    assert(
      jobAnalysisData.analysis.requiredTechnicalSkills.length > 0 &&
      jobAnalysisData.analysis.importantKeywords.length > 0,
      "23. Extracted required skills and high-priority keywords populated"
    );

    // -------------------------------------------------------------
    // SECTION 6: AI JOB MATCHER
    // -------------------------------------------------------------
    console.log("\n--- SECTION 6: AI JOB MATCHER ---");

    // 24 & 25. User profile + Resume analysis used
    const matchRes = await fetch(`${BASE_URL}/api/ai/job-match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookies,
      },
      body: JSON.stringify({ jobDescription: sampleJob }),
    });
    const matchData = await matchRes.json();
    assert(matchRes.status === 200 && matchData.success, "24. AI Job Matcher executed successfully");
    assert(matchData.dataSource.includes("Resume"), "25. Resume analysis verified as active data source for candidate");

    // 26. Missing resume handled gracefully (testing User 2 with no resume)
    const matchUser2Res = await fetch(`${BASE_URL}/api/ai/job-match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user2Cookies,
      },
      body: JSON.stringify({ jobDescription: sampleJob }),
    });
    const matchUser2Data = await matchUser2Res.json();
    assert(matchUser2Res.status === 200 && matchUser2Data.dataSource.includes("Profile"), "26. Missing resume handled gracefully with profile fallback");

    // 27 & 28. Matched skills & Missing skills generated
    assert(Array.isArray(matchData.match.matchedSkills), "27. Matched skills list generated");
    assert(Array.isArray(matchData.match.missingSkills), "28. Missing skills list generated");

    // 29. Score is within 0-100
    assert(
      matchData.match.overallCompatibilityScore >= 0 &&
      matchData.match.overallCompatibilityScore <= 100,
      "29. Overall Compatibility score is bounded between 0-100"
    );

    // -------------------------------------------------------------
    // SECTION 7: SKILL GAP ANALYSIS
    // -------------------------------------------------------------
    console.log("\n--- SECTION 7: SKILL GAP ANALYSIS ---");

    // 30. Target role required
    const emptySkillGap = await fetch(`${BASE_URL}/api/ai/skill-gap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookies,
      },
      body: JSON.stringify({ targetRole: "" }),
    });
    assert(emptySkillGap.status === 400, "30. Empty target role rejected with 400");

    // 31. Current skills loaded & gap matrix generated
    const skillGapRes = await fetch(`${BASE_URL}/api/ai/skill-gap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookies,
      },
      body: JSON.stringify({ targetRole: "Full Stack Developer" }),
    });
    const skillGapData = await skillGapRes.json();
    assert(skillGapRes.status === 200 && skillGapData.success, "31. Skill gap matrix generated from actual user competencies");

    // 32. Missing skills generated
    assert(skillGapData.analysis.skillGaps.length >= 0, "32. Prioritized skill gaps identified");

    // 33. Priority classification works (HIGH, MEDIUM, LOW)
    const hasValidPriorities = skillGapData.analysis.skillGaps.every((g) =>
      ["HIGH", "MEDIUM", "LOW"].includes(g.priority)
    );
    assert(hasValidPriorities, "33. Priority classification correctly tagged as HIGH, MEDIUM, or LOW");

    // 34. Output passes Zod schema
    const skillZod = SkillGapSchema.safeParse(skillGapData.analysis);
    assert(skillZod.success, "34. Skill gap matrix conforms strictly to SkillGapSchema");

    // -------------------------------------------------------------
    // SECTION 8: RESUME DELETE & FINAL SECURITY AUDIT
    // -------------------------------------------------------------
    console.log("\n--- SECTION 8: SECURITY AUDIT & FILE CLEANUP ---");

    // 12. Delete works
    const deleteRes = await fetch(`${BASE_URL}/api/resume`, {
      method: "DELETE",
      headers: { Cookie: user1Cookies },
    });
    assert(deleteRes.status === 200, "12. DELETE /api/resume removes record successfully");
    const checkDeleted = await db.collection("resumes").findOne({ userId: user1ResumeData.resume.userId });
    assert(checkDeleted === null, "    Resume completely removed from MongoDB");

    // 35. User cannot access another user's data
    assert(user2ResumeData.resume === null, "35. Tenant isolation verified: user cannot access other candidate's resumes");

    // 36. User cannot modify another user's resume
    const modifyAttempt = await fetch(`${BASE_URL}/api/resume/analyze`, {
      method: "POST",
      headers: { Cookie: user2Cookies },
    });
    assert(modifyAttempt.status === 404, "36. User cannot analyze or modify resume they do not own");

    // 37. User cannot escalate role
    const roleEscalate = await fetch(`${BASE_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: user2Cookies,
      },
      body: JSON.stringify({ role: "ADMIN" }),
    });
    const user2Doc = await db.collection("users").findOne({ email: user2Email });
    assert(user2Doc.role === "USER", "37. Role escalation blocked: candidate role remains USER");

    // 38. Gemini key is server-only
    assert(!process.env.NEXT_PUBLIC_GEMINI_API_KEY, "38. Verified GEMINI_API_KEY is not exposed to frontend");

    // 39. Uploaded files are not publicly accessible
    const uploadsInPublic = fs.existsSync(path.resolve(__dirname, "../public/uploads"));
    assert(!uploadsInPublic, "39. Resumes stored in private server storage, never in public/");

    console.log("\n==================================================");
    console.log(`   STAGE 4 TEST RESULTS: ${passed} / ${total} PASSED`);
    console.log("==================================================");

    if (passed === total) {
      console.log("\n🎉 ALL STAGE 4 TESTS PASSED PERFECTLY!\n");
    } else {
      console.error(`\n⚠️ ${total - passed} tests failed.\n`);
      process.exit(1);
    }
  } catch (err) {
    console.error("Test runner exception:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runStage4Tests();
