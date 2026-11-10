import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import ResumeTemplate from "../models/ResumeTemplate.js";
import fs from "fs";
import { sanitizeResumeData } from "../utils/resumeData.js";

const sanitizeString = (str, maxLength = 5000) =>
  typeof str === "string" ? str.trim().slice(0, maxLength) : "";

// POST: /api/resumes/create
export const createResume = async (req, res) => {
  try {
    const { title, resumeData } = req.body || {};
    const safeResumeData = resumeData && typeof resumeData === "object" && !Array.isArray(resumeData)
      ? sanitizeResumeData(resumeData)
      : {};
    const sanitizedTitle = sanitizeString(title ?? safeResumeData.title, 200) || "Untitled Resume";
    if (safeResumeData.template?.startsWith("custom-")) {
      const published = await ResumeTemplate.exists({ templateId: safeResumeData.template, status: "published", isBuiltin: false });
      if (!published) return res.status(400).json({ message: "That resume template is not currently published" });
    }

    const newResume = await Resume.create({
      ...safeResumeData,
      userId: req.userId,
      title: sanitizedTitle,
    });

    return res.status(201).json({ message: "Resume created successfully", resume: newResume });
  } catch (error) {
    console.error("createResume error:", error.message);
    return res.status(500).json({ message: "Failed to create resume" });
  }
};

// DELETE: /api/resumes/delete/:resumeId
export const deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    if (!resumeId || !resumeId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID" });
    }

    const resume = await Resume.findOneAndDelete({ userId: req.userId, _id: resumeId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found or already deleted" });
    }

    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("deleteResume error:", error.message);
    return res.status(500).json({ message: "Failed to delete resume" });
  }
};

// GET: /api/resumes/get/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    if (!resumeId || !resumeId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID" });
    }

    const resume = await Resume.findOne({ userId: req.userId, _id: resumeId }).select("-__v");
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    console.error("getResumeById error:", error.message);
    return res.status(500).json({ message: "Failed to load resume" });
  }
};

// GET: /api/resumes/public/:resumeId (no auth required)
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    if (!resumeId || !resumeId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID" });
    }

    const resume = await Resume.findOne({ public: true, _id: resumeId }).select("-__v -userId");
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    console.error("getPublicResumeById error:", error.message);
    return res.status(500).json({ message: "Failed to load resume" });
  }
};

// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
  try {
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    if (!resumeId || !resumeId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID" });
    }

    let resumeDataCopy;
    try {
      resumeDataCopy =
        typeof resumeData === "string" ? JSON.parse(resumeData) : structuredClone(resumeData);
    } catch {
      return res.status(400).json({ message: "Invalid resume data format" });
    }

    // Sanitize the data before saving
    const sanitizedData = sanitizeResumeData(resumeDataCopy);
    const existingResume = await Resume.findOne({ userId: req.userId, _id: resumeId }).select("template +personal_info.image_file_id");
    if (!existingResume) return res.status(404).json({ message: "Resume not found" });
    if (sanitizedData.template?.startsWith("custom-") && sanitizedData.template !== existingResume.template) {
      const published = await ResumeTemplate.exists({ templateId: sanitizedData.template, status: "published", isBuiltin: false });
      if (!published) return res.status(400).json({ message: "That resume template is not currently published" });
    }

    if (image) {
      try {
        const imageBufferData = fs.createReadStream(image.path);
        const response = await imagekit.files.upload({
          file: imageBufferData,
          fileName: "resume-profile.png",
          folder: "user-resumes",
          transformation: {
            pre: "w-300,h-300,fo-face,z-0.75" + (removeBackground ? ",e-bgremove" : ""),
          },
        });
        if (!sanitizedData.personal_info) sanitizedData.personal_info = {};
        sanitizedData.personal_info.image = response.url;
        if (response.fileId) sanitizedData.personal_info.image_file_id = response.fileId;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError.message);
        // Continue without image — don't block the save
      } finally {
        // Clean up temp file
        if (image.path) {
          try { fs.unlinkSync(image.path); } catch { /* ignore */ }
        }
      }
    }

    if (!image && existingResume.personal_info?.image_file_id && sanitizedData.personal_info) {
      sanitizedData.personal_info.image_file_id = existingResume.personal_info.image_file_id;
    }

    const resume = await Resume.findOneAndUpdate(
      { userId: req.userId, _id: resumeId },
      sanitizedData,
      { new: true, runValidators: true }
    ).select("-__v");

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const previousImageFileId = existingResume.personal_info?.image_file_id;
    const nextImageFileId = sanitizedData.personal_info?.image_file_id;
    if (image && previousImageFileId && nextImageFileId && previousImageFileId !== nextImageFileId) {
      try {
        await imagekit.files.delete(previousImageFileId);
      } catch (deleteError) {
        console.error("Previous profile image cleanup failed", { name: deleteError?.name, code: deleteError?.code });
      }
    }

    return res.status(200).json({ message: "Saved successfully", resume });
  } catch (error) {
    console.error("updateResume error:", error.message);
    return res.status(500).json({ message: "Failed to save resume" });
  }
};
