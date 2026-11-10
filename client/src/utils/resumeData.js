const emptyResumeDefaults = {
  title: "Untitled Resume",
  public: false,
  template: "template-1",
  accent_color: "#2563EB",
  professional_summary: "",
  personal_info: {
    image: "",
    full_name: "",
    profession: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  experience: [],
  education: [],
  project: [],
  skills: [],
  certifications: [],
  languages: [],
  achievements: [],
};

const objectArrayOrEmpty = (value) =>
  Array.isArray(value) ? value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) : [];

const stringArrayOrEmpty = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];

export const createEmptyResumeData = (overrides = {}) => {
  const source = overrides && typeof overrides === "object" && !Array.isArray(overrides) ? overrides : {};
  const personalInfo = source.personal_info && typeof source.personal_info === "object" && !Array.isArray(source.personal_info)
    ? source.personal_info
    : {};

  return {
    ...emptyResumeDefaults,
    ...source,
    personal_info: { ...emptyResumeDefaults.personal_info, ...personalInfo },
    experience: objectArrayOrEmpty(source.experience),
    education: objectArrayOrEmpty(source.education),
    project: objectArrayOrEmpty(source.project),
    skills: stringArrayOrEmpty(source.skills),
    certifications: stringArrayOrEmpty(source.certifications),
    languages: stringArrayOrEmpty(source.languages),
    achievements: stringArrayOrEmpty(source.achievements),
  };
};
