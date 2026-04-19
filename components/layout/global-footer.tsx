"use client";

import { usePathname } from "next/navigation";

export function GlobalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="footer-global">
      <div className="container-news">
        <div className="footer-logo">
          UniNews
        </div>
        <p>© {new Date().getFullYear()} UniNews. By students, for students.</p>
      </div>
    </footer>
  );
}
