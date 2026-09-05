import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateWithGroq = async (request) => {
  return await groq.chat.completions.create({
    model:
      request.model ||
      "openai/gpt-oss-120b",

    messages: request.messages,

    tools: request.tools,

    tool_choice:
      request.tool_choice || "auto",

    temperature:
      request.temperature ?? 0.2,
  });
};

export default groq;