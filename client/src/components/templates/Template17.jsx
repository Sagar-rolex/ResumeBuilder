import React from "react";

export const Template17 = ({ resumeData, accentColor }) => {
  const { personal_info, professional_summary, experience, education, project, skills } = resumeData || {};
  return (
    <div className="p-8 font-sans text-slate-800 bg-white min-h-[1000px] text-sm">
      <div className="border-b-2 pb-4 mb-6" style={{ borderColor: accentColor || "#2563EB" }}>
        <h1 className="text-3xl font-bold" style={{ color: accentColor || "#2563EB" }}>
          {personal_info?.full_name || "John Doe"}
        </h1>
        <p className="text-base font-medium text-slate-600 mt-1">{personal_info?.job_title || "Professional"}</p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
          {personal_info?.email && <span>{personal_info.email}</span>}
          {personal_info?.phone && <span>{personal_info.phone}</span>}
          {personal_info?.location && <span>{personal_info.location}</span>}
          {personal_info?.linkedin && <span>{personal_info.linkedin}</span>}
        </div>
      </div>
      {professional_summary && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: accentColor || "#2563EB" }}>Professional Summary</h2>
          <p className="text-slate-700 leading-relaxed">{professional_summary}</p>
        </div>
      )}
      {experience?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: accentColor || "#2563EB" }}>Experience</h2>
          <div className="space-y-4">
            {experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between font-semibold">
                  <span>{exp.position} - {exp.company}</span>
                  <span className="text-xs text-slate-500">{exp.start_date} - {exp.end_date}</span>
                </div>
                <p className="text-slate-600 text-xs mt-0.5">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {skills?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: accentColor || "#2563EB" }}>Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
