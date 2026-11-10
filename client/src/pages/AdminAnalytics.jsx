import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Eye, FileText, UserCheck, UserPlus } from "lucide-react";
import api from "../api";
import AdminLineChart from "../components/admin/AdminLineChart";

const periods = [
  ["7d", "Last 7 days"], ["30d", "Last 30 days"], ["90d", "Last 90 days"], ["12m", "Last 12 months"], ["custom", "Custom range"],
];

const AdminAnalytics = () => {
  const { token } = useSelector((state) => state.auth);
  const [period, setPeriod] = useState("30d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    if (period === "custom" && (!dateFrom || !dateTo)) {
      setReport(null);
      setError("");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ period });
      if (period === "custom") {
        params.set("dateFrom", dateFrom);
        params.set("dateTo", dateTo);
      }
      const { data } = await api.get(`/admin/analytics?${params}`, { headers: { Authorization: token } });
      setReport(data);
    } catch (requestError) {
      setReport(null);
      setError(requestError?.response?.data?.message || "Analytics could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, period, token]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const series = report?.series || [];
  const metrics = [
    { label: "Page views", value: series.reduce((sum, item) => sum + item.pageViews, 0), icon: Eye },
    { label: "Estimated unique visitors", value: report?.estimatedUniqueVisitors || 0, icon: UserCheck, approximate: true },
    { label: "Registrations", value: series.reduce((sum, item) => sum + item.registrations, 0), icon: UserPlus },
    { label: "Resumes created", value: series.reduce((sum, item) => sum + item.resumes, 0), icon: FileText },
  ];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-2xl font-bold text-gray-900">Analytics</h1><p className="mt-1 text-sm text-gray-600">Aggregated page views, signups, resumes, and authenticated activity.</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="text-xs font-medium text-gray-600">Date range<select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm sm:w-48">{periods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        {period === "custom" && <><label className="text-xs font-medium text-gray-600">From<input type="date" max={dateTo || undefined} value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm" /></label><label className="text-xs font-medium text-gray-600">To<input type="date" min={dateFrom || undefined} value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm" /></label></>}
      </div></header>
      {report?.uniqueVisitorsAreApproximate && <p className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">Unique visitors are an estimate based on a first-party visitor identifier. Page events are retained for up to 12 months.</p>}
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={fetchAnalytics} className="ml-3 font-semibold underline">Retry</button></div>}
      {period === "custom" && (!dateFrom || !dateTo) && <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Choose both a start and end date to view custom analytics.</div>}
      {loading ? <div className="flex min-h-64 items-center justify-center"><div className="size-9 animate-spin rounded-full border-b-2 border-blue-600" /></div> : report && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[...metrics, { label: "Active users", value: report?.activeUsersInRange || 0, icon: UserCheck }].map((metric) => { const MetricIcon = metric.icon; return <article key={metric.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-gray-500">{metric.label}</p><MetricIcon className="size-5 text-blue-600" /></div><p className="mt-3 text-3xl font-bold text-gray-900">{metric.value.toLocaleString()}</p>{metric.approximate && <p className="mt-1 text-xs text-gray-400">Approximate, distinct visitors within range</p>}</article>; })}</div>
        <div className="grid gap-5 xl:grid-cols-2">{[["User registration growth", "registrations"], ["Website traffic", "pageViews"], ["Resume creation", "resumes"], ["Daily active users", "dailyActiveUsers"]].map(([title, key]) => <article key={key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-gray-900">{title}</h2><p className="mt-1 text-xs text-gray-500">Actual daily counts for the selected range</p><div className="mt-4"><AdminLineChart data={series} dataKey={key} label={title} /></div></article>)}<article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-gray-900">Monthly active users</h2><p className="mt-1 text-xs text-gray-500">Distinct authenticated users with editor activity each month</p><div className="mt-4"><AdminLineChart data={(report?.monthlyActiveUsers || []).map((item) => ({ date: item.month, activeUsers: item.activeUsers }))} dataKey="activeUsers" label="Monthly active users" /></div></article></div>
        <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">Most visited public pages</h2></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Page</th><th className="px-5 py-3">Views</th><th className="px-5 py-3">Estimated visitors</th></tr></thead><tbody className="divide-y">{report.topPages?.length ? report.topPages.map((row) => <tr key={row.page}><td className="break-all px-5 py-3 font-medium">{row.page}</td><td className="px-5 py-3">{row.pageViews}</td><td className="px-5 py-3">{row.estimatedVisitors}</td></tr>) : <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-500">No page views recorded in this range.</td></tr>}</tbody></table></div></article>
      </>}
    </section>
  );
};

export default AdminAnalytics;
