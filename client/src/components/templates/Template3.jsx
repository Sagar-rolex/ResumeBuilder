import {
  buildContactItems,
  formatDate,
  formatRange,
  renderContactItems,
} from "./templateUtils.jsx";

const Template3 = ({ data, accentColor }) => {
  const contactItems = buildContactItems(data.personal_info);

  return (
    <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 font-light">
      <header className="mb-8">
        <h1 className="text-4xl font-light tracking-wide">
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        {data.personal_info?.profession && (
          <p className="text-sm text-slate-600 mt-1">
            {data.personal_info.profession}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
            {renderContactItems(contactItems)}
          </div>
        )}
      </header>

      {data.professional_summary && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
            Summary
          </h2>
          <p className="text-slate-700">{data.professional_summary}</p>
        </section>
      )}

      {data.experience?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
            Experience
          </h2>
          <div className="space-y-5">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline gap-3">
                  <h3 className="text-lg font-medium">{exp.position}</h3>
                  <span className="text-xs text-slate-500">
                    {formatRange(exp.start_date, exp.end_date, exp.is_current)}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{exp.company}</p>
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

      {data.project?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
            Projects
          </h2>
          <div className="space-y-4">
            {data.project.map((proj, index) => (
              <div key={index}>
                <h3 className="font-medium">{proj.name}</h3>
                {proj.description && (
                  <p className="text-sm text-slate-700">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: accentColor }}>
            Education
          </h2>
          <div className="space-y-3">
            {data.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-baseline gap-3">
                <div>
                  <h3 className="font-medium">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </h3>
                  <p className="text-sm text-slate-600">{edu.institution}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {formatDate(edu.graduation_date)}
                </span>
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
          <p className="text-sm text-slate-700">{data.skills.join(" | ")}</p>
        </section>
      )}
    </div>
  );
};

export default Template3;
