import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api";

const AdminActivity = () => {
  const { token } = useSelector((state) => state.auth);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/admin/activity?page=${page}&limit=25`, { headers: { Authorization: token } });
      setItems(data.activities || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Activity log could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [page, token]);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="space-y-6">
      <header><h1 className="text-2xl font-bold text-gray-900">Admin activity</h1><p className="mt-1 text-sm text-gray-600">Administrative changes and successful admin sign-ins. Passwords, tokens, and email addresses are not recorded.</p></header>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">Recent events <span className="font-normal text-gray-500">({total})</span></h2></div>
        {loading ? <div className="flex min-h-48 items-center justify-center text-sm text-gray-500">Loading activity…</div> : error ? <div role="alert" className="p-6 text-sm text-red-700">{error}<button onClick={load} className="ml-3 underline">Retry</button></div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3">Administrator</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Target</th><th className="px-5 py-3">Result</th><th className="px-5 py-3">Time</th></tr></thead><tbody className="divide-y divide-gray-100">{items.length ? items.map((item) => <tr key={item._id}><td className="px-5 py-3">{item.actorName}</td><td className="px-5 py-3 font-medium">{item.action.replaceAll(".", " ")}</td><td className="px-5 py-3">{item.targetLabel || `${item.targetType} ${item.targetId}`}</td><td className="px-5 py-3"><span className={`rounded-full px-2 py-1 text-xs ${item.result === "success" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>{item.result}</span></td><td className="whitespace-nowrap px-5 py-3 text-gray-500">{new Date(item.createdAt).toLocaleString()}</td></tr>) : <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500">No administrative activity recorded yet.</td></tr>}</tbody></table></div>}
        <footer className="flex items-center justify-between border-t px-5 py-3 text-sm"><span className="text-gray-500">Page {page} of {pages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} aria-label="Previous page" onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex min-h-10 min-w-10 items-center justify-center rounded border disabled:opacity-40"><ChevronLeft className="size-4" /></button><button type="button" disabled={page >= pages} aria-label="Next page" onClick={() => setPage((value) => Math.min(pages, value + 1))} className="flex min-h-10 min-w-10 items-center justify-center rounded border disabled:opacity-40"><ChevronRight className="size-4" /></button></div></footer>
      </div>
    </section>
  );
};

export default AdminActivity;
