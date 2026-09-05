import { generateWithGroq } from "./groq.js";
import { generateWithGemini } from "./gemini.js";

const shouldFallback = (error) => {
  const status = Number(
    error?.status ||
    error?.statusCode ||
    error?.code
  );

  return [
    400,
    401,
    403,
    408,
    429,
    500,
    502,
    503,
    504,
  ].includes(status);
};

export const generateWithFallback = async ({
  groqRequest,
  geminiRequest,
}) => {

  // =========================================================
  // 1. GROQ
  // =========================================================

  try {
    console.log("🟢 Trying Groq...");

    const response =
      await generateWithGroq(groqRequest);

    console.log("✅ Groq succeeded");

    return {
      provider: "groq",
      response,
    };

  } catch (error) {

    console.error(
      "❌ Groq failed:",
      error.message
    );

    if (!shouldFallback(error)) {
      throw error;
    }
  }

  // =========================================================
  // 2. GEMINI
  // =========================================================

  try {
    console.log("🟡 Falling back to Gemini...");

    const response =
      await generateWithGemini(geminiRequest);

    console.log("✅ Gemini succeeded");

    return {
      provider: "gemini",
      response,
    };

  } catch (error) {

    console.error(
      "❌ Gemini failed:",
      error.message
    );

    throw new Error(
      "All AI providers are currently unavailable."
    );
  }
};