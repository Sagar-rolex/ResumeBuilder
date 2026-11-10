import React, { useState } from "react";
import { Loader2, Sparkles, X, HelpCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../api";
import toast from "react-hot-toast";

const InterviewPrepModal = ({ isOpen, onClose, resumeData }) => {
  const { token } = useSelector((state) => state.auth);
  const [jobTitle, setJobTitle] = useState(resumeData?.personal_info?.profession || "");
  const [loading, setLoading] = useState(false);
  const [prepData, setPrepData] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      // Format resume text summary for AI
      const resumeText = `
Title: ${resumeData.title || ""}
Summary: ${resumeData.professional_summary || ""}
Skills: ${resumeData.skills?.join(", ") || ""}
Experience: ${resumeData.experience?.map(e => `${e.position} at ${e.company}: ${e.description}`).join("; ") || ""}
Projects: ${resumeData.project?.map(p => `${p.name} (${p.type}): ${p.description}`).join("; ") || ""}
      `.trim();

      const { data } = await api.post(
        "/ai/interview-prep",
        { resumeText, jobTitle },
        { headers: { Authorization: token } }
      );

      setPrepData(data);
      toast.success("Interview prep Q&A generated successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to generate interview prep");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-3 sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="interview-prep-title" className="my-auto bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-yellow-300" />
            <h2 id="interview-prep-title" className="text-lg font-bold">AI Interview Prep Q&A</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close interview preparation"
            className="flex min-h-11 min-w-11 items-center justify-center hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto min-h-0 flex-1 space-y-6">
          {!prepData ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-full mb-2">
                <HelpCircle className="size-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Practice smarter for your next interview</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Our AI will analyze your resume and generate tailored interview questions (Technical, Behavioral, and Situational) with expert talking points and tips.
              </p>

              <div className="max-w-md mx-auto space-y-3 pt-4">
                <label className="block text-sm font-medium text-gray-700 text-left">
                  Target Job Title / Role
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer, Product Manager"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Generating Q&A...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-5" />
                      Generate Interview Questions
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl">
                <div>
                  <h4 className="font-semibold text-blue-900">Target Role: {prepData.role}</h4>
                  <p className="text-xs text-blue-700">Customized based on your resume experience and skills</p>
                </div>
                <button
                  onClick={() => setPrepData(null)}
                  className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Regenerate
                </button>
              </div>

              <div className="space-y-3">
                {prepData.questions?.map((item, idx) => {
                  const isExpanded = expandedIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all"
                    >
                      <button
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 pr-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            item.category === 'Technical' ? 'bg-purple-100 text-purple-700' :
                            item.category === 'Behavioral' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {item.category || 'General'}
                          </span>
                          <span className="font-medium text-gray-900 text-sm md:text-base">
                            Q{idx + 1}. {item.question}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="size-5 text-gray-500 shrink-0" /> : <ChevronDown className="size-5 text-gray-500 shrink-0" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50 space-y-3 text-sm">
                          <div>
                            <span className="font-semibold text-gray-800 block mb-1">Suggested Answer / Talking Points:</span>
                            <p className="text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-200">
                              {item.suggested_answer}
                            </p>
                          </div>
                          {item.key_tips && (
                            <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-900">
                              <CheckCircle className="size-4 text-yellow-600 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-semibold">Key Tip:</span> {item.key_tips}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepModal;
