import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda Leve",
  description: "Uma agenda organizada, sem complicacao.",
  icons: {
    icon: "/logo-agenda-leve-icon.svg",
    shortcut: "/logo-agenda-leve-icon.svg",
    apple: "/logo-agenda-leve-icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
