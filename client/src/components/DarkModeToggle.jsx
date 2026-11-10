import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-gray-800 rounded-xl transition-all duration-200"
    >
      <span className="size-6">🌙</span>
      <span className="text-sm font-medium">Dark Mode</span>
    </button>
  );
};

export default DarkModeToggle;