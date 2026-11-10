import {
  buildContactItems,
  formatDate,
  formatRange,
  renderContactItems,
} from "./templateUtils.jsx";

const Template13 = ({ data, accentColor }) => {
  const contactItems = buildContactItems(data.personal_info);
  const corporateColor = accentColor || "#1D4ED8";

  return (
    <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8">
      <header className="mb-6 border-b-2 pb-4" style={{ borderColor: corporateColor }}>
        <h1 className="text-3xl font-semibold" style={{ color: corporateColor }}>
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        {data.personal_info?.profession && (
          <p className="text-sm text-slate-600 mt-1">
            {data.personal_info.profession}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
            {renderContactItems(contactItems)}
          </div>
        )}
      </header>

      {data.professional_summary && (
        <section className="mb-6">
          <h2 className="text-sm uppercase tracking-widest mb-2" style={{ color: corporateColor }}>
            Summary
          </h2>
          <p className="text-slate-700">{data.professional_summary}</p>
        </section>
      )}

      {data.experience?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm uppercase tracking-widest mb-3" style={{ color: corporateColor }}>
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index} className="border-l-2 pl-4" style={{ borderColor: corporateColor }}>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-sm text-slate-600">{exp.company}</p>
                  </div>
                  <p className="text-sm text-slate-500">
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
          <section>
            <h2 className="text-sm uppercase tracking-widest mb-3" style={{ color: corporateColor }}>
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
            <section>
              <h2 className="text-sm uppercase tracking-widest mb-3" style={{ color: corporateColor }}>
                Education
              </h2>
              <div className="space-y-3">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-semibold">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h3>
                    <p className="text-sm text-slate-600">{edu.institution}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(edu.graduation_date)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skills?.length > 0 && (
            <section>
              <h2 className="text-sm uppercase tracking-widest mb-3" style={{ color: corporateColor }}>
                Skills
              </h2>
              <p className="text-sm text-slate-700">{data.skills.join(" | ")}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template13;
