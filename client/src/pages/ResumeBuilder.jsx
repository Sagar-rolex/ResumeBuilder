import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileText,
  FolderIcon,
  GraduationCap,
  Award,
  Languages,
  Trophy,
  Share2Icon,
  Sparkles,
  User,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import PersonalInfoForm from "../components/PersonalInfoForm";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import ProfessionalSummaryForm from "../components/ProfessionalSummaryForm";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";
import SimpleListForm from "../components/SimpleListForm";
import AtsScoreModal from "../components/AtsScoreModal";
import JobMatcherModal from "../components/JobMatcherModal";
import InterviewPrepModal from "../components/InterviewPrepModal";
import AuthModal from "../components/AuthModal";
import { useSelector } from "react-redux";
import api from "../api";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { createEmptyResumeData } from "../utils/resumeData";

const SECTIONS = [
  { id: "personal", name: "Personal Info", icon: User },
  { id: "summary", name: "Summary", icon: FileText },
  { id: "experience", name: "Experience", icon: Briefcase },
  { id: "education", name: "Education", icon: GraduationCap },
  { id: "projects", name: "Projects", icon: FolderIcon },
  { id: "skills", name: "Skills", icon: Sparkles },
  { id: "certifications", name: "Certifications", icon: Award },
  { id: "languages", name: "Languages", icon: Languages },
  { id: "achievements", name: "Achievements", icon: Trophy },
];

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const [searchParams] = useSearchParams();
  const templateQuery = searchParams.get("template");
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const [reloadKey, setReloadKey] = useState(0);

  const isGuest = resumeId === "guest";
  const [resumeData, setResumeData] = useState(() => createEmptyResumeData({ template: templateQuery || "template-1" }));
  const [isLoadingResume, setIsLoadingResume] = useState(!isGuest);
  const [resumeLoadError, setResumeLoadError] = useState("");

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [mobileView, setMobileView] = useState("edit");
  const [removeBackground, setRemoveBackground] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [showJobMatcher, setShowJobMatcher] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const activeSection = SECTIONS[activeSectionIndex];

  const exportToWord = () => {
    if (!token && isGuest) {
      setShowAuthModal(true);
      return;
    }
    const previewEl = document.getElementById("resume-preview");
    if (!previewEl) return;
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${resumeData.title || "Resume"}</title></head>
      <body>${previewEl.innerHTML}</body>
      </html>
    `;
    const blob = new Blob(['﻿' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.title || "Resume"}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Word document exported successfully!");
  };

  useEffect(() => {
    mountedRef.current = true;
    if (isGuest) {
      setResumeData(createEmptyResumeData({ template: templateQuery || "template-1" }));
      setResumeLoadError("");
      setIsLoadingResume(false);
      return () => { mountedRef.current = false; };
    }

    setIsLoadingResume(true);
    setResumeLoadError("");
    if (!/^[0-9a-fA-F]{24}$/.test(resumeId || "")) {
      setResumeLoadError("This resume link is invalid. Return to your dashboard and open a resume from your list.");
      setIsLoadingResume(false);
      return () => { mountedRef.current = false; };
    }

    const loadExistingResume = async () => {
      try {
        const { data } = await api.get(`/resumes/get/${resumeId}`, {
          headers: { Authorization: token },
        });
        if (!data.resume) throw new Error("Resume data was not returned by the server.");
        if (mountedRef.current) {
          setResumeData(createEmptyResumeData(data.resume));
          document.title = data.resume.title || "Resume Builder";
        }
      } catch (error) {
        console.error("Failed to load resume", { status: error?.response?.status, code: error?.response?.data?.code });
        if (mountedRef.current) {
          setResumeLoadError(error?.response?.status === 404
            ? "This resume was not found or is no longer available."
            : error?.response?.data?.message || "We couldn't load this resume. Check your connection and try again.");
        }
      } finally {
        if (mountedRef.current) setIsLoadingResume(false);
      }
    };
    loadExistingResume();
    return () => { mountedRef.current = false; };
  }, [resumeId, token, isGuest, templateQuery, reloadKey]);

  const downloadResume = () => {
    if (!token && isGuest) {
      setShowAuthModal(true);
      return;
    }
    window.print();
  };

  const saveResume = async () => {
    if (!token && isGuest) {
      setShowAuthModal(true);
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updatedResumeData = structuredClone(resumeData);
      delete updatedResumeData._id;
      delete updatedResumeData.user;

      let data;
      if (isGuest) {
        ({ data } = await api.post("/resumes/create", {
          title: updatedResumeData.title,
          resumeData: updatedResumeData,
        }, { headers: { Authorization: token } }));
      } else {
        const formData = new FormData();
        formData.append("resumeId", resumeId);
        formData.append("resumeData", JSON.stringify(updatedResumeData));
        ({ data } = await api.put("/resumes/update", formData, {
          headers: { Authorization: token },
        }));
      }

      if (data.resume || data.resumeId) {
        const newId = data.resume?._id || data.resumeId;
        toast.success("Resume saved successfully!");
        if (isGuest) {
          navigate(`/app/builder/${newId}`);
        }
      } else {
        throw new Error("The server did not confirm that the resume was saved.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save resume");
    } finally {
      if (mountedRef.current) setIsSaving(false);
    }
  };

  if (isLoadingResume) return <Loader />;

  if (resumeLoadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Resume unavailable</h1>
          <p className="mt-3 text-sm text-slate-600" role="alert">{resumeLoadError}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => setReloadKey((key) => key + 1)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Try again</button>
            <button onClick={() => navigate("/app")} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-3 sm:px-5 xl:px-6 py-2 sm:py-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sticky top-0 z-40 shadow-xs">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <Link
            to={token ? "/app" : "/"}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl p-2 text-xs sm:text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeftIcon className="size-4" />
            <span>{token ? "Dashboard" : "Home"}</span>
          </Link>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <h1 className="min-w-0 max-w-[32vw] sm:max-w-md truncate font-semibold text-xs sm:text-base text-slate-800">
            {resumeData.title || "Untitled Resume"}
          </h1>
          {isGuest && (
            <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
              Guest Mode
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="ml-auto flex min-w-0 items-center justify-end gap-1 sm:gap-2 xl:gap-3">
          <button
            onClick={() => setShowAtsModal(true)}
            className="hidden xl:flex min-h-11 items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition border border-blue-200/60"
          >
            <ShieldCheck className="size-4" />
            <span>ATS Score</span>
          </button>
          <button
            onClick={() => setShowJobMatcher(true)}
            className="hidden xl:flex min-h-11 items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition border border-blue-200/60"
          >
            <Sparkles className="size-4" />
            <span>AI Matcher</span>
          </button>
          <button
            onClick={() => setShowInterviewModal(true)}
            className="hidden xl:flex min-h-11 items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl transition border border-purple-200/60"
          >
            <HelpCircle className="size-4" />
            <span>Interview Prep</span>
          </button>

          <details className="relative xl:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">More</summary>
            <div className="absolute right-0 top-full z-50 mt-2 grid w-52 max-w-[calc(100vw-1.5rem)] gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              <button onClick={(event) => { event.currentTarget.closest("details").open = false; setShowAtsModal(true); }} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm text-blue-700 hover:bg-blue-50"><ShieldCheck className="size-4" />ATS Score</button>
              <button onClick={(event) => { event.currentTarget.closest("details").open = false; setShowJobMatcher(true); }} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm text-blue-700 hover:bg-blue-50"><Sparkles className="size-4" />AI Matcher</button>
              <button onClick={(event) => { event.currentTarget.closest("details").open = false; setShowInterviewModal(true); }} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm text-purple-700 hover:bg-purple-50"><HelpCircle className="size-4" />Interview Prep</button>
            </div>
          </details>

          <button
            onClick={exportToWord}
            className="flex min-h-11 min-w-10 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            title="Download Word (.doc)"
          >
            <DownloadIcon className="size-4 text-blue-600" />
            <span className="hidden sm:inline">Word</span>
          </button>

          <button
            onClick={downloadResume}
            className="flex min-h-11 min-w-10 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            title="Download PDF"
          >
            <DownloadIcon className="size-4 text-rose-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={saveResume}
            disabled={isSaving}
            className="min-h-11 whitespace-nowrap rounded-xl bg-blue-600 px-3 sm:px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : isGuest ? "Save & Register" : "Save"}
          </button>
        </div>
      </nav>

      <div className="relative z-30 flex items-center justify-center gap-2 border-b border-slate-200 bg-white p-2 xl:hidden" role="tablist" aria-label="Resume workspace">
        <button type="button" role="tab" aria-selected={mobileView === "edit"} onClick={() => setMobileView("edit")} className={`min-h-11 flex-1 max-w-40 rounded-lg px-4 text-sm font-semibold ${mobileView === "edit" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>Edit</button>
        <button type="button" role="tab" aria-selected={mobileView === "preview"} onClick={() => setMobileView("preview")} className={`min-h-11 flex-1 max-w-40 rounded-lg px-4 text-sm font-semibold ${mobileView === "preview" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>Preview</button>
      </div>

      {/* Main Builder Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 xl:overflow-hidden">
        {/* Left Form Panel */}
        <div className={`${mobileView === "edit" ? "flex" : "hidden"} xl:flex min-h-[65vh] flex-col bg-white border-slate-200 xl:col-span-5 2xl:col-span-4 xl:h-[calc(100dvh-65px)] xl:min-h-0 xl:border-r`}>
          {/* Step Tabs Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step {activeSectionIndex + 1} of {SECTIONS.length}
              </span>
              <span className="text-xs font-semibold text-blue-600">
                {Math.round(((activeSectionIndex + 1) / SECTIONS.length) * 100)}% Completed
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((activeSectionIndex + 1) / SECTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Section Navigation Pills */}
          <div className="flex items-center gap-2 px-3 sm:px-6 py-3 border-b border-slate-200 overflow-x-auto no-scrollbar bg-white touch-pan-x">
            {SECTIONS.map((section, index) => {
              const Icon = section.icon;
              const isActive = index === activeSectionIndex;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionIndex(index)}
                  className={`flex min-h-11 shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Section Form Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">{activeSection.name}</h2>
              <span className="text-xs text-slate-400">Fill in details</span>
            </div>

            {activeSection.id === "personal" && (
              <PersonalInfoForm
                data={resumeData.personal_info}
                onChange={(personalInfo) => setResumeData((prev) => ({ ...prev, personal_info: personalInfo }))}
                removeBackground={removeBackground}
                setRemoveBackground={setRemoveBackground}
              />
            )}
            {activeSection.id === "summary" && (
              <ProfessionalSummaryForm
                data={resumeData.professional_summary}
                onChange={(professional_summary) => setResumeData((prev) => ({ ...prev, professional_summary }))}
                setResumeData={setResumeData}
              />
            )}
            {activeSection.id === "experience" && (
              <ExperienceForm data={resumeData.experience} onChange={(experience) => setResumeData((prev) => ({ ...prev, experience }))} />
            )}
            {activeSection.id === "education" && (
              <EducationForm data={resumeData.education} onChange={(education) => setResumeData((prev) => ({ ...prev, education }))} />
            )}
            {activeSection.id === "projects" && (
              <ProjectForm data={resumeData.project} onChange={(project) => setResumeData((prev) => ({ ...prev, project }))} />
            )}
            {activeSection.id === "skills" && (
              <SkillsForm data={resumeData.skills} onChange={(skills) => setResumeData((prev) => ({ ...prev, skills }))} />
            )}
            {activeSection.id === "certifications" && (
              <SimpleListForm title="Certifications" data={resumeData.certifications} onChange={(certifications) => setResumeData((prev) => ({ ...prev, certifications }))} placeholder="Certification or license" />
            )}
            {activeSection.id === "languages" && (
              <SimpleListForm title="Languages" data={resumeData.languages} onChange={(languages) => setResumeData((prev) => ({ ...prev, languages }))} placeholder="Language and proficiency" />
            )}
            {activeSection.id === "achievements" && (
              <SimpleListForm title="Achievements" data={resumeData.achievements} onChange={(achievements) => setResumeData((prev) => ({ ...prev, achievements }))} placeholder="Achievement" />
            )}
          </div>

          {/* Form Footer Navigation */}
          <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
            <button
              disabled={activeSectionIndex === 0}
              onClick={() => setActiveSectionIndex((prev) => Math.max(0, prev - 1))}
              className="min-h-11 px-3 sm:px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
              <span>Previous</span>
            </button>
            <button
              disabled={activeSectionIndex === SECTIONS.length - 1}
              onClick={() => setActiveSectionIndex((prev) => Math.min(SECTIONS.length - 1, prev + 1))}
              className="min-h-11 px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-40 flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Right Preview & Customization Panel */}
        <div className={`${mobileView === "preview" ? "flex" : "hidden"} xl:flex min-h-[70vh] bg-slate-100 flex-col xl:col-span-7 2xl:col-span-8 xl:h-[calc(100dvh-65px)] xl:min-h-0 xl:overflow-hidden`}>
          {/* Customization Toolbar */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap shadow-xs">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <TemplateSelector resumeData={resumeData} setResumeData={setResumeData} />
              <div className="h-5 w-px bg-slate-200" />
              <ColorPicker resumeData={resumeData} setResumeData={setResumeData} />
            </div>
          </div>

          {/* Resume Preview Canvas Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 md:p-10 flex justify-center items-start">
            <div className="bg-white shadow-2xl rounded-xl overflow-hidden max-w-[850px] w-full min-h-[1000px] border border-slate-200 origin-top transition-transform">
              <ResumePreview resumeData={resumeData} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAtsModal && (
        <AtsScoreModal resumeData={resumeData} onClose={() => setShowAtsModal(false)} />
      )}
      {showJobMatcher && (
        <JobMatcherModal resumeData={resumeData} onClose={() => setShowJobMatcher(false)} />
      )}
      {showInterviewModal && (
        <InterviewPrepModal resumeData={resumeData} onClose={() => setShowInterviewModal(false)} />
      )}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          saveResume();
        }}
      />
    </div>
  );
};

export default ResumeBuilder;
