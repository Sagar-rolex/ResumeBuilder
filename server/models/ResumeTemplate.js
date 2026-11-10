import mongoose from "mongoose";

const ResumeTemplateSchema = new mongoose.Schema({
  templateId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, default: "", trim: true, maxlength: 500 },
  category: { type: String, required: true, trim: true, maxlength: 40 },
  previewImage: { type: String, default: "", maxlength: 1000 },
  status: { type: String, enum: ["draft", "published", "unpublished"], default: "draft", index: true },
  isBuiltin: { type: Boolean, default: false, index: true },
  layout: {
    baseTemplate: { type: String, required: true },
    accentColor: { type: String, default: "#2563EB" },
    fontFamily: { type: String, enum: ["Arial", "Georgia", "Inter", "Times New Roman", "Verdana"], default: "Arial" },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true, minimize: false });

export default mongoose.model("ResumeTemplate", ResumeTemplateSchema);
