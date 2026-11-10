import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Resume from "../models/Resume.js";
import { isStrongPassword } from "../utils/passwordValidation.js";
import AdminActivity from "../models/AdminActivity.js";

const JWT_EXPIRES_IN = "7d";

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// ── Validation helpers ──────────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST: /api/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      return res.status(400).json({ message: "Name must be a non-empty string (max 100 chars)" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
    });

    const token = generateToken(newUser._id);
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({ message: "User created successfully", token, user: userResponse });
  } catch (error) {
    console.error("registerUser error:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }
    return res.status(400).json({ message: error.message });
  }
};

// POST: /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "This account is suspended" });
    }

    user.lastLoginAt = new Date();
    user.lastActiveAt = user.lastLoginAt;
    await user.save();
    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({ message: "Login successful", token, user: userResponse });
  } catch (error) {
    console.error("loginUser error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.role !== "admin" || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "This account is suspended" });
    }
    user.lastLoginAt = new Date();
    user.lastActiveAt = user.lastLoginAt;
    await user.save();
    try {
      await AdminActivity.create({
        actorId: user._id,
        actorName: user.name || "Administrator",
        action: "admin.login",
        targetType: "session",
        targetLabel: "Administrator signed in",
        result: "success",
      });
    } catch (auditError) {
      console.error("Admin login audit write failed", { name: auditError?.name, code: auditError?.code });
    }
    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;
    return res.status(200).json({ message: "Login successful", token, user: userResponse });
  } catch (error) {
    console.error("loginAdmin error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET: /api/users/data
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("getUserById error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET: /api/users/resumes
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 });
    return res.status(200).json({ resumes });
  } catch (error) {
    console.error("getUserResumes error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
