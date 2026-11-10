import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  FileStack,
  ChartNoAxesCombined,
  Activity,
} from "lucide-react";
import { logout } from "../app/features/authSlice";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [sidebarOpen]);

  const navigation = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Templates", href: "/admin/templates", icon: FileStack },
    { name: "Analytics", href: "/admin/analytics", icon: ChartNoAxesCombined },
    { name: "Activity Logs", href: "/admin/activity", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const isActive = (href) => {
    return location.pathname === href || (href === "/admin/dashboard" && location.pathname === "/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="relative flex items-center justify-center h-16 px-4 bg-blue-600">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-white mr-2" />
            <span className="text-white text-xl font-bold">Admin Panel</span>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close admin navigation" className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded text-white hover:bg-blue-700 lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  type="button"
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin User
              </p>
              <p className="mt-1 text-sm text-gray-900 font-medium">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 mt-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin navigation"
              aria-controls="admin-sidebar"
              aria-expanded={sidebarOpen}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-lg font-semibold text-gray-900">
                Admin Panel
              </span>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
