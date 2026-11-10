import { createHash, randomUUID } from "node:crypto";
import express from "express";
import Analytics from "../models/Analytics.js";
import User from "../models/User.js";
import { optionalAuth } from "../middlewares/authMiddleware.js";

const analyticsRouter = express.Router();
const visitorCookie = "resume_visitor";

analyticsRouter.post("/pageview", optionalAuth, async (req, res) => {
  try {
    const rawPath = typeof req.body?.path === "string" ? req.body.path : "";
    if (rawPath.length > 500 || !/^\/(?!\/)/.test(rawPath)) return res.status(400).json({ message: "Invalid page path" });
    const page = new URL(rawPath, "https://resume.local").pathname;
    if (!page.startsWith("/") || page.startsWith("/api/") || page.startsWith("/admin")) {
      return res.status(202).json({ accepted: false });
    }
    if (req.userId) {
      const account = await User.findById(req.userId).select("role").lean();
      if (account?.role === "admin") return res.status(202).json({ accepted: false });
    }

    let visitorSession = req.cookies?.[visitorCookie];
    if (!visitorSession || !/^[0-9a-f-]{36}$/i.test(visitorSession)) {
      visitorSession = randomUUID();
      res.cookie(visitorCookie, visitorSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000,
        path: "/api/analytics",
      });
    }

    const visitorId = createHash("sha256").update(visitorSession).digest("hex");
    const normalizedPage = page.replace(/\/[a-f0-9]{24}(?=\/|$)/gi, "/:id");
    const isInternal = page === "/app" || page.startsWith("/app/");
    const recentDuplicate = await Analytics.exists({
      visitorId,
      page: normalizedPage,
      timestamp: { $gte: new Date(Date.now() - 2000) },
    });
    if (!recentDuplicate) {
      await Analytics.create({
        page: normalizedPage,
        visitorId,
        userId: req.userId || null,
        sessionId: visitorId.slice(0, 24),
        isInternal,
      });
    }
    return res.status(202).json({ accepted: !recentDuplicate });
  } catch (error) {
    console.error("Page view tracking failed", { name: error?.name, code: error?.code });
    return res.status(202).json({ accepted: false });
  }
});

export default analyticsRouter;
