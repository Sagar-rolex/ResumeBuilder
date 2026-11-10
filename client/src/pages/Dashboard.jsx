import {
  FilePenLineIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  UploadCloudIcon,
  XIcon,
  Sparkles,
  ArrowUpRight,
  Briefcase,
  LogOut,
  User,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../app/features/authSlice";
import api from "../api";
import toast from "react-hot-toast";
import pdfToText from "react-pdftotext";

const COLORS = ["#2563eb", "#7c3aed", "#0ea5e9", "#d97706", "#dc2626"];

const Dashboard = () => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState("");
  const createLock = useRef(false);
  const uploadLock = useRef(false);

  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const loadAllResumes = useCallback(async () => {
    try {
      const { data } = await api.get("/users/resumes", {
        headers: { Authorization: token },
      });
      if (mountedRef.current) {
        setAllResumes(data.resumes);
        setLoadError("");
      }
    } catch (error) {
      if (mountedRef.current) setLoadError(error?.response?.data?.message || "Failed to load resumes");
      toast.error(error?.response?.data?.message || "Failed to load resumes");
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    mountedRef.current = true;
    loadAllResumes();
    return () => { mountedRef.current = false; };
  }, [loadAllResumes]);

  const createResume = async (event) => {
    event.preventDefault();
    if (createLock.current || !title.trim()) return;
    createLock.current = true;
    setIsCreating(true);
    try {
      const { data } = await api.post(
        "/resumes/create",
        { title },
        { headers: { Authorization: token } }
      );
      if (!/^[0-9a-fA-F]{24}$/.test(data.resume?._id || "")) {
        throw new Error("The server did not return a valid resume. Please try again.");
      }
      if (mountedRef.current) {
        setAllResumes((prev) => [...prev, data.resume]);
        setTitle("");
        setShowCreateResume(false);
      }
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to create resume");
    } finally {
      createLock.current = false;
      if (mountedRef.current) setIsCreating(false);
    }
  };

  const uploadResume = async (event) => {
    event.preventDefault();
    if (uploadLock.current || !resume || !title.trim()) return;
    uploadLock.current = true;
    setIsUploading(true);
    try {
      setUploadStage("Checking PDF…");
      if (resume.size === 0 || resume.size > 10 * 1024 * 1024) {
        throw new Error("Choose a PDF file smaller than 10 MB.");
      }
      const signature = await resume.slice(0, 5).text();
      if (signature !== "%PDF-") {
        throw new Error("This file is not a valid PDF. Choose a PDF document and try again.");
      }

      setUploadStage("Extracting text from PDF…");
      let resumeText;
      try {
        resumeText = await pdfToText(resume);
      } catch {
        throw new Error("Unable to read this PDF. It may be damaged or password-protected. Try another PDF.");
      }
      if (typeof resumeText !== "string" || resumeText.trim().length < 20) {
        throw new Error("No readable text was found in this PDF. Scanned PDFs need OCR; try a text-based PDF or enter your details manually.");
      }

      setUploadStage("Parsing and saving resume…");
      const { data } = await api.post(
        "/ai/upload-resume",
        { title: title.trim(), resumeText },
        { headers: { Authorization: token } }
      );
      if (!data.resumeId) throw new Error("The parser did not return a saved resume. Please try again.");
      if (mountedRef.current) {
        setTitle("");
        setResume(null);
        setShowUploadResume(false);
      }
      toast.success(data.message || "Resume imported successfully");
      navigate(`/app/builder/${data.resumeId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Unable to process this PDF. Please try again.");
    } finally {
      uploadLock.current = false;
      if (mountedRef.current) setUploadStage("");
      if (mountedRef.current) setIsUploading(false);
    }
  };

  const selectResumeFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    if (!hasPdfExtension || (file.type && file.type !== "application/pdf")) {
      setResume(null);
      event.target.value = "";
      toast.error("Choose a PDF file.");
      return;
    }
    if (!file.size || file.size > 10 * 1024 * 1024) {
      setResume(null);
      event.target.value = "";
      toast.error("Choose a PDF file smaller than 10 MB.");
      return;
    }
    setResume(file);
  };

  const editTitle = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      const { data } = await api.put(
        "/resumes/update",
        { resumeId: editResumeId, resumeData: { title } },
        { headers: { Authorization: token } }
      );
      if (mountedRef.current) {
        setAllResumes((prev) =>
          prev.map((r) => (r._id === editResumeId ? { ...r, title } : r))
        );
        setTitle("");
        setEditResumeId("");
      }
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update title");
    }
  };

  const deleteResume = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`/resumes/delete/${resumeId}`, {
        headers: { Authorization: token },
      });
      if (mountedRef.current) {
        setAllResumes((prev) => prev.filter((r) => r._id !== resumeId));
      }
      toast.success("Resume deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete resume");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/");
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Dashboard Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-16 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-600">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <FilePenLineIcon className="size-5" />
            </div>
            <span>ResumeCraft<span className="text-slate-900">.ai</span></span>
          </a>
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700">
            <User className="size-4 text-blue-600" />
            <span className="max-w-[32vw] truncate">{user?.name || "My Account"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50"
            title="Log out"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium text-blue-600">Welcome back, {user?.name || "there"}</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Resumes</h1>
            <p className="text-sm text-slate-500 mt-1">{user?.email} · Create, manage and optimize your professional resumes with AI.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <button
              onClick={() => setShowCreateResume(true)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 cursor-pointer"
            >
              <PlusIcon className="size-4" />
              <span>New Resume</span>
            </button>
            <button
              onClick={() => setShowUploadResume(true)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 shadow-xs transition-all hover:bg-slate-50 cursor-pointer"
            >
              <UploadCloudIcon className="size-4 text-slate-500" />
              <span>Upload PDF</span>
            </button>
          </div>
        </div>

        {/* Resumes Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-500" role="status">Loading your resumes…</div>
        ) : loadError ? (
          <div className="py-12 text-center text-sm text-red-600" role="alert">
            <p>{loadError}</p>
            <button onClick={loadAllResumes} className="mt-3 font-medium underline">Try again</button>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Quick Create Card */}
          <button
            onClick={() => setShowCreateResume(true)}
            className="bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl h-60 flex flex-col items-center justify-center gap-3 group transition-all cursor-pointer p-6 hover:shadow-lg"
          >
            <div className="size-14 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
              <PlusIcon className="size-6" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">Create Blank Resume</p>
              <p className="text-xs text-slate-400 mt-1">Start from scratch with AI guidance</p>
            </div>
          </button>

          {allResumes.map((resume, index) => {
            const baseColor = COLORS[index % COLORS.length];
            return (
              <div
                key={resume._id}
                onClick={() => navigate(`/app/builder/${resume._id}`)}
                className="bg-white border border-slate-200/80 rounded-2xl h-60 flex flex-col justify-between p-6 relative group hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: baseColor }} />

                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                    <FilePenLineIcon className="size-6" style={{ color: baseColor }} />
                  </div>
                  <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/app/builder/${resume._id}`)}
                      className="flex min-h-10 min-w-10 items-center justify-center rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50"
                      title="Edit resume"
                      aria-label={`Edit ${resume.title}`}
                    >
                      <FilePenLineIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/app/preview/${resume._id}`)}
                      className="flex min-h-10 min-w-10 items-center justify-center rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
                      title="Preview resume"
                      aria-label={`Preview ${resume.title}`}
                    >
                      <EyeIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditResumeId(resume._id);
                        setTitle(resume.title);
                      }}
                      className="flex min-h-10 min-w-10 items-center justify-center rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
                      title="Rename"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => deleteResume(resume._id)}
                      className="flex min-h-10 min-w-10 items-center justify-center rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
                      title="Delete"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="break-words font-bold text-slate-900 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {resume.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {resume.template || "Classic"} template · Updated {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Open Builder</span>
                  <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
        )}

        {!isLoading && !loadError && allResumes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-6 shadow-xs">
            <Briefcase className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-700">You haven&apos;t created any resumes yet.</p>
            <p className="text-sm text-slate-400 mt-1">Create your first resume or upload a PDF to get started.</p>
            <button
              onClick={() => setShowCreateResume(true)}
              className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition"
            >
              Create Your First Resume
            </button>
          </div>
        )}

        {/* ── Create Resume Modal ──────────────────────────────────── */}
        {showCreateResume && (
          <Modal onClose={() => { setShowCreateResume(false); setTitle(""); }}>
            <div className="text-left">
              <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <FilePenLineIcon className="size-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Create New Resume</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">Give your resume a title to organize your applications.</p>
              <form onSubmit={createResume}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Resume Title</label>
                <input
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-6 outline-none transition"
                  required
                  autoFocus
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isCreating}
                    onClick={() => setShowCreateResume(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button disabled={isCreating} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-md transition disabled:opacity-50">
                    {isCreating ? "Creating…" : "Create Resume"}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {/* ── Upload Resume Modal ──────────────────────────────────── */}
        {showUploadResume && (
          <Modal onClose={() => { setShowUploadResume(false); setTitle(""); setResume(null); }}>
            <div className="text-left">
              <div className="size-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <UploadCloudIcon className="size-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Upload Existing Resume</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">Upload your PDF resume and AI will parse it into our builder.</p>
              <form onSubmit={uploadResume}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Resume Title</label>
                <input
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  type="text"
                  placeholder="e.g. Product Manager Resume"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-4 outline-none transition"
                  required
                  autoFocus
                />
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Resume File (PDF)</label>
                <label htmlFor="resume-input" className="block border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50 mb-6">
                  {resume ? (
                    <div className="flex items-center justify-center gap-2 text-blue-700 font-medium text-sm">
                      <FilePenLineIcon className="size-5" />
                      <span>{resume.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <UploadCloudIcon className="size-10 text-slate-400" />
                      <p className="text-sm font-medium">Click to browse or drag & drop PDF</p>
                      <p className="text-xs text-slate-400">PDF up to 10MB</p>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  id="resume-input"
                  accept=".pdf"
                  hidden
                  disabled={isUploading}
                  onChange={selectResumeFile}
                />
                {isUploading && <p className="mb-4 text-sm text-purple-700" role="status" aria-live="polite">{uploadStage || "Processing PDF…"}</p>}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => setShowUploadResume(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isUploading || !resume || !title.trim()}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUploading && <LoaderCircleIcon className="animate-spin size-4" />}
                    {isUploading ? uploadStage || "Processing…" : "Upload & Parse"}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {/* ── Edit Title Modal ──────────────────────────────────────── */}
        {editResumeId && (
          <Modal onClose={() => { setEditResumeId(""); setTitle(""); }}>
            <div className="text-left">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Rename Resume</h2>
              <form onSubmit={editTitle}>
                <input
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  type="text"
                  placeholder="Resume title"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm mb-6 outline-none"
                  required
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditResumeId("")}
                    className="px-5 py-2.5 rounded-xl border text-slate-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

const Modal = ({ children, onClose }) => (
  <div
    role="presentation"
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start sm:items-center justify-center overflow-y-auto p-3 sm:p-4 animate-fadeIn"
    onClick={onClose}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Resume dialog"
      onClick={(e) => e.stopPropagation()}
      className="my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-md p-4 sm:p-6 relative"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute top-3 right-3 flex min-h-11 min-w-11 items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
        onClick={onClose}
      >
        <XIcon className="size-5" />
      </button>
      {children}
    </div>
  </div>
);

export default Dashboard;
