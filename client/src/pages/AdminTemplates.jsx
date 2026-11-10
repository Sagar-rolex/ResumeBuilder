import React, { useCallback, useEffect, useState } from "react";
import { Eye, FilePlus2, Pencil, Trash2, X } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../api";
import ResumePreview from "../components/ResumePreview";
import { useTemplateCatalog } from "../contexts/templateCatalog";
import { createEmptyResumeData } from "../utils/resumeData";

const makeForm = (template) => ({
  name: template?.name || "",
  description: template?.description || "",
  category: template?.category || "Professional",
  previewImage: template?.previewImage || "",
  status: template?.status || "draft",
  layout: {
    baseTemplate: template?.layout?.baseTemplate || "template-1",
    accentColor: template?.layout?.accentColor || "#2563EB",
    fontFamily: template?.layout?.fontFamily || "Arial",
  },
});

const AdminTemplates = () => {
  const { token } = useSelector((state) => state.auth);
  const { refresh: refreshPublicCatalog } = useTemplateCatalog();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(makeForm());
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [sampleData] = useState(() => ({
    ...createEmptyResumeData(),
    personal_info: { ...createEmptyResumeData().personal_info, full_name: "Jordan Lee", profession: "Product Designer", email: "jordan@example.com", location: "San Francisco, CA" },
    professional_summary: "Product designer with experience creating clear, accessible digital products and collaborating across design and engineering teams.",
    skills: ["Product Design", "Prototyping", "Accessibility", "Figma"],
  }));

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/templates", { headers: { Authorization: token } });
      setTemplates(data.templates || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openEditor = (template = null) => {
    setEditor(template);
    setEditorOpen(true);
    setForm(makeForm(template));
  };

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateLayout = (key, value) => setForm((current) => ({ ...current, layout: { ...current.layout, [key]: value } }));

  const saveTemplate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editor) {
        await api.patch(`/admin/templates/${editor.templateId}`, form, { headers: { Authorization: token } });
        toast.success("Template updated");
      } else {
        await api.post("/admin/templates", form, { headers: { Authorization: token } });
        toast.success("Template created");
      }
      setEditor(null);
      setEditorOpen(false);
      await Promise.all([fetchTemplates(), refreshPublicCatalog()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save template");
    } finally {
      setSaving(false);
    }
  };

  const setPublished = async (template) => {
    const status = template.status === "published" ? "unpublished" : "published";
    try {
      await api.patch(`/admin/templates/${template.templateId}`, { status }, { headers: { Authorization: token } });
      toast.success(status === "published" ? "Template published" : "Template unpublished");
      await Promise.all([fetchTemplates(), refreshPublicCatalog()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not change template status");
    }
  };

  const deleteTemplate = async (template) => {
    if (!window.confirm(`Delete “${template.name}”? Saved resumes using this template must keep their layout.`)) return;
    try {
      await api.delete(`/admin/templates/${template.templateId}`, { headers: { Authorization: token } });
      toast.success("Template deleted");
      await Promise.all([fetchTemplates(), refreshPublicCatalog()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete template");
    }
  };

  if (loading) return <div className="flex min-h-72 items-center justify-center"><div className="size-9 animate-spin rounded-full border-b-2 border-blue-600" /></div>;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Resume templates</h1><p className="mt-1 text-sm text-gray-600">Configure safe layout variants. Published templates appear in the builder and use an existing supported renderer.</p></div>
        <button type="button" onClick={() => openEditor()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><FilePlus2 className="size-4" /> Add template</button>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article key={template.templateId} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="relative flex h-36 items-center justify-center overflow-hidden bg-slate-100">
              {template.previewImage ? <img src={template.previewImage} alt={`${template.name} preview`} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-28 w-20 rounded border border-slate-200 bg-white p-2 shadow-sm"><div className="mb-2 h-2 rounded" style={{ backgroundColor: template.layout?.accentColor || "#2563EB" }} /><div className="space-y-1"><div className="h-1 rounded bg-slate-200" /><div className="h-1 w-4/5 rounded bg-slate-200" /><div className="mt-3 h-1 rounded bg-slate-100" /><div className="h-1 rounded bg-slate-100" /><div className="h-1 w-3/4 rounded bg-slate-100" /></div></div>}
              <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${template.status === "published" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>{template.status}</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-semibold text-gray-900">{template.name}</h2><p className="text-sm text-gray-500">{template.category}</p></div><span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-600">{template.isBuiltin ? "Built-in" : "Custom"}</span></div>
              <p className="line-clamp-2 min-h-10 text-sm text-gray-600">{template.description || "No description"}</p>
              <p className="break-all text-xs text-gray-400">ID: {template.templateId}</p>
              <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                <button type="button" onClick={() => setPreview(template)} className="inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 text-sm text-gray-700 hover:bg-gray-50"><Eye className="size-4" /> Preview</button>
                <button type="button" onClick={() => openEditor(template)} className="inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 text-sm text-gray-700 hover:bg-gray-50"><Pencil className="size-4" /> Edit</button>
                <button type="button" onClick={() => setPublished(template)} className="min-h-10 rounded-md border px-3 text-sm text-blue-700 hover:bg-blue-50">{template.status === "published" ? "Unpublish" : "Publish"}</button>
                {!template.isBuiltin && <button type="button" onClick={() => deleteTemplate(template)} aria-label={`Delete ${template.name}`} className="ml-auto flex min-h-10 min-w-10 items-center justify-center rounded-md text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>}
              </div>
              <p className="text-[11px] text-gray-400">Created {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : "with app"}{template.updatedAt ? ` · Updated ${new Date(template.updatedAt).toLocaleDateString()}` : ""}</p>
            </div>
          </article>
        ))}
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:items-center sm:p-6">
          <section role="dialog" aria-modal="true" aria-labelledby="template-form-title" className="my-auto grid w-full max-w-6xl gap-5 rounded-2xl bg-white p-4 shadow-2xl sm:p-6 lg:grid-cols-2">
            <form onSubmit={saveTemplate} className="space-y-4">
              <header className="flex items-center justify-between"><h2 id="template-form-title" className="text-xl font-bold text-slate-900">{editor ? `Edit ${editor.name}` : "Add template"}</h2><button type="button" onClick={() => { setEditor(null); setEditorOpen(false); }} aria-label="Close template form" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100"><X className="size-5" /></button></header>
              <label className="block text-sm font-medium">Template name<input required maxLength={80} value={form.name} onChange={(e) => updateField("name", e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border px-3 font-normal" /></label>
              <label className="block text-sm font-medium">Description<textarea maxLength={500} rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal" /></label>
              <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">Category<select value={form.category} onChange={(e) => updateField("category", e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border px-3 font-normal">{["Professional", "Classic", "Creative", "Technical", "Academic"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="block text-sm font-medium">Status<select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border px-3 font-normal">{["draft", "published", "unpublished"].map((item) => <option key={item}>{item}</option>)}</select></label></div>
              <label className="block text-sm font-medium">Preview image URL (HTTPS)<input type="url" value={form.previewImage} onChange={(e) => updateField("previewImage", e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border px-3 font-normal" placeholder="https://…" /></label>
              <p className="text-xs text-slate-500">Choose a supported renderer and adjust its appearance. Template configuration accepts data only; JavaScript and HTML are not allowed.</p>
              <label className="block text-sm font-medium">Resume layout<select disabled={Boolean(editor?.isBuiltin)} value={form.layout.baseTemplate} onChange={(e) => updateLayout("baseTemplate", e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border px-3 font-normal">{Array.from({ length: 26 }, (_, index) => <option key={index} value={`template-${index + 1}`}>Built-in layout {index + 1}</option>)}</select></label>
              <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">Accent color<input type="color" value={form.layout.accentColor} onChange={(e) => updateLayout("accentColor", e.target.value)} className="mt-1 h-11 w-full rounded-lg border p-1" /></label><label className="block text-sm font-medium">Font<select value={form.layout.fontFamily} onChange={(e) => updateLayout("fontFamily", e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border px-3 font-normal">{["Arial", "Georgia", "Inter", "Times New Roman", "Verdana"].map((font) => <option key={font}>{font}</option>)}</select></label></div>
              <button disabled={saving} className="min-h-11 w-full rounded-lg bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving…" : "Save template"}</button>
            </form>
            <div className="min-w-0 rounded-xl bg-slate-100 p-3 sm:p-5"><p className="mb-3 text-sm font-semibold text-slate-600">Live sample preview</p><div className="mx-auto max-h-[75vh] max-w-[640px] overflow-auto bg-white shadow-lg"><ResumePreview data={sampleData} template={form.layout.baseTemplate} accentColor={form.layout.accentColor} managedTemplate={{ ...form, templateId: editor?.templateId || "draft-preview" }} /></div></div>
          </section>
        </div>
      )}

      {preview && !editorOpen && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 sm:items-center sm:p-6"><section role="dialog" aria-modal="true" aria-labelledby="template-preview-title" className="my-auto w-full max-w-4xl rounded-xl bg-white p-4 sm:p-6"><header className="mb-4 flex items-center justify-between"><h2 id="template-preview-title" className="text-lg font-bold">{preview.name} preview</h2><button type="button" onClick={() => setPreview(null)} aria-label="Close preview" className="flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-gray-100"><X className="size-5" /></button></header><div className="max-h-[75vh] overflow-auto bg-slate-100 p-3"><ResumePreview data={sampleData} template={preview.templateId} managedTemplate={preview} accentColor={preview.layout?.accentColor} /></div></section></div>}
    </section>
  );
};

export default AdminTemplates;
