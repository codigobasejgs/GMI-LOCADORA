"use client";

import { useMemo, useState } from "react";
import { vehicles as seedVehicles, rentals, payments, maintenances, money } from "@/lib/mock-data";
import { findStoredClient, findStoredVehicle, useAdminSettings, useStoredClients, useStoredVehicles } from "@/lib/local-store";

type EntryType = "receita" | "despesa";
type Entry = { id: string; type: EntryType; vehicleId: string; title: string; amount: number; date: string; category: string };

type Goal = { monthlyRevenue: number; monthlyProfit: number; occupancy: number };

const todayIso = new Date().toISOString().slice(0, 10);
const initialEntries: Entry[] = [
  ...payments.map((p) => {
    const rental = rentals.find((r) => r.id === p.rentalId);
    return { id: p.id, type: "receita" as const, vehicleId: rental?.vehicleId ?? "", title: "Pagamento de diaria", amount: p.amount, date: p.paidAt, category: p.method };
  }),
  ...maintenances.map((m) => ({ id: m.id, type: "despesa" as const, vehicleId: m.vehicleId, title: m.description, amount: m.cost, date: m.date, category: "manutencao" })),
  { id: "fuel-1", type: "despesa", vehicleId: "v1", title: "Abastecimento completo", amount: 285, date: todayIso, category: "combustivel" },
  { id: "fuel-2", type: "despesa", vehicleId: "v3", title: "Troca de oleo", amount: 420, date: todayIso, category: "oleo" },
];

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function receiptText(entry: Entry, vehicles: typeof seedVehicles, settings: ReturnType<typeof useAdminSettings>) {
  const vehicle = findStoredVehicle(vehicles, entry.vehicleId);
  return `${settings.receiptTitle}\n${settings.tradeName}\nCNPJ: ${settings.cnpj}\nWhatsApp: ${settings.whatsapp}\n\nTipo: ${entry.type}\nDescricao: ${entry.title}\nVeiculo: ${vehicle?.brand ?? ""} ${vehicle?.model ?? ""} ${vehicle?.plate ?? ""}\nValor: ${money.format(entry.amount)}\nData: ${fmtDate(entry.date)}\nStatus: baixado no sistema\n\n${settings.receiptFooter}`;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "blue" | "orange" | "green" | "red" }) {
  const cls = {
    blue: "text-gmi-blue bg-blue-50 ring-blue-100",
    orange: "text-gmi-orange bg-orange-50 ring-orange-100",
    green: "text-emerald-600 bg-emerald-50 ring-emerald-100",
    red: "text-red-600 bg-red-50 ring-red-100",
  }[tone];
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${cls.split(" ")[1]}`} />
      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className={`mt-2 text-3xl font-black ${cls.split(" ")[0]}`}>{value}</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

export default function FinanceiroPage() {
  const settings = useAdminSettings();
  const vehicles = useStoredVehicles();
  const clients = useStoredClients();
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [goal, setGoal] = useState<Goal>({ monthlyRevenue: 25000, monthlyProfit: 16000, occupancy: 85 });
  const [form, setForm] = useState({ type: "despesa" as EntryType, vehicleId: seedVehicles[0]?.id ?? "", title: "", amount: "", category: "manutencao" });
  const [rateio, setRateio] = useState({ dailyRate: "180", plannedDays: "7", realDays: "9", fine: "50" });

  const totals = useMemo(() => {
    const receita = entries.filter((e) => e.type === "receita").reduce((sum, e) => sum + e.amount, 0);
    const despesa = entries.filter((e) => e.type === "despesa").reduce((sum, e) => sum + e.amount, 0);
    return { receita, despesa, lucro: receita - despesa };
  }, [entries]);

  const activeRentals = rentals.filter((r) => r.status === "ativo");
  const occupancy = Math.round((activeRentals.length / vehicles.length) * 100);
  const todayCharges = activeRentals.slice(0, 3);
  const oilAlerts = vehicles.filter((v) => v.nextRevisionKm - v.currentKm <= 3000);

  const profitability = useMemo(() => vehicles.map((vehicle) => {
    const vehicleEntries = entries.filter((e) => e.vehicleId === vehicle.id);
    const revenue = vehicleEntries.filter((e) => e.type === "receita").reduce((sum, e) => sum + e.amount, 0);
    const cost = vehicleEntries.filter((e) => e.type === "despesa").reduce((sum, e) => sum + e.amount, 0);
    return { vehicle, revenue, cost, profit: revenue - cost, margin: revenue ? Math.round(((revenue - cost) / revenue) * 100) : 0 };
  }).sort((a, b) => b.profit - a.profit), [entries]);

  const rateioResult = useMemo(() => {
    const dailyRate = Number(rateio.dailyRate) || 0;
    const planned = Number(rateio.plannedDays) || 0;
    const real = Number(rateio.realDays) || 0;
    const fine = Number(rateio.fine) || 0;
    const diff = real - planned;
    const base = diff * dailyRate;
    const penalty = diff > 0 ? diff * fine : 0;
    return { diff, total: base + penalty };
  }, [rateio]);

  function addEntry() {
    if (!form.title.trim() || Number(form.amount) <= 0) return;
    setEntries((prev) => [{ id: `entry-${Date.now()}`, type: form.type, vehicleId: form.vehicleId, title: form.title, amount: Number(form.amount), date: todayIso, category: form.category }, ...prev]);
    setForm((prev) => ({ ...prev, title: "", amount: "" }));
  }

  async function copyReceipt(entry: Entry) {
    await navigator.clipboard.writeText(receiptText(entry, vehicles, settings));
    alert("Recibo copiado. Cole no WhatsApp do cliente.");
  }

  function sendReceiptWhatsApp(entry: Entry) {
    const rental = rentals.find((item) => item.vehicleId === entry.vehicleId && item.status === "ativo");
    const client = rental ? findStoredClient(clients, rental.clientId) : null;
    const phone = onlyDigits(client?.whatsapp ?? "");
    const text = encodeURIComponent(receiptText(entry, vehicles, settings));
    window.open(`https://wa.me/${phone || ""}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  async function copyDailyAlert() {
    await navigator.clipboard.writeText(`GMI Locadora - Alerta diario\n${todayCharges.length} cobrancas para receber hoje\n${oilAlerts.length} carro(s) precisando revisao/oleo\nReceita: ${money.format(totals.receita)}\nLucro: ${money.format(totals.lucro)}`);
    alert("Resumo diario copiado para WhatsApp/e-mail.");
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-slate-950">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">Centro financeiro premium</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Financeiro operacional</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold text-blue-100/85">Receitas, despesas, abastecimentos, manutenções, alertas, metas e rentabilidade por veículo.</p>
            </div>
            <button type="button" onClick={copyDailyAlert} className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-gmi-blue shadow-xl shadow-black/10 hover:scale-[1.02]">
              Copiar alerta diário
            </button>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Receita" value={money.format(totals.receita)} sub={`${entries.filter((e) => e.type === "receita").length} lançamentos`} tone="blue" />
          <StatCard label="Despesas" value={money.format(totals.despesa)} sub="manutenção, óleo, combustível" tone="orange" />
          <StatCard label="Lucro" value={money.format(totals.lucro)} sub={`meta ${money.format(goal.monthlyProfit)}`} tone={totals.lucro >= goal.monthlyProfit ? "green" : "red"} />
          <StatCard label="Ocupação" value={`${occupancy}%`} sub={`meta ${goal.occupancy}%`} tone={occupancy >= goal.occupancy ? "green" : "orange"} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Novo lançamento</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EntryType })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold"><option value="receita">Receita</option><option value="despesa">Despesa</option></select>
            <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold">{vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate}</option>)}</select>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Descrição: abastecimento, óleo, avaria..." className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold sm:col-span-2" />
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Valor" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold"><option value="manutencao">Manutenção</option><option value="combustivel">Combustível</option><option value="oleo">Óleo</option><option value="avaria">Avaria</option><option value="diaria">Diária</option><option value="outros">Outros</option></select>
          </div>
          <button type="button" onClick={addEntry} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-gmi-blue to-gmi-blueDark px-6 py-4 text-sm font-black text-white shadow-xl shadow-gmi-blue/20 hover:scale-[1.01]">Registrar lançamento</button>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Metas do dono</p>
          <div className="mt-4 space-y-3">
            <label className="block text-xs font-black text-slate-500">Meta receita mensal<input type="number" value={goal.monthlyRevenue} onChange={(e) => setGoal({ ...goal, monthlyRevenue: Number(e.target.value) })} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold" /></label>
            <label className="block text-xs font-black text-slate-500">Meta lucro mensal<input type="number" value={goal.monthlyProfit} onChange={(e) => setGoal({ ...goal, monthlyProfit: Number(e.target.value) })} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold" /></label>
            <label className="block text-xs font-black text-slate-500">Meta ocupação %<input type="number" value={goal.occupancy} onChange={(e) => setGoal({ ...goal, occupancy: Number(e.target.value) })} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold" /></label>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 lg:col-span-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Rentabilidade por veículo</p>
          <div className="mt-4 space-y-3">
            {profitability.map(({ vehicle, revenue, cost, profit, margin }) => (
              <div key={vehicle.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-black text-slate-950">{vehicle.brand} {vehicle.model}</p><p className="text-xs font-bold text-slate-500">{vehicle.plate} • {vehicle.currentKm.toLocaleString("pt-BR")} km</p></div>
                  <div className="text-left sm:text-right"><p className={`text-xl font-black ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{money.format(profit)}</p><p className="text-xs font-bold text-slate-500">margem {margin}%</p></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-blue-50 p-3"><p className="text-xs font-bold text-slate-500">Faturamento</p><p className="font-black text-gmi-blue">{money.format(revenue)}</p></div><div className="rounded-2xl bg-orange-50 p-3"><p className="text-xs font-bold text-slate-500">Custos</p><p className="font-black text-gmi-orange">{money.format(cost)}</p></div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">Fila de alertas</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-100"><p className="font-black text-red-700">{todayCharges.length} cobranças hoje</p><p className="mt-1 text-xs font-bold text-slate-500">Enviar aviso para dono cobrar no WhatsApp.</p></div>
              <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100"><p className="font-black text-amber-700">{oilAlerts.length} revisões/óleo</p><p className="mt-1 text-xs font-bold text-slate-500">Carros próximos do KM limite.</p></div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Rateio diárias quebradas</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <input value={rateio.dailyRate} onChange={(e) => setRateio({ ...rateio, dailyRate: e.target.value })} placeholder="Diária" className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold" />
              <input value={rateio.fine} onChange={(e) => setRateio({ ...rateio, fine: e.target.value })} placeholder="Multa/dia" className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold" />
              <input value={rateio.plannedDays} onChange={(e) => setRateio({ ...rateio, plannedDays: e.target.value })} placeholder="Dias contrato" className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold" />
              <input value={rateio.realDays} onChange={(e) => setRateio({ ...rateio, realDays: e.target.value })} placeholder="Dias reais" className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold" />
            </div>
            <div className="mt-4 rounded-2xl bg-gmi-blue p-4 text-white"><p className="text-xs font-bold text-blue-100">Diferença calculada</p><p className="text-2xl font-black">{money.format(rateioResult.total)}</p><p className="text-xs font-semibold text-blue-100">{rateioResult.diff > 0 ? `${rateioResult.diff} dia(s) atraso + multa` : rateioResult.diff < 0 ? `${Math.abs(rateioResult.diff)} dia(s) devolvidos antes` : "Sem diferença"}</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white shadow-card ring-1 ring-slate-100">
          <div className="border-b border-slate-100 p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Últimos lançamentos + recibos</p></div>
          <div className="divide-y divide-slate-100">
            {entries.slice(0, 10).map((entry) => {
              const vehicle = findStoredVehicle(vehicles, entry.vehicleId);
              return <div key={entry.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-slate-950">{entry.title}</p><p className="text-xs font-bold text-slate-500">{vehicle?.brand} {vehicle?.model} • {entry.category} • {fmtDate(entry.date)}</p></div><div className="flex flex-wrap items-center gap-3"><p className={`text-lg font-black ${entry.type === "receita" ? "text-emerald-600" : "text-gmi-orange"}`}>{entry.type === "receita" ? "+" : "-"}{money.format(entry.amount)}</p><button type="button" onClick={() => copyReceipt(entry)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200">Baixar Pagamento</button><button type="button" onClick={() => sendReceiptWhatsApp(entry)} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white hover:bg-emerald-600">Enviar WhatsApp</button></div></div>;
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
