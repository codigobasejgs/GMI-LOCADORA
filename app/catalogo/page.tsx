"use client";

import Image from "next/image";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { money } from "@/lib/mock-data";
import { useStoredVehicles } from "@/lib/local-store";
import type { Vehicle, VehicleStatus } from "@/lib/types";

/* ─── Status helpers ─────────────────────────────────────── */
const statusConfig: Record<VehicleStatus, { label: string; bg: string; text: string; dot: string }> = {
  alugado:    { label: "Alugado",     bg: "bg-gmi-blue/15",   text: "text-gmi-blue",     dot: "bg-gmi-blue" },
  disponivel: { label: "Disponivel",  bg: "bg-emerald-100",   text: "text-emerald-700",  dot: "bg-emerald-500" },
  manutencao: { label: "Manutencao",  bg: "bg-amber-100",     text: "text-amber-700",    dot: "bg-amber-500" },
};

type FilterKey = "todos" | VehicleStatus;

const filters: { key: FilterKey; label: string }[] = [
  { key: "todos",      label: "Todos" },
  { key: "disponivel", label: "Disponivel" },
  { key: "alugado",    label: "Alugado" },
  { key: "manutencao", label: "Manutencao" },
];

/* ─── Detail Modal ───────────────────────────────────────── */
function DetailModal({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const s = statusConfig[vehicle.status];
  const progress = Math.min(100, Math.round((vehicle.currentKm / vehicle.nextRevisionKm) * 100));
  const kmLeft = vehicle.nextRevisionKm - vehicle.currentKm;
  const isNearRevision = kmLeft <= 2000;

  /* Close on Escape */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes do ${vehicle.brand} ${vehicle.model}`}
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-200/60">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero image */}
        <div className="relative h-64 w-full overflow-hidden rounded-t-[2rem] bg-slate-100 sm:h-72">
          <Image
            src={vehicle.photoUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 672px"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-white drop-shadow-lg sm:text-3xl">
                {vehicle.brand} {vehicle.model}
              </h2>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-sm font-black text-white backdrop-blur">
                {vehicle.plate}
              </span>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide ${s.bg} ${s.text}`}>
              <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7">
          {/* Price highlight */}
          <div className="rounded-2xl bg-gradient-to-r from-gmi-orange/10 to-orange-50 p-4 ring-1 ring-gmi-orange/20">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Diaria</p>
            <p className="mt-1 text-3xl font-black text-gmi-orange">{money.format(vehicle.dailyRate)}<span className="text-base font-bold text-slate-400">/dia</span></p>
          </div>

          {/* Info grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Ano",          value: vehicle.year },
              { label: "Cor",          value: vehicle.color },
              { label: "Combustivel",  value: vehicle.fuel },
              { label: "Cambio",       value: vehicle.transmission },
              { label: "Placa",        value: vehicle.plate },
              { label: "Status",       value: s.label },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="mt-1 text-sm font-black text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* KM progress */}
          <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400">Quilometragem</p>
                <p className="text-xl font-black text-slate-950">{vehicle.currentKm.toLocaleString("pt-BR")} km</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400">Proxima revisao</p>
                <p className="text-xl font-black text-gmi-blue">{vehicle.nextRevisionKm.toLocaleString("pt-BR")} km</p>
              </div>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${isNearRevision ? "bg-gradient-to-r from-gmi-orange to-red-500" : "bg-gradient-to-r from-gmi-blue to-sky-400"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">{progress}% percorrido</span>
              {isNearRevision ? (
                <span className="rounded-lg bg-red-50 px-2.5 py-1 font-black text-red-600">Revisao em {kmLeft.toLocaleString("pt-BR")} km</span>
              ) : (
                <span className="text-slate-400">Faltam {kmLeft.toLocaleString("pt-BR")} km</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Vehicle Card ───────────────────────────────────────── */
function VehicleCard({ vehicle, onClick }: { vehicle: Vehicle; onClick: () => void }) {
  const s = statusConfig[vehicle.status];
  const progress = Math.min(100, Math.round((vehicle.currentKm / vehicle.nextRevisionKm) * 100));
  const kmLeft = vehicle.nextRevisionKm - vehicle.currentKm;
  const isNearRevision = kmLeft <= 2000;

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalhes do ${vehicle.brand} ${vehicle.model}`}
      className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-white shadow-card ring-2 ring-white transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-gmi-blue/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gmi-blue/40"
    >
      {/* Photo */}
      <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
        <Image
          src={vehicle.photoUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Status badge over image */}
        <span className={`absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide backdrop-blur-sm ${s.bg} ${s.text}`}>
          <span className={`inline-block h-2 w-2 rounded-full ${s.dot}`} />
          {s.label}
        </span>

        {/* Plate badge over image */}
        <span className="absolute bottom-3 right-4 rounded-full bg-black/30 px-3 py-1 text-xs font-black text-white backdrop-blur">
          {vehicle.plate}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-black tracking-tight text-gmi-blueDark">
              {vehicle.brand} {vehicle.model}
            </h3>
          </div>
          {isNearRevision && <span title="Revisao proxima" className="shrink-0 text-lg">&#128295;</span>}
        </div>

        {/* Specs row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[
            { icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", value: String(vehicle.year) },
            { icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42", value: vehicle.color },
            { icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z", value: vehicle.fuel },
          ].map((spec, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-3.5 w-3.5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d={spec.icon} />
              </svg>
              {spec.value}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-3.5 w-3.5 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            {vehicle.transmission}
          </span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Diaria</p>
            <p className="text-2xl font-black text-gmi-orange">{money.format(vehicle.dailyRate)}<span className="text-sm font-bold text-slate-400">/dia</span></p>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-gmi-blue/10 px-3 py-1.5 text-xs font-black text-gmi-blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Detalhes
          </div>
        </div>

        {/* KM progress bar */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>{vehicle.currentKm.toLocaleString("pt-BR")} km</span>
            <span>Revisao: {vehicle.nextRevisionKm.toLocaleString("pt-BR")} km</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${isNearRevision ? "bg-gradient-to-r from-gmi-orange to-red-500" : "bg-gmi-blue"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {isNearRevision && (
            <p className="mt-1.5 text-[11px] font-black text-red-600">Revisao em {kmLeft.toLocaleString("pt-BR")} km</p>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─── Page Component ─────────────────────────────────────── */
export default function CatalogoPage() {
  const vehicles = useStoredVehicles();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("todos");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const filtered = useMemo(() => {
    if (activeFilter === "todos") return vehicles;
    return vehicles.filter((v) => v.status === activeFilter);
  }, [activeFilter]);

  const counts = useMemo(() => ({
    todos:      vehicles.length,
    disponivel: vehicles.filter((v) => v.status === "disponivel").length,
    alugado:    vehicles.filter((v) => v.status === "alugado").length,
    manutencao: vehicles.filter((v) => v.status === "manutencao").length,
  }), []);

  const openDetail = useCallback((v: Vehicle) => setSelectedVehicle(v), []);
  const closeDetail = useCallback(() => setSelectedVehicle(null), []);

  return (
    <main className="min-h-screen text-slate-950">
      {/* ── Header ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-20 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">Frota completa</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Catalogo de Veiculos</h1>
              <p className="mt-2 max-w-xl text-sm font-semibold text-blue-100/80">
                Explore todos os veiculos da frota GMI. Filtre por status e veja detalhes completos.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-[2rem] bg-white/12 px-5 py-4 ring-1 ring-white/20 backdrop-blur">
                <p className="text-xs font-bold text-blue-100/70">Total na frota</p>
                <p className="text-3xl font-black">{vehicles.length}</p>
              </div>
              <div className="rounded-[2rem] bg-emerald-400/15 px-5 py-4 ring-1 ring-emerald-300/20 backdrop-blur">
                <p className="text-xs font-bold text-emerald-200/80">Disponiveis</p>
                <p className="text-3xl font-black text-emerald-300">{counts.disponivel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter bar ─────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-7 flex flex-wrap items-center gap-2 rounded-[2rem] bg-white/90 p-2.5 shadow-card ring-1 ring-slate-200/60 backdrop-blur">
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center gap-2 rounded-[1.5rem] px-5 py-2.5 text-sm font-black transition-all duration-200
                  ${isActive
                    ? "bg-gmi-blue text-white shadow-lg shadow-gmi-blue/25"
                    : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                {f.label}
                <span className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-black
                  ${isActive
                    ? "bg-white/25 text-white"
                    : "bg-slate-100 text-slate-500"
                  }`}>
                  {counts[f.key]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Vehicle grid ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gmi-orange">Catalogo</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-gmi-blueDark">
              {activeFilter === "todos" ? "Todos os veiculos" : `Veiculos — ${filters.find((f) => f.key === activeFilter)?.label}`}
            </h2>
          </div>
          <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-gmi-blue shadow-sm ring-1 ring-slate-200">
            {filtered.length} {filtered.length === 1 ? "veiculo" : "veiculos"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] bg-white py-20 text-center shadow-card ring-1 ring-slate-200/60">
            <span className="text-5xl">&#128663;</span>
            <p className="mt-4 text-lg font-black text-slate-400">Nenhum veiculo encontrado</p>
            <p className="mt-1 text-sm text-slate-400">Tente outro filtro.</p>
            <button
              type="button"
              onClick={() => setActiveFilter("todos")}
              className="mt-5 rounded-full bg-gmi-blue px-6 py-2.5 text-sm font-black text-white transition hover:bg-gmi-blueDark"
            >
              Ver todos
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onClick={() => openDetail(v)} />
            ))}
          </div>
        )}
      </section>

      {/* ── Detail modal ───────────────────────────────────── */}
      {selectedVehicle && <DetailModal vehicle={selectedVehicle} onClose={closeDetail} />}
    </main>
  );
}
