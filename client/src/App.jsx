import React, { useEffect } from "react";
import { Route, Routes, Link, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import Preview from "./pages/Preview";
import Login from "./pages/Login";
import AdminSettings from "./pages/AdminSettings";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import { useDispatch } from "react-redux";
import api from "@/api";
import { login, setLoading } from "./app/features/authSlice";
import { Toaster } from "react-hot-toast";
import RequireAuth from "./components/RequireAuth";
import { logout } from "./app/features/authSlice";
import AdminTemplates from "./pages/AdminTemplates";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminActivity from "./pages/AdminActivity";
import TemplateCatalogProvider from "./contexts/TemplateCatalogProvider";

const PageViewTracker = () => {
  const { pathname } = useLocation();
  const lastTrackedPath = React.useRef("");

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;
    api.post("/analytics/pageview", { path: pathname }).catch(() => {});
  }, [pathname]);

  return null;
};

// ── 404 Page ────────────────────────────────────────────────────────
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <h1 className="text-7xl font-bold text-gray-200">404</h1>
    <p className="text-xl text-gray-600 mt-4">Page not found</p>
    <p className="text-sm text-gray-400 mt-2">The page you're looking for doesn't exist.</p>
    <Link
      to="/"
      className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
    >
      Back to Home
    </Link>
  </div>
);

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUnauthorized = () => dispatch(logout());
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [dispatch]);

  useEffect(() => {
    const getUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(setLoading(false));
        return;
      }
      try {
        const { data } = await api.get("/api/users/data", {
          headers: { Authorization: token },
        });
        if (data.user) {
          dispatch(login({ token, user: data.user }));
        } else {
          dispatch(logout());
        }
      } catch {
        // Token is invalid or expired — clear it
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    getUserData();
  }, [dispatch]);

  return (
    <TemplateCatalogProvider>
    <>
      <Toaster position="top-center" />
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth role="user" />}>
          <Route path="app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="builder/:resumeId" element={<ResumeBuilder />} />
            <Route path="preview/:resumeId" element={<Preview privatePreview />} />
          </Route>
        </Route>

        <Route path="view/:resumeId" element={<Preview />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
        <Route element={<RequireAuth role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="templates" element={<AdminTemplates />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="activity" element={<AdminActivity />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
    </TemplateCatalogProvider>
  );
};

export default App;
