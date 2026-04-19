import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastContainer } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveAnnouncement } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "UniNews — University News Platform",
  description:
    "Your university's pulse. News, stories, and updates from students, for students.",
  keywords: ["university", "news", "campus", "students", "college"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const announcement = await getActiveAnnouncement();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('uninews-theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {announcement && (
          <div style={{ background: "var(--warning)", color: "#000", padding: "0.5rem 1rem", textAlign: "center", fontWeight: 600, fontSize: "0.875rem" }}>
            {announcement.message}
          </div>
        )}
        <Navbar user={user} />
        <main style={{ flex: 1 }}>{children}</main>
        <MobileNav user={user} />

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid var(--border-light)",
            padding: "2rem 0",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-body)",
          }}
        >
          <div className="container-news">
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                color: "var(--text-secondary)",
              }}
            >
              UniNews
            </div>
            <p>© {new Date().getFullYear()} UniNews. By students, for students.</p>
          </div>
        </footer>
        <ToastContainer />
      </body>
    </html>
  );
}
