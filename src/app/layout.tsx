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
  title: "Facilita",
  description: "Agendamentos, disponibilidade e serviços em um so lugar.",
  icons: {
    icon: "/logo-facilita-icon.svg",
    shortcut: "/logo-facilita-icon.svg",
    apple: "/logo-facilita-icon.svg"
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
