import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function testFullLogin() {
  console.log("Testing complete NextAuth Credentials Sign-in & Session Flow...\n");

  // Step 1: Fetch CSRF Token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [csrfRes.headers.get("set-cookie") || ""];
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  console.log("1. CSRF Token received:", csrfToken ? "YES" : "NO");

  const cookieHeader = csrfCookies.map(c => c.split(";")[0]).join("; ");

  // Step 2: POST credentials to callback
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieHeader,
    },
    body: new URLSearchParams({
      email: "admin@careerpilot.ai",
      password: "AdminPassword123",
      csrfToken,
      redirect: "false",
      json: "true",
    }).toString(),
    redirect: "manual",
  });

  const sessionCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie") || ""];
  console.log("2. Login status:", loginRes.status);
  
  const allCookies = [...csrfCookies, ...sessionCookies]
    .map(c => c.split(";")[0])
    .filter(Boolean)
    .join("; ");

  console.log("3. Session cookies generated:", sessionCookies.length > 0 ? "YES" : "NO");

  // Step 3: Access protected /dashboard with session cookie
  const dashRes = await fetch(`${BASE_URL}/dashboard`, {
    headers: {
      "Cookie": allCookies,
    },
    redirect: "manual",
  });

  console.log("4. Authenticated /dashboard access status:", dashRes.status);
  if (dashRes.status === 200) {
    console.log("✅ SUCCESS: Successfully accessed protected /dashboard with authenticated session cookie!");
  } else {
    console.log("Response location:", dashRes.headers.get("location"));
  }

  // Step 4: Access protected /admin with session cookie (admin role)
  const adminRes = await fetch(`${BASE_URL}/admin`, {
    headers: {
      "Cookie": allCookies,
    },
    redirect: "manual",
  });

  console.log("5. Authenticated /admin access status:", adminRes.status);
  if (adminRes.status === 200) {
    console.log("✅ SUCCESS: Successfully accessed protected /admin with ADMIN role credentials!");
  } else {
    console.log("Admin response location:", adminRes.headers.get("location"));
  }
}

testFullLogin().catch(console.error);
