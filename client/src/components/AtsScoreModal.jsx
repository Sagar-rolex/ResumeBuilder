import React, { useMemo } from "react";
import { XIcon, AwardIcon, CheckCircle2Icon, AlertTriangleIcon, SparklesIcon } from "lucide-react";

const AtsScoreModal = ({ resumeData, onClose }) => {
  const analysis = useMemo(() => {
    let score = 0;
    const checks = [];

    // 1. Contact Info (20 pts)
    const pi = resumeData?.personal_info || {};
    let contactScore = 0;
    if (pi.full_name) contactScore += 5;
    if (pi.email) contactScore += 5;
    if (pi.phone) contactScore += 5;
    if (pi.location) contactScore += 5;
    score += contactScore;
    checks.push({
      label: "Contact Information",
      passed: contactScore === 20,
      details: contactScore === 20 ? "Complete name, email, phone, and location provided." : "Missing some contact details (name, email, phone, or location).",
    });

    // 2. Professional Summary (15 pts)
    const summary = resumeData?.professional_summary || "";
    const summaryPassed = summary.length > 50;
    if (summaryPassed) score += 15;
    checks.push({
      label: "Professional Summary",
      passed: summaryPassed,
      details: summaryPassed ? "Good summary length and description." : "Summary is too short or missing. Add a 2-3 sentence overview.",
    });

    // 3. Experience (25 pts)
    const exp = resumeData?.experience || [];
    const expPassed = exp.length > 0;
    if (expPassed) score += 25;
    checks.push({
      label: "Work Experience",
      passed: expPassed,
      details: expPassed ? `${exp.length} work experience entry/entries found.` : "No work experience listed. Add your relevant roles.",
    });

    // 4. Education (15 pts)
    const edu = resumeData?.education || [];
    const eduPassed = edu.length > 0;
    if (eduPassed) score += 15;
    checks.push({
      label: "Education",
      passed: eduPassed,
      details: eduPassed ? `${edu.length} education entry/entries found.` : "No education history listed.",
    });

    // 5. Skills (15 pts)
    const skills = resumeData?.skills || [];
    const skillsPassed = skills.length >= 5;
    if (skills.length > 0) score += 10;
    if (skillsPassed) score += 5;
    checks.push({
      label: "Skills Section",
      passed: skillsPassed,
      details: skills.length >= 5 ? `${skills.length} skills listed (great for ATS keyword matching).` : "Add at least 5-10 key skills for better ATS matching.",
    });

    // 6. Projects (10 pts)
    const proj = resumeData?.project || [];
    const projPassed = proj.length > 0;
    if (projPassed) score += 10;
    checks.push({
      label: "Projects & Portfolio",
      passed: projPassed,
      details: projPassed ? `${proj.length} project(s) listed.` : "Consider adding key projects to showcase practical experience.",
    });

    return { score: Math.min(score, 100), checks };
  }, [resumeData]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center overflow-y-auto p-3 sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="ats-score-title" className="relative my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-4 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close ATS score"
          className="absolute top-3 right-3 flex min-h-11 min-w-11 items-center justify-center rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <XIcon className="size-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <AwardIcon className="size-7" />
          </div>
          <div>
            <h2 id="ats-score-title" className="text-xl font-bold text-slate-800 dark:text-white">ATS Compatibility Score</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Automated resume parsing analysis</p>
          </div>
        </div>

        {/* Score Circle / Meter */}
        <div className="flex items-center justify-center my-6">
          <div className="relative flex flex-col items-center justify-center w-36 h-36 rounded-full border-8 border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/40">
            <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{analysis.score}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">ATS Ready</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-6">
          {analysis.checks.map((check, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
              {check.passed ? (
                <CheckCircle2Icon className="size-5 text-blue-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangleIcon className="size-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{check.label}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{check.details}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          Got it, back to editing
        </button>
      </div>
    </div>
  );
};

export default AtsScoreModal;
