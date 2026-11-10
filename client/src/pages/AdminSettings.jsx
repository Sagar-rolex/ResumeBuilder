import React, { useState } from "react";
import { useSelector } from "react-redux";
import { CheckCircle2, CircleAlert, RefreshCw, Settings2, ShieldCheck } from "lucide-react";
import api from "../api";

const AdminSettings = () => {
  const { token } = useSelector((state) => state.auth);
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkProvider = async () => {
    setChecking(true);
    try {
      const { data } = await api.get("/ai/status", { headers: { Authorization: token } });
      setStatus(data);
    } catch (error) {
      setStatus(error?.response?.data || { status: "error", code: "AI_STATUS_UNAVAILABLE", message: "The backend diagnostic could not be reached." });
    } finally {
      setChecking(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header><h1 className="text-2xl font-bold text-gray-900">Admin settings</h1><p className="mt-1 text-sm text-gray-600">Review application services and security details. Secrets are managed in backend environment variables.</p></header>
      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start gap-3"><span className="rounded-lg bg-blue-50 p-2 text-blue-700"><Settings2 className="size-5" /></span><div><h2 className="font-semibold text-gray-900">AI provider connectivity</h2><p className="mt-1 text-sm text-gray-600">Runs a real minimal provider request. The result never includes the API key.</p></div></div>
        <button type="button" disabled={checking} onClick={checkProvider} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"><RefreshCw className={`size-4 ${checking ? "animate-spin" : ""}`} />{checking ? "Checking…" : "Check connection"}</button>
        {status && <div role="status" className={`mt-4 rounded-lg border p-4 ${status.status === "ok" ? "border-blue-200 bg-blue-50" : "border-amber-200 bg-amber-50"}`}><div className="flex gap-2">{status.status === "ok" ? <CheckCircle2 className="mt-0.5 size-5 text-blue-700" /> : <CircleAlert className="mt-0.5 size-5 text-amber-700" />}<div className="min-w-0"><p className="font-semibold text-gray-900">{status.status === "ok" ? "Provider connected" : status.message || "Provider unavailable"}</p>{status.code && <p className="mt-1 text-xs text-gray-600">Code: {status.code}</p>}<dl className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">{[["Provider", status.provider], ["Model", status.model], ["Endpoint", status.endpoint], ["Key variable", status.apiKeyVariable], ["Key loaded", typeof status.apiKeyPresent === "boolean" ? String(status.apiKeyPresent) : undefined]].filter(([, value]) => value !== undefined).map(([key, value]) => <div key={key}><dt className="font-medium">{key}</dt><dd className="break-all">{value}</dd></div>)}</dl>{status.reply && <p className="mt-2 text-sm text-gray-700">Provider reply: {status.reply}</p>}</div></div></div>}
      </article>
      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 text-blue-700" /><div><h2 className="font-semibold text-gray-900">Access controls</h2><p className="mt-1 text-sm text-gray-600">Administrator routes and management APIs verify an active admin account on the backend. Provision administrators through the secure seed command; public registration cannot grant admin privileges.</p></div></div></article>
    </section>
  );
};

export default AdminSettings;
