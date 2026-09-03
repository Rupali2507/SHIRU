import express from "express";

import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getMerchantOrders,
  updateOrderStatus,
} from "../controller/orderController.js";

import {
  authenticate,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================================
// USER ROUTES
// ======================================

// Create order
router.post(
  "/",
  authenticate,
  createOrder
);

// Get my orders
router.get(
  "/my-orders",
  authenticate,
  getMyOrders
);

// Get single order
router.get(
  "/:id",
  authenticate,
  getOrderById
);

// Verify Razorpay payment
router.post(
  "/verify-payment",
  authenticate,
  verifyPayment
);


// ======================================
// MERCHANT ROUTES
// ======================================

// Get merchant orders
router.get(
  "/merchant",
  authenticate,
  authorize("MERCHANT"),
  getMerchantOrders
);

// Update order status
router.patch(
  "/:id/status",
  authenticate,
  authorize("MERCHANT"),
  updateOrderStatus
);


export default router;