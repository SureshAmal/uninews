"use client";

import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("uninews-theme") || "light";
    setTheme(saved as "light" | "dark");
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("uninews-theme", next);
  };

  if (!mounted) return <div style={{ width: 36, height: 36 }} />;

  return (
    <button
      onClick={toggle}
      className="btn btn-icon btn-ghost"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s",
          transform: theme === "light" ? "rotate(0deg)" : "rotate(180deg)",
          opacity: theme === "light" ? 1 : 0,
          position: theme === "light" ? "relative" : "absolute",
        }}
      >
        <Sun size={20} />
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s",
          transform: theme === "dark" ? "rotate(0deg)" : "rotate(-180deg)",
          opacity: theme === "dark" ? 1 : 0,
          position: theme === "dark" ? "relative" : "absolute",
        }}
      >
        <Moon size={20} />
      </span>
    </button>
  );
}
