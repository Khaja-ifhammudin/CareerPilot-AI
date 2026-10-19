import { generateStructuredAI } from "@/lib/ai/gemini-client";
import { SkillGapSchema, type SkillGapOutput } from "@/lib/ai/schemas";

const SKILL_GAP_SYSTEM_INSTRUCTION = `You are a technical career coach specializing in software engineering skills gap analysis.
Given a candidate's current technical skills and their target career role, analyze the competencies needed to be competitive.
Categorize missing skills into HIGH, MEDIUM, and LOW priority based on market demand.
Provide realistic, actionable self-directed learning directions (e.g. 'Build a Dockerized REST API' or 'Practice SQL indexing'). Do NOT invent fake courses or certificates.`;

export async function analyzeSkillGapsWithAI(
  targetRole: string,
  currentSkills: string[]
): Promise<SkillGapOutput> {
  const prompt = `Analyze the skill gaps between the candidate's current competencies and their target role.

TARGET ROLE: ${targetRole}
CURRENT CANDIDATE SKILLS: ${currentSkills.join(", ") || "None specified"}

Compare:
1. Current Skills vs Required Skills for ${targetRole}
2. Matched Skills
3. Missing Skills categorized by priority:
   - HIGH: Essential prerequisite technologies for the role
   - MEDIUM: Highly favored tools in modern production teams
   - LOW: Nice-to-have or specialized tooling
4. Actionable recommendations to close the gaps

Return a valid JSON object matching the requested schema.`;

  const mockFallback = (): SkillGapOutput => {
    const matched = currentSkills.filter((s) =>
      ["React", "TypeScript", "JavaScript", "Node.js", "MongoDB", "Python"].includes(s)
    );

    const gaps = [
      {
        skill: "Docker & Containerization",
        priority: "HIGH" as const,
        reason: "Most modern production environments require applications to be packaged and deployed in Docker containers.",
        learningDirection: "Create a multi-stage Dockerfile for your Next.js application and run it locally with docker compose.",
      },
      {
        skill: "Cloud Deployment (AWS / GCP)",
        priority: "HIGH" as const,
        reason: "Employers expect engineers to understand basic cloud primitives like S3, serverless functions, and ECS/Cloud Run.",
        learningDirection: "Deploy a personal full-stack service to AWS or Vercel with environment variable secrets.",
      },
      {
        skill: "Relational Database & SQL Indexing",
        priority: "MEDIUM" as const,
        reason: "While NoSQL is useful, relational data models (PostgreSQL) and indexing are required in 80% of backend roles.",
        learningDirection: "Practice designing a normalized database schema with foreign keys and index queries for speed.",
      },
      {
        skill: "Automated Integration Testing (Jest / Playwright)",
        priority: "LOW" as const,
        reason: "Testing differentiates junior developers from reliable engineers by demonstrating quality assurance skills.",
        learningDirection: "Write unit tests for utility functions and an end-to-end user login test using Playwright.",
      },
    ];

    return {
      targetRole,
      currentSkills,
      requiredSkills: [
        ...matched,
        "Docker & Containerization",
        "Cloud Deployment (AWS / GCP)",
        "Relational Database & SQL Indexing",
        "Automated Integration Testing",
      ],
      matchedSkills: matched.length > 0 ? matched : ["Problem Solving", "Web Basics"],
      skillGaps: gaps,
      actionableRecommendations: [
        "Focus first on high-priority gap: build a containerized microservice or portfolio project using Docker.",
        "Add a relational database (PostgreSQL) project alongside your existing MongoDB knowledge.",
        "Highlight your matched skills prominently at the top of your resume technical skills matrix.",
      ],
    };
  };

  return generateStructuredAI<SkillGapOutput>(
    prompt,
    SkillGapSchema,
    SKILL_GAP_SYSTEM_INSTRUCTION,
    mockFallback
  );
}
