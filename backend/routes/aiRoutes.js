import express from "express";
import { chatWithAI } from "../controller/aiController.js";
import { authenticate } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post(
  "/chat",
  authenticate,
  chatWithAI
);

export default router;