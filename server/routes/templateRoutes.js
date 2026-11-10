import express from "express";
import ResumeTemplate from "../models/ResumeTemplate.js";
import { builtinTemplates } from "../configs/builtinTemplates.js";

const templateRouter = express.Router();

templateRouter.get("/", async (_req, res) => {
  try {
    const records = await ResumeTemplate.find({ status: "published" }).lean();
    const byId = new Map(records.map((item) => [item.templateId, item]));
    const rendererTemplates = builtinTemplates.map((item) => ({ ...item, ...(byId.get(item.templateId) || {}), isBuiltin: true }));
    rendererTemplates.push(...records.filter((item) => !item.isBuiltin));
    const templates = rendererTemplates.filter((item) => item.status === "published");
    return res.json({ templates, rendererTemplates });
  } catch (error) {
    console.error("Template catalog read failed", { name: error?.name, code: error?.code });
    return res.status(503).json({ message: "Template catalog is temporarily unavailable" });
  }
});

export default templateRouter;
