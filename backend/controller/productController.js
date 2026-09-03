import Product from "../models/Product.js";
import Merchant from "../models/Merchant.js";




export const createProduct = async (req, res) => {
  try {

    const userId = req.user.userId;

    const {
      name,
      description,
      category,
      brand,
      price,
      currency,
      sku,
      stock,
      sizes,
      colors,
      images,
      aiMetadata,
    } = req.body;



    if (
      !name ||
      !description ||
      !category ||
      price === undefined ||
      !sku
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, category, price and SKU are required",
      });
    }


   

    const merchant = await Merchant.findOne({
      owner: userId,
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant store not found",
      });
    }


  

    const existingProduct = await Product.findOne({
      sku,
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }



    const product = await Product.create({

      merchant: merchant._id,

      name,
      description,
      category,
      brand,

      price,
      currency: currency || merchant.currency,

      sku,
      stock: stock ?? 0,

      sizes: sizes || [],
      colors: colors || [],
      images: images || [],

      aiMetadata: aiMetadata || {},

      aiEnabled: true,
      status: "ACTIVE",
    });


    return res.status(201).json({

      success: true,

      message: "Product created successfully",

      product,
    });

  } catch (error) {

    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "ACTIVE",
      aiEnabled: true,
      stock: { $gt: 0 },
    })
      .populate("merchant", "storeName description")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================
// GET PRODUCT BY ID
// ======================================

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      status: "ACTIVE",
      aiEnabled: true,
    }).populate(
      "merchant",
      "storeName description"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================
// SEARCH PRODUCTS
// ======================================

export const searchProducts = async (req, res) => {
  try {

    const {
      query,
      category,
      brand,
      color,
      minPrice,
      maxPrice,
    } = req.query;


    // -------------------------
    // Build MongoDB filter
    // -------------------------

    const filter = {
      status: "ACTIVE",
      aiEnabled: true,
      stock: { $gt: 0 },
    };


    // -------------------------
    // Category
    // -------------------------

    if (category) {
      filter.category = {
        $regex: category,
        $options: "i",
      };
    }


    // -------------------------
    // Brand
    // -------------------------

    if (brand) {
      filter.brand = {
        $regex: brand,
        $options: "i",
      };
    }


    // -------------------------
    // Color
    // -------------------------

    if (color) {
      filter.colors = {
        $regex: color,
        $options: "i",
      };
    }


    // -------------------------
    // Price range
    // -------------------------

    if (minPrice || maxPrice) {

      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }


    // -------------------------
    // Text search
    // -------------------------

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


    // -------------------------
    // Search database
    // -------------------------

    const products = await Product.find(filter)
      .populate(
        "merchant",
        "storeName description"
      )
      .limit(50);


    return res.status(200).json({

      success: true,

      count: products.length,

      query: {
        query,
        category,
        brand,
        color,
        minPrice,
        maxPrice,
      },

      products,

    });

  } catch (error) {

    console.error("Search products error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// ======================================
// GET MERCHANT PRODUCTS
// ======================================

export const getMerchantProducts = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find merchant owned by logged-in user
    const merchant = await Merchant.findOne({
      owner: userId,
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant profile not found",
      });
    }

    const products = await Product.find({
      merchant: merchant._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    console.error(
      "Get merchant products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch merchant products",
    });
  }
};
// ======================================
// UPDATE MERCHANT PRODUCT
// ======================================

export const updateProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const merchant = await Merchant.findOne({
      owner: userId,
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant profile not found",
      });
    }

    const product = await Product.findOne({
      _id: id,
      merchant: merchant._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "category",
      "brand",
      "price",
      "currency",
      "stock",
      "sizes",
      "colors",
      "images",
      "aiMetadata",
      "aiEnabled",
      "status",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update product",
    });
  }
};

// ======================================
// DELETE MERCHANT PRODUCT
// ======================================

export const deleteProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const merchant = await Merchant.findOne({
      owner: userId,
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant profile not found",
      });
    }

    const product = await Product.findOne({
      _id: id,
      merchant: merchant._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.status = "INACTIVE";
    product.aiEnabled = false;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product removed successfully",
    });

  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete product",
    });
  }
};