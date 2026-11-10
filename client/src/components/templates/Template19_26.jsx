import React from "react";
export const Template19 = ({ resumeData, accentColor }) => {
  const { personal_info, professional_summary, experience, skills } = resumeData || {};
  return (
    <div className="p-8 font-sans bg-white min-h-[1000px] text-sm">
      <div className="text-center pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: accentColor || "#2563EB" }}>{personal_info?.full_name || "Alex Smith"}</h1>
        <p className="text-sm font-semibold text-slate-600 mt-1">{personal_info?.job_title || "Engineer"}</p>
        <p className="text-xs text-slate-400 mt-1">{personal_info?.email} • {personal_info?.phone} • {personal_info?.location}</p>
      </div>
      <div className="mt-6 space-y-6">
        {professional_summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: accentColor || "#2563EB" }}>Summary</h2>
            <p className="text-slate-700 text-xs">{professional_summary}</p>
          </div>
        )}
        {experience?.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: accentColor || "#2563EB" }}>Experience</h2>
            {experience.map((e, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between font-semibold"><span>{e.position} at {e.company}</span><span className="text-xs text-slate-500">{e.start_date} - {e.end_date}</span></div>
                <p className="text-xs text-slate-600">{e.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export const Template20 = ({ resumeData, accentColor }) => {
  const { personal_info, professional_summary, experience, skills } = resumeData || {};
  return (
    <div className="p-8 font-serif bg-white min-h-[1000px] text-sm">
      <div className="border-l-4 pl-4 mb-6" style={{ borderColor: accentColor || "#2563EB" }}>
        <h1 className="text-3xl font-bold">{personal_info?.full_name || "David Miller"}</h1>
        <p className="text-sm text-slate-600">{personal_info?.job_title}</p>
      </div>
      {professional_summary && <p className="text-xs text-slate-700 mb-6">{professional_summary}</p>}
      {experience?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor || "#2563EB" }}>Experience</h2>
          {experience.map((e, i) => (
            <div key={i}>
              <p className="font-semibold">{e.position} - {e.company}</p>
              <p className="text-xs text-slate-500">{e.start_date} - {e.end_date}</p>
              <p className="text-xs text-slate-600 mt-1">{e.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export const Template21 = ({ resumeData, accentColor }) => {
  const { personal_info, professional_summary, experience, skills } = resumeData || {};
  return (
    <div className="p-8 bg-slate-50 min-h-[1000px] text-sm font-sans">
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 mb-6">
        <h1 className="text-2xl font-bold" style={{ color: accentColor || "#2563EB" }}>{personal_info?.full_name || "Sarah Connor"}</h1>
        <p className="text-sm text-slate-600">{personal_info?.job_title}</p>
      </div>
      {experience?.length > 0 && (
        <div className="space-y-4">
          {experience.map((e, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-900">{e.position} at {e.company}</p>
              <p className="text-xs text-slate-500">{e.start_date} - {e.end_date}</p>
              <p className="text-xs text-slate-600 mt-2">{e.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export const Template22 = ({ resumeData, accentColor }) => {
  const { personal_info, professional_summary, experience } = resumeData || {};
  return (
    <div className="p-8 bg-white min-h-[1000px] text-sm font-sans">
      <h1 className="text-3xl font-black uppercase tracking-wider" style={{ color: accentColor || "#2563EB" }}>{personal_info?.full_name || "Michael Jordan"}</h1>
      <p className="text-sm font-bold text-slate-500 mb-6">{personal_info?.job_title}</p>
      {experience?.length > 0 && (
        <div className="space-y-4 border-t pt-4 border-slate-200">
          {experience.map((e, i) => (
            <div key={i}>
              <p className="font-bold">{e.position}</p>
              <p className="text-xs text-slate-500">{e.company} | {e.start_date} - {e.end_date}</p>
              <p className="text-xs text-slate-700 mt-1">{e.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export const Template23 = ({ resumeData, accentColor }) => {
  const { personal_info, experience } = resumeData || {};
  return (
    <div className="p-8 bg-white min-h-[1000px] text-sm font-sans">
      <div className="text-center bg-slate-900 text-white p-6 rounded-lg mb-6">
        <h1 className="text-2xl font-bold">{personal_info?.full_name || "Chris Evans"}</h1>
        <p className="text-xs text-blue-400 mt-1">{personal_info?.job_title}</p>
      </div>
      {experience?.length > 0 && experience.map((e, i) => (
        <div key={i} className="mb-4">
          <p className="font-semibold">{e.position} @ {e.company}</p>
          <p className="text-xs text-slate-500">{e.start_date} - {e.end_date}</p>
          <p className="text-xs text-slate-600 mt-1">{e.description}</p>
        </div>
      ))}
    </div>
  );
};
export const Template24 = ({ resumeData, accentColor }) => {
  const { personal_info, experience } = resumeData || {};
  return (
    <div className="p-8 bg-white min-h-[1000px] text-sm font-sans">
      <h1 className="text-2xl font-bold border-b pb-2" style={{ borderColor: accentColor || "#2563EB", color: accentColor || "#2563EB" }}>{personal_info?.full_name || "Robert Downey"}</h1>
      <p className="text-xs text-slate-600 mt-1">{personal_info?.job_title}</p>
      {experience?.length > 0 && experience.map((e, i) => (
        <div key={i} className="mt-4">
          <p className="font-semibold">{e.position} - {e.company}</p>
          <p className="text-xs text-slate-500">{e.start_date} - {e.end_date}</p>
          <p className="text-xs text-slate-700 mt-1">{e.description}</p>
        </div>
      ))}
    </div>
  );
};
export const Template25 = ({ resumeData, accentColor }) => {
  const { personal_info, experience } = resumeData || {};
  return (
    <div className="p-8 bg-white min-h-[1000px] text-sm font-sans">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: accentColor || "#2563EB" }}>{personal_info?.full_name || "Tom Holland"}</h1>
          <p className="text-xs text-slate-600">{personal_info?.job_title}</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>{personal_info?.email}</p>
          <p>{personal_info?.phone}</p>
        </div>
      </div>
      {experience?.length > 0 && experience.map((e, i) => (
        <div key={i} className="mb-4">
          <p className="font-semibold">{e.position} at {e.company}</p>
          <p className="text-xs text-slate-500">{e.start_date} - {e.end_date}</p>
          <p className="text-xs text-slate-700 mt-1">{e.description}</p>
        </div>
      ))}
    </div>
  );
};
export const Template26 = ({ resumeData, accentColor }) => {
  const { personal_info, experience } = resumeData || {};
  return (
    <div className="p-8 bg-white min-h-[1000px] text-sm font-sans">
      <div className="border-t-4 pt-4" style={{ borderColor: accentColor || "#2563EB" }}>
        <h1 className="text-3xl font-bold">{personal_info?.full_name || "Chris Hemsworth"}</h1>
        <p className="text-sm text-slate-600">{personal_info?.job_title}</p>
      </div>
      {experience?.length > 0 && experience.map((e, i) => (
        <div key={i} className="mt-6">
          <p className="font-bold text-slate-900">{e.position} - {e.company}</p>
          <p className="text-xs text-slate-500">{e.start_date} - {e.end_date}</p>
          <p className="text-xs text-slate-700 mt-1">{e.description}</p>
        </div>
      ))}
    </div>
  );
};
