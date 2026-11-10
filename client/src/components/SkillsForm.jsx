import { Plus, Sparkles, X } from "lucide-react";
import React, { useState } from "react";

const SkillsForm = ({ data, onChange }) => {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !data.includes(trimmed)) {
      onChange([...data, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (indexToRemove) => {
    onChange(data.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">Skills</h3>
        <p className="text-sm text-gray-500">Add your technical and soft skills</p>
      </div>

      <div className="flex flex-col gap-2 min-[360px]:flex-row">
        <input
          type="text"
          placeholder="Enter a skill (e.g., JavaScript, Project Management)"
          className="min-h-11 min-w-0 flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => setNewSkill(e.target.value)}
          value={newSkill}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="size-4" /> Add
        </button>
      </div>

      {data.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="flex max-w-full items-center gap-1 break-all px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {skill}
              <button
                onClick={() => removeSkill(index)}
                className="ml-1 flex min-h-9 min-w-9 items-center justify-center hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>No skills added yet.</p>
          <p className="text-sm">Add your technical and soft skills above.</p>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Add 8-12 relevant skills. Include both technical skills (programming
          languages, tools) and soft skills (leadership, communication).
        </p>
      </div>
    </div>
  );
};

export default SkillsForm;
