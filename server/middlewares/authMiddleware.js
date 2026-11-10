import jwt from "jsonwebtoken";
import User from "../models/User.js";

const extractToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (typeof authHeader !== "string" || !authHeader.trim()) return null;
  const bearerMatch = authHeader.trim().match(/^Bearer\s+(.+)$/i);
  return (bearerMatch ? bearerMatch[1] : authHeader).trim() || null;
};

const verifyToken = (token, res) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401).json({
      message: error?.name === "TokenExpiredError"
        ? "Unauthorized: Session expired. Sign in again."
        : "Unauthorized: Invalid token",
    });
    return null;
  }
};

const findAuthenticatedUser = async (userId, res, fields) => {
  try {
    return await User.findById(userId).select(fields);
  } catch (error) {
    // A database lookup failure is an authentication-service problem, not a
    // bad JWT. Keep it distinguishable from signature/expiration failures.
    console.error("Authentication user lookup failed", { name: error?.name, code: error?.code });
    res.status(503).json({ message: "Authentication service is temporarily unavailable" });
    return null;
  }
};

const protect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const decoded = verifyToken(token, res);
  if (!decoded) return;
  const user = await findAuthenticatedUser(decoded.userId, res, "isActive lastActiveAt");
  if (!user) return res.headersSent ? undefined : res.status(401).json({ message: "Unauthorized: User not found" });
  if (user.isActive === false) return res.status(403).json({ message: "Account suspended" });
  req.userId = decoded.userId;
  if (!user.lastActiveAt || Date.now() - user.lastActiveAt.getTime() > 5 * 60 * 1000) {
    User.updateOne({ _id: user._id }, { $set: { lastActiveAt: new Date() } }).catch(() => {});
  }
  next();
};

const optionalAuth = (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    } catch {
      // Public analytics accepts anonymous visits; an invalid optional token is ignored.
    }
  }
  next();
};

const adminProtect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const decoded = verifyToken(token, res);
  if (!decoded) return;
  const user = await findAuthenticatedUser(decoded.userId, res, "-password");
  if (!user) return res.headersSent ? undefined : res.status(401).json({ message: "Unauthorized: User not found" });
  if (user.isActive === false) return res.status(403).json({ message: "Account suspended" });
  if (user.role !== "admin") return res.status(403).json({ message: "Access denied. Admin role required." });
  req.userId = decoded.userId;
  req.user = user;
  next();
};

export { protect, adminProtect, optionalAuth };
export default protect;
