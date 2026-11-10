import React from "react";

export const Template18 = ({ resumeData, accentColor }) => {
  const { personal_info, professional_summary, experience, education, project, skills } = resumeData || {};
  return (
    <div className="grid grid-cols-12 min-h-[1000px] bg-white text-sm font-sans">
      <div className="col-span-4 bg-slate-900 text-white p-6 flex flex-col justify-between">
        <div>
          {personal_info?.image && (
            <img src={personal_info.image} alt="Profile" className="size-28 rounded-full object-cover mx-auto mb-4 border-2 border-white/20" />
          )}
          <h1 className="text-xl font-bold text-center">{personal_info?.full_name || "Jane Doe"}</h1>
          <p className="text-xs text-center text-slate-400 mt-1">{personal_info?.job_title || "Specialist"}</p>
          <div className="mt-6 space-y-2 text-xs text-slate-300">
            {personal_info?.email && <p className="truncate">✉ {personal_info.email}</p>}
            {personal_info?.phone && <p>📞 {personal_info.phone}</p>}
            {personal_info?.location && <p>📍 {personal_info.location}</p>}
          </div>
          {skills?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">Core Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-[11px]">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-8 p-8 space-y-6">
        {professional_summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: accentColor || "#2563EB" }}>About Me</h2>
            <p className="text-slate-700 text-xs leading-relaxed">{professional_summary}</p>
          </div>
        )}
        {experience?.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: accentColor || "#2563EB" }}>Work Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>{exp.position}</span>
                    <span className="text-xs text-slate-500">{exp.start_date} - {exp.end_date}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600">{exp.company}</p>
                  <p className="text-xs text-slate-500 mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
