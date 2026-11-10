import {
  buildContactItems,
  formatDate,
  formatRange,
  renderContactItems,
} from "./templateUtils.jsx";

const Template9 = ({ data, accentColor }) => {
  const contactItems = buildContactItems(data.personal_info);

  return (
    <div className="max-w-4xl mx-auto bg-slate-50 text-slate-900 p-8 rounded-lg shadow-sm print:shadow-none">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">
              {data.personal_info?.full_name || "Your Name"}
            </h1>
            {data.personal_info?.profession && (
              <p className="text-sm text-slate-600">
                {data.personal_info.profession}
              </p>
            )}
          </div>
          {contactItems.length > 0 && (
            <div className="text-sm text-slate-600 space-y-1">
              {renderContactItems(contactItems, {
                itemClassName: "flex items-center gap-2",
                iconSize: 12,
              })}
            </div>
          )}
        </div>
      </header>

      {data.professional_summary && (
        <section className="mb-6 bg-white p-4 rounded-md border">
          <h2 className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
            Summary
          </h2>
          <p className="text-slate-700">{data.professional_summary}</p>
        </section>
      )}

      <div className="space-y-6">
        {data.experience?.length > 0 && (
          <section className="bg-white p-4 rounded-md border">
            <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
              Experience
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index} className="border-l-2 pl-3" style={{ borderColor: accentColor }}>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-semibold">{exp.position}</h3>
                      <p className="text-sm text-slate-600">{exp.company}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatRange(exp.start_date, exp.end_date, exp.is_current)}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">
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
            <section className="bg-white p-4 rounded-md border">
              <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
                Projects
              </h2>
              <div className="space-y-3">
                {data.project.map((proj, index) => (
                  <div key={index}>
                    <h3 className="font-semibold">{proj.name}</h3>
                    {proj.description && (
                      <p className="text-sm text-slate-700">{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="space-y-6">
            {data.education?.length > 0 && (
              <section className="bg-white p-4 rounded-md border">
                <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
                  Education
                </h2>
                <div className="space-y-3">
                  {data.education.map((edu, index) => (
                    <div key={index}>
                      <h3 className="font-semibold">
                        {edu.degree} {edu.field && `in ${edu.field}`}
                      </h3>
                      <p className="text-sm text-slate-600">{edu.institution}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(edu.graduation_date)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.skills?.length > 0 && (
              <section className="bg-white p-4 rounded-md border">
                <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                  {data.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-100 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template9;
