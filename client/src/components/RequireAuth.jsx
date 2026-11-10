import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "./Loader";

export default function RequireAuth({ role }) {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) {
    if (role === "admin") return <Navigate to="/admin/login" replace />;
    const requestedState = new URLSearchParams(location.search).get("state");
    const params = new URLSearchParams({
      state: requestedState === "register" ? "register" : "login",
      next: `${location.pathname}${location.search}`,
    });
    return <Navigate to={`/login?${params.toString()}`} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/app"} replace />;
  }
  return <Outlet />;
}
