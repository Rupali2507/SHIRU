import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  searchProducts,
  getMerchantProducts,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";

import {
  authenticate,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================================
// PUBLIC PRODUCT APIs
// ======================================

router.get(
  "/",
  getProducts
);

router.get(
  "/search",
  searchProducts
);


// ======================================
// MERCHANT PRODUCT APIs
// ======================================

router.get(
  "/merchant",
  authenticate,
  authorize("MERCHANT"),
  getMerchantProducts
);

router.post(
  "/",
  authenticate,
  authorize("MERCHANT"),
  createProduct
);

router.put(
  "/:id",
  authenticate,
  authorize("MERCHANT"),
  updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize("MERCHANT"),
  deleteProduct
);


// ======================================
// GET SINGLE PRODUCT
// ======================================

router.get(
  "/:id",
  getProductById
);


export default router;