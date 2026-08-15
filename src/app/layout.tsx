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
      className="h-full antialiased scroll-smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#f4f4f7] text-zinc-900 selection:bg-[#111115] selection:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
