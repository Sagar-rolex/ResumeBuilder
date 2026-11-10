import {
  buildContactItems,
  formatDate,
  formatRange,
  renderContactItems,
} from "./templateUtils.jsx";

const Template14 = ({ data, accentColor }) => {
  const contactItems = buildContactItems(data.personal_info);

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 text-slate-100 p-8 print:bg-white print:text-slate-900">
      <header className="mb-6 border-b border-slate-700 pb-4 print:border-slate-300">
        <h1 className="text-3xl font-semibold" style={{ color: accentColor }}>
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        {data.personal_info?.profession && (
          <p className="text-sm text-slate-300 print:text-slate-600 mt-1">
            {data.personal_info.profession}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300 print:text-slate-600">
            {renderContactItems(contactItems, {
              iconClassName: "text-slate-300 print:text-slate-600",
            })}
          </div>
        )}
      </header>

      {data.professional_summary && (
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
            Summary
          </h2>
          <p className="text-slate-200 print:text-slate-700">{data.professional_summary}</p>
        </section>
      )}

      {data.experience?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index} className="border border-slate-700 rounded p-3 print:border-slate-300">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-sm text-slate-300 print:text-slate-600">{exp.company}</p>
                  </div>
                  <p className="text-xs text-slate-400 print:text-slate-500">
                    {formatRange(exp.start_date, exp.end_date, exp.is_current)}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-sm text-slate-200 print:text-slate-700 mt-2 whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {data.project?.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
              Projects
            </h2>
            <div className="space-y-3">
              {data.project.map((proj, index) => (
                <div key={index} className="border border-slate-700 rounded p-3 print:border-slate-300">
                  <h3 className="font-semibold">{proj.name}</h3>
                  {proj.description && (
                    <p className="text-sm text-slate-200 print:text-slate-700">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-6">
          {data.education?.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
                Education
              </h2>
              <div className="space-y-3">
                {data.education.map((edu, index) => (
                  <div key={index} className="border border-slate-700 rounded p-3 print:border-slate-300">
                    <h3 className="font-semibold">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h3>
                    <p className="text-sm text-slate-300 print:text-slate-600">{edu.institution}</p>
                    <p className="text-xs text-slate-400 print:text-slate-500">
                      {formatDate(edu.graduation_date)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skills?.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2 text-sm">
                {data.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 border border-slate-700 rounded text-slate-200 print:text-slate-700 print:border-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template14;
