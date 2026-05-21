import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { SplashScreen } from "@/components/layout/splash-screen";
import { SmartNavigation } from "@/components/layout/smart-navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GMI Locadora | Gestão de Frota",
  description: "Sistema de gestão de frota, cobrança e contratos da GMI Locadora.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
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
        <SplashScreen />
        <Sidebar />
        <SmartNavigation />
        <div className="min-h-screen bg-[#eef3f7] pb-44 lg:pb-0 lg:pl-72">
          {children}
        </div>
      </body>
    </html>
  );
}
