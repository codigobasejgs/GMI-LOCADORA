"use client";

import { useState, useMemo, useCallback } from "react";
import {
  vehicles,
  rentals,
  money,
  getClientById,
  getRentalByVehicleId,
} from "@/lib/mock-data";
import type { Vehicle, Rental } from "@/lib/types";

/* ────────────────────── helpers ────────────────────── */

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toISODate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isDateInRange(dateStr: string, start: string, end: string | null): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const s = new Date(start + "T00:00:00");
  if (d < s) return false;
  if (!end) return true;
  const e = new Date(end + "T00:00:00");
  return d <= e;
}

function isToday(year: number, month: number, day: number) {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

/** All rentals (active or pending) for a specific vehicle that overlap a given date */
function getRentalsForDate(vehicleId: string, dateStr: string): Rental[] {
  return rentals.filter(
    (r) =>
      r.vehicleId === vehicleId &&
      (r.status === "ativo" || r.status === "pendente") &&
      isDateInRange(dateStr, r.startDate, r.endDate)
  );
}

/* ───────────────── status badge colors ─────────────── */

function statusBadge(status: Vehicle["status"]) {
  switch (status) {
    case "alugado":
      return { bg: "bg-gmi-blue", text: "text-white", label: "Alugado" };
    case "disponivel":
      return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Disponivel" };
    case "manutencao":
      return { bg: "bg-amber-100", text: "text-amber-700", label: "Manutencao" };
  }
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */

export default function ReservasPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0].id);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId)!,
    [selectedVehicleId]
  );

  const activeRental = useMemo(
    () => getRentalByVehicleId(selectedVehicleId),
    [selectedVehicleId]
  );

  const activeClient = useMemo(
    () => (activeRental ? getClientById(activeRental.clientId) : null),
    [activeRental]
  );

  /* calendar math */
  const { year, month } = currentMonth;
  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfWeek(year, month);

  const prevMonth = useCallback(() => {
    setCurrentMonth((c) => {
      if (c.month === 0) return { year: c.year - 1, month: 11 };
      return { ...c, month: c.month - 1 };
    });
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth((c) => {
      if (c.month === 11) return { year: c.year + 1, month: 0 };
      return { ...c, month: c.month + 1 };
    });
  }, []);

  /* pre-compute rental map for the selected vehicle/month */
  const dayRentalMap = useMemo(() => {
    const map: Record<number, { rented: boolean; clientName: string | null }> = {};
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = toISODate(year, month, d);
      const matched = getRentalsForDate(selectedVehicleId, dateStr);
      if (matched.length > 0) {
        const r = matched[0];
        const client = getClientById(r.clientId);
        map[d] = { rented: true, clientName: client?.name ?? null };
      } else {
        map[d] = { rented: false, clientName: null };
      }
    }
    return map;
  }, [selectedVehicleId, year, month, totalDays]);

  const isMaintenance = selectedVehicle.status === "manutencao";

  /* ───────────── tooltip position ─────────── */
  const tooltipDay = hoveredDay;
  const tooltipRental = tooltipDay ? dayRentalMap[tooltipDay] : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* ── HEADER ── */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-20 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">
                Gestao de reservas
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Calendario
              </h1>
              <p className="mt-2 max-w-xl text-sm font-semibold text-blue-100/80">
                Visualize a disponibilidade da frota e acompanhe as locacoes ativas.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white/12 px-5 py-4 ring-1 ring-white/20 backdrop-blur">
              <p className="text-xs font-bold text-blue-100/70">Mes atual</p>
              <p className="text-2xl font-black">
                {MONTH_NAMES[month]} {year}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VEHICLE SELECTOR ── */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-10 overflow-hidden rounded-[2rem] bg-white/90 p-4 shadow-card ring-1 ring-slate-200/70 backdrop-blur sm:p-5">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Selecione o veiculo
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            {vehicles.map((v) => {
              const badge = statusBadge(v.status);
              const isSelected = v.id === selectedVehicleId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`group relative flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-gmi-blue text-white shadow-lg shadow-gmi-blue/25 ring-2 ring-gmi-blue"
                      : "bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 hover:ring-slate-300"
                  }`}
                >
                  <div
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      v.status === "alugado"
                        ? isSelected ? "bg-white" : "bg-gmi-blue"
                        : v.status === "disponivel"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {v.model}
                    </p>
                    <p className={`text-xs font-bold ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                      {v.plate}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BODY GRID: Calendar + Sidebar ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* ── CALENDAR ── */}
          <div className="flex-1 overflow-hidden rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-7">
            {/* Month nav */}
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-gmi-blue hover:text-white"
                aria-label="Mes anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-black tracking-tight text-gmi-blueDark sm:text-2xl">
                {MONTH_NAMES[month]} {year}
              </h2>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-gmi-blue hover:text-white"
                aria-label="Proximo mes"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Week headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {WEEK_DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                  {d}
                </div>
              ))}

              {/* Empty offset cells */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const info = dayRentalMap[day];
                const today = isToday(year, month, day);
                const rented = info?.rented ?? false;
                const isHovered = hoveredDay === day;

                return (
                  <div
                    key={day}
                    className="relative"
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div
                      className={`relative flex aspect-square cursor-default flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all duration-150 sm:text-base ${
                        rented
                          ? "bg-gmi-blue/10 text-gmi-blue ring-1 ring-gmi-blue/20"
                          : isMaintenance
                          ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200/50"
                          : "bg-slate-50 text-slate-600 ring-1 ring-slate-100 hover:bg-slate-100"
                      } ${today ? "ring-2 ring-gmi-orange shadow-md shadow-gmi-orange/20" : ""}`}
                    >
                      <span className={`font-black ${today ? "text-gmi-orange" : ""}`}>{day}</span>
                      {rented && (
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gmi-blue" />
                      )}
                      {isMaintenance && !rented && (
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </div>

                    {/* Tooltip */}
                    {isHovered && rented && info?.clientName && (
                      <div className="pointer-events-none absolute -top-12 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-xl bg-gmi-blueDark px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                        <span className="mr-1">👤</span>
                        {info.clientName}
                        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gmi-blueDark" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gmi-blue" />
                <span className="text-xs font-bold text-slate-500">Alugado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-500">Disponivel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-500">Manutencao</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full ring-2 ring-gmi-orange bg-white" />
                <span className="text-xs font-bold text-slate-500">Hoje</span>
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="w-full shrink-0 lg:w-80 xl:w-96">
            {/* Vehicle info card */}
            <div className="overflow-hidden rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-gmi-orange">
                    Veiculo selecionado
                  </p>
                  <h3 className="mt-1.5 truncate text-xl font-black tracking-tight text-gmi-blueDark">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </h3>
                  <p className="mt-1 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">
                    {selectedVehicle.plate}
                  </p>
                </div>
                {(() => {
                  const badge = statusBadge(selectedVehicle.status);
                  return (
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              {/* Vehicle details */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-xs font-bold text-slate-400">Ano</p>
                  <p className="mt-0.5 text-base font-black text-slate-900">{selectedVehicle.year}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-xs font-bold text-slate-400">Cor</p>
                  <p className="mt-0.5 text-base font-black text-slate-900">{selectedVehicle.color}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-xs font-bold text-slate-400">Combustivel</p>
                  <p className="mt-0.5 text-base font-black text-slate-900">{selectedVehicle.fuel}</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-3 ring-1 ring-orange-100">
                  <p className="text-xs font-bold text-slate-400">Diaria</p>
                  <p className="mt-0.5 text-base font-black text-gmi-orange">
                    {money.format(selectedVehicle.dailyRate)}
                  </p>
                </div>
              </div>

              {/* KM bar */}
              <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400">KM atual</p>
                  <p className="text-xs font-bold text-slate-400">
                    Prox. revisao: {selectedVehicle.nextRevisionKm.toLocaleString("pt-BR")} km
                  </p>
                </div>
                <p className="mt-1 text-lg font-black text-slate-950">
                  {selectedVehicle.currentKm.toLocaleString("pt-BR")} km
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedVehicle.nextRevisionKm - selectedVehicle.currentKm <= 2000
                        ? "bg-gradient-to-r from-gmi-orange to-red-500"
                        : "bg-gmi-blue"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((selectedVehicle.currentKm / selectedVehicle.nextRevisionKm) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Active rental card */}
            <div className="mt-5 overflow-hidden rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Locacao ativa
              </p>

              {activeRental && activeClient ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-gmi-blue/5 p-3.5 ring-1 ring-gmi-blue/10">
                    <p className="text-xs font-bold text-slate-400">Cliente</p>
                    <p className="mt-0.5 text-base font-black text-gmi-blueDark">
                      {activeClient.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <p className="text-xs font-bold text-slate-400">Inicio</p>
                      <p className="mt-0.5 text-sm font-black text-slate-900">
                        {new Date(activeRental.startDate + "T00:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <p className="text-xs font-bold text-slate-400">Termino</p>
                      <p className="mt-0.5 text-sm font-black text-slate-900">
                        {activeRental.endDate
                          ? new Date(activeRental.endDate + "T00:00:00").toLocaleDateString("pt-BR")
                          : "Em aberto"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-orange-50 p-3 ring-1 ring-orange-100">
                      <p className="text-xs font-bold text-slate-400">Valor</p>
                      <p className="mt-0.5 text-base font-black text-gmi-orange">
                        {money.format(activeRental.totalValue)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <p className="text-xs font-bold text-slate-400">Pgto.</p>
                      <p className="mt-0.5 text-sm font-black text-gmi-blue">
                        {activeRental.paymentDay}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <p className="text-xs font-bold text-slate-400">WhatsApp</p>
                    <p className="mt-0.5 text-sm font-black text-slate-900">
                      {activeClient.whatsapp}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-100">
                  <p className="text-3xl">🅿️</p>
                  <p className="mt-2 text-sm font-black text-slate-400">
                    {isMaintenance ? "Veiculo em manutencao" : "Nenhuma locacao ativa"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-300">
                    {isMaintenance
                      ? "Aguardando conclusao do servico"
                      : "Este veiculo esta disponivel para locacao"}
                  </p>
                </div>
              )}
            </div>

            {/* Monthly summary */}
            <div className="mt-5 overflow-hidden rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Resumo do mes
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gmi-blue/5 p-3.5 ring-1 ring-gmi-blue/10">
                  <p className="text-xs font-bold text-slate-400">Dias alugados</p>
                  <p className="mt-0.5 text-2xl font-black text-gmi-blue">
                    {Object.values(dayRentalMap).filter((d) => d.rented).length}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3.5 ring-1 ring-emerald-100">
                  <p className="text-xs font-bold text-slate-400">Dias livres</p>
                  <p className="mt-0.5 text-2xl font-black text-emerald-600">
                    {Object.values(dayRentalMap).filter((d) => !d.rented).length}
                  </p>
                </div>
              </div>
              {activeRental && (
                <div className="mt-3 rounded-2xl bg-orange-50 p-3.5 ring-1 ring-orange-100">
                  <p className="text-xs font-bold text-slate-400">Receita estimada (mes)</p>
                  <p className="mt-0.5 text-2xl font-black text-gmi-orange">
                    {money.format(
                      Object.values(dayRentalMap).filter((d) => d.rented).length *
                        selectedVehicle.dailyRate
                    )}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
