import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastContainer } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveAnnouncement } from "@/app/actions/admin"
import { GlobalFooter } from "@/components/layout/global-footer";

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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('uninews-theme');
                  var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!theme && supportDark) theme = 'dark';
                  if (!theme) theme = 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="layout-root">
        {announcement && (
          <div className="announcement-banner">
            {announcement.message}
          </div>
        )}
        <Navbar user={user} />
        <main className="layout-main">{children}</main>
        <MobileNav user={user} />
        <GlobalFooter />
        <ToastContainer />
      </body>
    </html>
  );
}
