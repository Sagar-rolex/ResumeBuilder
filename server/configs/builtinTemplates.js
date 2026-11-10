const names = [
  "Classic Professional", "Modern Minimal", "Executive Suite", "Creative Sidebar", "Tech Innovator", "Corporate Clean",
  "Bold Accent", "Traditional Serif", "Compact Grid", "Two Column Pro", "Minimalist Border", "Timeline Professional",
  "Header Highlight", "Dark Sidebar", "Centered Elegant", "Modern Split", "Executive Border", "Dark Sidebar Pro",
  "Centered Modern", "Serif Accent", "Card Grid", "Bold Header", "Dark Header", "Underline Modern", "Split Header", "Top Border Executive",
];

export const builtinTemplates = names.map((name, index) => ({
  templateId: `template-${index + 1}`,
  name,
  description: "ResumeCraft.ai built-in resume layout.",
  category: index === 3 || index === 14 || index === 20 ? "Creative" : index === 7 || index === 19 ? "Classic" : "Professional",
  previewImage: "",
  status: "published",
  isBuiltin: true,
  layout: { baseTemplate: `template-${index + 1}`, accentColor: "#2563EB", fontFamily: "Arial" },
}));

export const allowedBaseTemplates = new Set(builtinTemplates.map(({ templateId }) => templateId));
export const allowedTemplateFonts = new Set(["Arial", "Georgia", "Inter", "Times New Roman", "Verdana"]);
