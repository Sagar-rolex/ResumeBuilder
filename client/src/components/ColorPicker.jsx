import { Check, Palette } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

const COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Sky Blue", value: "#0EA5E9" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Gray", value: "#6B7280" },
  { name: "Black", value: "#1F2937" },
];

const ColorPicker = ({ selectedColor, onChange, resumeData, setResumeData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 ring-purple-300 hover:ring transition-all px-3 py-2 rounded-lg"
      >
        <Palette size={16} /> <span className="max-sm:hidden">Accent</span>
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-2 grid w-[min(15rem,calc(100vw-1rem))] grid-cols-4 gap-2 rounded-md border border-gray-200 bg-white p-3 shadow-sm">
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              aria-label={`Use ${color.name} accent color`}
              aria-pressed={(selectedColor || resumeData?.accent_color) === color.value}
              className="relative flex min-h-12 min-w-12 flex-col items-center justify-center rounded-lg cursor-pointer group"
              onClick={() => {
                if (onChange) onChange(color.value);
                else setResumeData?.((prev) => ({ ...prev, accent_color: color.value }));
                setIsOpen(false);
              }}
            >
              <span
                className="size-9 rounded-full border-2 border-transparent group-hover:border-black/25 transition-colors"
                style={{ backgroundColor: color.value }}
              />
              {(selectedColor || resumeData?.accent_color) === color.value && (
                <span className="absolute top-1 left-1 right-1 bottom-5 flex items-center justify-center">
                  <Check className="size-5 text-white" />
                </span>
              )}
              <span className="text-[10px] text-center mt-0.5 text-gray-600">{color.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
