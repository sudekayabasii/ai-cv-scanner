import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Talent Scanner",
  description: "Yapay Zeka Destekli CV Analizi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}