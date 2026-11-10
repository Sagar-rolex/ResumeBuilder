import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Eye, Pencil, Search, Trash2, UserRoundX, X } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

const formatDate = (value) => value ? new Date(value).toLocaleString() : "Never";

const AdminUsers = () => {
  const { token, user: admin } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [registeredFrom, setRegisteredFrom] = useState("");
  const [registeredTo, setRegisteredTo] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [viewingUser, setViewingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [working, setWorking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  useEffect(() => { setPage(1); }, [searchQuery, roleFilter, statusFilter, sortOrder, registeredFrom, registeredTo]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");
      const params = new URLSearchParams({ page: String(page), limit: "15", search: searchQuery, role: roleFilter, status: statusFilter, sortBy: "createdAt", sortOrder });
      if (registeredFrom) params.set("registeredFrom", registeredFrom);
      if (registeredTo) params.set("registeredTo", registeredTo);
      const { data } = await api.get(`/admin/users?${params}`, { headers: { Authorization: token } });
      setUsers(data.users || []);
      setPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      setUsers([]);
      setTotal(null);
      setLoadError(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, registeredFrom, registeredTo, roleFilter, searchQuery, sortOrder, statusFilter, token]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name || "", email: user.email || "" });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editForm.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      toast.error("Enter a valid name and email address");
      return;
    }
    setWorking(true);
    try {
      await api.patch(`/admin/users/${editingUser._id}`, { name: editForm.name, email: editForm.email }, { headers: { Authorization: token } });
      toast.success("Profile updated");
      setEditingUser(null);
      await fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update user");
    } finally {
      setWorking(false);
    }
  };

  const loadDetails = async (user) => {
    setViewingUser({ ...user, loading: true });
    try {
      const { data } = await api.get(`/admin/users/${user._id}`, { headers: { Authorization: token } });
      setViewingUser(data.user);
    } catch (error) {
      setViewingUser(null);
      toast.error(error?.response?.data?.message || "Could not load user profile");
    }
  };

  const toggleStatus = async (user) => {
    const nextIsActive = user.isActive === false;
    setWorking(true);
    try {
      await api.patch(`/admin/users/${user._id}/status`, { isActive: nextIsActive }, { headers: { Authorization: token } });
      toast.success(nextIsActive ? "Account reactivated" : "Account suspended");
      await fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update account status");
    } finally {
      setWorking(false);
    }
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    setWorking(true);
    try {
      const { data } = await api.delete(`/admin/users/${deleteTarget._id}`, { headers: { Authorization: token } });
      if (data.cleanupWarnings) toast.error("Account and resumes were deleted, but some uploaded profile images could not be removed; check storage cleanup.");
      else toast.success("Account, resumes, and tracked profile images were deleted");
      setDeleteTarget(null);
      await fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    } finally {
      setWorking(false);
    }
  };

  const adminId = admin?._id || admin?.id;

  return (
    <section className="space-y-6">
      <header><h1 className="text-2xl font-bold text-gray-900">User management</h1><p className="mt-1 text-sm text-gray-600">Search accounts, review activity, and manage access. Profile edits do not change account roles.</p></header>
      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-6">
        <label className="relative sm:col-span-2"><span className="sr-only">Search by name or email</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name or email" className="min-h-11 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm" /></label>
        <label><span className="sr-only">Role filter</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm"><option value="">All roles</option><option value="user">User</option><option value="admin">Admin</option></select></label>
        <label><span className="sr-only">Account status filter</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm"><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="recently-active">Active in 30 days</option></select></label>
        <label><span className="sr-only">Registration sort</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm"><option value="desc">Newest first</option><option value="asc">Oldest first</option></select></label>
        <div className="flex gap-2 sm:col-span-2 xl:col-span-6"><label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-gray-500"><CalendarDays className="size-4 shrink-0" /><span className="sr-only">Registered from</span><input type="date" value={registeredFrom} max={registeredTo || undefined} onChange={(event) => setRegisteredFrom(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-lg border border-gray-300 px-2 text-sm" /></label><label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-gray-500"><span>to</span><span className="sr-only">Registered to</span><input type="date" value={registeredTo} min={registeredFrom || undefined} onChange={(event) => setRegisteredTo(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-lg border border-gray-300 px-2 text-sm" /></label></div>
      </div>

      {loadError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{loadError}</span><button type="button" onClick={fetchUsers} className="font-semibold underline">Retry</button></div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4"><h2 className="font-semibold text-gray-900">Users <span className="font-normal text-gray-500">({total ?? "—"})</span></h2><span className="text-xs text-gray-500">Page {page} of {pages}</span></div>
        <div className="max-w-full overflow-x-auto touch-pan-x" role="region" aria-label="Users table; scroll horizontally for more columns" tabIndex={0}>
          <table className="min-w-[980px] divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Registered</th><th className="px-4 py-3">Last login</th><th className="px-4 py-3">Last active</th><th className="px-4 py-3">Resumes</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">Loading users…</td></tr> : loadError ? <tr><td colSpan={8} className="px-4 py-12 text-center text-red-700">User records are unavailable until the request succeeds.</td></tr> : users.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No users match these filters.</td></tr> : users.map((user) => { const isSelf = String(user._id) === String(adminId); return <tr key={user._id} className="hover:bg-slate-50"><td className="px-4 py-3"><div className="font-medium text-gray-900">{user.name}</div><div className="text-xs text-gray-500">{user.email}</div></td><td className="px-4 py-3">{user.role}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${user.isActive === false ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>{user.isActive === false ? "Suspended" : "Active"}</span></td><td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(user.createdAt)}</td><td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(user.lastLoginAt)}</td><td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(user.lastActiveAt)}</td><td className="px-4 py-3">{user.resumeCount ?? 0}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" title="View profile" aria-label={`View ${user.name}`} onClick={() => loadDetails(user)} className="flex min-h-10 min-w-10 items-center justify-center rounded text-slate-600 hover:bg-slate-100"><Eye className="size-4" /></button><button type="button" title="Edit profile" aria-label={`Edit ${user.name}`} onClick={() => openEdit(user)} className="flex min-h-10 min-w-10 items-center justify-center rounded text-blue-600 hover:bg-blue-50"><Pencil className="size-4" /></button><button type="button" title={user.isActive === false ? "Reactivate" : "Suspend"} aria-label={`${user.isActive === false ? "Reactivate" : "Suspend"} ${user.name}`} disabled={working || isSelf} onClick={() => toggleStatus(user)} className="flex min-h-10 min-w-10 items-center justify-center rounded text-amber-600 hover:bg-amber-50 disabled:opacity-30">{user.isActive === false ? <Check className="size-4" /> : <UserRoundX className="size-4" />}</button><button type="button" title={isSelf ? "You cannot delete your own account" : "Delete account"} aria-label={`Delete ${user.name}`} disabled={working || isSelf} onClick={() => setDeleteTarget(user)} className="flex min-h-10 min-w-10 items-center justify-center rounded text-red-600 hover:bg-red-50 disabled:opacity-30"><Trash2 className="size-4" /></button></div></td></tr>; })}</tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between border-t px-5 py-3 text-sm"><span className="text-gray-500">Showing {loadError ? "—" : users.length} of {total ?? "—"}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="flex min-h-10 min-w-10 items-center justify-center rounded border disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="size-4" /></button><button type="button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)} className="flex min-h-10 min-w-10 items-center justify-center rounded border disabled:opacity-40" aria-label="Next page"><ChevronRight className="size-4" /></button></div></footer>
      </div>

      {editingUser && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:items-center sm:p-6"><form role="dialog" aria-modal="true" aria-labelledby="edit-user-title" onSubmit={saveEdit} className="my-auto w-full max-w-lg space-y-4 rounded-xl bg-white p-5 shadow-xl"><header className="flex items-center justify-between"><h2 id="edit-user-title" className="text-lg font-semibold">Edit user profile</h2><button type="button" onClick={() => setEditingUser(null)} className="flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-gray-100" aria-label="Close"><X className="size-5" /></button></header><label className="block text-sm font-medium">Full name<input maxLength={100} value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} className="mt-1 min-h-11 w-full rounded-lg border px-3" required /></label><label className="block text-sm font-medium">Email<input type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} className="mt-1 min-h-11 w-full rounded-lg border px-3" required /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingUser(null)} className="min-h-11 rounded-lg border px-4">Cancel</button><button disabled={working} className="min-h-11 rounded-lg bg-blue-600 px-4 font-semibold text-white disabled:opacity-50">{working ? "Saving…" : "Save profile"}</button></div></form></div>}

      {viewingUser && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:items-center sm:p-6"><section role="dialog" aria-modal="true" aria-labelledby="view-user-title" className="my-auto w-full max-w-xl rounded-xl bg-white p-5 shadow-xl"><header className="mb-4 flex items-center justify-between"><h2 id="view-user-title" className="text-lg font-semibold">User profile</h2><button type="button" onClick={() => setViewingUser(null)} aria-label="Close profile" className="flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-gray-100"><X className="size-5" /></button></header>{viewingUser.loading ? <p className="py-8 text-center text-gray-500">Loading profile…</p> : <><div className="grid gap-3 sm:grid-cols-2">{[["Name", viewingUser.name], ["Email", viewingUser.email], ["Role", viewingUser.role], ["Status", viewingUser.isActive === false ? "Suspended" : "Active"], ["Registered", formatDate(viewingUser.createdAt)], ["Last login", formatDate(viewingUser.lastLoginAt)], ["Last active", formatDate(viewingUser.lastActiveAt)], ["Resume count", viewingUser.resumeCount ?? 0]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>)}</div><h3 className="mt-5 font-semibold">Saved resumes</h3><ul className="mt-2 divide-y">{viewingUser.resumes?.length ? viewingUser.resumes.map((resume) => <li key={resume._id} className="flex justify-between gap-3 py-2 text-sm"><span>{resume.title}</span><span className="text-gray-500">{resume.template}</span></li>) : <li className="py-3 text-sm text-gray-500">No resumes saved.</li>}</ul></>}</section></div>}

      {deleteTarget && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:items-center sm:p-6"><section role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title" className="my-auto w-full max-w-md rounded-xl bg-white p-5 shadow-xl"><header className="flex items-center justify-between"><h2 id="delete-user-title" className="text-lg font-semibold">Permanently delete account?</h2><button type="button" onClick={() => setDeleteTarget(null)} aria-label="Close" className="flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-gray-100"><X className="size-5" /></button></header><div className="my-4 rounded-lg bg-red-50 p-4 text-sm text-red-900"><p className="font-semibold">{deleteTarget.name}</p><p className="mt-2">The user account and all {deleteTarget.resumeCount ?? 0} associated resumes will be permanently deleted. Tracked uploaded profile images are removed too. Legacy images may lack a storage ID, or the image provider may be unavailable; the app reports a cleanup warning. The audit log keeps only a non-email record reference.</p></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setDeleteTarget(null)} className="min-h-11 rounded-lg border px-4">Cancel</button><button type="button" disabled={working || String(deleteTarget._id) === String(adminId)} onClick={deleteUser} className="min-h-11 rounded-lg bg-red-600 px-4 font-semibold text-white disabled:opacity-50">{working ? "Deleting…" : "Delete account and resumes"}</button></div></section></div>}
    </section>
  );
};

export default AdminUsers;
