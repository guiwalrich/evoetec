import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evo Etec ERP — Sistema de Gestão para Assistências Técnicas",
  description: "Sistema completo de gestão financeira, ordens de serviço, vendas e catálogo online para assistências técnicas.",
  icons: {
    icon: [
      { url: "/assets/wrldevotec.png", type: "image/png" },
    ],
    shortcut: "/assets/wrldevotec.png",
    apple: "/assets/wrldevotec.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#111113] text-zinc-100">{children}</body>
    </html>
  );
}
