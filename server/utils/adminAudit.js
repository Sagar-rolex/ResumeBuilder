import AdminActivity from "../models/AdminActivity.js";

export const recordAdminActivity = (req, { action, targetType, targetId = "", targetLabel = "", result = "success" }) =>
  AdminActivity.create({
    actorId: req.userId,
    actorName: req.user?.name || "Administrator",
    action,
    targetType,
    targetId: String(targetId),
    targetLabel: String(targetLabel).slice(0, 100),
    result,
  });
