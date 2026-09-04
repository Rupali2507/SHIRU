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


// ========================================
// USER ROUTES
// ========================================

router.post(
  "/",
  authenticate,
  createOrder
);

router.get(
  "/my-orders",
  authenticate,
  getMyOrders
);

router.post(
  "/verify-payment",
  authenticate,
  verifyPayment
);


// ========================================
// MERCHANT ROUTES
// ========================================

router.get(
  "/merchant",
  authenticate,
  authorize("MERCHANT"),
  getMerchantOrders
);

router.patch(
  "/merchant/:id/status",
  authenticate,
  authorize("MERCHANT"),
  updateOrderStatus
);


// ========================================
// ORDER BY ID
// ========================================

// IMPORTANT: Keep this AFTER /merchant routes
router.get(
  "/:id",
  authenticate,
  getOrderById
);


export default router;