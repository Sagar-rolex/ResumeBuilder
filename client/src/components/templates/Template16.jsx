import {
  buildContactItems,
  formatDate,
  formatRange,
  renderContactItems,
} from "./templateUtils.jsx";

const Template16 = ({ data }) => {
  const contactItems = buildContactItems(data.personal_info);

  return (
    <div className="max-w-4xl mx-auto bg-white text-black p-8 text-sm leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        {data.personal_info?.profession && (
          <p className="text-sm text-gray-700 mt-1">
            {data.personal_info.profession}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-700">
            {renderContactItems(contactItems, {
              iconClassName: "text-gray-600",
            })}
          </div>
        )}
      </header>

      {data.professional_summary && (
        <section className="mb-5">
          <h2 className="font-semibold uppercase mb-2">Summary</h2>
          <p>{data.professional_summary}</p>
        </section>
      )}

      {data.experience?.length > 0 && (
        <section className="mb-5">
          <h2 className="font-semibold uppercase mb-2">Experience</h2>
          <div className="space-y-3">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <p className="text-gray-700">
                    {formatRange(exp.start_date, exp.end_date, exp.is_current)}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-gray-800 mt-2 whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.project?.length > 0 && (
        <section className="mb-5">
          <h2 className="font-semibold uppercase mb-2">Projects</h2>
          <div className="space-y-2">
            {data.project.map((proj, index) => (
              <div key={index}>
                <h3 className="font-semibold">{proj.name}</h3>
                {proj.description && <p>{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="mb-5">
          <h2 className="font-semibold uppercase mb-2">Education</h2>
          <div className="space-y-2">
            {data.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-semibold">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </h3>
                  <p className="text-gray-700">{edu.institution}</p>
                </div>
                <p className="text-gray-700">
                  {formatDate(edu.graduation_date)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills?.length > 0 && (
        <section>
          <h2 className="font-semibold uppercase mb-2">Skills</h2>
          <p>{data.skills.join(" | ")}</p>
        </section>
      )}
    </div>
  );
};

export default Template16;
