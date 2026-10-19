import { generateStructuredAI } from "@/lib/ai/gemini-client";
import {
  InterviewQuestionsOutputSchema,
  InterviewAnswerEvaluationSchema,
  InterviewSessionEvaluationSchema,
  type InterviewQuestionsOutput,
  type InterviewAnswerEvaluationOutput,
  type InterviewSessionEvaluationOutput,
} from "@/lib/ai/schemas";

const INTERVIEWER_SYSTEM_INSTRUCTION = `You are a Principal Software Engineering Hiring Manager and Technical Interviewer at a premier technology company.
Your role is to conduct rigorous, grounded, and realistic mock interview sessions.
CRITICAL RULES:
1. Ground questions strictly in the candidate's actual profile, resume, and the specified job role.
2. DO NOT hallucinate candidate experience or claim they have worked with technologies not in their profile/resume.
3. If evaluating behavioral questions, emphasize the STAR framework (Situation, Task, Action, Result).
4. If evaluating technical questions, assess accuracy, efficiency, trade-offs, and communication.
5. Provide constructive, direct feedback and concrete improved phrasing.
6. Return only valid JSON conforming strictly to the requested schema.`;

export interface GenerateQuestionsOptions {
  sessionType: "GENERAL" | "TECHNICAL" | "BEHAVIORAL" | "JOB_SPECIFIC";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  candidateSkills?: string[];
  candidateSummary?: string;
  candidateExperienceLevel?: string;
  skillGaps?: string[];
}

export async function generateInterviewQuestions(
  options: GenerateQuestionsOptions
): Promise<InterviewQuestionsOutput> {
  const {
    sessionType,
    difficulty,
    jobTitle = "Software Engineer",
    company = "Tech Company",
    jobDescription,
    candidateSkills = [],
    candidateSummary,
    candidateExperienceLevel = "Entry",
    skillGaps = [],
  } = options;

  const prompt = `Generate 5 realistic, targeted interview questions for a candidate.

INTERVIEW CONFIGURATION:
- Session Type: ${sessionType}
- Target Role: ${jobTitle} at ${company}
- Target Difficulty: ${difficulty}
- Candidate Experience Level: ${candidateExperienceLevel}
- Candidate Known Skills: ${candidateSkills.join(", ") || "General Computer Science"}
${candidateSummary ? `- Resume Summary: ${candidateSummary}` : ""}
${skillGaps.length > 0 ? `- Known Technical Gaps: ${skillGaps.join(", ")}` : ""}
${jobDescription ? `- Job Description Context: """${jobDescription.slice(0, 10000)}"""` : ""}

REQUIREMENTS:
- Produce exactly 5 diverse questions.
- For TECHNICAL: Focus on candidate's stack (e.g. ${candidateSkills.slice(0, 5).join(", ") || "algorithms, web architecture"}).
- For BEHAVIORAL: Focus on collaboration, conflict resolution, technical challenges, and prioritization.
- For JOB_SPECIFIC: Focus on day-to-day requirements of ${jobTitle} at ${company}.
- Assign a unique questionId (e.g. "q1", "q2") to each question.
- Specify what the interviewer is looking for in expectedFocus.`;

  const mockFallback = (): InterviewQuestionsOutput => {
    if (sessionType === "BEHAVIORAL") {
      return {
        questions: [
          {
            questionId: "q1",
            question: "Tell me about a time you faced an unexpected technical roadblock on a deadline. How did you resolve it?",
            category: "Problem Solving",
            expectedFocus: "Application of STAR method, communication with stakeholders, and practical problem decomposition.",
          },
          {
            questionId: "q2",
            question: "Describe a situation where you had a disagreement with a teammate over an architectural decision. How did you handle it?",
            category: "Collaboration",
            expectedFocus: "Constructive conflict resolution, objective data evaluation, and team cohesion.",
          },
          {
            questionId: "q3",
            question: "Can you give an example of a mistake you made in production or in a class project, and what you learned from it?",
            category: "Ownership & Accountability",
            expectedFocus: "Honesty, blameless root-cause analysis, and preventative safeguards implemented.",
          },
          {
            questionId: "q4",
            question: "How do you prioritize competing requirements when multiple tasks are urgent?",
            category: "Prioritization",
            expectedFocus: "Impact vs. effort evaluation, trade-off communication, and agile mindset.",
          },
          {
            questionId: "q5",
            question: "Tell me about a project you are particularly proud of. What made it challenging and impactful?",
            category: "Initiative & Passion",
            expectedFocus: "Technical depth, personal agency, and measurable outcomes.",
          },
        ],
      };
    }

    // Technical / Job specific / General fallback
    const primarySkill = candidateSkills[0] || "React";
    const secondarySkill = candidateSkills[1] || "Node.js";

    return {
      questions: [
        {
          questionId: "q1",
          question: `Explain how state management and re-rendering work in modern web applications, particularly when using ${primarySkill}.`,
          category: "Technical Fundamentals",
          expectedFocus: "Component lifecycle, immutability, virtual DOM diffing, and performance optimization.",
        },
        {
          questionId: "q2",
          question: `How would you design a scalable REST or GraphQL API backend in ${secondarySkill} that handles authentication and rate limiting?`,
          category: "Backend & API Design",
          expectedFocus: "Middleware patterns, JWT/session handling, token validation, and rate limiter implementations.",
        },
        {
          questionId: "q3",
          question: "What strategies do you employ to prevent common web security vulnerabilities such as XSS, CSRF, and SQL/NoSQL injection?",
          category: "Security",
          expectedFocus: "Input sanitization, parameterized queries, HTTP-only cookies, and Content Security Policy.",
        },
        {
          questionId: "q4",
          question: "Describe your approach to database indexing and query optimization when query response times degrade under high traffic.",
          category: "Database & Performance",
          expectedFocus: "Compound indexes, execution plan (explain) analysis, caching layers, and database denormalization.",
        },
        {
          questionId: "q5",
          question: `For the ${jobTitle} position at ${company}, how would you architect a continuous deployment pipeline with automated tests?`,
          category: "DevOps & Engineering Practices",
          expectedFocus: "Unit/integration testing, CI/CD stages, containerization, and zero-downtime deployment strategies.",
        },
      ],
    };
  };

  return generateStructuredAI<InterviewQuestionsOutput>(
    prompt,
    InterviewQuestionsOutputSchema,
    INTERVIEWER_SYSTEM_INSTRUCTION,
    mockFallback
  );
}

export async function evaluateInterviewAnswer(
  question: string,
  userAnswer: string,
  category: string,
  expectedFocus?: string
): Promise<InterviewAnswerEvaluationOutput> {
  const prompt = `Evaluate the candidate's answer to the following interview question.

QUESTION:
"${question}"
Category: ${category}
${expectedFocus ? `Expected Evaluation Focus: "${expectedFocus}"` : ""}

CANDIDATE ANSWER:
"""
${userAnswer.slice(0, 10000)}
"""

EVALUATE AND SCORE (0-100):
- Score 80-100: Comprehensive, structured, concrete examples, proactive mention of trade-offs.
- Score 60-79: Solid conceptual grasp, but lacks concrete metrics or deeper architectural edge cases.
- Score 40-59: High-level or vague, missed key technical details or STAR framework steps.
- Score 0-39: Incorrect, off-topic, or insufficient effort.

Provide:
1. Numerical score (0-100)
2. Specific strengths (bullet points)
3. Actionable weaknesses or missed opportunities (bullet points)
4. Concise constructive feedback paragraph
5. An exemplary improved answer showing how a Staff Engineer would articulate the response`;

  const mockFallback = (): InterviewAnswerEvaluationOutput => {
    const wordCount = userAnswer.trim().split(/\s+/).length;
    let score = 75;
    if (wordCount > 60) score = 85;
    if (wordCount < 20) score = 55;

    return {
      score,
      strengths: [
        "Directly addressed the core question without excessive tangents.",
        "Demonstrated practical familiarity with development workflows.",
        "Used clear, professional engineering terminology.",
      ],
      weaknesses: [
        "Could include more specific quantitative metrics (e.g. % performance improvement, latency reduction).",
        "Could briefly discuss edge cases and trade-offs of the chosen approach.",
      ],
      feedback:
        "Strong fundamental answer. To elevate it to senior engineering caliber, quantify the business or performance impact and explicitly articulate the technical trade-offs.",
      improvedAnswer: `In my previous work, I approached this systematically: first, I established measurable baseline metrics to define the problem. Next, I evaluated two architectural alternatives considering maintainability and latency. Finally, I implemented the solution with automated tests, resulting in a 40% reduction in processing overhead and zero production regressions.`,
    };
  };

  return generateStructuredAI<InterviewAnswerEvaluationOutput>(
    prompt,
    InterviewAnswerEvaluationSchema,
    INTERVIEWER_SYSTEM_INSTRUCTION,
    mockFallback
  );
}

export async function evaluateInterviewSession(
  sessionSummary: {
    jobTitle?: string;
    company?: string;
    sessionType: string;
    questions: Array<{
      question: string;
      category: string;
      userAnswer?: string;
      evaluation?: { score: number; feedback: string };
    }>;
  }
): Promise<InterviewSessionEvaluationOutput> {
  const evaluatedQuestions = sessionSummary.questions.filter((q) => q.evaluation);
  const avgScore =
    evaluatedQuestions.length > 0
      ? Math.round(
          evaluatedQuestions.reduce((acc, q) => acc + (q.evaluation?.score || 0), 0) /
            evaluatedQuestions.length
        )
      : 70;

  const prompt = `Provide a comprehensive final evaluation for an entire mock interview session.

SESSION CONTEXT:
- Role: ${sessionSummary.jobTitle || "Software Engineer"} at ${sessionSummary.company || "Tech Company"}
- Session Type: ${sessionSummary.sessionType}
- Average Answer Score: ${avgScore}/100
- Questions Answered: ${evaluatedQuestions.length}

QUESTION BREAKDOWNS:
${evaluatedQuestions
  .map(
    (q, i) => `Q${i + 1} (${q.category}): "${q.question}"
Answer: "${(q.userAnswer || "Skipped").slice(0, 300)}"
Score: ${q.evaluation?.score || 0}/100
Feedback: "${q.evaluation?.feedback || "N/A"}"`
  )
  .join("\n\n")}

Provide:
1. Overall session score (0-100)
2. Overall holistic assessment paragraph
3. Top candidate strengths across all questions
4. Areas for improvement
5. Concrete recommendations for the real interview`;

  const mockFallback = (): InterviewSessionEvaluationOutput => {
    return {
      overallScore: avgScore,
      overallFeedback: `The candidate demonstrated solid competence for the ${
        sessionSummary.jobTitle || "Software Engineer"
      } position with a balanced grasp of technical fundamentals and structured communication.`,
      strengths: [
        "Consistent clarity and structured thought process across questions.",
        "Solid command of modern web stack and architecture patterns.",
        "Demonstrated practical understanding of engineering trade-offs.",
      ],
      weaknesses: [
        "In behavioral responses, could structure answers more tightly around the STAR framework.",
        "Could articulate quantitative performance and impact metrics more proactively.",
      ],
      recommendations: [
        "Practice opening behavioral answers with a concise one-sentence executive summary before diving into context.",
        "Review system design trade-offs regarding caching and database sharding for high-scale questions.",
        "Prepare 2-3 tailored questions to ask the interviewer about their engineering team culture and technical roadmap.",
      ],
    };
  };

  return generateStructuredAI<InterviewSessionEvaluationOutput>(
    prompt,
    InterviewSessionEvaluationSchema,
    INTERVIEWER_SYSTEM_INSTRUCTION,
    mockFallback
  );
}
