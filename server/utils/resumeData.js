const cleanString = (value, maxLength = 5000) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const cleanStringList = (value, maxItems = 30, maxLength = 200) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string").map((item) => cleanString(item, maxLength)).filter(Boolean).slice(0, maxItems)
    : [];

export const sanitizeResumeData = (data = {}) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};

  const sanitized = {};
  if (data.title !== undefined) sanitized.title = cleanString(data.title, 200);
  if (data.public !== undefined) sanitized.public = data.public === true || data.public === "true";
  if (data.template !== undefined) sanitized.template = cleanString(data.template, 50);
  if (data.accent_color !== undefined) sanitized.accent_color = cleanString(data.accent_color, 20);
  if (data.professional_summary !== undefined) sanitized.professional_summary = cleanString(data.professional_summary);

  for (const field of ["skills", "certifications", "languages", "achievements"]) {
    if (data[field] !== undefined) sanitized[field] = cleanStringList(data[field], 50, 300);
  }

  if (data.personal_info && typeof data.personal_info === "object" && !Array.isArray(data.personal_info)) {
    const info = data.personal_info;
    sanitized.personal_info = {};
    for (const [field, maxLength] of Object.entries({
      image: 2000,
      full_name: 100,
      profession: 100,
      email: 200,
      phone: 30,
      location: 200,
      linkedin: 500,
      website: 500,
    })) {
      if (info[field] !== undefined) sanitized.personal_info[field] = cleanString(info[field], maxLength);
    }
  }

  if (Array.isArray(data.experience)) {
    sanitized.experience = data.experience.slice(0, 20).map((rawItem) => {
      const item = rawItem && typeof rawItem === "object" ? rawItem : {};
      return {
        company: cleanString(item.company, 200),
        position: cleanString(item.position, 200),
        start_date: cleanString(item.start_date, 20),
        end_date: cleanString(item.end_date, 20),
        description: cleanString(item.description, 2000),
        is_current: Boolean(item.is_current),
      };
    });
  }

  if (Array.isArray(data.project)) {
    sanitized.project = data.project.slice(0, 20).map((rawItem) => {
      const item = rawItem && typeof rawItem === "object" ? rawItem : {};
      return {
        name: cleanString(item.name, 200),
        type: cleanString(item.type, 200),
        description: cleanString(item.description, 2000),
      };
    });
  }

  if (Array.isArray(data.education)) {
    sanitized.education = data.education.slice(0, 10).map((rawItem) => {
      const item = rawItem && typeof rawItem === "object" ? rawItem : {};
      return {
        institution: cleanString(item.institution, 200),
        degree: cleanString(item.degree, 100),
        field: cleanString(item.field, 100),
        graduation_date: cleanString(item.graduation_date, 20),
        gpa: cleanString(item.gpa, 20),
      };
    });
  }

  return sanitized;
};

export const hasResumeContent = (data) => Boolean(
  data?.professional_summary ||
  Object.values(data?.personal_info || {}).some(Boolean) ||
  ["skills", "certifications", "languages", "achievements", "experience", "project", "education"]
    .some((field) => Array.isArray(data?.[field]) && data[field].some((entry) =>
      typeof entry === "string" ? Boolean(entry) : Object.values(entry || {}).some(Boolean)
    ))
);
