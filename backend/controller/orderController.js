import Order from "../models/Order.js";

import Merchant from "../models/Merchant.js";

import crypto from "crypto";
import {
  createOrderService,
} from "../services/orderService.js";




// ======================================
// CREATE ORDER
// ======================================
// ======================================
// CREATE ORDER
// ======================================

export const createOrder = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.userId;

    const {
      items,
      shippingAddress,
    } = req.body;

    const result =
      await createOrderService({
        userId,
        items,
        shippingAddress,
      });

    return res.status(201).json({
      success: true,
      message:
        "Order created successfully",
      ...result,
    });

  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to create order",
    });
  }
};
// ======================================
// VERIFY RAZORPAY PAYMENT
// ======================================

export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // -----------------------------------
    // Validate input
    // -----------------------------------

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    // -----------------------------------
    // Find SHIRU order
    // -----------------------------------

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // -----------------------------------
    // Prevent duplicate verification
    // -----------------------------------

    if (order.status === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    // -----------------------------------
    // Verify Razorpay signature
    // -----------------------------------

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const isValidSignature =
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // -----------------------------------
    // Fetch payment from Razorpay
    // -----------------------------------

    const payment =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    // -----------------------------------
    // Verify payment belongs to our order
    // -----------------------------------

    if (
      payment.order_id !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment does not belong to this order",
      });
    }

    // -----------------------------------
    // Verify amount
    // -----------------------------------

    const expectedAmount =
      Math.round(order.totalAmount * 100);

    if (payment.amount !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match order amount",
      });
    }

    // -----------------------------------
    // Verify currency
    // -----------------------------------

    if (payment.currency !== order.currency) {
      return res.status(400).json({
        success: false,
        message: "Payment currency does not match order",
      });
    }

    // -----------------------------------
    // Verify payment status
    // -----------------------------------

    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Payment is not captured. Current status: ${payment.status}`,
      });
    }

    // -----------------------------------
    // Reduce inventory atomically
    // -----------------------------------

    for (const item of order.items) {

      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {

        console.error(
          `Insufficient stock for product ${item.product}`
        );

        return res.status(409).json({
          success: false,
          message:
            `Insufficient stock for ${item.name}. Payment may require refund.`,
        });
      }
    }

    // -----------------------------------
    // Mark order as PAID
    // -----------------------------------

    order.razorpayPaymentId =
      razorpay_payment_id;

    order.status = "PAID";

    await order.save();

    // -----------------------------------
    // Success
    // -----------------------------------

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",

      order: {
        id: order._id,
        status: order.status,
        amount: order.totalAmount,
        currency: order.currency,
        razorpayOrderId:
          order.razorpayOrderId,
        razorpayPaymentId:
          order.razorpayPaymentId,
      },
    });

  } catch (error) {

    console.error(
      "Payment verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// ======================================
// GET MY ORDERS
// ======================================

export const getMyOrders = async (req, res) => {
  try {

    const userId = req.user.userId;

    const orders = await Order.find({
      user: userId,
    })
      .populate(
        "merchant",
        "storeName description logo"
      )
      .populate(
        "items.product",
        "name brand images"
      )
      .sort({
        createdAt: -1,
      });


    return res.status(200).json({

      success: true,

      count: orders.length,

      orders,

    });

  } catch (error) {

    console.error(
      "Get my orders error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Unable to fetch orders",

    });

  }
};

// ======================================
// GET ORDER BY ID
// ======================================

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: userId,
    })
      .populate(
        "merchant",
        "storeName description logo website"
      )
      .populate(
        "items.product",
        "name brand images category"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order",
    });
  }
};
// ======================================
// GET MERCHANT ORDERS
// ======================================

export const getMerchantOrders = async (req, res) => {
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

    // Find orders belonging to this merchant
    const orders = await Order.find({
      merchant: merchant._id,
    })
      .populate(
        "user",
        "name email"
      )
      .populate(
        "items.product",
        "name brand images category"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error(
      "Get merchant orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch merchant orders",
    });
  }
};
// ======================================
// UPDATE ORDER STATUS
// ======================================

export const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { status } = req.body;


    // -----------------------------------
    // Validate status
    // -----------------------------------

    const allowedStatuses = [
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }


    // -----------------------------------
    // Find merchant
    // -----------------------------------

    const merchant = await Merchant.findOne({
      owner: userId,
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant profile not found",
      });
    }


    // -----------------------------------
    // Find order belonging to merchant
    // -----------------------------------

    const order = await Order.findOne({
      _id: id,
      merchant: merchant._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    // -----------------------------------
    // Validate status transition
    // -----------------------------------

    const validTransitions = {
      PAID: ["PROCESSING", "CANCELLED"],

      PROCESSING: ["SHIPPED", "CANCELLED"],

      SHIPPED: ["DELIVERED"],

      DELIVERED: [],

      CANCELLED: [],
    };


    const allowedNextStatuses =
      validTransitions[order.status] || [];


    if (
      !allowedNextStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot change order from ${order.status} to ${status}`,
      });
    }


    // -----------------------------------
    // Update
    // -----------------------------------

    order.status = status;

    await order.save();


    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",

      order: {
        id: order._id,
        status: order.status,
        totalAmount: order.totalAmount,
        updatedAt: order.updatedAt,
      },
    });

  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update order status",
    });
  }
};