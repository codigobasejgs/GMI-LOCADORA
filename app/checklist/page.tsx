"use client";

import { useState, useCallback } from "react";
import {
  rentals,
  getClientById,
  getVehicleById,
  getActiveRentals,
} from "@/lib/mock-data";
import type {
  ChecklistType,
  FuelLevel,
  ChecklistDamage,
  Rental,
} from "@/lib/types";

// ─── Constants ──────────────────────────────────────────
const FUEL_LEVELS: { label: string; value: FuelLevel; percent: number }[] = [
  { label: "Reserva", value: "reserva", percent: 5 },
  { label: "1/4", value: "1/4", percent: 25 },
  { label: "1/2", value: "1/2", percent: 50 },
  { label: "3/4", value: "3/4", percent: 75 },
  { label: "Cheio", value: "cheio", percent: 100 },
];

const DAMAGE_AREAS = [
  "Dianteira",
  "Traseira",
  "Lateral Esq",
  "Lateral Dir",
  "Teto",
  "Para-brisa",
  "Pneus",
  "Interior",
] as const;

function fuelColor(percent: number): string {
  if (percent <= 5) return "bg-red-500";
  if (percent <= 25) return "bg-gmi-orange";
  if (percent <= 50) return "bg-amber-400";
  if (percent <= 75) return "bg-emerald-400";
  return "bg-emerald-500";
}

function fuelRingColor(percent: number): string {
  if (percent <= 5) return "ring-red-500 text-red-600";
  if (percent <= 25) return "ring-gmi-orange text-gmi-orange";
  if (percent <= 50) return "ring-amber-400 text-amber-600";
  if (percent <= 75) return "ring-emerald-400 text-emerald-600";
  return "ring-emerald-500 text-emerald-700";
}

// ─── Toast Component ────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black text-white shadow-2xl shadow-emerald-200 ring-1 ring-emerald-500">
        <span className="text-xl">&#10003;</span>
        {message}
        <button
          type="button"
          onClick={onClose}
          className="ml-2 rounded-xl bg-white/20 px-2 py-0.5 text-xs font-bold transition hover:bg-white/30"
          aria-label="Fechar notificacao"
        >
          X
        </button>
      </div>
    </div>
  );
}

// ─── Summary Card ───────────────────────────────────────
interface SummaryData {
  type: ChecklistType;
  rental: Rental;
  fuelLevel: FuelLevel;
  kmReading: number;
  damages: ChecklistDamage[];
  notes: string;
}

function SummaryCard({ data }: { data: SummaryData }) {
  const client = getClientById(data.rental.clientId);
  const vehicle = getVehicleById(data.rental.vehicleId);
  const fuelInfo = FUEL_LEVELS.find((f) => f.value === data.fuelLevel);

  return (
    <div className="mx-auto mt-6 max-w-2xl rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-slate-100 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
          &#10003;
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
            Checklist salvo
          </p>
          <h3 className="text-xl font-black text-gmi-blueDark">
            {data.type === "retirada" ? "Retirada" : "Devolucao"} registrada
          </h3>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold text-slate-400">Cliente</p>
          <p className="mt-1 text-base font-black text-slate-950">
            {client?.name ?? "---"}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold text-slate-400">Veiculo</p>
          <p className="mt-1 text-base font-black text-slate-950">
            {vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : "---"}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold text-slate-400">Combustivel</p>
          <p className="mt-1 text-base font-black text-slate-950">
            {fuelInfo?.label ?? data.fuelLevel}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold text-slate-400">KM</p>
          <p className="mt-1 text-base font-black text-slate-950">
            {data.kmReading.toLocaleString("pt-BR")} km
          </p>
        </div>
      </div>

      {data.damages.length > 0 && (
        <div className="mt-4 rounded-2xl border border-gmi-orange/20 bg-orange-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-gmi-orange">
            Avarias registradas
          </p>
          <ul className="mt-2 space-y-1.5">
            {data.damages.map((d) => (
              <li key={d.area} className="text-sm font-semibold text-slate-700">
                <span className="font-black text-slate-900">{d.area}:</span>{" "}
                {d.description || "Marcado (sem descricao)"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.notes && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold text-slate-400">Notas gerais</p>
          <p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-slate-700">
            {data.notes}
          </p>
        </div>
      )}

      <p className="mt-5 text-center text-xs font-semibold text-slate-400">
        Registrado em {new Date().toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function ChecklistPage() {
  // Form state
  const [type, setType] = useState<ChecklistType | null>(null);
  const [selectedRentalId, setSelectedRentalId] = useState("");
  const [fuelLevel, setFuelLevel] = useState<FuelLevel | null>(null);
  const [kmReading, setKmReading] = useState("");
  const [checkedAreas, setCheckedAreas] = useState<Record<string, boolean>>({});
  const [areaDescriptions, setAreaDescriptions] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  // UI state
  const [toast, setToast] = useState<string | null>(null);
  const [savedSummary, setSavedSummary] = useState<SummaryData | null>(null);

  const activeRentals = getActiveRentals();
  const selectedRental = rentals.find((r) => r.id === selectedRentalId);
  const selectedClient = selectedRental
    ? getClientById(selectedRental.clientId)
    : null;
  const selectedVehicle = selectedRental
    ? getVehicleById(selectedRental.vehicleId)
    : null;

  const toggleArea = useCallback((area: string) => {
    setCheckedAreas((prev) => {
      const next = { ...prev, [area]: !prev[area] };
      if (!next[area]) {
        setAreaDescriptions((d) => {
          const copy = { ...d };
          delete copy[area];
          return copy;
        });
      }
      return next;
    });
  }, []);

  const updateAreaDescription = useCallback((area: string, desc: string) => {
    setAreaDescriptions((prev) => ({ ...prev, [area]: desc }));
  }, []);

  const canSave =
    type !== null &&
    selectedRentalId !== "" &&
    fuelLevel !== null &&
    kmReading.trim() !== "" &&
    parseInt(kmReading, 10) > 0;

  function handleSave() {
    if (!canSave || !selectedRental || !type || !fuelLevel) return;

    const damages: ChecklistDamage[] = Object.entries(checkedAreas)
      .filter(([, checked]) => checked)
      .map(([area]) => ({
        area,
        description: areaDescriptions[area] || "",
      }));

    const summary: SummaryData = {
      type,
      rental: selectedRental,
      fuelLevel,
      kmReading: parseInt(kmReading, 10),
      damages,
      notes,
    };

    setSavedSummary(summary);
    setToast("Checklist salvo com sucesso!");
    setTimeout(() => setToast(null), 4000);
  }

  function handleReset() {
    setType(null);
    setSelectedRentalId("");
    setFuelLevel(null);
    setKmReading("");
    setCheckedAreas({});
    setAreaDescriptions({});
    setNotes("");
    setSavedSummary(null);
  }

  const fuelPercent = fuelLevel
    ? FUEL_LEVELS.find((f) => f.value === fuelLevel)?.percent ?? 0
    : 0;

  return (
    <main className="min-h-screen pb-12 text-slate-950">
      {/* ── Header ── */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">
            Inspecao veicular
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
            Checklist
          </h1>
          <p className="mt-2 max-w-xl text-sm font-semibold text-blue-100/80">
            Registre o estado do veiculo na retirada ou devolucao.
          </p>
        </div>
      </section>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* ── Summary after save ── */}
        {savedSummary ? (
          <div className="-mt-10">
            <SummaryCard data={savedSummary} />
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-2xl bg-gmi-blue px-8 py-4 text-sm font-black text-white shadow-lg shadow-gmi-blue/20 transition hover:scale-[1.02] hover:bg-gmi-blueDark focus:outline-none focus:ring-4 focus:ring-gmi-blue/30"
              >
                Novo Checklist
              </button>
            </div>
          </div>
        ) : (
          <div className="-mt-10 space-y-5">
            {/* ── Type Selector ── */}
            <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Tipo de checklist
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("retirada")}
                  className={`flex min-h-[4rem] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-4 py-4 text-sm font-black transition sm:flex-row sm:gap-3 sm:text-base ${
                    type === "retirada"
                      ? "border-gmi-blue bg-gmi-blue/10 text-gmi-blue ring-2 ring-gmi-blue/20"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-2xl">&#128663;</span>
                  Retirada
                </button>
                <button
                  type="button"
                  onClick={() => setType("devolucao")}
                  className={`flex min-h-[4rem] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-4 py-4 text-sm font-black transition sm:flex-row sm:gap-3 sm:text-base ${
                    type === "devolucao"
                      ? "border-gmi-orange bg-gmi-orange/10 text-gmi-orange ring-2 ring-gmi-orange/20"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-2xl">&#128230;</span>
                  Devolucao
                </button>
              </div>
            </div>

            {/* ── Rental Selector ── */}
            <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Locacao ativa
              </p>
              <select
                value={selectedRentalId}
                onChange={(e) => setSelectedRentalId(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 transition focus:border-gmi-blue focus:outline-none focus:ring-2 focus:ring-gmi-blue/20"
                aria-label="Selecionar locacao ativa"
              >
                <option value="">Selecione uma locacao...</option>
                {activeRentals.map((rental) => {
                  const c = getClientById(rental.clientId);
                  const v = getVehicleById(rental.vehicleId);
                  return (
                    <option key={rental.id} value={rental.id}>
                      {c?.name ?? "---"} - {v?.brand} {v?.model} ({v?.plate})
                    </option>
                  );
                })}
              </select>

              {selectedRental && selectedClient && selectedVehicle && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
                    <p className="text-xs font-bold text-slate-400">Cliente</p>
                    <p className="mt-1 text-base font-black text-slate-950">
                      {selectedClient.name}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {selectedClient.whatsapp}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3.5 ring-1 ring-blue-100">
                    <p className="text-xs font-bold text-slate-400">Veiculo</p>
                    <p className="mt-1 text-base font-black text-gmi-blue">
                      {selectedVehicle.brand} {selectedVehicle.model}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {selectedVehicle.plate} | {selectedVehicle.color} |{" "}
                      {selectedVehicle.currentKm.toLocaleString("pt-BR")} km
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Fuel Gauge ── */}
            <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Nivel de combustivel
              </p>

              {/* Visual gauge bar */}
              <div className="mt-4 h-5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${fuelColor(fuelPercent)}`}
                  style={{ width: `${fuelPercent}%` }}
                />
              </div>
              <p className="mt-1.5 text-center text-xs font-bold text-slate-400">
                {fuelLevel
                  ? FUEL_LEVELS.find((f) => f.value === fuelLevel)?.label
                  : "Selecione o nivel"}
              </p>

              {/* Level buttons */}
              <div className="mt-4 grid grid-cols-5 gap-2">
                {FUEL_LEVELS.map((level) => {
                  const isSelected = fuelLevel === level.value;
                  const colorClass = isSelected
                    ? `${fuelRingColor(level.percent)} ring-2 bg-white font-black`
                    : "ring-1 ring-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100";
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFuelLevel(level.value)}
                      className={`flex min-h-[3rem] items-center justify-center rounded-2xl px-1 py-3 text-xs font-bold transition sm:text-sm ${colorClass}`}
                    >
                      {level.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── KM Reading ── */}
            <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
              <label
                htmlFor="km-input"
                className="text-xs font-black uppercase tracking-[0.18em] text-slate-500"
              >
                Quilometragem atual
              </label>
              <div className="mt-3 flex items-center gap-3">
                <input
                  id="km-input"
                  type="number"
                  inputMode="numeric"
                  placeholder={
                    selectedVehicle
                      ? `Atual: ${selectedVehicle.currentKm.toLocaleString("pt-BR")} km`
                      : "Ex: 49500"
                  }
                  value={kmReading}
                  onChange={(e) => setKmReading(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg font-black text-slate-900 transition placeholder:text-slate-400 focus:border-gmi-blue focus:outline-none focus:ring-2 focus:ring-gmi-blue/20"
                  min={0}
                />
                <span className="shrink-0 text-sm font-bold text-slate-400">km</span>
              </div>
            </div>

            {/* ── Damage Checklist ── */}
            <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Avarias e danos
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Marque as areas com avarias e descreva os danos encontrados.
              </p>

              <div className="mt-4 space-y-3">
                {DAMAGE_AREAS.map((area) => {
                  const isChecked = !!checkedAreas[area];
                  return (
                    <div key={area}>
                      <button
                        type="button"
                        onClick={() => toggleArea(area)}
                        role="checkbox"
                        aria-checked={isChecked}
                        className={`flex w-full min-h-[3rem] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition ${
                          isChecked
                            ? "border-gmi-orange bg-orange-50 text-gmi-orange"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs transition ${
                            isChecked
                              ? "bg-gmi-orange text-white"
                              : "bg-white ring-1 ring-slate-300"
                          }`}
                        >
                          {isChecked ? "✓" : ""}
                        </span>
                        {area}
                      </button>

                      {isChecked && (
                        <input
                          type="text"
                          placeholder={`Descreva o dano em: ${area}`}
                          value={areaDescriptions[area] || ""}
                          onChange={(e) =>
                            updateAreaDescription(area, e.target.value)
                          }
                          className="mt-2 w-full rounded-2xl border border-gmi-orange/30 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-slate-900 transition placeholder:text-slate-400 focus:border-gmi-orange focus:outline-none focus:ring-2 focus:ring-gmi-orange/20"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── General Notes ── */}
            <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
              <label
                htmlFor="notes-input"
                className="text-xs font-black uppercase tracking-[0.18em] text-slate-500"
              >
                Notas gerais
              </label>
              <textarea
                id="notes-input"
                rows={4}
                placeholder="Observacoes adicionais sobre o veiculo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition placeholder:text-slate-400 focus:border-gmi-blue focus:outline-none focus:ring-2 focus:ring-gmi-blue/20"
              />
            </div>

            {/* ── Save Button ── */}
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className={`flex w-full min-h-[3.5rem] items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-black shadow-xl transition focus:outline-none focus:ring-4 ${
                canSave
                  ? "bg-gradient-to-r from-gmi-blue to-gmi-blueDark text-white shadow-gmi-blue/20 hover:scale-[1.02] focus:ring-gmi-blue/30"
                  : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
              }`}
            >
              <span className="text-xl">&#128190;</span>
              Salvar Checklist
            </button>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* ── Inline animation keyframes ── */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 1rem);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.35s ease-out both;
        }
      `}</style>
    </main>
  );
}
