import { createContext, useContext } from "react";

const builtinNames = [
  "Classic Professional", "Modern Minimal", "Executive Suite", "Creative Sidebar", "Tech Innovator", "Corporate Clean",
  "Bold Accent", "Traditional Serif", "Compact Grid", "Two Column Pro", "Minimalist Border", "Timeline Professional",
  "Header Highlight", "Dark Sidebar", "Centered Elegant", "Modern Split", "Executive Border", "Dark Sidebar Pro",
  "Centered Modern", "Serif Accent", "Card Grid", "Bold Header", "Dark Header", "Underline Modern", "Split Header", "Top Border Executive",
];

export const fallbackTemplates = builtinNames.map((name, index) => ({
  templateId: `template-${index + 1}`,
  name,
  category: "Professional",
  status: "published",
  isBuiltin: true,
  layout: { baseTemplate: `template-${index + 1}`, accentColor: "#2563EB", fontFamily: "Arial" },
}));

export const TemplateCatalogContext = createContext({ templates: fallbackTemplates, rendererTemplates: fallbackTemplates, refresh: async () => {} });
export const useTemplateCatalog = () => useContext(TemplateCatalogContext);
