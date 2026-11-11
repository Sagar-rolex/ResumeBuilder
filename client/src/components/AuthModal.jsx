import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { X, Lock, Mail, User2Icon, Eye, EyeOff } from "lucide-react";
import api, { getApiErrorMessage } from "@/api";
import { login } from "../app/features/authSlice";
import toast from "react-hot-toast";
import PasswordRequirements from "./PasswordRequirements";
import { isStrongPassword } from "../utils/passwordValidation";

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const confirmMismatch = mode === "register" && !!confirmPassword && !!formData.password && confirmPassword !== formData.password;
  const passwordsMatchAndStrong = mode === "register" && !!confirmPassword && confirmPassword === formData.password && isStrongPassword(formData.password);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (mode === "register" && !formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = "Invalid email format";
    if (!formData.password) nextErrors.password = "Password is required";
    else if (mode === "register" && !isStrongPassword(formData.password)) nextErrors.password = "Password must meet all requirements below.";
    else if (mode === "login" && formData.password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    if (mode === "register") {
      if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
      else if (formData.password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const { data } = await api.post(`/users/${mode}`, formData);
      dispatch(login(data));
      localStorage.setItem("token", data.token);
      toast.success(data.message || "Success!");
      if (onSuccess) onSuccess(data);
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Authentication failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center overflow-y-auto p-3 sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" className="my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative animate-fadeIn">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in dialog"
          className="absolute top-3 right-3 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
        >
          <X className="size-5" />
        </button>

        <h2 id="auth-modal-title" className="text-2xl font-bold text-slate-900 mt-2">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Please log in or sign up to save and download your resume.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {mode === "register" && (
            <div className="flex items-center w-full bg-slate-50 border border-slate-300 h-12 rounded-xl px-4 gap-3">
              <User2Icon className="size-5 text-slate-400" />
              <input
                name="name"
                type="text"
                maxLength={100}
                placeholder="Full Name"
                className="bg-transparent border-none outline-none w-full text-sm"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
              />
            </div>
          )}
          {errors.name && <p className="text-xs text-red-500 pl-4" role="alert">{errors.name}</p>}

          <div className="flex items-center w-full bg-slate-50 border border-slate-300 h-12 rounded-xl px-4 gap-3">
            <Mail className="size-5 text-slate-400" />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              className="bg-transparent border-none outline-none w-full text-sm"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 pl-4" role="alert">{errors.email}</p>}

          <div className="flex items-center w-full bg-slate-50 border border-slate-300 h-12 rounded-xl px-4 gap-3">
            <Lock className="size-5 text-slate-400" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              maxLength={128}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              placeholder={mode === "register" ? "Password" : "Password (min 6 chars)"}
              className="bg-transparent border-none outline-none min-w-0 flex-1 text-sm"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setErrors((prev) => ({
                  ...prev,
                  password: "",
                  confirmPassword: confirmPassword
                    ? e.target.value === confirmPassword ? "" : "Passwords do not match."
                    : prev.confirmPassword,
                }));
              }}
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded text-slate-500 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 pl-4" role="alert">{errors.password}</p>}
          {mode === "register" && <PasswordRequirements password={formData.password} />}

          {mode === "register" && (
            <>
              <div className="flex items-center w-full bg-slate-50 border border-slate-300 h-12 rounded-xl px-4 gap-3">
                <Lock className="size-5 text-slate-400" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  maxLength={128}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  className="bg-transparent border-none outline-none min-w-0 flex-1 text-sm"
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPassword(value);
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: !value
                        ? prev.confirmPassword ? "Please confirm your password." : ""
                        : value === formData.password ? "" : prev.confirmPassword ? "Passwords do not match." : "",
                    }));
                  }}
                />
                <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirmPassword} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded text-slate-500 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {(confirmMismatch || (!confirmPassword && errors.confirmPassword)) && <p className="text-xs text-red-500 pl-4" role="alert">{confirmMismatch ? "Passwords do not match." : errors.confirmPassword}</p>}
              {passwordsMatchAndStrong && <p className="text-xs text-blue-600 pl-4" role="status">Passwords match.</p>}
            </>
          )}

          <button
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition disabled:opacity-50 mt-2"
          >
            {loading ? "Processing..." : mode === "login" ? "Login & Save" : "Sign Up & Save"}
          </button>
        </form>

        <p className="text-sm text-center text-slate-500 mt-6">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setConfirmPassword("");
              setErrors({});
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
