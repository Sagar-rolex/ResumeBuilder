import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";

const SimpleListForm = ({ title, data = [], onChange, placeholder }) => {
  const [value, setValue] = useState("");

  const addItem = (event) => {
    event.preventDefault();
    const item = value.trim();
    if (!item) return;
    onChange([...data, item]);
    setValue("");
  };

  const removeItem = (index) => onChange(data.filter((_, itemIndex) => itemIndex !== index));

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">Add relevant {title.toLowerCase()} to your resume.</p>
      </div>
      <form onSubmit={addItem} className="flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          maxLength={300}
        />
        <button type="submit" disabled={!value.trim()} className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">
          <Plus className="size-4" /> Add
        </button>
      </form>
      {data.length ? (
        <ul className="space-y-2">
          {data.map((item, index) => (
            <li key={`${item}-${index}`} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span className="min-w-0 break-words">{item}</span>
              <button type="button" onClick={() => removeItem(index)} aria-label={`Remove ${item}`} className="flex min-h-10 min-w-10 shrink-0 items-center justify-center text-red-600 hover:text-red-700">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="rounded-lg bg-slate-50 py-6 text-center text-sm text-slate-500">No {title.toLowerCase()} added yet.</p>}
    </section>
  );
};

export default SimpleListForm;
