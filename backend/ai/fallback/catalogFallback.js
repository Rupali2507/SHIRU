import Product from "../../models/Product.js";

export const catalogFallback = async (message) => {
  try {
    const text = message.toLowerCase();

    const filter = {
      status: "ACTIVE",
      aiEnabled: true,
      stock: { $gt: 0 },
    };

    // -----------------------------------------
    // Extract budget
    // -----------------------------------------
    let maxPrice = null;
    const priceMatch = text.match(
      /(?:under|below|less than|max|maximum)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i
    );

    if (priceMatch) {
       maxPrice = Number(
        priceMatch[1].replace(/,/g, "")
      );

      filter.price = {
        $lte: maxPrice,
      };
    }


    // -----------------------------------------
    // Extract common colors
    // -----------------------------------------

    const colors = [
      "black",
      "white",
      "red",
      "blue",
      "green",
      "yellow",
      "pink",
      "grey",
      "gray",
      "brown",
    ];

    const detectedColor = colors.find(
      (color) => text.includes(color)
    );

    if (detectedColor) {
      filter.colors = {
        $regex: detectedColor,
        $options: "i",
      };
    }


    // -----------------------------------------
    // Extract common categories
    // -----------------------------------------

    const categories = [
      "running shoes",
      "sneakers",
      "shoes",
      "sandals",
      "shirts",
      "t-shirts",
      "jeans",
      "jackets",
      "bags",
      "watches",
      "headphones",
      "laptops",
      "phones",
    ];

    const detectedCategory =
      categories.find(
        (category) =>
          text.includes(category)
      );

    if (detectedCategory) {
      filter.category = {
        $regex: detectedCategory,
        $options: "i",
      };
    }


    // -----------------------------------------
    // Search database
    // -----------------------------------------

    let products =
      await Product.find(filter)
        .populate(
          "merchant",
          "storeName description"
        )
        .limit(10)
        .lean();
    if (maxPrice !== null) {
  products = products.filter(
    (product) =>
      Number(product.price) <= maxPrice
  );
}

    // -----------------------------------------
    // Format response
    // -----------------------------------------

    return products.map((product) => ({
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

      merchant:
        product.merchant
          ? {
              id:
                product.merchant._id.toString(),

              name:
                product.merchant.storeName,
            }
          : null,

      image:
        product.images?.[0] || null,
    }));

  } catch (error) {

    console.error(
      "Catalog fallback error:",
      error
    );

    return [];
  }
};