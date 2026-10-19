import { generateStructuredAI } from "@/lib/ai/gemini-client";
import { JobAnalysisSchema, type JobAnalysisOutput } from "@/lib/ai/schemas";

const JOB_SYSTEM_INSTRUCTION = `You are a technical recruitment analyst.
Your job is to read raw job postings and extract structured requirements without making unsupported assumptions.
If information (such as company or location) is not clearly present in the posting, return null or 'Unknown' rather than inventing it.
Distinguish between mandatory ('required') skills and 'preferred'/'nice-to-have' skills.`;

export async function analyzeJobDescriptionWithAI(
  rawDescription: string,
  meta?: {
    jobTitle?: string;
    company?: string;
    location?: string;
  }
): Promise<JobAnalysisOutput> {
  const cleanDescription = rawDescription.slice(0, 25000);

  const prompt = `Analyze the following job posting and extract all key hiring criteria.

SUPPLIED METADATA (Optional):
- Job Title: ${meta?.jobTitle || "Not provided"}
- Company: ${meta?.company || "Not provided"}
- Location: ${meta?.location || "Not provided"}

JOB DESCRIPTION CONTENT:
"""
${cleanDescription}
"""

Return a valid JSON object matching the requested schema.`;

  const mockFallback = (): JobAnalysisOutput => ({
    jobTitle: meta?.jobTitle || "Full Stack Software Engineer",
    company: meta?.company || null,
    location: meta?.location || "Remote / Hybrid",
    seniority: "Entry / Early Career (0-3 yrs)",
    summary:
      "Engineering opportunity focused on building scalable customer-facing web applications, collaborating with design and backend API teams.",
    experienceRequirements: "0-3 years of practical experience with modern web development stacks.",
    educationRequirements: "B.S. in Computer Science, Software Engineering, or equivalent practical experience.",
    requiredTechnicalSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "RESTful APIs",
      "Git",
    ],
    preferredSkills: [
      "Next.js",
      "Docker",
      "Tailwind CSS",
      "PostgreSQL or MongoDB",
      "Automated Testing (Jest/Playwright)",
    ],
    softSkills: [
      "Cross-functional communication",
      "Self-directed problem solving",
      "Attention to detail",
    ],
    responsibilities: [
      "Develop responsive UI components using React and TypeScript.",
      "Integrate backend APIs and manage client state effectively.",
      "Participate in code reviews and agile sprint planning.",
    ],
    importantKeywords: [
      "React",
      "TypeScript",
      "Full Stack",
      "Node.js",
      "REST APIs",
      "Agile",
      "Frontend",
    ],
    technologies: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Git"],
  });

  return generateStructuredAI<JobAnalysisOutput>(
    prompt,
    JobAnalysisSchema,
    JOB_SYSTEM_INSTRUCTION,
    mockFallback
  );
}
