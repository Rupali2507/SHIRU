import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Merchant from "../models/Merchant.js";
import razorpay from "../config/razorpay.js";

export const createAIOrder = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      productId,
      quantity = 1,
      selectedSize,
      selectedColor,
      shippingAddress,
    } = req.body;

    // -----------------------------
    // Validate input
    // -----------------------------

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    // -----------------------------
    // Find product
    // -----------------------------

    const product = await Product.findOne({
      _id: productId,
      status: "ACTIVE",
      aiEnabled: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -----------------------------
    // Check stock
    // -----------------------------

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // -----------------------------
    // Validate size
    // -----------------------------

    if (
      selectedSize &&
      product.sizes.length > 0 &&
      !product.sizes.includes(selectedSize)
    ) {
      return res.status(400).json({
        success: false,
        message: `${product.name} does not have size ${selectedSize}`,
      });
    }

    // -----------------------------
    // Validate color
    // -----------------------------

    if (
      selectedColor &&
      product.colors.length > 0 &&
      !product.colors.includes(selectedColor)
    ) {
      return res.status(400).json({
        success: false,
        message: `${product.name} does not have color ${selectedColor}`,
      });
    }

    // -----------------------------
    // Find merchant
    // -----------------------------

    const merchant = await Merchant.findById(
      product.merchant
    );

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    // -----------------------------
    // Calculate amount
    // -----------------------------

    const subtotal =
      product.price * quantity;

    // -----------------------------
    // Create Razorpay order
    // -----------------------------

    const razorpayOrder =
      await razorpay.orders.create({
        amount: Math.round(subtotal * 100),
        currency: "INR",
        receipt: `shiru_ai_${Date.now()}`,
        notes: {
          userId: userId.toString(),
          merchantId: merchant._id.toString(),
          source: "SHIRU_AI",
        },
      });

    // -----------------------------
    // Create SHIRU order
    // -----------------------------

    const order = await Order.create({
      user: userId,

      merchant: merchant._id,

      items: [
        {
          product: product._id,
          name: product.name,
          sku: product.sku,
          quantity,
          price: product.price,
          selectedSize:
            selectedSize || null,
          selectedColor:
            selectedColor || null,
        },
      ],

      subtotal,

      totalAmount: subtotal,

      currency: "INR",

      status: "PAYMENT_PENDING",

      razorpayOrderId:
        razorpayOrder.id,

      shippingAddress:
        shippingAddress || {},
    });

    return res.status(201).json({
      success: true,

      order: {
        id: order._id,
        product: product.name,
        amount: order.totalAmount,
        currency: order.currency,
        status: order.status,
        razorpayOrderId:
          order.razorpayOrderId,
      },

      razorpay: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId:
          process.env.RAZORPAY_KEY_ID,
      },

      confirmation: {
        required: true,
        message:
          `You are about to purchase ${product.name} for ₹${subtotal}.`,
      },
    });
  } catch (error) {
    console.error(
      "AI order creation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create AI order",
    });
  }
};