import { Mail, Phone, MapPin, Code } from "lucide-react";

const TechInnovatorTemplate = ({ data, accentColor }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="text-center py-12 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex justify-center mb-4">
          <Code size={48} style={{ color: accentColor }} />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-2">
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        <p className="text-xl text-gray-600 uppercase tracking-wide">
          {data.personal_info?.profession || "Profession"}
        </p>
      </header>

      {/* Contact */}
      <section className="px-8 py-6 bg-gray-50">
        <div className="flex justify-center space-x-8 text-sm">
          {data.personal_info?.phone && (
            <div className="flex items-center gap-2">
              <Phone size={16} style={{ color: accentColor }} />
              <span>{data.personal_info.phone}</span>
            </div>
          )}
          {data.personal_info?.email && (
            <div className="flex items-center gap-2">
              <Mail size={16} style={{ color: accentColor }} />
              <span>{data.personal_info.email}</span>
            </div>
          )}
          {data.personal_info?.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} style={{ color: accentColor }} />
              <span>{data.personal_info.location}</span>
            </div>
          )}
        </div>
      </section>

      {/* Summary */}
      {data.professional_summary && (
        <section className="px-8 py-8">
          <h2
            className="text-lg font-semibold mb-4 uppercase tracking-wide"
            style={{ color: accentColor }}
          >
            Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {data.professional_summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="px-8 py-8 bg-gray-50">
          <h2
            className="text-lg font-semibold mb-6 uppercase tracking-wide"
            style={{ color: accentColor }}
          >
            Experience
          </h2>
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div
                key={index}
                className="border-l-4 pl-6"
                style={{ borderColor: accentColor }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {exp.position}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(exp.start_date)} -{" "}
                    {exp.is_current ? "Present" : formatDate(exp.end_date)}
                  </span>
                </div>
                <p className="text-lg mb-3" style={{ color: accentColor }}>
                  {exp.company}
                </p>
                {exp.description && (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {exp.description.split("\n").map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="px-8 py-8">
          <h2
            className="text-lg font-semibold mb-4 uppercase tracking-wide"
            style={{ color: accentColor }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.project && data.project.length > 0 && (
        <section className="px-8 py-8 bg-gray-50">
          <h2
            className="text-lg font-semibold mb-6 uppercase tracking-wide"
            style={{ color: accentColor }}
          >
            Projects
          </h2>
          <div className="space-y-6">
            {data.project.map((project, index) => (
              <div key={index}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {project.name}
                </h3>
                <p className="text-lg mb-3" style={{ color: accentColor }}>
                  {project.type}
                </p>
                {project.description && (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {project.description.split("\n").map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="px-8 py-8">
          <h2
            className="text-lg font-semibold mb-4 uppercase tracking-wide"
            style={{ color: accentColor }}
          >
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <p className="text-xl font-bold text-gray-900">{edu.degree}</p>
                <p className="text-lg text-gray-600">{edu.institution}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(edu.graduation_date)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TechInnovatorTemplate;
