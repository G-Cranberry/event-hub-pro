import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Glassmorphism dark/light mode toggle.
 * Stores preference in localStorage, toggles .dark / .light on <html>.
 */
export function ThemeToggle({ className }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return true;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const handler = () => setIsDark(document.documentElement.classList.contains("dark"));
    window.addEventListener("themechange", handler);
    return () => window.removeEventListener("themechange", handler);
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("orbit:theme", next ? "dark" : "light");
    window.dispatchEvent(new CustomEvent("themechange"));
    setIsDark(next);
  };

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={`orb-theme-toggle ${!isDark ? "orb-theme-toggle--light" : ""} ${className ?? ""}`}>
      
      <span className="orb-theme-toggle__track" />
      <span className="orb-theme-toggle__thumb">
        {isDark ? <Moon /> : <Sun />}
      </span>
    </button>);

}

/** Apply saved theme on app mount — call once in AppShell. */
export function applySavedTheme() {
  if (typeof document === "undefined") return;
  const saved = localStorage.getItem("orbit:theme") ?? "dark";
  const isDark = saved === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);
}