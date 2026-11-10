import express from "express";
import protect, { adminProtect } from "../middlewares/authMiddleware.js";
import {
  enhanceJobDescription,
  enhanceProfessionalSummary,
  uploadResume,
  chatSupport,
  aiStatus,
  generateInterviewPrep,
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/enhance-pro-sum", protect, enhanceProfessionalSummary);
aiRouter.post("/enhance-job-desc", protect, enhanceJobDescription);
aiRouter.post("/upload-resume", protect, uploadResume);
aiRouter.post("/interview-prep", protect, generateInterviewPrep);
aiRouter.post("/chat", protect, chatSupport);

// Real provider ping, restricted to admins; never expose configuration secrets.
aiRouter.get("/status", adminProtect, aiStatus);

export default aiRouter;
