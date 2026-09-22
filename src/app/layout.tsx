import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LingoFlow AI — Break Language Barriers. Grow Without Borders.",
  description: "Industry-ready AI translation, localization, and language productivity SaaS platform.",
  keywords: ["AI Translation", "Localization", "Multi-language", "Language SaaS", "LingoFlow"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
