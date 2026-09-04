import { runAgent } from "../ai/agent.js";

export const chatWithAI = async (req, res) => {
  try {

    const {
      message,
      history = [],
      productContext = [],
    } = req.body;


    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }


    const result =
  await runAgent(
    message,
    history,
    productContext,
    req.user.userId
  );


    return res.status(200).json({

      success: true,

      response:
        result.response,

      productContext:
        result.productContext || [],

    });

  } catch (error) {

    console.error(
      "AI chat error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "AI service failed",

    });
  }
};