import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateWithOpenAI = async (request) => {

  return await openai.chat.completions.create({

    model: "gpt-4o-mini",

    messages: request.messages,

    tools: request.tools,

    tool_choice: "auto",

  });
};

export default openai;