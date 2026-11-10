import React, { useState } from "react";
import { XIcon, BriefcaseIcon, CheckCircleIcon, SparklesIcon, AlertCircleIcon } from "lucide-react";

const JobMatcherModal = ({ resumeData, onClose }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMatch = (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      // Simple heuristic keyword matcher
      const jdLower = jobDescription.toLowerCase();
      const skills = (resumeData?.skills || []).map(s => typeof s === "string" ? s.toLowerCase() : s.name?.toLowerCase()).filter(Boolean);

      // Extract common tech/professional keywords from JD
      const commonKeywords = ["react", "node", "javascript", "python", "java", "sql", "aws", "docker", "agile", "leadership", "communication", "typescript", "tailwind", "mongodb", "git", "rest", "api"];
      const foundKeywords = commonKeywords.filter(kw => jdLower.includes(kw));
      const matchedKeywords = foundKeywords.filter(kw => skills.some(s => s.includes(kw)) || jdLower.includes(kw));

      const matchScore = foundKeywords.length > 0
        ? Math.round((matchedKeywords.length / Math.max(foundKeywords.length, 1)) * 40 + 60)
        : 75;

      setMatchResult({
        score: Math.min(matchScore, 98),
        matched: matchedKeywords,
        missing: commonKeywords.filter(kw => jdLower.includes(kw) && !skills.some(s => s.includes(kw))),
      });
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center overflow-y-auto p-3 sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="job-matcher-title" className="relative my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl p-4 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close job matcher"
          className="absolute top-3 right-3 flex min-h-11 min-w-11 items-center justify-center rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <XIcon className="size-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <BriefcaseIcon className="size-7" />
          </div>
          <div>
            <h2 id="job-matcher-title" className="text-xl font-bold text-slate-800 dark:text-white">AI Job Matcher & Tailor</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Paste job description to check keyword alignment</p>
          </div>
        </div>

        {!matchResult ? (
          <form onSubmit={analyzeMatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Paste Target Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
                placeholder="Paste job description here (e.g. Looking for a Full Stack Developer with React, Node.js, AWS...)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm"
                required
              />
            </div>
            <button
              disabled={isAnalyzing || !jobDescription.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <SparklesIcon className="size-4" />
              {isAnalyzing ? "Analyzing Match..." : "Analyze Job Match"}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center bg-purple-50 dark:bg-purple-950/40 p-6 rounded-xl border border-purple-100 dark:border-purple-900/50">
              <div className="text-center">
                <span className="text-5xl font-extrabold text-purple-600 dark:text-purple-400">{matchResult.score}%</span>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">Job Match Score</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Matched Key Concepts</p>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.matched.length > 0 ? matchResult.matched.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      <CheckCircleIcon className="size-3" /> {kw}
                    </span>
                  )) : <p className="text-xs text-slate-400">No specific keywords matched yet.</p>}
                </div>
              </div>

              {matchResult.missing.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommended Keywords to Add</p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missing.map((kw, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <AlertCircleIcon className="size-3" /> {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMatchResult(null)}
              className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-slate-700 dark:text-white font-medium rounded-lg transition-colors"
            >
              Analyze Another Job Description
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatcherModal;
