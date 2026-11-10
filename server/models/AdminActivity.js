import mongoose from "mongoose";

const AdminActivitySchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  actorName: { type: String, required: true },
  action: { type: String, required: true, index: true },
  targetType: { type: String, required: true },
  targetId: { type: String, default: "" },
  targetLabel: { type: String, default: "" },
  result: { type: String, enum: ["success", "failure"], default: "success" },
}, { timestamps: true });

AdminActivitySchema.index({ createdAt: -1 });

export default mongoose.model("AdminActivity", AdminActivitySchema);
