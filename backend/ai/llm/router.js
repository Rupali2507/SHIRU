import { generateWithGemini } from "./gemini.js";
import { generateWithOpenAI } from "./openai.js";

const shouldFallback = (error) => {
  const status = Number(error?.status || error?.code);

  return [429, 500, 502, 503, 504].includes(status);
};

export const generateWithFallback = async ({
  geminiRequest,
  openAIRequest,
}) => {
  
  try {
    console.log("🤖 Trying Gemini...");

    const response =
      await generateWithGemini(geminiRequest);

    return {
      provider: "gemini",
      response,
    };

  } catch (error) {

    console.error(
      "❌ Gemini failed:",
      error.message
    );

    if (!shouldFallback(error)) {
      throw error;
    }
  }



  try {
    console.log("🔄 Falling back to OpenAI...");

    const response =
      await generateWithOpenAI(openAIRequest);

    return {
      provider: "openai",
      response,
    };

  } catch (error) {

    console.error(
      "❌ OpenAI failed:",
      error.message
    );

    throw new Error(
      "All AI providers are currently unavailable."
    );
  }
};