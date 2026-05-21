"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { vehicles as initialVehicles, rentals, today, money, getClientById } from "@/lib/mock-data";
import type { Vehicle } from "@/lib/types";

function StatCard({ label, value, icon, tone }: { label: string; value: number | string; icon: string; tone?: "alert" | "success" }) {
  const colors = tone === "alert" ? "ring-gmi-orange/30 text-gmi-orange" : tone === "success" ? "ring-emerald-200 text-emerald-600" : "ring-slate-200/70 text-gmi-blue";
  const glow = tone === "alert" ? "bg-gmi-orange/20" : tone === "success" ? "bg-emerald-400/20" : "bg-gmi-blue/15";
  return (
    <div className={`group relative overflow-hidden rounded-[2rem] bg-white/90 p-5 shadow-card ring-1 backdrop-blur ${colors.split(" ")[0]}`}>
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl ${glow}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className={`mt-2 text-4xl font-black leading-none ${colors.split(" ")[1]}`}>{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function KmUpdater({ currentKm, onUpdate }: { currentKm: number; onUpdate: (km: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(currentKm));
  function save() {
    const parsed = parseInt(val.replace(/\D/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) onUpdate(parsed);
    setEditing(false);
  }
  if (!editing) {
    return (
      <button type="button" onClick={() => { setVal(String(currentKm)); setEditing(true); }} className="rounded-xl bg-gmi-blue/10 px-2.5 py-1 text-xs font-black text-gmi-blue transition hover:bg-gmi-blue/20" title="Atualizar KM">
        Atualizar
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <input type="text" value={val} onChange={(e) => setVal(e.target.value)} className="w-24 rounded-xl border border-slate-200 px-2.5 py-1 text-sm font-bold text-slate-900 focus:border-gmi-blue focus:outline-none focus:ring-2 focus:ring-gmi-blue/20" autoFocus onKeyDown={(e) => e.key === "Enter" && save()} />
      <button type="button" onClick={save} className="rounded-xl bg-emerald-500 px-2.5 py-1 text-xs font-black text-white transition hover:bg-emerald-600">OK</button>
      <button type="button" onClick={() => setEditing(false)} className="rounded-xl bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-600 transition hover:bg-slate-300">X</button>
    </div>
  );
}

function VehicleCard({ vehicle, paid, onPay, onKmUpdate }: { vehicle: Vehicle; paid: boolean; onPay: () => void; onKmUpdate: (km: number) => void }) {
  const rental = rentals.find((r) => r.vehicleId === vehicle.id && r.status === "ativo");
  const client = rental ? getClientById(rental.clientId) : null;
  const isDueToday = rental && rental.paymentDay === today && !paid;
  const isNearRevision = vehicle.nextRevisionKm - vehicle.currentKm <= 2000;
  const progress = Math.min(100, Math.round((vehicle.currentKm / vehicle.nextRevisionKm) * 100));
  const kmLeft = vehicle.nextRevisionKm - vehicle.currentKm;

  return (
    <article className={`relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-card ring-2 transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${isDueToday ? "animate-pulse-border ring-gmi-orange" : "ring-white"}`}>
      {isDueToday && <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-gmi-orange via-red-500 to-gmi-orange" />}
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gmi-blue/5" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-black tracking-tight text-gmi-blueDark">{vehicle.brand} {vehicle.model}</h2>
            {isNearRevision && <span title="Revisão próxima" className="text-lg">🔧</span>}
          </div>
          <p className="mt-1.5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">{vehicle.plate}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${vehicle.status === "alugado" ? "bg-gmi-blue text-white" : vehicle.status === "manutencao" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
          {vehicle.status === "alugado" ? "Alugado" : vehicle.status === "manutencao" ? "Manutenção" : "Livre"}
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
          <p className="text-xs font-bold text-slate-400">Cliente</p>
          <p className="mt-1 text-base font-black text-slate-950">{client?.name ?? "—"}</p>
        </div>
        <div className="rounded-2xl bg-orange-50 p-3.5 ring-1 ring-orange-100">
          <p className="text-xs font-bold text-slate-400">Aluguel</p>
          <p className="mt-1 text-base font-black text-gmi-orange">{rental ? money.format(rental.totalValue) : "—"}</p>
        </div>
      </div>

      {rental && (
        <div className="relative mt-3 rounded-2xl border border-slate-100 bg-white p-3.5">
          <p className="text-xs font-bold text-slate-400">Pagamento fixo</p>
          <p className="mt-0.5 text-lg font-black text-gmi-blue">Toda {rental.paymentDay}</p>
        </div>
      )}

      <div className="relative mt-3 rounded-2xl border border-slate-100 bg-white p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-slate-400">KM atual</p>
            <p className="text-lg font-black text-slate-950">{vehicle.currentKm.toLocaleString("pt-BR")} km</p>
          </div>
          <KmUpdater currentKm={vehicle.currentKm} onUpdate={onKmUpdate} />
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full transition-all ${isNearRevision ? "bg-gradient-to-r from-gmi-orange to-red-500" : "bg-gmi-blue"}`} style={{ width: `${progress}%` }} />
        </div>
        {isNearRevision ? (
          <p className="mt-2 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">
            🔧 Revisão em {kmLeft.toLocaleString("pt-BR")} km
          </p>
        ) : (
          <p className="mt-1.5 text-xs font-semibold text-slate-400">Próx. revisão: {vehicle.nextRevisionKm.toLocaleString("pt-BR")} km</p>
        )}
      </div>

      {isDueToday && (
        <button type="button" onClick={onPay} className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gmi-orange to-orange-600 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-200 transition hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-gmi-orange/30">
          <span className="text-lg">💳</span> Registrar Pagamento
        </button>
      )}

      {paid && <div className="relative mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-700 ring-1 ring-emerald-100">✅ Pagamento registrado hoje</div>}
    </article>
  );
}

export default function DashboardPage() {
  const [vehicleList, setVehicleList] = useState<Vehicle[]>(initialVehicles);
  const [paidIds, setPaidIds] = useState<Set<string>>(() => new Set());

  const summary = useMemo(() => {
    const rented = vehicleList.filter((v) => v.status === "alugado").length;
    const available = vehicleList.filter((v) => v.status === "disponivel").length;
    const inMaint = vehicleList.filter((v) => v.status === "manutencao").length;
    const dueToday = rentals.filter((r) => r.status === "ativo" && r.paymentDay === today && !paidIds.has(r.vehicleId)).length;
    const totalRevenue = rentals.filter((r) => r.status === "ativo").reduce((acc, r) => acc + r.totalValue, 0);
    return { rented, available, inMaint, dueToday, totalRevenue };
  }, [vehicleList, paidIds]);

  function markAsPaid(id: string) {
    setPaidIds((c) => new Set(c).add(id));
  }

  function updateKm(vehicleId: string, newKm: number) {
    setVehicleList((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, currentKm: newKm } : v)));
  }

  return (
    <main className="min-h-screen text-slate-950">
      {/* Header */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">Painel principal</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Dashboard</h1>
              <p className="mt-2 max-w-xl text-sm font-semibold text-blue-100/80">Visão completa da frota, cobranças e revisões.</p>
            </div>
            <div className="rounded-[2rem] bg-white/12 px-5 py-4 ring-1 ring-white/20 backdrop-blur">
              <p className="text-xs font-bold text-blue-100/70">Dia simulado</p>
              <p className="text-2xl font-black">{today}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Alugados" value={summary.rented} icon="🚗" />
          <StatCard label="Disponíveis" value={summary.available} icon="🅿️" tone="success" />
          <StatCard label="Cobranças Hoje" value={summary.dueToday} icon="🔔" tone="alert" />
          <StatCard label="Receita Ativa" value={money.format(summary.totalRevenue)} icon="💰" />
        </div>
      </section>

      {/* Vehicle grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gmi-orange">Painel operacional</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-gmi-blueDark">Veículos</h2>
          </div>
          <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-gmi-blue shadow-sm ring-1 ring-slate-200">
            {vehicleList.length} cadastrados
          </span>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vehicleList.map((v) => (
            <VehicleCard key={v.id} vehicle={v} paid={paidIds.has(v.id)} onPay={() => markAsPaid(v.id)} onKmUpdate={(km) => updateKm(v.id, km)} />
          ))}
        </div>
      </section>
    </main>
  );
}
