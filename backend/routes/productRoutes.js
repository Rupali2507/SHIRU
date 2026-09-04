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

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/search", searchProducts);

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
  upload.array("images", 5),
  createProduct
);

router.put(
  "/:id",
  authenticate,
  authorize("MERCHANT"),
  upload.array("images", 5),
  updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize("MERCHANT"),
  deleteProduct
);

router.get("/:id", getProductById);

export default router;