import Product from "../../models/Product.js";
import mongoose from "mongoose";

export const getProduct = async ({ productId }) => {
  try {
    // -----------------------------------------
    // Validate product ID
    // -----------------------------------------

    if (!productId) {
      throw new Error("Product ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID");
    }


    // -----------------------------------------
    // Find product
    // -----------------------------------------

    const product = await Product.findOne({
      _id: productId,
      status: "ACTIVE",
      aiEnabled: true,
    })
      .populate(
        "merchant",
        "storeName description"
      )
      .lean();


    if (!product) {
      throw new Error("Product not found");
    }


    // -----------------------------------------
    // Return AI-safe product data
    // -----------------------------------------

    return {
      id: product._id.toString(),

      name: product.name,

      description:
        product.description,

      category:
        product.category,

      brand:
        product.brand,

      price:
        product.price,

      currency:
        product.currency,

      stock:
        product.stock,

      sizes:
        product.sizes,

      colors:
        product.colors,

      features:
        product.aiMetadata?.features || [],

      useCases:
        product.aiMetadata?.useCases || [],

      tags:
        product.aiMetadata?.tags || [],

      merchant:
        product.merchant
          ? {
              id:
                product.merchant._id.toString(),

              name:
                product.merchant.storeName,

              description:
                product.merchant.description,
            }
          : null,

      image:
        product.images?.[0] || null,
    };

  } catch (error) {

    console.error(
      "AI get product error:",
      error
    );

    throw new Error(
      "Unable to get product"
    );
  }
};

export const searchProducts = async ({
  query,
  category,
  brand,
  color,
  minPrice,
  maxPrice,
}) => {
  try {
    // Base filter:
    // Only products that SHIRU is allowed to sell.
    const filter = {
      status: "ACTIVE",
      aiEnabled: true,
      stock: { $gt: 0 },
    };

    // Category
    if (category) {
      filter.category = {
        $regex: category,
        $options: "i",
      };
    }

    // Brand
    if (brand) {
      filter.brand = {
        $regex: brand,
        $options: "i",
      };
    }

    // Color
    if (color) {
      filter.colors = {
        $regex: color,
        $options: "i",
      };
    }

    // Price
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Natural-language search
    if (query) {
      filter.$or = [
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },
        {
          description: {
            $regex: query,
            $options: "i",
          },
        },
        {
          "aiMetadata.searchText": {
            $regex: query,
            $options: "i",
          },
        },
        {
          "aiMetadata.tags": {
            $regex: query,
            $options: "i",
          },
        },
        {
          "aiMetadata.useCases": {
            $regex: query,
            $options: "i",
          },
        },
      ];
    }

    const products = await Product.find(filter)
      .populate("merchant", "storeName description")
      .limit(20)
      .lean();

    // Return only information the AI needs.
    return products.map((product) => ({
      id: product._id.toString(),

      name: product.name,
      description: product.description,

      category: product.category,
      brand: product.brand,

      price: product.price,
      currency: product.currency,

      stock: product.stock,

      sizes: product.sizes,
      colors: product.colors,

      features: product.aiMetadata?.features || [],
      useCases: product.aiMetadata?.useCases || [],
      tags: product.aiMetadata?.tags || [],

      merchant: product.merchant
        ? {
            id: product.merchant._id.toString(),
            name: product.merchant.storeName,
            description: product.merchant.description,
          }
        : null,

      image: product.images?.[0] || null,
    }));
  } catch (error) {
    console.error("AI product search error:", error);
    throw new Error("Unable to search products");
  }
};