import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Users, UserCheck, FileText, ArrowRight, Eye, UserPlus } from "lucide-react";
import api from "../api";
import AdminLineChart from "../components/admin/AdminLineChart";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState(null);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setStats(null);
        setRecentUsers(null);
        setSeries(null);
        const [statsRes, usersRes, analyticsRes] = await Promise.allSettled([
          api.get("/admin/overview", { headers: { Authorization: token } }),
          api.get("/admin/users?limit=5", { headers: { Authorization: token } }),
          api.get("/admin/analytics?period=30d", { headers: { Authorization: token } }),
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }
        if (usersRes.status === "fulfilled" && usersRes.value?.data?.users) {
          setRecentUsers(usersRes.value.data.users);
        }
        if (analyticsRes.status === "fulfilled" && analyticsRes.value?.data?.series) setSeries(analyticsRes.value.data.series);
        if ([statsRes, usersRes, analyticsRes].some((result) => result.status === "rejected")) setError("Some dashboard data is unavailable. Check the backend connection and administrator session.");
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const statCards = [
    {
      name: "Total registered users",
      value: stats ? stats.totalUsers ?? 0 : "—",
      subtext: stats ? `+${stats.newUsersLast7Days ?? 0} this week` : "Unavailable",
      icon: Users,
      iconClass: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "New users · last 7 days",
      value: stats ? stats.newUsersLast7Days ?? 0 : "—",
      subtext: stats ? `${(stats.newUsersLast7Days ?? 0) - (stats.newUsersPrevious7Days ?? 0) >= 0 ? "+" : ""}${(stats.newUsersLast7Days ?? 0) - (stats.newUsersPrevious7Days ?? 0)} vs previous 7 days` : "Unavailable",
      icon: UserPlus,
      iconClass: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      name: "Active users · last 30 days",
      value: stats ? stats.activeUsersLast30Days ?? 0 : "—",
      subtext: stats ? "Based on authenticated activity" : "Unavailable",
      icon: UserCheck,
      iconClass: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      name: "Resumes created",
      value: stats ? stats.totalResumes ?? 0 : "—",
      subtext: stats ? `+${stats.newResumesLast7Days ?? 0} this week` : "Unavailable",
      icon: FileText,
      iconClass: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Page views · last 12 months",
      value: stats ? stats.totalPageViews ?? 0 : "—",
      subtext: stats ? `${stats.pageViewsLast30Days ?? 0} this month` : "Unavailable",
      icon: Eye,
      iconClass: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Estimated unique visitors · 30 days",
      value: stats ? stats.uniqueVisitorsLast30Days ?? 0 : "—",
      subtext: stats ? "Approximate first-party count" : "Unavailable",
      icon: Users,
      iconClass: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of platform users, resume creations, and system activity.
        </p>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button type="button" onClick={() => window.location.reload()} className="ml-3 underline">Retry</button></div>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                {stat.subtext && (
                  <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <Icon className={`size-6 ${stat.iconClass}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {[["Registrations", "registrations"], ["Website traffic", "pageViews"], ["Resume creations", "resumes"]].map(([label, key]) => <article key={key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-gray-900">{label} · 30 days</h2><div className="mt-3">{series ? <AdminLineChart data={series} dataKey={key} label={label} /> : <p className="py-8 text-center text-sm text-gray-500">Analytics data unavailable.</p>}</div></article>)}
      </div>

      {/* Recent Users Section */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Recent Users</h2>
            <p className="text-xs text-gray-500 mt-0.5">Latest registrations on the platform</p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="max-w-full overflow-x-auto touch-pan-x" role="region" aria-label="Recent users table; scroll horizontally for more columns" tabIndex={0}>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentUsers === null ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-red-600 text-xs">Recent users could not be loaded.</td></tr>
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-xs">
                    No recent users found
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u._id || u.id} className="hover:bg-gray-50/80">
                    <td className="px-6 py-3.5 font-medium text-gray-900">
                      {u.name}
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{u.email}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
