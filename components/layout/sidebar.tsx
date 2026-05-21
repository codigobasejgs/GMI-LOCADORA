"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/lib/mock-data";
import { useAdminSettings } from "@/lib/local-store";

export function Sidebar() {
  const settings = useAdminSettings();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-gmi-blue px-4 py-3 shadow-lg lg:hidden">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-white p-1.5 shadow-md">
            <Image src="/logo-gmi.png" alt="GMI" width={100} height={50} className="h-9 w-auto rounded-xl object-contain" />
          </div>
          <span className="text-lg font-black tracking-tight text-white">{settings.tradeName}</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-2xl bg-white/15 p-2.5 text-white backdrop-blur transition hover:bg-white/25"
          aria-label="Menu"
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </header>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#041e34] transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="flex items-center gap-4 border-b border-white/10 px-6 py-5">
          <div className="rounded-2xl bg-white p-2 shadow-xl">
            <Image src="/logo-gmi.png" alt="GMI" width={120} height={60} className="h-12 w-auto rounded-xl object-contain" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-white">{settings.tradeName}</p>
            <p className="text-xs font-bold text-blue-300/70">Gestão de Frota</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition ${
                  active
                    ? "bg-gmi-blue text-white shadow-lg shadow-gmi-blue/30"
                    : item.href === "/configuracoes"
                    ? "bg-white/8 text-orange-200 ring-1 ring-gmi-orange/25 hover:bg-white/12 hover:text-white"
                    : "text-blue-200/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4">
          <p className="text-xs font-bold text-blue-300/40">{settings.tradeName} &copy; 2026</p>
          <p className="text-xs font-bold text-blue-300/30">Sistema de Gestão v1.0</p>
        </div>
      </aside>
    </>
  );
}
