import Product from "../../models/Product.js";

export const getRelatedProducts = async ({
  productId,
  maxPrice,
}) => {
  try {
    // Find the product the user is interested in
    const product = await Product.findOne({
      _id: productId,
      status: "ACTIVE",
      aiEnabled: true,
    }).lean();

    if (!product) {
      throw new Error("Product not found");
    }

    /*
      Find products that are related by:
      - same category
      - same use case
      - same tags
      - same brand
    */

    const orConditions = [
      {
        category: product.category,
      },
    ];

    if (product.brand) {
      orConditions.push({
        brand: product.brand,
      });
    }

    if (product.aiMetadata?.useCases?.length) {
      orConditions.push({
        "aiMetadata.useCases": {
          $in: product.aiMetadata.useCases,
        },
      });
    }

    if (product.aiMetadata?.tags?.length) {
      orConditions.push({
        "aiMetadata.tags": {
          $in: product.aiMetadata.tags,
        },
      });
    }

    const filter = {
      _id: { $ne: product._id },
      status: "ACTIVE",
      aiEnabled: true,
      stock: { $gt: 0 },
      $or: orConditions,
    };

    // Respect user's budget if provided
    if (maxPrice !== undefined) {
      filter.price = {
        $lte: Number(maxPrice),
      };
    }

    const relatedProducts = await Product.find(filter)
      .populate("merchant", "storeName description")
      .limit(10)
      .lean();

    return relatedProducts.map((item) => ({
      id: item._id.toString(),

      name: item.name,
      description: item.description,

      category: item.category,
      brand: item.brand,

      price: item.price,
      currency: item.currency,

      stock: item.stock,

      sizes: item.sizes,
      colors: item.colors,

      features: item.aiMetadata?.features || [],
      useCases: item.aiMetadata?.useCases || [],
      tags: item.aiMetadata?.tags || [],

      merchant: item.merchant
        ? {
            id: item.merchant._id.toString(),
            name: item.merchant.storeName,
          }
        : null,

      image: item.images?.[0] || null,
    }));
  } catch (error) {
    console.error("Related products error:", error);
    throw new Error("Unable to find related products");
  }
};