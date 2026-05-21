"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const flow = [
  { href: "/", label: "Dashboard", next: "/cadastros", action: "Cadastrar clientes/carros" },
  { href: "/cadastros", label: "Cadastros", next: "/catalogo", action: "Ver frota cadastrada" },
  { href: "/catalogo", label: "Catálogo", next: "/reservas", action: "Criar reserva" },
  { href: "/reservas", label: "Reservas", next: "/contratos", action: "Gerar contrato" },
  { href: "/contratos", label: "Contratos", next: "/checklist", action: "Fazer vistoria" },
  { href: "/checklist", label: "Checklist", next: "/financeiro", action: "Registrar financeiro" },
  { href: "/financeiro", label: "Financeiro", next: "/relatorios", action: "Exportar relatório" },
  { href: "/relatorios", label: "Relatórios", next: "/configuracoes", action: "Ajustar sistema" },
  { href: "/configuracoes", label: "Configurações", next: "/", action: "Voltar ao painel" },
];

function isEditable(element: EventTarget | null): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
}

function focusNext(current: HTMLElement) {
  const fields = Array.from(document.querySelectorAll<HTMLElement>("input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])"))
    .filter((item) => item.offsetParent !== null && item.tabIndex !== -1);
  const index = fields.indexOf(current);
  const next = fields[index + 1];
  if (next) next.focus();
}

export function SmartNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const step = useMemo(() => flow.find((item) => item.href === pathname) ?? flow[0], [pathname]);
  const currentIndex = flow.findIndex((item) => item.href === step.href);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter" && isEditable(event.target) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        focusNext(event.target);
      }

      if (event.altKey && event.key === "ArrowRight") {
        event.preventDefault();
        router.push(step.next);
      }

      if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault();
        const previous = flow[(currentIndex - 1 + flow.length) % flow.length];
        router.push(previous.href);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, router, step.next]);

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 overflow-hidden rounded-[2rem] bg-white/95 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200 backdrop-blur lg:inset-x-auto lg:right-4 lg:w-[22rem]">
      <div className="bg-gradient-to-r from-gmi-blue to-gmi-blueDark px-5 py-4 text-white">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">Fluxo inteligente</p>
        <p className="mt-1 text-sm font-black">Etapa {currentIndex + 1} de {flow.length}: {step.label}</p>
      </div>
      <div className="p-4">
        <div className="flex gap-1">
          {flow.map((item, index) => (
            <span key={item.href} className={`h-2 flex-1 rounded-full ${index <= currentIndex ? "bg-gmi-orange" : "bg-slate-200"}`} />
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-500">Enter avança para próximo campo. Alt + → vai para próxima etapa.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={flow[(currentIndex - 1 + flow.length) % flow.length].href} className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-xs font-black text-slate-600 hover:bg-slate-200">
            Voltar
          </Link>
          <Link href={step.next} className="rounded-2xl bg-gmi-orange px-4 py-3 text-center text-xs font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600">
            {step.action}
          </Link>
        </div>
      </div>
    </div>
  );
}
