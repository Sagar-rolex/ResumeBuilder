import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import adminTemplateRouter from "./routes/adminTemplateRoutes.js";
import templateRouter from "./routes/templateRoutes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security: request body size limit (prevents DoS) ────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── Cookie parser ─────────────────────────────────────────────────────
app.use(cookieParser());

// ── CORS with explicit allowed origins ──────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://127.0.0.1:5173",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Security: basic response headers ────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// ── Simple in-memory rate limiter (per IP, per window) ──────────────
const rateLimitStore = new Map();

const createRateLimiter = (maxRequests, windowMs) => {
  const id = `${maxRequests}_${windowMs}`;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const key = `${ip}:${id}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }
    const timestamps = rateLimitStore.get(key).filter((t) => t > windowStart);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({
        message: "Too many requests. Please wait a moment and try again.",
        retryAfter: Math.ceil((timestamps[0] + windowMs - now) / 1000),
      });
    }

    timestamps.push(now);
    rateLimitStore.set(key, timestamps);
    next();
  };
};

// Apply rate limiting to AI endpoints (20 req/min)
const aiRateLimiter = createRateLimiter(20, 60 * 1000);

// Periodic cleanup for stale rate limit entries (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitStore.entries()) {
    const recent = timestamps.filter((t) => t > now - 5 * 60 * 1000);
    if (recent.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, recent);
    }
  }
}, 5 * 60 * 1000);

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured");
}

// ── Routes ──────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send("Server is live...");
});

app.use("/api/users", userRouter); // register + login are public; /data and /resumes use route-level protect
app.use("/api/resumes", resumeRouter); // each route uses protect internally
app.use("/api/analytics", analyticsRouter);
app.use("/api/templates", templateRouter);
app.use("/api/ai", aiRateLimiter, aiRouter); // rate limit ALL AI routes; protect is per-route (chat is public)
app.use("/api/admin/templates", adminTemplateRouter);
app.use("/api/admin", adminRouter); // adminProtect on every protected route

// 404 handler for unknown API routes
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origin not allowed" });
  }
  res.status(500).json({ message: "Internal server error" });
});

let server;
try {
  await connectDB();
  console.log("Database connection established");
  server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Server startup failed; database connection is required.", error.message);
  process.exit(1);
}

// ── Graceful shutdown ───────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server?.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
