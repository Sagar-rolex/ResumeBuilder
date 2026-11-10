import React, { useState } from "react";
import { Check, LayoutTemplate, X } from "lucide-react";
import { useTemplateCatalog } from "../contexts/templateCatalog";

const TemplateSelector = ({ resumeData, setResumeData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { templates, refresh } = useTemplateCatalog();
  const toggleOpen = () => {
    if (!isOpen) refresh();
    setIsOpen((current) => !current);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition"
      >
        <LayoutTemplate className="size-4 text-blue-600" />
        <span>Templates ({templates.length})</span>
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl max-h-[min(25rem,calc(100dvh-5rem))] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Select Template</h3>
            <button onClick={() => setIsOpen(false)} aria-label="Close template selector" className="flex min-h-11 min-w-11 items-center justify-center rounded text-slate-400 hover:text-slate-600">
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {templates.filter((template) => template.status === "published").map((t) => (
              <button
                key={t.templateId}
                onClick={() => {
                  setResumeData((prev) => ({ ...prev, template: t.templateId, accent_color: t.layout?.accentColor || prev.accent_color }));
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                  resumeData.template === t.templateId
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "hover:bg-slate-50 text-slate-700 border border-slate-100"
                }`}
              >
                <span>{t.name}</span>
                {resumeData.template === t.id && <Check className="size-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
