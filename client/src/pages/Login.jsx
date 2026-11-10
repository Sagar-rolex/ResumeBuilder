import { Lock, Mail, User2Icon, ArrowLeft, Eye, EyeOff } from "lucide-react";
import React from "react";
import api from "@/api";
import { useDispatch } from "react-redux";
import { login } from "../app/features/authSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import PasswordRequirements from "../components/PasswordRequirements";
import { isStrongPassword } from "../utils/passwordValidation";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("state") === "register" ? "register" : "login";
  const [mode, setMode] = React.useState(initialMode);
  const [loading, setLoading] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState({});
  const confirmMismatch = mode === "register" && !!confirmPassword && !!formData.password && confirmPassword !== formData.password;
  const passwordsMatchAndStrong = mode === "register" && !!confirmPassword && confirmPassword === formData.password && isStrongPassword(formData.password);

  const validate = () => {
    const newErrors = {};
    if (mode === "register" && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (mode === "register" && !isStrongPassword(formData.password)) {
      newErrors.password = "Password must meet all requirements below.";
    } else if (mode === "login" && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (mode === "register") {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password.";
      } else if (formData.password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post(`/users/${mode}`, formData);
      dispatch(login(data));
      localStorage.setItem("token", data.token);
      toast.success(data.message);
      const nextPath = searchParams.get("next");
      const isAppPath = nextPath === "/app" || nextPath?.startsWith("/app/") || nextPath?.startsWith("/app?");
      navigate(isAppPath ? nextPath : data.user?.role === "admin" ? "/admin/dashboard" : "/app");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isConfirmPassword = name === "confirmPassword";
    const nextFormData = isConfirmPassword ? formData : { ...formData, [name]: value };
    if (isConfirmPassword) setConfirmPassword(value);
    else setFormData(nextFormData);
    setErrors((prev) => {
      const nextErrors = { ...prev };
      if (nextErrors[name]) nextErrors[name] = "";

      if (mode === "register" && (name === "password" || name === "confirmPassword")) {
        const nextConfirmPassword = isConfirmPassword ? value : confirmPassword;
        const nextPassword = name === "password" ? value : formData.password;
        if (nextConfirmPassword && nextPassword === nextConfirmPassword) {
          nextErrors.confirmPassword = "";
        } else if (nextConfirmPassword && prev.confirmPassword) {
          nextErrors.confirmPassword = "Passwords do not match.";
        } else if (!nextConfirmPassword && prev.confirmPassword) {
          nextErrors.confirmPassword = "Please confirm your password.";
        }
      }
      return nextErrors;
    });
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setErrors({});
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="flex items-center justify-center min-h-dvh bg-gray-50 px-4 py-6">
      <div className="relative w-full max-w-[380px] text-center border border-gray-300/60 rounded-2xl px-5 sm:px-8 bg-white shadow-lg">
        {/* Back to home link */}
        <a
          href="/"
          className="absolute top-4 left-4 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Home
        </a>

        <h1 className="text-gray-900 text-3xl mt-10 font-medium">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          {mode === "login" ? "Login to access your resumes" : "Sign up to start building resumes"}
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          {mode !== "login" && (
            <div className="space-y-1 mb-2">
              <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <User2Icon size={16} color="#6B7280" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  className="border-none outline-none ring-0 flex-1"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 pl-6">{errors.name}</p>
              )}
            </div>
          )}

          <div className={`space-y-1 ${mode === "register" ? "mb-2" : ""}`}>
            <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <Mail size={13} color="#6B7280" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                className="border-none outline-none ring-0 flex-1"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 pl-6">{errors.email}</p>
            )}
          </div>

          <div className={`space-y-1 ${mode === "register" ? "mb-2" : ""}`}>
            <div className={`flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 pr-4 gap-2 ${mode === "login" ? "mt-4" : ""}`}>
              <Lock size={13} color="#6B7280" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                maxLength={128}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                placeholder="Password"
                className="border-none outline-none ring-0 flex-1 min-w-0"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded text-gray-500 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 pl-6">{errors.password}</p>
            )}
            {mode === "register" && <PasswordRequirements password={formData.password} />}
          </div>

          {mode === "register" && (
            <div className="space-y-1 mb-2">
              <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 pr-4 gap-2">
                <Lock size={13} color="#6B7280" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  maxLength={128}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  className="border-none outline-none ring-0 flex-1 min-w-0"
                  value={confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  aria-pressed={showConfirmPassword}
                  className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded text-gray-500 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {(confirmMismatch || (!confirmPassword && errors.confirmPassword)) && (
                <p className="text-xs text-red-500 pl-6" role="alert">
                  {confirmMismatch ? "Passwords do not match." : errors.confirmPassword}
                </p>
              )}
              {passwordsMatchAndStrong && <p className="text-xs text-blue-600 pl-6" role="status">Passwords match.</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full h-11 rounded-full text-white bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-4 mb-8">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={toggleMode}
            className="text-blue-500 hover:underline font-medium"
          >
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
