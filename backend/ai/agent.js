import { generateWithFallback } from "./llm/router.js";

import {
  searchProducts,
  getProduct,
} from "./tools/productTools.js";

import {
  getRelatedProducts,
} from "./tools/recommendationTools.js";

import {
  catalogFallback,
} from "./fallback/catalogFallback.js";

import {
  formatCatalogFallback,
} from "./fallback/responseFallback.js";
import {
  createOrder,
} from "./tools/orderTools.js";

// ==================================================
// GEMINI TOOLS
// ==================================================

const geminiTools = [
  {
    functionDeclarations: [

      // --------------------------------------------
      // searchProducts
      // --------------------------------------------

      {
        name: "searchProducts",

        description:
          "Search the SHIRU product catalog for products matching the user's shopping requirements.",

        parameters: {
          type: "OBJECT",

          properties: {
            query: {
              type: "STRING",
              description:
                "General product keywords or requirements.",
            },

            category: {
              type: "STRING",
              description:
                "Product category requested by the user.",
            },

            brand: {
              type: "STRING",
              description:
                "Specific brand requested by the user.",
            },

            color: {
              type: "STRING",
              description:
                "Color requested by the user.",
            },

            minPrice: {
              type: "NUMBER",
              description:
                "Minimum budget in INR.",
            },

            maxPrice: {
              type: "NUMBER",
              description:
                "Maximum budget in INR.",
            },
          },
        },
      },


      // --------------------------------------------
      // getProduct
      // --------------------------------------------

      {
        name: "getProduct",

        description:
          "Get the exact details of a specific SHIRU product using its product ID.",

        parameters: {
          type: "OBJECT",

          properties: {
            productId: {
              type: "STRING",

              description:
                "The exact ID of the product.",
            },
          },

          required: [
            "productId",
          ],
        },
      },


      // --------------------------------------------
      // getRelatedProducts
      // --------------------------------------------

      {
        name: "getRelatedProducts",

        description:
          "Find products related to a product for useful upselling and cross-selling opportunities.",

        parameters: {
          type: "OBJECT",

          properties: {
            productId: {
              type: "STRING",

              description:
                "The ID of the product the user is considering.",
            },

            maxPrice: {
              type: "NUMBER",

              description:
                "Maximum price for related products.",
            },
          },

          required: [
            "productId",
          ],
        },
      },
       {
        name: "createOrder",
        description:
          "Create an order only after the user has explicitly confirmed the purchase.",
        parameters: {
          type: "OBJECT",
          properties: {
            items: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  productId: {
                    type: "STRING",
                  },
                  quantity: {
                    type: "INTEGER",
                  },
                  selectedSize: {
                    type: "STRING",
                  },
                  selectedColor: {
                    type: "STRING",
                  },
                },
                required: ["productId", "quantity"],
              },
            },

            shippingAddress: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                phone: { type: "STRING" },
                addressLine1: { type: "STRING" },
                city: { type: "STRING" },
                state: { type: "STRING" },
                postalCode: { type: "STRING" },
                country: { type: "STRING" },
              },
            },
          },
          required: ["items"],
        },
      },
    

    ],
  },
];


// ==================================================
// OPENAI TOOLS
// ==================================================

const openAITools = [

  // ----------------------------------------------
  // searchProducts
  // ----------------------------------------------

  {
    type: "function",

    function: {
      name: "searchProducts",

      description:
        "Search the SHIRU product catalog for products matching the user's shopping requirements.",

      parameters: {
        type: "object",

        properties: {
          query: {
            type: "string",

            description:
              "General product keywords or requirements.",
          },

          category: {
            type: "string",

            description:
              "Product category requested by the user.",
          },

          brand: {
            type: "string",

            description:
              "Specific brand requested by the user.",
          },

          color: {
            type: "string",

            description:
              "Color requested by the user.",
          },

          minPrice: {
            type: "number",

            description:
              "Minimum budget in INR.",
          },

          maxPrice: {
            type: "number",

            description:
              "Maximum budget in INR.",
          },
        },
      },
    },
  },

    // ----------------------------------------------
  // createOrder
  // ----------------------------------------------

  {
    type: "function",

    function: {
      name: "createOrder",

      description:
        "Create an order only after the user has explicitly confirmed the purchase.",

      parameters: {
        type: "object",

        properties: {
          items: {
            type: "array",

            items: {
              type: "object",

              properties: {
                productId: {
                  type: "string",
                },

                quantity: {
                  type: "integer",
                },

                selectedSize: {
                  type: "string",
                },

                selectedColor: {
                  type: "string",
                },
              },

              required: [
                "productId",
                "quantity",
              ],
            },
          },

          shippingAddress: {
            type: "object",

            properties: {
              name: {
                type: "string",
              },

              phone: {
                type: "string",
              },

              addressLine1: {
                type: "string",
              },

              city: {
                type: "string",
              },

              state: {
                type: "string",
              },

              postalCode: {
                type: "string",
              },

              country: {
                type: "string",
              },
            },
          },
        },

        required: [
          "items",
        ],
      },
    },
  },


  // ----------------------------------------------
  // getProduct
  // ----------------------------------------------

  {
    type: "function",

    function: {
      name: "getProduct",

      description:
        "Get the exact details of a specific SHIRU product using its product ID.",

      parameters: {
        type: "object",

        properties: {
          productId: {
            type: "string",

            description:
              "The exact ID of the product.",
          },
        },

        required: [
          "productId",
        ],
      },
    },
  },


  // ----------------------------------------------
  // getRelatedProducts
  // ----------------------------------------------

  {
    type: "function",

    function: {
      name: "getRelatedProducts",

      description:
        "Find products related to a product for useful upselling and cross-selling opportunities.",

      parameters: {
        type: "object",

        properties: {
          productId: {
            type: "string",

            description:
              "The ID of the product the user is considering.",
          },

          maxPrice: {
            type: "number",

            description:
              "Maximum price for related products.",
          },
        },

        required: [
          "productId",
        ],
      },
    },
  },

];


// ==================================================
// SYSTEM INSTRUCTION
// ==================================================

const systemInstruction = `
You are SHIRU, an AI personal shopping assistant.

Your job is to help users discover, compare and
purchase products from the SHIRU marketplace.


CONVERSATION MEMORY:

Remember the user's previous shopping requirements.

If the user provides additional information such as:

- color
- size
- budget
- brand
- category
- use case
- preference

combine it with previous requirements.

Do not forget previous requirements unless the
user explicitly changes them.


PRODUCT SEARCH:

Use searchProducts whenever the user asks to:

- find products
- search products
- discover products
- recommend products
- compare products

For a normal product search, call searchProducts
and then provide the answer.

Do NOT call getRelatedProducts automatically after
searchProducts.

Do NOT make unnecessary tool calls.


RELATED PRODUCTS:

Use getRelatedProducts ONLY when the user explicitly
asks for:

- related products
- alternatives
- better options
- upgrades
- upsells
- cross-sells
- accessories
- what else they should consider


PRODUCT DETAILS:

Use getProduct when you need the exact details
of a specific product using its product ID.

Do not use getProduct unnecessarily when the
information is already available from searchProducts.


UPSELLING:

Recommend a more expensive alternative only when
it provides a meaningful improvement relevant to
the user's needs.


CROSS-SELLING:

Recommend complementary products only when they
are genuinely useful with the product being considered.


IMPORTANT:

Never invent:

- product names
- prices
- stock
- brands
- features
- merchants
- product IDs

Only use information returned by the tools.

PURCHASING:

When the user wants to buy a product:

1. Identify the exact product.
2. Confirm the product, merchant, price and quantity.
3. Ask the user for explicit confirmation before creating the order.
4. Only call createOrder after the user explicitly confirms.
5. Never create an order merely because the user says "buy" if confirmation has not yet been obtained.
6. Never invent shipping information.
7. If shipping information is missing, ask the user for it before creating the order.

Keep responses concise and conversational.
`;


// ==================================================
// PRODUCT CONTEXT
// ==================================================

const buildProductContext = (products) => {

  if (!Array.isArray(products)) {
    return [];
  }

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    merchant: product.merchant?.name || null,
  }));
};


// ==================================================
// EXTRACT TOOL CALL
// ==================================================

const extractToolCall = (
  provider,
  response
) => {

  // ----------------------------------------------
  // Gemini
  // ----------------------------------------------

  if (provider === "gemini") {

    const functionCalls =
      response.functionCalls;

    if (
      !functionCalls ||
      functionCalls.length === 0
    ) {
      return null;
    }

    const call =
      functionCalls[0];

    return {
      name: call.name,

      args:
        call.args || {},
    };
  }


  // ----------------------------------------------
  // OpenAI
  // ----------------------------------------------

  if (provider === "openai") {

    const toolCalls =
      response
        .choices?.[0]
        ?.message
        ?.tool_calls;

    if (
      !toolCalls ||
      toolCalls.length === 0
    ) {
      return null;
    }

    const call =
      toolCalls[0];

    let args = {};

    try {

      args = JSON.parse(
        call.function.arguments || "{}"
      );

    } catch (error) {

      console.error(
        "Failed to parse OpenAI tool arguments:",
        error.message
      );

    }

    return {
      name:
        call.function.name,

      args,

      id:
        call.id,
    };
  }

  return null;
};


// ==================================================
// EXTRACT TEXT
// ==================================================

const extractText = (
  provider,
  response
) => {

  if (provider === "gemini") {

    return response.text || null;
  }


  if (provider === "openai") {

    return (
      response
        .choices?.[0]
        ?.message
        ?.content || null
    );
  }


  return null;
};


// ==================================================
// EXECUTE TOOL
// ==================================================

const executeTool = async (
  toolName,
  args,
  userId
) => {
  console.log(`🔧 Executing tool: ${toolName}`);

  switch (toolName) {
    case "searchProducts":
      return await searchProducts(args || {});

    case "getProduct":
      return await getProduct(args || {});

    case "getRelatedProducts":
      return await getRelatedProducts(args || {});

    case "createOrder":
      return await createOrder({
        ...(args || {}),
        userId,
      });

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
};


// ==================================================
// MAIN AGENT
// ==================================================

export const runAgent = async (
  message,
  history = [],
  productContext = [],
  userId
) => {

  try {

    // ==============================================
    // PREVIOUS PRODUCT CONTEXT
    // ==============================================

    let latestProducts = [
      ...productContext,
    ];


    // ==============================================
    // PRODUCT CONTEXT INSTRUCTION
    // ==============================================

    const productContextInstruction =
      latestProducts.length > 0
        ? `

PREVIOUSLY SHOWN PRODUCTS:

The following products were recently shown to
the user:

${latestProducts
  .map(
    (product, index) =>
      `${index + 1}. ${product.name} (ID: ${product.id})`
  )
  .join("\n")}


If the user refers to:

- "that one"
- "this one"
- "the first one"
- "the second one"
- "the previous one"
- "the Puma one"
- "the other one"

use the product context to determine which
product they are referring to.

Never invent a product ID.
`
        : "";


    const fullSystemInstruction = `
${systemInstruction}

${productContextInstruction}
`;


    // ==============================================
    // GEMINI CONVERSATION
    // ==============================================

    let geminiConversation = [

      ...history.map((item) => ({

        role:
          item.role === "assistant"
            ? "model"
            : "user",

        parts: [
          {
            text:
              item.content,
          },
        ],

      })),

      {
        role: "user",

        parts: [
          {
            text:
              message,
          },
        ],
      },

    ];


    // ==============================================
    // OPENAI CONVERSATION
    // ==============================================

    let openAIConversation = [

      ...history.map((item) => ({

        role:
          item.role === "assistant"
            ? "assistant"
            : "user",

        content:
          item.content,

      })),

      {
        role: "user",

        content:
          message,
      },

    ];


    // ==============================================
    // AGENT LOOP
    // ==============================================

    for (
      let iteration = 0;
      iteration < 3;
      iteration++
    ) {

      console.log(
        `🔄 Agent iteration ${iteration + 1}`
      );


      // ============================================
      // ASK LLM
      // ============================================

      const result =
        await generateWithFallback({

          // ----------------------------------------
          // Gemini
          // ----------------------------------------

          geminiRequest: {

            contents:
              geminiConversation,

            config: {

              tools:
                geminiTools,

              systemInstruction:
                fullSystemInstruction,
            },

          },


          // ----------------------------------------
          // OpenAI
          // ----------------------------------------

          openAIRequest: {

            messages: [

              {
                role: "system",

                content:
                  fullSystemInstruction,
              },

              ...openAIConversation,

            ],

            tools:
              openAITools,
          },

        });


      console.log(
        `🤖 AI provider used: ${result.provider}`
      );


      const response =
        result.response;


      // ============================================
      // CHECK TOOL CALL
      // ============================================

      const functionCall =
        extractToolCall(
          result.provider,
          response
        );


      // ============================================
      // FINAL RESPONSE
      // ============================================

      if (!functionCall) {

        const text =
          extractText(
            result.provider,
            response
          );


        if (text) {

          return {
            response: text,

            productContext:
              latestProducts,
          };
        }


        console.warn(
          "⚠️ AI returned neither text nor a tool call."
        );

        return {
          response:
            "I couldn't generate a response right now.",

          productContext:
            latestProducts,
        };
      }


      // ============================================
      // EXECUTE TOOL
      // ============================================

      const toolResult =
        await executeTool(
          functionCall.name,
          functionCall.args,
          userId
        );


      console.log(
        `✅ Tool completed: ${functionCall.name}`
      );


      // ============================================
      // UPDATE PRODUCT CONTEXT
      // ============================================

      if (
        functionCall.name ===
          "searchProducts" ||
        functionCall.name ===
          "getRelatedProducts"
      ) {

        const newContext =
          buildProductContext(
            toolResult
          );


        if (newContext.length > 0) {

          latestProducts =
            newContext;
        }
      }


      // ============================================
      // GEMINI TOOL HISTORY
      // ============================================

      geminiConversation.push({

        role: "model",

        parts: [
          {
            functionCall: {

              name:
                functionCall.name,

              args:
                functionCall.args,
            },
          },
        ],
      });


      geminiConversation.push({

        role: "user",

        parts: [
          {
            functionResponse: {

              name:
                functionCall.name,

              response: {

                products:
                  toolResult,
              },
            },
          },
        ],
      });


      // ============================================
      // OPENAI TOOL HISTORY
      // ============================================

      const toolCallId =
        functionCall.id ||
        `shiru-tool-${iteration}`;


      openAIConversation.push({

        role: "assistant",

        content: null,

        tool_calls: [

          {
            id:
              toolCallId,

            type: "function",

            function: {

              name:
                functionCall.name,

              arguments:
                JSON.stringify(
                  functionCall.args
                ),
            },
          },

        ],
      });


      openAIConversation.push({

        role: "tool",

        tool_call_id:
          toolCallId,

        content:
          JSON.stringify(
            toolResult
          ),
      });

    }


    // ==============================================
    // MAX ITERATIONS
    // ==============================================

    return {
      response:
        "I couldn't complete the shopping request. Please try again.",

      productContext:
        latestProducts,
    };


  } catch (error) {

    console.error(
      "Agent error:",
      error
    );


    // ==============================================
    // DETERMINISTIC FALLBACK
    // ==============================================

    try {

      console.log(
        "🛟 Using deterministic catalog fallback..."
      );


      const products =
        await catalogFallback(
          message
        );


      return {

        response:
          formatCatalogFallback(
            products
          ),

        productContext:
          buildProductContext(
            products
          ),
      };


    } catch (fallbackError) {

      console.error(
        "❌ Catalog fallback failed:",
        fallbackError
      );


      return {

        response:
          "I'm having trouble processing your request right now. Please try again.",

        productContext:
          productContext,
      };
    }
  }
};