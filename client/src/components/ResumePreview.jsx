import React from "react";
import { useTemplateCatalog } from "../contexts/templateCatalog";
import Template1 from "./templates/Template1";
import Template2 from "./templates/Template2";
import Template3 from "./templates/Template3";
import Template4 from "./templates/Template4";
import Template5 from "./templates/Template5";
import Template6 from "./templates/Template6";
import Template7 from "./templates/Template7";
import Template8 from "./templates/Template8";
import Template9 from "./templates/Template9";
import Template10 from "./templates/Template10";
import Template11 from "./templates/Template11";
import Template12 from "./templates/Template12";
import Template13 from "./templates/Template13";
import Template14 from "./templates/Template14";
import Template15 from "./templates/Template15";
import Template16 from "./templates/Template16";
import { Template17 } from "./templates/Template17";
import { Template18 } from "./templates/Template18";
import {
  Template19,
  Template20,
  Template21,
  Template22,
  Template23,
  Template24,
  Template25,
  Template26,
} from "./templates/Template19_26";

// Template registry — maps template IDs to components
const TEMPLATE_MAP = {
  "template-1": Template1,
  "template-2": Template2,
  "template-3": Template3,
  "template-4": Template4,
  "template-5": Template5,
  "template-6": Template6,
  "template-7": Template7,
  "template-8": Template8,
  "template-9": Template9,
  "template-10": Template10,
  "template-11": Template11,
  "template-12": Template12,
  "template-13": Template13,
  "template-14": Template14,
  "template-15": Template15,
  "template-16": Template16,
  "template-17": Template17,
  "template-18": Template18,
  "template-19": Template19,
  "template-20": Template20,
  "template-21": Template21,
  "template-22": Template22,
  "template-23": Template23,
  "template-24": Template24,
  "template-25": Template25,
  "template-26": Template26,
  // Legacy names map to new IDs
  classic: Template2,
  modern: Template1,
  minimal: Template3,
  "minimal-image": Template3,
  "tech-innovator": Template12,
};

const ResumePreview = ({ data, resumeData, template, accentColor, classes = "", managedTemplate: managedTemplateProp }) => {
  const { templates, rendererTemplates } = useTemplateCatalog();
  const activeData = data || resumeData || {};
  const activeTemplate = template || activeData?.template || "template-1";
  const managedTemplate = managedTemplateProp || rendererTemplates.find((item) => item.templateId === activeTemplate) || templates.find((item) => item.templateId === activeTemplate);
  const rendererId = managedTemplate?.layout?.baseTemplate || activeTemplate;
  const activeColor = accentColor || activeData?.accent_color || managedTemplate?.layout?.accentColor || "#2563EB";
  const TemplateComponent = TEMPLATE_MAP[rendererId] || Template1;

  return (
    <div className="w-full bg-gray-100">
      <div
        id="resume-preview"
        className={`min-w-0 max-w-full border border-gray-200 print:shadow-none print:border-none ${classes}`}
        style={{ overflowWrap: "anywhere", fontFamily: managedTemplate?.layout?.fontFamily || "Arial, sans-serif" }}
      >
        <TemplateComponent
          data={activeData}
          resumeData={activeData}
          accentColor={activeColor}
        />
        {[
          ["Certifications", activeData.certifications],
          ["Languages", activeData.languages],
          ["Achievements", activeData.achievements],
        ].filter(([, items]) => Array.isArray(items) && items.length > 0).map(([title, items]) => (
          <section key={title} className="bg-white px-8 py-4 text-slate-800">
            <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide" style={{ color: activeColor }}>{title}</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ResumePreview;
