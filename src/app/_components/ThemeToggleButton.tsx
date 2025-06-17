"use client";

import { FiSun, FiMoon } from "react-icons/fi";

interface ThemeToggleButtonProps {
  toggleTheme: () => void;
  theme: "light" | "dark";
}

export default function ThemeToggleButton({
  toggleTheme,
  theme,
}: ThemeToggleButtonProps) {
  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-30 p-1.5 w-8 h-8 bg-[#0D1919] dark:bg-cyan-600 rounded-md flex items-center justify-center text-white shadow-lg hover:bg-[#0E2626] dark:hover:bg-cyan-700 transition border border-[#2D3838]"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <FiSun className="text-[#A2BEBE] h-6 w-6" />
      ) : (
        <FiMoon className="text-[#A2BEBE] h-8 w-8" />
      )}
    </button>
  );
}
