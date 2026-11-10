import express from "express";
import { adminProtect } from "../middlewares/authMiddleware.js";
import { loginAdmin } from "../controllers/userController.js";
import User from "../models/User.js";
import Resume from "../models/Resume.js";
import Analytics from "../models/Analytics.js";
import AdminActivity from "../models/AdminActivity.js";
import { recordAdminActivity } from "../utils/adminAudit.js";
import imagekit from "../configs/imageKit.js";

const adminRouter = express.Router();

const adminLoginAttempts = new Map();
const limitAdminLogin = (req, res, next) => {
  const key = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const active = (adminLoginAttempts.get(key) || []).filter((timestamp) => timestamp > now - 15 * 60 * 1000);
  if (active.length >= 10) return res.status(429).json({ message: "Too many administrator sign-in attempts. Try again in 15 minutes." });
  active.push(now);
  adminLoginAttempts.set(key, active);
  next();
};
adminRouter.post("/login", limitAdminLogin, loginAdmin);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isObjectId = (value) => /^[a-f0-9]{24}$/i.test(String(value || ""));
const getAnalyticsRange = ({ period = "30d", dateFrom, dateTo } = {}) => {
  const now = new Date();
  let end = new Date(now);
  let start;
  if (period === "custom") {
    if (!dateFrom || !dateTo || Number.isNaN(Date.parse(dateFrom)) || Number.isNaN(Date.parse(dateTo))) return null;
    start = new Date(dateFrom);
    end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
  } else {
    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "12m" ? 365 : 30;
    end.setHours(23, 59, 59, 999);
    start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
  }
  if (start > end) [start, end] = [end, start];
  const durationDays = Math.min(366, Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1));
  if (durationDays === 366) start = new Date(end.getTime() - 365 * 86400000);
  start.setHours(0, 0, 0, 0);
  return { startDate: start, endDate: end, days: durationDays };
};

// ============ USER MANAGEMENT ============

// Get all users (admin only) - with pagination, search, filter
adminRouter.get("/users", adminProtect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "", status = "", sortBy = "createdAt", sortOrder = "desc", registeredFrom, registeredTo } = req.query;
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));

    const query = {};
    if (search) {
      const escaped = escapeRegex(String(search).slice(0, 100));
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ];
    }
    if (["user", "admin"].includes(role)) {
      query.role = role;
    }
    if (status === "active") query.isActive = { $ne: false };
    if (status === "suspended") query.isActive = false;
    if (status === "recently-active") query.lastActiveAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    if (registeredFrom || registeredTo) {
      query.createdAt = {};
      if (registeredFrom && !Number.isNaN(Date.parse(registeredFrom))) query.createdAt.$gte = new Date(registeredFrom);
      if (registeredTo && !Number.isNaN(Date.parse(registeredTo))) {
        query.createdAt.$lte = new Date(registeredTo);
        query.createdAt.$lte.setHours(23, 59, 59, 999);
      }
    }

    const sort = {};
    sort[["createdAt", "name", "email", "lastLoginAt", "lastActiveAt"].includes(sortBy) ? sortBy : "createdAt"] = sortOrder === "asc" ? 1 : -1;

    const users = await User.find(query)
      .select("-password")
      .sort(sort)
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);

    // Add resume count for each user
    const userIds = users.map(u => u._id);
    const resumeCounts = await Resume.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);

    const resumeCountMap = {};
    resumeCounts.forEach(rc => {
      resumeCountMap[rc._id.toString()] = rc.count;
    });

    const usersWithResumeCount = users.map(user => ({
      ...user.toObject(),
      resumeCount: resumeCountMap[user._id.toString()] || 0
    }));

    const total = await User.countDocuments(query);

    res.json({
      users: usersWithResumeCount,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      currentPage: pageNumber,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single user details (admin only)
adminRouter.get("/users/:id", adminProtect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid user ID" });
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's resumes
    const resumes = await Resume.find({ userId: id }).select("title template createdAt updatedAt").sort({ createdAt: -1 });
    const resumeCount = resumes.length;

    res.json({
      user: {
        ...user.toObject(),
        resumeCount,
        resumes: resumes.map(r => ({ _id: r._id, title: r.title, template: r.template, createdAt: r.createdAt, updatedAt: r.updatedAt }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update allowlisted profile fields only. Role and status have separate protected controls.
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid user ID" });
    const { name, email } = req.body || {};
    if (Object.hasOwn(req.body || {}, "role") || Object.hasOwn(req.body || {}, "isActive")) {
      return res.status(400).json({ message: "Role and account status cannot be changed through profile editing" });
    }
    if (name !== undefined && (typeof name !== "string" || !name.trim() || name.trim().length > 100)) {
      return res.status(400).json({ message: "Name must contain 1–100 characters" });
    }
    if (email !== undefined && (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();

    await user.save();
    await recordAdminActivity(req, { action: "user.updated", targetType: "user", targetId: user._id, targetLabel: `User ${user._id}` });

    const updatedUser = await User.findById(id).select("-password");
    res.json({ user: updatedUser, message: "User updated successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};
adminRouter.patch("/users/:id", adminProtect, updateUser);
adminRouter.put("/users/:id", adminProtect, updateUser);

adminRouter.patch("/users/:id/status", adminProtect, async (req, res) => {
  try {
    const { isActive } = req.body || {};
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: "Invalid user ID" });
    if (typeof isActive !== "boolean") return res.status(400).json({ message: "isActive must be true or false" });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!isActive && String(user._id) === String(req.userId)) return res.status(400).json({ message: "You cannot suspend your own account" });
    if (!isActive && user.role === "admin" && user.isActive !== false) {
      const activeAdmins = await User.countDocuments({ role: "admin", isActive: { $ne: false } });
      if (activeAdmins <= 1) return res.status(409).json({ message: "Cannot suspend the last active administrator" });
    }
    user.isActive = isActive;
    await user.save();
    await recordAdminActivity(req, {
      action: isActive ? "user.reactivated" : "user.suspended",
      targetType: "user",
      targetId: user._id,
      targetLabel: `User ${user._id}`,
    });
    const safeUser = await User.findById(user._id).select("-password");
    return res.json({ user: safeUser, message: isActive ? "User reactivated" : "User suspended" });
  } catch (error) {
    console.error("Admin account status update failed", { name: error?.name, code: error?.code });
    return res.status(500).json({ message: "Failed to update account status" });
  }
});

// Delete user (admin only)
adminRouter.delete("/users/:id", adminProtect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid user ID" });

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.userId) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    if (user.role === "admin" && user.isActive !== false) {
      const adminCount = await User.countDocuments({ role: "admin", isActive: { $ne: false } });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last active administrator" });
      }
    }

    const imageRecords = await Resume.find({ userId: id }).select("personal_info.image +personal_info.image_file_id").lean();
    const imageFileIds = [...new Set(imageRecords.map((resume) => resume.personal_info?.image_file_id).filter(Boolean))];
    const legacyImageRefs = imageRecords.filter((resume) => resume.personal_info?.image && !resume.personal_info?.image_file_id).length;
    const session = await User.startSession();
    try {
      await session.withTransaction(async () => {
        await Resume.deleteMany({ userId: id }, { session });
        await User.deleteOne({ _id: id }, { session });
      });
    } finally {
      await session.endSession();
    }
    await recordAdminActivity(req, { action: "user.deleted", targetType: "user", targetId: user._id, targetLabel: `User ${user._id}` });
    const imageCleanup = await Promise.allSettled(imageFileIds.map((fileId) => imagekit.files.delete(fileId)));
    const cleanupWarnings = imageCleanup.filter((result) => result.status === "rejected").length + legacyImageRefs;
    if (cleanupWarnings) console.error("Deleted user profile image cleanup incomplete", { failedAssets: cleanupWarnings });
    res.json({ message: "User and associated resumes were permanently deleted", cleanupWarnings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ ANALYTICS & DASHBOARD ============

// Dashboard overview metrics are sourced directly from MongoDB collections.
const getOverview = async (_req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersLast7Days,
      newUsersPrevious7Days,
      adminUsers,
      totalResumes,
      newResumesLast7Days,
      totalPageViews,
      pageViewsLast30Days,
      uniqueVisitorsLast30Days,
      activeUsersLast30Days,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.countDocuments({ createdAt: { $gte: previousWeekStart, $lt: weekAgo } }),
      User.countDocuments({ role: "admin" }),
      Resume.countDocuments(),
      Resume.countDocuments({ createdAt: { $gte: weekAgo } }),
      Analytics.countDocuments({ timestamp: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }, isInternal: false }),
      Analytics.countDocuments({ isInternal: false, timestamp: { $gte: monthAgo } }),
      Analytics.distinct("visitorId", { isInternal: false, timestamp: { $gte: monthAgo } }),
      User.countDocuments({ role: "user", isActive: { $ne: false }, $or: [{ lastActiveAt: { $gte: monthAgo } }, { lastLoginAt: { $gte: monthAgo } }] }),
    ]);

    res.json({
      totalUsers,
      newUsersLast7Days,
      newUsersPrevious7Days,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      totalResumes,
      newResumesLast7Days,
      totalPageViews,
      pageViewsLast30Days,
      uniqueVisitorsLast30Days: uniqueVisitorsLast30Days.length,
      activeUsersLast30Days,
      uniqueVisitorsAreApproximate: true,
    });
  } catch (error) {
    console.error("Admin overview failed", { name: error?.name, code: error?.code });
    res.status(500).json({ message: "Failed to load admin overview" });
  }
};
adminRouter.get("/overview", adminProtect, getOverview);
adminRouter.get("/stats", adminProtect, getOverview);

adminRouter.get("/analytics", adminProtect, async (req, res) => {
  try {
    const range = getAnalyticsRange(req.query);
    if (!range) return res.status(400).json({ message: "Provide valid start and end dates for a custom range" });
    const { startDate, endDate, days } = range;
    const rangeMatch = { $gte: startDate, $lte: endDate };
    const [registrations, traffic, resumeCreations, activity, monthlyActivity, topPages, uniqueVisitors, activeUsersInRange] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: rangeMatch } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
      Analytics.aggregate([
        { $match: { isInternal: false, timestamp: rangeMatch } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, views: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
      ]),
      Resume.aggregate([
        { $match: { createdAt: rangeMatch } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
      Analytics.aggregate([
        { $match: { isInternal: true, userId: { $ne: null }, timestamp: rangeMatch } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, users: { $addToSet: "$userId" } } },
      ]),
      Analytics.aggregate([
        { $match: { isInternal: true, userId: { $ne: null }, timestamp: rangeMatch } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$timestamp" } }, users: { $addToSet: "$userId" } } },
        { $sort: { _id: 1 } },
      ]),
      Analytics.aggregate([
        { $match: { isInternal: false, timestamp: rangeMatch } },
        { $group: { _id: "$page", views: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
        { $sort: { views: -1 } }, { $limit: 10 },
      ]),
      Analytics.distinct("visitorId", { isInternal: false, timestamp: rangeMatch }),
      Analytics.distinct("userId", { isInternal: true, userId: { $ne: null }, timestamp: rangeMatch }),
    ]);

    const toMap = (rows, value) => new Map(rows.map((row) => [row._id, value(row)]));
    const registrationsByDate = toMap(registrations, (row) => row.count);
    const trafficByDate = toMap(traffic, (row) => ({ views: row.views, visitors: row.visitors.length }));
    const resumesByDate = toMap(resumeCreations, (row) => row.count);
    const activeByDate = toMap(activity, (row) => row.users.length);
    const series = [];
    for (let index = 0; index < days; index += 1) {
      const date = new Date(startDate.getTime() + index * 86400000);
      const key = date.toISOString().slice(0, 10);
      const trafficPoint = trafficByDate.get(key) || { views: 0, visitors: 0 };
      series.push({
        date: key,
        registrations: registrationsByDate.get(key) || 0,
        pageViews: trafficPoint.views,
        estimatedVisitors: trafficPoint.visitors,
        resumes: resumesByDate.get(key) || 0,
        dailyActiveUsers: activeByDate.get(key) || 0,
      });
    }
    return res.json({
      period: { start: startDate.toISOString(), end: endDate.toISOString(), days },
      uniqueVisitorsAreApproximate: true,
      estimatedUniqueVisitors: uniqueVisitors.length,
      activeUsersInRange: activeUsersInRange.length,
      monthlyActiveUsers: monthlyActivity.map((row) => ({ month: row._id, activeUsers: row.users.length })),
      series,
      topPages: topPages.map((row) => ({ page: row._id, pageViews: row.views, estimatedVisitors: row.visitors.length })),
    });
  } catch (error) {
    console.error("Admin analytics aggregation failed", { name: error?.name, code: error?.code });
    return res.status(500).json({ message: "Failed to load analytics" });
  }
});

adminRouter.get("/activity", adminProtect, async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const [activities, total] = await Promise.all([
      AdminActivity.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AdminActivity.countDocuments(),
    ]);
    return res.json({ activities, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error("Admin activity read failed", { name: error?.name, code: error?.code });
    return res.status(500).json({ message: "Failed to load admin activity" });
  }
});

// Get chart data for registrations over time
adminRouter.get("/charts/registrations", adminProtect, async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with 0
    const result = [];
    const dateMap = {};
    dailyRegistrations.forEach(d => { dateMap[d._id] = d.count; });

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      result.unshift({
        date: dateStr,
        count: dateMap[dateStr] || 0
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chart data for page views over time
adminRouter.get("/charts/pageviews", adminProtect, async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const dailyViews = await Analytics.aggregate([
      { $match: { isInternal: false, timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          totalViews: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$visitorId" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = [];
    const viewMap = {};
    const visitorMap = {};
    dailyViews.forEach(d => {
      viewMap[d._id] = d.totalViews;
      visitorMap[d._id] = d.uniqueVisitors.length;
    });

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      result.unshift({
        date: dateStr,
        totalViews: viewMap[dateStr] || 0,
        uniqueVisitors: visitorMap[dateStr] || 0
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chart data for resume creation over time
adminRouter.get("/charts/resumes", adminProtect, async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const dailyResumes = await Resume.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = [];
    const resumeMap = {};
    dailyResumes.forEach(d => { resumeMap[d._id] = d.count; });

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      result.unshift({
        date: dateStr,
        count: resumeMap[dateStr] || 0
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top pages visited
adminRouter.get("/analytics/top-pages", adminProtect, async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const topPages = await Analytics.aggregate([
      { $match: { isInternal: false, timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: "$page",
          totalViews: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$visitorId" }
        }
      },
      { $sort: { totalViews: -1 } },
      { $limit: 20 },
      {
        $project: {
          page: "$_id",
          totalViews: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" }
        }
      }
    ]);

    res.json(topPages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user activity trends (logins per day)
adminRouter.get("/charts/user-activity", adminProtect, async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const dailyActivity = await Analytics.aggregate([
      { $match: { isInternal: true, userId: { $ne: null }, timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          users: { $addToSet: "$userId" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = [];
    const activityMap = {};
    dailyActivity.forEach(d => { activityMap[d._id] = d.users.length; });

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      result.unshift({
        date: dateStr,
        activeUsers: activityMap[dateStr] || 0
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default adminRouter;
