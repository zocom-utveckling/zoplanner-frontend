import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import "./index.css";

function DarkModeButton() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      return saved === "dark";
    }
    return (
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
    );
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light",
    );
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <button
      type="button"
      className="dark-mode-button"
      onClick={() => setIsDarkMode((prev) => !prev)}
      aria-pressed={isDarkMode}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <FaSun /> : <FaMoon />}
      <span>{isDarkMode ? "Light" : "Dark"}</span>
    </button>
  );
}

export { DarkModeButton };
