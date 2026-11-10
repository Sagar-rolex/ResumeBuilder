import React from "react";

// ── Contact Items Builder ──────────────────────────────────────────
export const buildContactItems = (info = {}) => {
  if (!info) return [];
  const items = [];
  if (info.email) items.push({ key: "email", label: "Email", value: info.email, href: `mailto:${info.email}` });
  if (info.phone) items.push({ key: "phone", label: "Phone", value: info.phone, href: `tel:${info.phone}` });
  if (info.location) items.push({ key: "location", label: "Location", value: info.location });
  if (info.linkedin) items.push({ key: "linkedin", label: "LinkedIn", value: info.linkedin, href: info.linkedin });
  if (info.website) items.push({ key: "website", label: "Website", value: info.website, href: info.website });
  return items;
};

// ── Contact Items Renderer ─────────────────────────────────────────
export const renderContactItems = (items = []) => {
  return items.map((item, idx) => (
    <span key={item.key || idx} className="inline-flex items-center gap-1">
      {item.href ? (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {item.value}
        </a>
      ) : (
        <span>{item.value}</span>
      )}
      {idx < items.length - 1 && <span className="mx-1 text-slate-300">•</span>}
    </span>
  ));
};

// ── Date Formatter ─────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// ── Date Range Formatter ───────────────────────────────────────────
export const formatRange = (startDate, endDate, isCurrent) => {
  const start = formatDate(startDate);
  const end = isCurrent ? "Present" : formatDate(endDate);
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
};
