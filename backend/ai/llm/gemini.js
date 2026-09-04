import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateWithGemini = async (request) => {

  return await ai.models.generateContent({

    model: "gemini-2.5-flash",

    contents: request.contents,

    config: request.config,

  });
};

export default ai;