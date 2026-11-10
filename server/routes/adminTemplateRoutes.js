import express from "express";
import mongoose from "mongoose";
import ResumeTemplate from "../models/ResumeTemplate.js";
import Resume from "../models/Resume.js";
import AdminActivity from "../models/AdminActivity.js";
import { adminProtect } from "../middlewares/authMiddleware.js";
import { allowedBaseTemplates, allowedTemplateFonts, builtinTemplates } from "../configs/builtinTemplates.js";

const router = express.Router();
router.use(adminProtect);
const allowedStatuses = new Set(["draft", "published", "unpublished"]);
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52);

const validateTemplate = (body = {}, current = {}) => {
  const name = typeof body.name === "string" ? body.name.trim() : current.name;
  const description = typeof body.description === "string" ? body.description.trim() : current.description || "";
  const category = typeof body.category === "string" ? body.category.trim() : current.category;
  const previewImage = body.previewImage === undefined ? current.previewImage || "" : String(body.previewImage).trim();
  const layoutInput = body.layout && typeof body.layout === "object" ? body.layout : current.layout || {};
  const baseTemplate = layoutInput.baseTemplate || current.layout?.baseTemplate;
  const accentColor = layoutInput.accentColor || current.layout?.accentColor || "#2563EB";
  const fontFamily = layoutInput.fontFamily || current.layout?.fontFamily || "Arial";
  const status = body.status || current.status || "draft";

  if (!name || name.length > 80) return { error: "Template name is required and must be 80 characters or fewer" };
  if (!category || category.length > 40) return { error: "Choose a category (40 characters or fewer)" };
  if (description.length > 500) return { error: "Description must be 500 characters or fewer" };
  if (!allowedBaseTemplates.has(baseTemplate)) return { error: "Choose a supported built-in layout" };
  if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(accentColor)) return { error: "Accent color must be a valid hex color" };
  if (!allowedTemplateFonts.has(fontFamily)) return { error: "Choose a supported font" };
  if (previewImage) {
    try {
      if (new URL(previewImage).protocol !== "https:") return { error: "Preview image URL must use HTTPS" };
    } catch {
      return { error: "Preview image must be an HTTPS URL" };
    }
  }
  if (!allowedStatuses.has(status)) return { error: "Invalid template status" };
  return { value: { name, description, category, previewImage, status, layout: { baseTemplate, accentColor, fontFamily } } };
};

const writeAudit = (req, action, template) => AdminActivity.create({
  actorId: req.userId,
  actorName: req.user?.name || "Administrator",
  action,
  targetType: "template",
  targetId: template.templateId,
  targetLabel: template.name,
  result: "success",
});

router.get("/", async (_req, res) => {
  try {
    const records = await ResumeTemplate.find({}).lean();
    const byId = new Map(records.map((item) => [item.templateId, item]));
    const templates = builtinTemplates.map((item) => ({ ...item, ...(byId.get(item.templateId) || {}), isBuiltin: true }));
    templates.push(...records.filter((item) => !item.isBuiltin));
    return res.json({ templates });
  } catch (error) {
    console.error("Admin template list failed", { name: error?.name, code: error?.code });
    return res.status(500).json({ message: "Failed to load templates" });
  }
});

router.get("/:templateId", async (req, res) => {
  const { templateId } = req.params;
  const stored = await ResumeTemplate.findOne({ templateId }).lean();
  const builtin = builtinTemplates.find((item) => item.templateId === templateId);
  const template = builtin ? { ...builtin, ...(stored || {}), isBuiltin: true } : stored;
  if (!template) return res.status(404).json({ message: "Template not found" });
  return res.json({ template });
});

router.post("/", async (req, res) => {
  const validated = validateTemplate(req.body);
  if (validated.error) return res.status(400).json({ message: validated.error });
  try {
    const base = slugify(validated.value.name) || "template";
    const template = await ResumeTemplate.create({
      ...validated.value,
      templateId: `custom-${base}-${new mongoose.Types.ObjectId().toString().slice(-6)}`,
      isBuiltin: false,
      createdBy: req.userId,
      updatedBy: req.userId,
    });
    await writeAudit(req, "template.created", template);
    return res.status(201).json({ template });
  } catch (error) {
    console.error("Template create failed", { name: error?.name, code: error?.code });
    return res.status(500).json({ message: "Failed to create template" });
  }
});

const updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const isBuiltin = allowedBaseTemplates.has(templateId);
    let template = await ResumeTemplate.findOne({ templateId });
    if (!template && isBuiltin) {
      const defaults = builtinTemplates.find((item) => item.templateId === templateId);
      template = new ResumeTemplate(defaults);
    }
    if (!template) return res.status(404).json({ message: "Template not found" });

    const validated = validateTemplate(req.body, template.toObject());
    if (validated.error) return res.status(400).json({ message: validated.error });
    if (template.status === "published" && validated.value.status !== "published") {
      const records = await ResumeTemplate.find({}).select("templateId status isBuiltin").lean();
      const recordById = new Map(records.map((item) => [item.templateId, item]));
      const publishedBuiltins = builtinTemplates.filter((item) => (recordById.get(item.templateId)?.status || item.status) === "published").length;
      const publishedCustom = records.filter((item) => !item.isBuiltin && item.status === "published").length;
      if (publishedBuiltins + publishedCustom <= 1) return res.status(409).json({ message: "At least one published template must remain available" });
    }
    if (isBuiltin) validated.value.layout.baseTemplate = templateId;
    Object.assign(template, validated.value, { isBuiltin, updatedBy: req.userId });
    await template.save();
    await writeAudit(req, req.body.status && req.body.status !== "draft" ? `template.${req.body.status}` : "template.updated", template);
    return res.json({ template });
  } catch (error) {
    console.error("Template update failed", { name: error?.name, code: error?.code });
    return res.status(500).json({ message: "Failed to update template" });
  }
};
router.patch("/:templateId", updateTemplate);
router.patch("/:templateId/status", async (req, res) => {
  req.body = { status: req.body?.status };
  return updateTemplate(req, res);
});

router.delete("/:templateId", async (req, res) => {
  const { templateId } = req.params;
  if (allowedBaseTemplates.has(templateId)) return res.status(409).json({ message: "Built-in templates cannot be deleted; unpublish them instead" });
  try {
    const template = await ResumeTemplate.findOne({ templateId, isBuiltin: false });
    if (!template) return res.status(404).json({ message: "Template not found" });
    const inUse = await Resume.countDocuments({ template: templateId });
    if (inUse > 0) return res.status(409).json({ message: `This template is used by ${inUse} saved resume(s). Unpublish it instead of deleting it.` });
    await ResumeTemplate.deleteOne({ _id: template._id });
    await writeAudit(req, "template.deleted", template);
    return res.json({ message: "Template deleted" });
  } catch (error) {
    console.error("Template delete failed", { name: error?.name, code: error?.code });
    return res.status(500).json({ message: "Failed to delete template" });
  }
});

export default router;
