import {
  buildContactItems,
  formatDate,
  formatRange,
  renderContactItems,
} from "./templateUtils.jsx";

const Template8 = ({ data, accentColor }) => {
  const contactItems = buildContactItems(data.personal_info);

  return (
    <div className="max-w-4xl mx-auto bg-white text-slate-900 p-6 text-sm leading-snug">
      <header className="mb-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">
              {data.personal_info?.full_name || "Your Name"}
            </h1>
            {data.personal_info?.profession && (
              <p className="text-xs text-slate-600 mt-1">
                {data.personal_info.profession}
              </p>
            )}
          </div>
          {contactItems.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              {renderContactItems(contactItems, { iconSize: 11 })}
            </div>
          )}
        </div>
      </header>

      {data.professional_summary && (
        <section className="mb-4">
          <h2 className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
            Summary
          </h2>
          <p className="text-slate-700">{data.professional_summary}</p>
        </section>
      )}

      {data.experience?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
            Experience
          </h2>
          <div className="space-y-3">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline gap-3">
                  <h3 className="font-semibold">{exp.position}</h3>
                  <span className="text-xs text-slate-500">
                    {formatRange(exp.start_date, exp.end_date, exp.is_current)}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{exp.company}</p>
                {exp.description && (
                  <p className="text-xs text-slate-700 mt-1 whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {data.project?.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
              Projects
            </h2>
            <div className="space-y-2">
              {data.project.map((proj, index) => (
                <div key={index}>
                  <h3 className="font-semibold">{proj.name}</h3>
                  {proj.description && (
                    <p className="text-xs text-slate-700">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-4">
          {data.education?.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                Education
              </h2>
              <div className="space-y-2">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-sm">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h3>
                    <p className="text-xs text-slate-600">{edu.institution}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(edu.graduation_date)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skills?.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                Skills
              </h2>
              <p className="text-xs text-slate-700">{data.skills.join(" | ")}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template8;
