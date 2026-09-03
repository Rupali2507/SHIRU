import express from "express";

import {
  createMerchant,
  getMerchantProfile,
} from "../controller/merchantController.js";

import {
  authenticate,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();




router.post(
  "/",
  authenticate,
  authorize("MERCHANT"),
  createMerchant
);



router.get(
  "/me",
  authenticate,
  authorize("MERCHANT"),
  getMerchantProfile
);


export default router;