"use client";

import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("uninews-theme") || "light";
    setTheme(saved as "light" | "dark");
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = (event: React.MouseEvent) => {
    const next = theme === "light" ? "dark" : "light";

    // Add ripple effect to the button
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
        setRipples((prev) => prev.filter(r => r.id !== id));
    }, 600);

    // Telegram-style reveal effect using View Transitions API
    if (!document.startViewTransition) {
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("uninews-theme", next);
      return;
    }

    document.documentElement.style.setProperty("--x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--y", `${event.clientY}px`);

    const { flushSync } = require("react-dom");

    document.startViewTransition(() => {
      flushSync(() => {
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("uninews-theme", next);
      });
    });
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
      {ripples.map(ripple => (
        <span 
            key={ripple.id}
            className="ripple"
            style={{
                left: ripple.x,
                top: ripple.y,
                position: "absolute",
                width: "2px",
                height: "2px",
                background: "rgba(255, 255, 255, 0.4)",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                animation: "ripple 0.6s ease-out"
            }}
        />
      ))}
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
