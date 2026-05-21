"use client";

import { useMemo, useState } from "react";
import {
  vehicles,
  rentals,
  payments,
  maintenances,
  monthlyRevenue,
  money,
  getClientById,
  getVehicleById,
  getRentalByVehicleId,
} from "@/lib/mock-data";
import type { Payment, PaymentMethod } from "@/lib/types";

/* ─── Helpers ──────────────────────────────────────────── */

function getRentalById(id: string) {
  return rentals.find((r) => r.id === id);
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const METHOD_BADGE: Record<PaymentMethod, { label: string; cls: string }> = {
  pix: { label: "PIX", cls: "bg-blue-100 text-blue-700 ring-blue-200" },
  dinheiro: { label: "Dinheiro", cls: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
  cartao: { label: "Cartao", cls: "bg-purple-100 text-purple-700 ring-purple-200" },
  transferencia: { label: "TED", cls: "bg-amber-100 text-amber-700 ring-amber-200" },
};

/* ─── Stat Card ────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
  tone,
  sub,
}: {
  label: string;
  value: string;
  icon: string;
  tone?: "green" | "red" | "orange" | "blue";
  sub?: string;
}) {
  const ring =
    tone === "green"
      ? "ring-emerald-200"
      : tone === "red"
      ? "ring-red-200"
      : tone === "orange"
      ? "ring-gmi-orange/30"
      : "ring-slate-200/70";
  const valueColor =
    tone === "green"
      ? "text-emerald-600"
      : tone === "red"
      ? "text-red-600"
      : tone === "orange"
      ? "text-gmi-orange"
      : "text-gmi-blue";
  const glow =
    tone === "green"
      ? "bg-emerald-400/20"
      : tone === "red"
      ? "bg-red-400/15"
      : tone === "orange"
      ? "bg-gmi-orange/20"
      : "bg-gmi-blue/15";

  return (
    <div className={`group relative overflow-hidden rounded-[2rem] bg-white/90 p-5 shadow-card ring-1 backdrop-blur ${ring}`}>
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl ${glow}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-black leading-none sm:text-4xl ${valueColor}`}>{value}</p>
          {sub && <p className="mt-1.5 text-xs font-semibold text-slate-400">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

/* ─── Pure CSS Bar Chart ───────────────────────────────── */

function RevenueChart() {
  const maxVal = Math.max(...monthlyRevenue.flatMap((m) => [m.revenue, m.expenses]));
  const ceil = Math.ceil(maxVal / 2000) * 2000;

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-200/70 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gmi-orange">Desempenho</p>
          <h3 className="mt-1 text-xl font-black tracking-tight text-gmi-blueDark sm:text-2xl">Receita vs Despesas</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span className="inline-block h-3 w-3 rounded-full bg-gmi-blue" /> Receita
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span className="inline-block h-3 w-3 rounded-full bg-gmi-orange" /> Despesas
          </span>
        </div>
      </div>

      {/* Chart area */}
      <div className="mt-6 flex items-end gap-2 sm:gap-4" style={{ height: 260 }}>
        {monthlyRevenue.map((m) => {
          const revH = (m.revenue / ceil) * 100;
          const expH = (m.expenses / ceil) * 100;
          return (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              {/* Bars */}
              <div className="flex w-full items-end justify-center gap-1" style={{ height: 220 }}>
                {/* Revenue bar */}
                <div className="flex flex-1 max-w-[32px] flex-col items-center justify-end">
                  <span className="mb-1 text-[10px] font-black text-gmi-blue sm:text-xs">
                    {(m.revenue / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-gmi-blue to-[#2b8fcc] transition-all duration-700"
                    style={{ height: `${revH}%`, minHeight: 8 }}
                  />
                </div>
                {/* Expense bar */}
                <div className="flex flex-1 max-w-[32px] flex-col items-center justify-end">
                  <span className="mb-1 text-[10px] font-black text-gmi-orange sm:text-xs">
                    {(m.expenses / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-gmi-orange to-orange-400 transition-all duration-700"
                    style={{ height: `${expH}%`, minHeight: 8 }}
                  />
                </div>
              </div>
              {/* Month label */}
              <span className="mt-1 text-xs font-black text-slate-500">{m.month}</span>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {(() => {
          const totalRev = monthlyRevenue.reduce((a, m) => a + m.revenue, 0);
          const totalExp = monthlyRevenue.reduce((a, m) => a + m.expenses, 0);
          const avg = totalRev / monthlyRevenue.length;
          return (
            <>
              <div className="rounded-2xl bg-blue-50 p-3 text-center ring-1 ring-blue-100">
                <p className="text-[10px] font-bold text-slate-400">Total Receita</p>
                <p className="mt-0.5 text-sm font-black text-gmi-blue">{money.format(totalRev)}</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-3 text-center ring-1 ring-orange-100">
                <p className="text-[10px] font-bold text-slate-400">Total Despesas</p>
                <p className="mt-0.5 text-sm font-black text-gmi-orange">{money.format(totalExp)}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
                <p className="text-[10px] font-bold text-slate-400">Media/Mes</p>
                <p className="mt-0.5 text-sm font-black text-emerald-600">{money.format(avg)}</p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────── */

export default function FinanceiroPage() {
  const [showAll, setShowAll] = useState(false);

  /* Computed data */
  const totalReceita = useMemo(() => payments.reduce((a, p) => a + p.amount, 0), []);
  const totalDespesas = useMemo(() => maintenances.reduce((a, m) => a + m.cost, 0), []);
  const lucro = totalReceita - totalDespesas;

  const pendingPayments = useMemo(() => {
    const activeRentals = rentals.filter((r) => r.status === "ativo");
    const paidRentalIds = new Set(payments.map((p) => p.rentalId));
    const today = new Date();
    let pendingTotal = 0;
    activeRentals.forEach((r) => {
      const start = new Date(r.startDate);
      const weeksActive = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)));
      const expectedPayments = weeksActive;
      const actualPayments = payments.filter((p) => p.rentalId === r.id).length;
      const missing = Math.max(0, expectedPayments - actualPayments);
      pendingTotal += missing * r.totalValue;
    });
    return pendingTotal;
  }, []);

  /* Vehicles near revision (nextRevisionKm - currentKm <= 3000) */
  const revisionAlerts = useMemo(
    () =>
      vehicles
        .filter((v) => v.nextRevisionKm - v.currentKm <= 3000)
        .map((v) => ({
          vehicle: v,
          kmLeft: v.nextRevisionKm - v.currentKm,
          estimatedCost: v.nextRevisionKm >= 100000 ? 1200 : v.nextRevisionKm >= 50000 ? 800 : 450,
        }))
        .sort((a, b) => a.kmLeft - b.kmLeft),
    []
  );

  /* Recent payments sorted by date desc */
  const sortedPayments = useMemo(
    () => [...payments].sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    []
  );
  const visiblePayments = showAll ? sortedPayments : sortedPayments.slice(0, 6);

  /* Sorted maintenances by date desc */
  const sortedMaintenances = useMemo(
    () => [...maintenances].sort((a, b) => b.date.localeCompare(a.date)),
    []
  );

  return (
    <main className="min-h-screen text-slate-950">
      {/* ── Header ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">Controle financeiro</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Financeiro</h1>
              <p className="mt-2 max-w-xl text-sm font-semibold text-blue-100/80">
                Receitas, despesas, pagamentos e alertas de manutencao da frota.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white/12 px-5 py-4 ring-1 ring-white/20 backdrop-blur">
              <p className="text-xs font-bold text-blue-100/70">Periodo</p>
              <p className="text-2xl font-black">Jan - Mai 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Summary Cards ───────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Receita Total"
            value={money.format(totalReceita)}
            icon="💰"
            tone="blue"
            sub={`${payments.length} pagamentos recebidos`}
          />
          <StatCard
            label="Despesas"
            value={money.format(totalDespesas)}
            icon="🔧"
            tone="orange"
            sub={`${maintenances.length} manutencoes realizadas`}
          />
          <StatCard
            label="Lucro Liquido"
            value={money.format(lucro)}
            icon="📈"
            tone="green"
            sub={`Margem ${((lucro / totalReceita) * 100).toFixed(1)}%`}
          />
          <StatCard
            label="Pgtos Pendentes"
            value={money.format(pendingPayments)}
            icon="⏳"
            tone={pendingPayments > 0 ? "red" : "green"}
            sub={pendingPayments > 0 ? "Cobrar clientes" : "Tudo em dia"}
          />
        </div>
      </section>

      {/* ── Revenue Chart + Revision Alerts ──────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart — 2 cols */}
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>

          {/* Revision alerts — 1 col */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Alertas</p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-gmi-blueDark">Revisoes Proximas</h3>
            </div>

            {revisionAlerts.length === 0 ? (
              <div className="rounded-[2rem] bg-emerald-50 p-6 text-center shadow-card ring-1 ring-emerald-100">
                <p className="text-lg font-black text-emerald-600">Nenhum alerta</p>
                <p className="mt-1 text-sm text-slate-500">Todos os veiculos estao OK</p>
              </div>
            ) : (
              revisionAlerts.map(({ vehicle, kmLeft, estimatedCost }) => {
                const urgency = kmLeft <= 1000;
                return (
                  <div
                    key={vehicle.id}
                    className={`relative overflow-hidden rounded-[2rem] p-5 shadow-card ring-1 transition hover:-translate-y-0.5 ${
                      urgency
                        ? "bg-red-50 ring-red-200"
                        : "bg-amber-50 ring-amber-200"
                    }`}
                  >
                    <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${urgency ? "bg-red-300/30" : "bg-amber-300/20"}`} />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="mt-0.5 text-xs font-bold text-slate-500">{vehicle.plate}</p>
                        </div>
                        <span className="text-2xl">🔧</span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-white/80 p-2.5 ring-1 ring-slate-200/60">
                          <p className="text-[10px] font-bold text-slate-400">KM Atual</p>
                          <p className="text-sm font-black text-slate-900">{vehicle.currentKm.toLocaleString("pt-BR")}</p>
                        </div>
                        <div className={`rounded-xl p-2.5 ring-1 ${urgency ? "bg-red-100/80 ring-red-200" : "bg-amber-100/80 ring-amber-200"}`}>
                          <p className="text-[10px] font-bold text-slate-400">Faltam</p>
                          <p className={`text-sm font-black ${urgency ? "text-red-700" : "text-amber-700"}`}>
                            {kmLeft.toLocaleString("pt-BR")} km
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/80">
                        <div
                          className={`h-full rounded-full transition-all ${urgency ? "bg-red-500" : "bg-amber-500"}`}
                          style={{ width: `${Math.min(100, ((3000 - kmLeft) / 3000) * 100)}%` }}
                        />
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500">Custo estimado</p>
                        <p className={`text-sm font-black ${urgency ? "text-red-700" : "text-amber-700"}`}>
                          {money.format(estimatedCost)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── Recent Payments ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gmi-orange">Historico</p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-gmi-blueDark sm:text-2xl">Pagamentos Recentes</h3>
          </div>
          {sortedPayments.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="w-fit rounded-full bg-gmi-blue/10 px-4 py-2 text-xs font-black text-gmi-blue transition hover:bg-gmi-blue/20"
            >
              {showAll ? "Mostrar menos" : `Ver todos (${sortedPayments.length})`}
            </button>
          )}
        </div>

        {/* Desktop table */}
        <div className="mt-5 hidden rounded-[2rem] bg-white shadow-card ring-1 ring-slate-200/70 md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-slate-400">Cliente</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-slate-400">Veiculo</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-slate-400">Valor</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-slate-400">Data</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-slate-400">Metodo</th>
                </tr>
              </thead>
              <tbody>
                {visiblePayments.map((p) => {
                  const rental = getRentalById(p.rentalId);
                  const client = rental ? getClientById(rental.clientId) : null;
                  const vehicle = rental ? getVehicleById(rental.vehicleId) : null;
                  const badge = METHOD_BADGE[p.method];
                  return (
                    <tr key={p.id} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-black text-slate-900">{client?.name ?? "---"}</td>
                      <td className="px-6 py-4 font-bold text-slate-600">
                        {vehicle ? `${vehicle.brand} ${vehicle.model}` : "---"}
                      </td>
                      <td className="px-6 py-4 font-black text-gmi-blue">{money.format(p.amount)}</td>
                      <td className="px-6 py-4 font-bold text-slate-600">{fmtDate(p.paidAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="mt-5 flex flex-col gap-3 md:hidden">
          {visiblePayments.map((p) => {
            const rental = getRentalById(p.rentalId);
            const client = rental ? getClientById(rental.clientId) : null;
            const vehicle = rental ? getVehicleById(rental.vehicleId) : null;
            const badge = METHOD_BADGE[p.method];
            return (
              <div key={p.id} className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-200/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{client?.name ?? "---"}</p>
                    <p className="mt-0.5 text-xs font-bold text-slate-500">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : "---"}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ring-1 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xl font-black text-gmi-blue">{money.format(p.amount)}</p>
                  <p className="text-sm font-bold text-slate-400">{fmtDate(p.paidAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Maintenance History ──────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gmi-orange">Manutencoes</p>
          <h3 className="mt-1 text-xl font-black tracking-tight text-gmi-blueDark sm:text-2xl">Historico Recente</h3>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedMaintenances.map((m) => {
            const vehicle = getVehicleById(m.vehicleId);
            return (
              <div
                key={m.id}
                className="group relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gmi-blue/5 transition group-hover:bg-gmi-blue/10" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-900">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : "---"}
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-slate-400">
                      {vehicle?.plate ?? "---"}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gmi-blue/10 text-lg">
                    🔧
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-600">{m.description}</p>

                <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2.5 ring-1 ring-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400">Data</p>
                    <p className="text-sm font-black text-slate-900">{fmtDate(m.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400">Custo</p>
                    <p className="text-sm font-black text-gmi-orange">{money.format(m.cost)}</p>
                  </div>
                </div>

                <div className="mt-2 rounded-xl bg-blue-50 px-3 py-1.5 text-center ring-1 ring-blue-100">
                  <p className="text-[10px] font-bold text-slate-400">
                    KM no servico: <span className="text-xs font-black text-gmi-blue">{m.kmAtService.toLocaleString("pt-BR")} km</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
