"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leave = window.setTimeout(() => setLeaving(true), 2100);
    const hide = window.setTimeout(() => setVisible(false), 2800);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#041e34] transition-opacity duration-700 ${leaving ? "opacity-0" : "opacity-100"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(43,143,204,0.45),rgba(11,90,147,0.22)_34%,rgba(4,30,52,1)_72%)]" />
      <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-gmi-orange/25 blur-3xl splash-float" />
      <div className="absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl splash-float-delayed" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="splash-logo-wrap relative rounded-[2.4rem] bg-white p-5 shadow-2xl shadow-black/30 ring-1 ring-white/30">
          <div className="absolute inset-[-2px] rounded-[2.5rem] bg-gradient-to-r from-gmi-orange via-white to-sky-300 opacity-70 blur-sm" />
          <div className="relative rounded-[1.8rem] bg-white p-3">
            <Image src="/logo-gmi.png" alt="GMI Locadora" width={220} height={120} priority className="h-24 w-auto object-contain sm:h-32" />
          </div>
        </div>

        <p className="splash-kicker mt-8 text-xs font-black uppercase tracking-[0.55em] text-orange-200">GMI Locadora</p>
        <h1 className="splash-title mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Gestão de frota premium</h1>
        <div className="splash-loader mt-7 h-1.5 w-56 overflow-hidden rounded-full bg-white/15 ring-1 ring-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-gmi-orange via-white to-sky-300" />
        </div>
      </div>
    </div>
  );
}
