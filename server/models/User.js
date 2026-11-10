import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null, index: true },
    lastActiveAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.index({ role: 1, isActive: 1, lastActiveAt: -1 });

const User = mongoose.model("User", UserSchema);

export default User;
