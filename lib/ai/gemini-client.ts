import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Extracts and cleans JSON string from AI model output, removing markdown codeblocks.
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```$/, "");
  }
  return cleaned.trim();
}

/**
 * Applies explicit fallback metadata so that deterministic evaluations
 * are never presented or mistaken for live Gemini AI output.
 */
function applyFallbackMetadata<T>(fallback: () => T, reason: string): T {
  const result = fallback();
  if (typeof result === "object" && result !== null) {
    return {
      ...result,
      isFallback: true,
      fallbackReason: reason,
    } as T;
  }
  return result;
}

/**
 * Generic server-side structured JSON generator using Google Gemini.
 */
export async function generateStructuredAI<T>(
  prompt: string,
  schema: z.ZodType<T>,
  systemInstruction?: string,
  mockFallback?: () => T
): Promise<T> {
  // If no Gemini key is configured and a mock fallback is provided
  if (!apiKey || !genAI) {
    if (mockFallback) {
      console.warn(
        "⚠️ AI SERVICE UNCONFIGURED: GEMINI_API_KEY is unset. Serving explicit deterministic fallback with isFallback=true."
      );
      return applyFallbackMetadata(
        mockFallback,
        "Live Gemini AI key is not configured on server. Deterministic structural baseline provided."
      );
    }
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
        ? {
            role: "system",
            parts: [{ text: systemInstruction }],
          }
        : undefined,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for high factual accuracy & adherence
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = cleanJsonOutput(responseText);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch {
      throw new Error("Model response was not valid JSON format.");
    }

    const validated = schema.safeParse(parsed);
    if (!validated.success) {
      console.error("AI Schema Validation Error:", validated.error.format());
      throw new Error("AI output failed structured schema validation.");
    }

    return validated.data;
  } catch (error: unknown) {
    console.error("Gemini AI generation failure:", error);
    // If rate limited or error occurs and mock fallback exists, return tagged degraded state
    if (mockFallback) {
      console.warn(
        "⚠️ AI SERVICE DEGRADED: Live Gemini call failed. Serving explicit deterministic fallback with isFallback=true."
      );
      return applyFallbackMetadata(
        mockFallback,
        "Live Gemini model request failed or was rate limited. Deterministic structural baseline provided."
      );
    }
    throw error;
  }
}
