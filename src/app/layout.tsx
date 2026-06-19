import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const heading = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Smart Agenda",
  description: "Agendamentos, disponibilidade e tipos de atendimento em um so lugar.",
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
      <body className={`${heading.variable} ${body.variable} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
