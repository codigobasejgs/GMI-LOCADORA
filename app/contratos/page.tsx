"use client";

import { useState, useMemo } from "react";
import { rentals, money } from "@/lib/mock-data";
import { findStoredClient, findStoredVehicle, useStoredClients, useStoredVehicles } from "@/lib/local-store";
import type { Client, Rental, Vehicle } from "@/lib/types";

/* ─── Constants ──────────────────────────────────────────── */
const WEEKDAYS = [
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
  "Domingo",
] as const;

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  ativo: {
    label: "Ativo",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  pendente: {
    label: "Pendente",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  finalizado: {
    label: "Finalizado",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
  },
};

/* ─── Helpers ────────────────────────────────────────────── */
function formatDate(iso: string | null): string {
  if (!iso) return "Indefinido";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function diffDays(start: string, end: string | null): number {
  if (!end) {
    const now = new Date();
    const s = new Date(start);
    return Math.max(1, Math.ceil((now.getTime() - s.getTime()) / 86400000));
  }
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000));
}

/* ─── Sub-components ─────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendente;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ContractCard({ rental, clients, vehicles }: { rental: Rental; clients: Client[]; vehicles: Vehicle[] }) {
  const client = findStoredClient(clients, rental.clientId);
  const vehicle = findStoredVehicle(vehicles, rental.vehicleId);
  const days = diffDays(rental.startDate, rental.endDate);

  return (
    <article className="group relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-card ring-2 ring-white transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gmi-blue/5" />

      {/* Top row */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-400">Contrato</p>
          <h3 className="mt-0.5 truncate text-xl font-black tracking-tight text-gmi-blueDark">
            {client?.name ?? "Cliente removido"}
          </h3>
        </div>
        <StatusBadge status={rental.status} />
      </div>

      {/* Details grid */}
      <div className="relative mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
          <p className="text-xs font-bold text-slate-400">Veiculo</p>
          <p className="mt-1 text-base font-black text-slate-950">
            {vehicle ? `${vehicle.brand} ${vehicle.model}` : "---"}
          </p>
          {vehicle && (
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {vehicle.plate}
            </p>
          )}
        </div>
        <div className="rounded-2xl bg-orange-50 p-3.5 ring-1 ring-orange-100">
          <p className="text-xs font-bold text-slate-400">Valor Semanal</p>
          <p className="mt-1 text-base font-black text-gmi-orange">
            {money.format(rental.totalValue)}
          </p>
        </div>
      </div>

      {/* Dates + Payment day */}
      <div className="relative mt-3 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl border border-slate-100 bg-white p-3">
          <p className="text-xs font-bold text-slate-400">Inicio</p>
          <p className="mt-0.5 text-sm font-black text-slate-900">
            {formatDate(rental.startDate)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-3">
          <p className="text-xs font-bold text-slate-400">Fim</p>
          <p className="mt-0.5 text-sm font-black text-slate-900">
            {formatDate(rental.endDate)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-3">
          <p className="text-xs font-bold text-slate-400">Dias</p>
          <p className="mt-0.5 text-sm font-black text-gmi-blue">{days}</p>
        </div>
      </div>

      <div className="relative mt-3 rounded-2xl border border-slate-100 bg-white p-3.5">
        <p className="text-xs font-bold text-slate-400">Dia de Pagamento</p>
        <p className="mt-0.5 text-lg font-black text-gmi-blue">
          {rental.paymentDay}
        </p>
      </div>
    </article>
  );
}

function ContractPreview({
  client,
  vehicle,
  startDate,
  endDate,
  totalValue,
  paymentDay,
}: {
  client: Client | undefined;
  vehicle: Vehicle | undefined;
  startDate: string;
  endDate: string;
  totalValue: number;
  paymentDay: string;
}) {
  if (!client && !vehicle) return null;

  const days = startDate && endDate ? diffDays(startDate, endDate) : 0;

  return (
    <div className="rounded-[2rem] border-2 border-dashed border-gmi-blue/20 bg-gmi-blue/5 p-6">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-gmi-blue">
        Pre-visualizacao do contrato
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between rounded-2xl bg-white p-3.5 shadow-sm">
          <span className="text-sm font-bold text-slate-500">Cliente</span>
          <span className="text-sm font-black text-slate-900">
            {client?.name ?? "---"}
          </span>
        </div>
        <div className="flex justify-between rounded-2xl bg-white p-3.5 shadow-sm">
          <span className="text-sm font-bold text-slate-500">CPF/CNPJ</span>
          <span className="text-sm font-black text-slate-900">
            {client?.cpfCnpj ?? "---"}
          </span>
        </div>
        <div className="flex justify-between rounded-2xl bg-white p-3.5 shadow-sm">
          <span className="text-sm font-bold text-slate-500">Veiculo</span>
          <span className="text-sm font-black text-slate-900">
            {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` : "---"}
          </span>
        </div>
        <div className="flex justify-between rounded-2xl bg-white p-3.5 shadow-sm">
          <span className="text-sm font-bold text-slate-500">Periodo</span>
          <span className="text-sm font-black text-slate-900">
            {startDate ? formatDate(startDate) : "---"} a{" "}
            {endDate ? formatDate(endDate) : "---"}
            {days > 0 && (
              <span className="ml-1 text-gmi-blue">({days} dias)</span>
            )}
          </span>
        </div>
        <div className="flex justify-between rounded-2xl bg-orange-50 p-3.5 shadow-sm ring-1 ring-orange-100">
          <span className="text-sm font-bold text-slate-500">Valor Total</span>
          <span className="text-lg font-black text-gmi-orange">
            {totalValue > 0 ? money.format(totalValue) : "---"}
          </span>
        </div>
        <div className="flex justify-between rounded-2xl bg-white p-3.5 shadow-sm">
          <span className="text-sm font-bold text-slate-500">Pagamento</span>
          <span className="text-sm font-black text-gmi-blue">
            {paymentDay || "---"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function ContratosPage() {
  const clients = useStoredClients();
  const vehicles = useStoredVehicles();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalValue, setTotalValue] = useState(0);
  const [paymentDay, setPaymentDay] = useState<string>(WEEKDAYS[0]);
  const [toast, setToast] = useState<string | null>(null);

  // Derived data
  const selectedClient = selectedClientId
    ? findStoredClient(clients, selectedClientId)
    : undefined;
  const selectedVehicle = selectedVehicleId
    ? findStoredVehicle(vehicles, selectedVehicleId)
    : undefined;

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "disponivel"),
    []
  );

  const activeContracts = useMemo(
    () => rentals.filter((r) => r.status === "ativo"),
    []
  );
  const finishedContracts = useMemo(
    () => rentals.filter((r) => r.status === "finalizado"),
    []
  );

  const totalActiveRevenue = useMemo(
    () => activeContracts.reduce((sum, r) => sum + r.totalValue, 0),
    [activeContracts]
  );

  // Auto-calculate total value when dates and vehicle change
  const calculatedValue = useMemo(() => {
    if (!startDate || !endDate || !selectedVehicle) return 0;
    const days = diffDays(startDate, endDate);
    return days * selectedVehicle.dailyRate;
  }, [startDate, endDate, selectedVehicle]);

  function handleAutoCalc() {
    if (calculatedValue > 0) setTotalValue(calculatedValue);
  }

  function handleGeneratePdf() {
    if (!selectedClient || !selectedVehicle) {
      showToast("Selecione cliente e veiculo primeiro!");
      return;
    }
    console.log("PDF gerado com sucesso!", {
      client: selectedClient.name,
      vehicle: `${selectedVehicle.brand} ${selectedVehicle.model}`,
      plate: selectedVehicle.plate,
      startDate,
      endDate,
      totalValue,
      paymentDay,
    });
    showToast("PDF gerado com sucesso!");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function resetForm() {
    setSelectedClientId("");
    setSelectedVehicleId("");
    setStartDate("");
    setEndDate("");
    setTotalValue(0);
    setPaymentDay(WEEKDAYS[0]);
  }

  return (
    <main className="min-h-screen text-slate-950">
      {/* Toast notification */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 animate-bounce rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-emerald-200">
          {toast}
        </div>
      )}

      {/* ─── Header ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">
                Gestao de contratos
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Contratos
              </h1>
              <p className="mt-2 max-w-xl text-sm font-semibold text-blue-100/80">
                Gerencie locacoes ativas, crie novos contratos e gere PDFs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) resetForm();
              }}
              className="flex items-center gap-2 rounded-[2rem] bg-gradient-to-r from-gmi-orange to-orange-600 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-900/30 transition hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-gmi-orange/30"
            >
              <span className="text-lg">{showForm ? "✕" : "+"}</span>
              {showForm ? "Cancelar" : "Novo Contrato"}
            </button>
          </div>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Active contracts */}
          <div className="group relative overflow-hidden rounded-[2rem] bg-white/90 p-5 shadow-card ring-1 ring-slate-200/70 backdrop-blur">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gmi-blue/15 blur-2xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Contratos Ativos
                </p>
                <p className="mt-2 text-4xl font-black leading-none text-gmi-blue">
                  {activeContracts.length}
                </p>
              </div>
              <span className="text-3xl">📄</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="group relative overflow-hidden rounded-[2rem] bg-white/90 p-5 shadow-card ring-1 ring-emerald-200 backdrop-blur">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Receita Semanal
                </p>
                <p className="mt-2 text-4xl font-black leading-none text-emerald-600">
                  {money.format(totalActiveRevenue)}
                </p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </div>

          {/* Finished */}
          <div className="group relative overflow-hidden rounded-[2rem] bg-white/90 p-5 shadow-card ring-1 ring-slate-200/70 backdrop-blur">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gmi-blue/15 blur-2xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Finalizados
                </p>
                <p className="mt-2 text-4xl font-black leading-none text-slate-400">
                  {finishedContracts.length}
                </p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── New Contract Form ───────────────────────── */}
      {showForm && (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-slate-100 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gmi-orange/10">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gmi-orange">
                  Formulario
                </p>
                <h2 className="text-xl font-black tracking-tight text-gmi-blueDark">
                  Novo Contrato
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Form fields */}
              <div className="space-y-5">
                {/* Client select */}
                <div>
                  <label
                    htmlFor="client"
                    className="mb-1.5 block text-xs font-black uppercase tracking-[0.15em] text-slate-500"
                  >
                    Cliente
                  </label>
                  <select
                    id="client"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition focus:border-gmi-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-gmi-blue/20"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.cpfCnpj}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle select */}
                <div>
                  <label
                    htmlFor="vehicle"
                    className="mb-1.5 block text-xs font-black uppercase tracking-[0.15em] text-slate-500"
                  >
                    Veiculo
                  </label>
                  <select
                    id="vehicle"
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition focus:border-gmi-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-gmi-blue/20"
                  >
                    <option value="">Selecione um veiculo disponivel...</option>
                    {availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} - {v.plate} (
                        {money.format(v.dailyRate)}/dia)
                      </option>
                    ))}
                  </select>
                  {availableVehicles.length === 0 && (
                    <p className="mt-1.5 text-xs font-bold text-gmi-danger">
                      Nenhum veiculo disponivel no momento.
                    </p>
                  )}
                </div>

                {/* Date inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="mb-1.5 block text-xs font-black uppercase tracking-[0.15em] text-slate-500"
                    >
                      Data Inicio
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition focus:border-gmi-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-gmi-blue/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="endDate"
                      className="mb-1.5 block text-xs font-black uppercase tracking-[0.15em] text-slate-500"
                    >
                      Data Fim
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition focus:border-gmi-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-gmi-blue/20"
                    />
                  </div>
                </div>

                {/* Total value */}
                <div>
                  <label
                    htmlFor="totalValue"
                    className="mb-1.5 block text-xs font-black uppercase tracking-[0.15em] text-slate-500"
                  >
                    Valor Total (R$)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="totalValue"
                      type="number"
                      min={0}
                      step={0.01}
                      value={totalValue || ""}
                      onChange={(e) =>
                        setTotalValue(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0,00"
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition focus:border-gmi-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-gmi-blue/20"
                    />
                    {calculatedValue > 0 && (
                      <button
                        type="button"
                        onClick={handleAutoCalc}
                        className="shrink-0 rounded-2xl bg-gmi-blue/10 px-4 py-3 text-xs font-black text-gmi-blue transition hover:bg-gmi-blue/20"
                        title={`Calcular automaticamente: ${money.format(calculatedValue)}`}
                      >
                        Calcular ({money.format(calculatedValue)})
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment day */}
                <div>
                  <label
                    htmlFor="paymentDay"
                    className="mb-1.5 block text-xs font-black uppercase tracking-[0.15em] text-slate-500"
                  >
                    Dia de Pagamento Semanal
                  </label>
                  <select
                    id="paymentDay"
                    value={paymentDay}
                    onChange={(e) => setPaymentDay(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition focus:border-gmi-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-gmi-blue/20"
                  >
                    {WEEKDAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generate PDF button */}
                <button
                  type="button"
                  onClick={handleGeneratePdf}
                  disabled={!selectedClient || !selectedVehicle}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gmi-blue to-gmi-blueDark px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-gmi-blue/20 transition hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-gmi-blue/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  <span className="text-lg">📄</span>
                  Gerar PDF
                </button>
              </div>

              {/* Preview */}
              <ContractPreview
                client={selectedClient}
                vehicle={selectedVehicle}
                startDate={startDate}
                endDate={endDate}
                totalValue={totalValue}
                paymentDay={paymentDay}
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── Active Contracts ────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gmi-orange">
              Em andamento
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-gmi-blueDark">
              Contratos Ativos
            </h2>
          </div>
          <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-gmi-blue shadow-sm ring-1 ring-slate-200">
            {activeContracts.length} contratos
          </span>
        </div>

        {activeContracts.length === 0 ? (
          <div className="mt-6 rounded-[2rem] bg-white p-12 text-center shadow-card ring-1 ring-slate-100">
            <p className="text-4xl">📋</p>
            <p className="mt-3 text-lg font-black text-slate-400">
              Nenhum contrato ativo
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {activeContracts.map((r) => (
              <ContractCard key={r.id} rental={r} clients={clients} vehicles={vehicles} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Finished Contracts ──────────────────────── */}
      {finishedContracts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Historico
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-gmi-blueDark">
                Contratos Finalizados
              </h2>
            </div>
            <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-slate-400 shadow-sm ring-1 ring-slate-200">
              {finishedContracts.length} finalizados
            </span>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {finishedContracts.map((r) => (
              <ContractCard key={r.id} rental={r} clients={clients} vehicles={vehicles} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
