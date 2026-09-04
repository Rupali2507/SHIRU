export const toolDefinitions = {
  searchProducts: {
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

  getRelatedProducts: {
    name: "getRelatedProducts",

    description:
      "Find products related to a product the user is interested in for upselling and cross-selling.",

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

      required: ["productId"],
    },
  },
};