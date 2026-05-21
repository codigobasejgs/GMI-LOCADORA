import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GMI Locadora | Gestão de Frota",
  description: "Sistema de gestão de frota, cobrança e contratos da GMI Locadora.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "GMI Locadora" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B5A93",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Sidebar />
        <div className="min-h-screen bg-[#eef3f7] lg:pl-72">
          {children}
        </div>
      </body>
    </html>
  );
}
