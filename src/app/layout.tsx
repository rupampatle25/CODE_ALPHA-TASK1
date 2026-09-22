import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "BhashaSetu — Connecting Languages, Empowering Communication.",
  description: "Industry-ready AI language translation, localization, and tone adaptation SaaS platform. Connecting Languages, Empowering Communication.",
  keywords: ["BhashaSetu", "AI Translation", "Language Bridge", "Multilingual", "Localization", "Tone Adaptation"],
};

const themeScript = `
  (function() {
    try {
      var storedTheme = localStorage.getItem('bhashasetu-theme') || localStorage.getItem('lingoflow-theme');
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (storedTheme === 'dark' || (!storedTheme && systemDark) || (storedTheme === 'system' && systemDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased selection:bg-blue-500 selection:text-white bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

