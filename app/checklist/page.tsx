"use client";

import { useMemo, useRef, useState } from "react";
import { rentals, getActiveRentals, money } from "@/lib/mock-data";
import { findStoredClient, findStoredVehicle, useStoredClients, useStoredVehicles } from "@/lib/local-store";
import type { ChecklistType, FuelLevel } from "@/lib/types";

const FUEL_LEVELS: { label: string; value: FuelLevel; percent: number }[] = [
  { label: "Reserva", value: "reserva", percent: 5 },
  { label: "1/4", value: "1/4", percent: 25 },
  { label: "1/2", value: "1/2", percent: 50 },
  { label: "3/4", value: "3/4", percent: 75 },
  { label: "Cheio", value: "cheio", percent: 100 },
];

const DAMAGE_AREAS = ["Dianteira", "Traseira", "Lateral Esq", "Lateral Dir", "Teto", "Para-brisa", "Pneus", "Interior"];

type DamageState = Record<string, { checked: boolean; description: string; photos: string[] }>;

type SavedInspection = {
  id: string;
  type: ChecklistType;
  rentalId: string;
  fuelLevel: FuelLevel;
  kmReading: number;
  damages: DamageState;
  notes: string;
  signature: string;
  createdAt: string;
};

function fuelColor(percent: number) {
  if (percent <= 5) return "bg-red-500";
  if (percent <= 25) return "bg-gmi-orange";
  if (percent <= 50) return "bg-amber-400";
  return "bg-emerald-500";
}

function emptyDamages(): DamageState {
  return Object.fromEntries(DAMAGE_AREAS.map((area) => [area, { checked: false, description: "", photos: [] }]));
}

function readFiles(files: FileList | null) {
  if (!files) return Promise.resolve<string[]>([]);
  return Promise.all(
    Array.from(files).slice(0, 6).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(file);
        }),
    ),
  );
}

function SignaturePad({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const p = point(event);
    if (!canvas || !p) return;
    drawing.current = true;
    canvas.setPointerCapture(event.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#073F68";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const p = point(event);
    const ctx = canvas?.getContext("2d");
    if (!canvas || !p || !ctx) return;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    onChange(canvas.toDataURL("image/png"));
  }

  function stop(event: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Assinatura digital</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Cliente assina no celular na retirada/devolucao.</p>
        </div>
        <button type="button" onClick={clear} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-200">
          Limpar
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={720}
        height={220}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
        className="mt-4 h-44 w-full touch-none rounded-3xl border-2 border-dashed border-gmi-blue/25 bg-[linear-gradient(180deg,#f8fafc,#fff)]"
        aria-label="Campo para assinatura digital"
      />
      {value && <p className="mt-2 text-xs font-black text-emerald-600">Assinatura capturada</p>}
    </div>
  );
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function ContractPreview({ inspection, clients, vehicles }: { inspection: SavedInspection; clients: ReturnType<typeof useStoredClients>; vehicles: ReturnType<typeof useStoredVehicles> }) {
  const rental = rentals.find((item) => item.id === inspection.rentalId);
  const client = rental ? findStoredClient(clients, rental.clientId) : null;
  const vehicle = rental ? findStoredVehicle(vehicles, rental.vehicleId) : null;
  const damagedAreas = Object.entries(inspection.damages).filter(([, item]) => item.checked);
  const photoCount = damagedAreas.reduce((total, [, item]) => total + item.photos.length, 0);

  function printContract() {
    window.print();
  }

  const receipt = `GMI Locadora\nRecibo/termo ${inspection.type}\nCliente: ${client?.name}\nVeiculo: ${vehicle?.brand} ${vehicle?.model} ${vehicle?.plate}\nKM: ${inspection.kmReading.toLocaleString("pt-BR")}\nValor contrato: ${money.format(rental?.totalValue ?? 0)}\nFotos anexadas: ${photoCount}\nData: ${new Date(inspection.createdAt).toLocaleString("pt-BR")}`;

  async function copyReceipt() {
    await navigator.clipboard.writeText(receipt);
    alert("Recibo copiado. Cole no WhatsApp do cliente.");
  }

  function sendWhatsApp() {
    const phone = onlyDigits(client?.whatsapp ?? "");
    window.open(`https://wa.me/${phone || ""}?text=${encodeURIComponent(receipt)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="-mt-10 space-y-5 print:mt-0">
      <div className="rounded-[2.2rem] bg-white p-6 shadow-card ring-1 ring-slate-100 sm:p-8 print:shadow-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-gmi-orange">Contrato + vistoria</p>
            <h2 className="mt-2 text-2xl font-black text-gmi-blueDark">Termo de {inspection.type === "retirada" ? "Retirada" : "Devolucao"}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">Registro #{inspection.id}</p>
          </div>
          <div className="rounded-2xl bg-gmi-blue px-5 py-3 text-center text-white">
            <p className="text-xs font-bold text-blue-100">Valor contrato</p>
            <p className="text-xl font-black">{money.format(rental?.totalValue ?? 0)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs font-black text-slate-400">Cliente</p>
            <p className="mt-1 font-black text-slate-950">{client?.name}</p>
            <p className="text-xs font-bold text-slate-500">{client?.cpfCnpj}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
            <p className="text-xs font-black text-slate-400">Veiculo</p>
            <p className="mt-1 font-black text-gmi-blue">{vehicle?.brand} {vehicle?.model}</p>
            <p className="text-xs font-bold text-slate-500">{vehicle?.plate} • {vehicle?.color}</p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100">
            <p className="text-xs font-black text-slate-400">Vistoria</p>
            <p className="mt-1 font-black text-gmi-orange">{inspection.kmReading.toLocaleString("pt-BR")} km</p>
            <p className="text-xs font-bold text-slate-500">Combustivel: {inspection.fuelLevel}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Avarias anexadas ao contrato</p>
          {damagedAreas.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-700">Nenhuma avaria registrada.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {damagedAreas.map(([area, item]) => (
                <div key={area} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="font-black text-slate-950">{area}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{item.description || "Avaria marcada sem descricao."}</p>
                  {item.photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {item.photos.map((photo, index) => (
                        <img key={photo} src={photo} alt={`${area} foto ${index + 1}`} className="h-24 w-full rounded-xl object-cover ring-1 ring-slate-200" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_18rem]">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs font-black text-slate-400">Observacoes</p>
            <p className="mt-2 min-h-16 whitespace-pre-wrap text-sm font-semibold text-slate-700">{inspection.notes || "Sem observacoes adicionais."}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-xs font-black text-slate-400">Assinatura cliente</p>
            <img src={inspection.signature} alt="Assinatura do cliente" className="mt-2 h-24 w-full object-contain" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
          <button type="button" onClick={printContract} className="flex-1 rounded-2xl bg-gradient-to-r from-gmi-blue to-gmi-blueDark px-6 py-4 text-sm font-black text-white shadow-xl shadow-gmi-blue/20 hover:scale-[1.01]">
            Gerar PDF / Imprimir contrato
          </button>
          <button type="button" onClick={copyReceipt} className="flex-1 rounded-2xl bg-gmi-orange px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-200 hover:scale-[1.01]">
            Baixar Pagamento / Copiar recibo
          </button>
          <button type="button" onClick={sendWhatsApp} className="flex-1 rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-emerald-200 hover:scale-[1.01]">
            Enviar pelo WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const clients = useStoredClients();
  const vehicles = useStoredVehicles();
  const [type, setType] = useState<ChecklistType>("retirada");
  const [selectedRentalId, setSelectedRentalId] = useState(getActiveRentals()[0]?.id ?? "");
  const [fuelLevel, setFuelLevel] = useState<FuelLevel>("cheio");
  const [kmReading, setKmReading] = useState("");
  const [damages, setDamages] = useState<DamageState>(() => emptyDamages());
  const [notes, setNotes] = useState("");
  const [signature, setSignature] = useState("");
  const [savedInspection, setSavedInspection] = useState<SavedInspection | null>(null);

  const selectedRental = rentals.find((item) => item.id === selectedRentalId);
  const selectedClient = selectedRental ? findStoredClient(clients, selectedRental.clientId) : null;
  const selectedVehicle = selectedRental ? findStoredVehicle(vehicles, selectedRental.vehicleId) : null;
  const fuelPercent = FUEL_LEVELS.find((item) => item.value === fuelLevel)?.percent ?? 0;
  const photoTotal = useMemo(() => Object.values(damages).reduce((sum, item) => sum + item.photos.length, 0), [damages]);
  const canSave = selectedRentalId && Number(kmReading) > 0 && signature;

  function updateDamage(area: string, patch: Partial<DamageState[string]>) {
    setDamages((prev) => ({ ...prev, [area]: { ...prev[area], ...patch } }));
  }

  async function addPhotos(area: string, files: FileList | null) {
    const photos = await readFiles(files);
    if (photos.length === 0) return;
    setDamages((prev) => ({
      ...prev,
      [area]: { ...prev[area], checked: true, photos: [...prev[area].photos, ...photos].slice(0, 8) },
    }));
  }

  function save() {
    if (!canSave) return;
    setSavedInspection({
      id: `GMI-${Date.now().toString().slice(-6)}`,
      type,
      rentalId: selectedRentalId,
      fuelLevel,
      kmReading: Number(kmReading),
      damages,
      notes,
      signature,
      createdAt: new Date().toISOString(),
    });
  }

  if (savedInspection) {
    return (
      <main className="min-h-screen bg-slate-50 pb-12 text-slate-950 print:bg-white print:pb-0">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white print:hidden sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">Contrato pronto</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Fotos + assinatura anexadas</h1>
          </div>
        </section>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 print:max-w-none print:px-0">
          <ContractPreview inspection={savedInspection} clients={clients} vehicles={vehicles} />
          <button type="button" onClick={() => setSavedInspection(null)} className="mx-auto mt-6 block rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white print:hidden">
            Voltar e editar vistoria
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-slate-950">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">Vistoria premium</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Checklist com fotos, assinatura e contrato</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold text-blue-100/85">No celular: tire fotos de avarias, registre combustível/KM, colete assinatura e gere contrato com tudo anexado.</p>
        </div>
      </section>

      <div className="relative mx-auto -mt-10 grid max-w-5xl gap-5 px-4 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        <div className="space-y-5">
          <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Etapa</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(["retirada", "devolucao"] as ChecklistType[]).map((item) => (
                <button key={item} type="button" onClick={() => setType(item)} className={`rounded-2xl border-2 px-4 py-4 text-sm font-black capitalize transition ${type === item ? "border-gmi-orange bg-orange-50 text-gmi-orange" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                  {item === "retirada" ? "Retirada" : "Devolucao"}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Locacao</p>
            <select value={selectedRentalId} onChange={(event) => setSelectedRentalId(event.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 focus:border-gmi-blue focus:outline-none focus:ring-2 focus:ring-gmi-blue/20">
              {getActiveRentals().map((rental) => {
                const client = findStoredClient(clients, rental.clientId);
                const vehicle = findStoredVehicle(vehicles, rental.vehicleId);
                return <option key={rental.id} value={rental.id}>{client?.name} - {vehicle?.brand} {vehicle?.model} ({vehicle?.plate})</option>;
              })}
            </select>
            {selectedClient && selectedVehicle && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-black text-slate-400">Cliente</p>
                  <p className="mt-1 font-black text-slate-950">{selectedClient.name}</p>
                  <p className="text-xs font-bold text-slate-500">{selectedClient.whatsapp}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                  <p className="text-xs font-black text-slate-400">Veiculo</p>
                  <p className="mt-1 font-black text-gmi-blue">{selectedVehicle.brand} {selectedVehicle.model}</p>
                  <p className="text-xs font-bold text-slate-500">{selectedVehicle.plate} • {selectedVehicle.currentKm.toLocaleString("pt-BR")} km</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Combustivel e KM</p>
            <div className="mt-4 h-5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200"><div className={`h-full rounded-full transition-all duration-500 ${fuelColor(fuelPercent)}`} style={{ width: `${fuelPercent}%` }} /></div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {FUEL_LEVELS.map((level) => <button key={level.value} type="button" onClick={() => setFuelLevel(level.value)} className={`rounded-2xl px-2 py-3 text-xs font-black transition ${fuelLevel === level.value ? "bg-gmi-blue text-white" : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"}`}>{level.label}</button>)}
            </div>
            <input type="number" inputMode="numeric" value={kmReading} onChange={(event) => setKmReading(event.target.value)} placeholder="KM atual" className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg font-black text-slate-900 focus:border-gmi-blue focus:outline-none focus:ring-2 focus:ring-gmi-blue/20" />
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Avarias e fotos obrigatorias</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">Marque areas com danos. Use camera do celular ou galeria.</p>
            <div className="mt-4 space-y-4">
              {DAMAGE_AREAS.map((area) => {
                const damage = damages[area];
                return (
                  <div key={area} className={`rounded-3xl border-2 p-4 transition ${damage.checked ? "border-gmi-orange bg-orange-50" : "border-slate-200 bg-slate-50"}`}>
                    <button type="button" onClick={() => updateDamage(area, { checked: !damage.checked })} className="flex w-full items-center justify-between text-left font-black text-slate-900">
                      <span>{area}</span><span className={`rounded-xl px-3 py-1 text-xs ${damage.checked ? "bg-gmi-orange text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}>{damage.checked ? "Com avaria" : "Ok"}</span>
                    </button>
                    {damage.checked && (
                      <div className="mt-3 space-y-3">
                        <input value={damage.description} onChange={(event) => updateDamage(area, { description: event.target.value })} placeholder={`Descreva dano em ${area}`} className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold focus:border-gmi-orange focus:outline-none focus:ring-2 focus:ring-gmi-orange/20" />
                        <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gmi-orange/40 bg-white px-4 py-4 text-sm font-black text-gmi-orange hover:bg-orange-50">
                          Tirar foto / anexar imagem
                          <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(event) => addPhotos(area, event.target.files)} />
                        </label>
                        {damage.photos.length > 0 && <div className="grid grid-cols-3 gap-2">{damage.photos.map((photo, index) => <img key={photo} src={photo} alt={`${area} foto ${index + 1}`} className="h-24 w-full rounded-xl object-cover ring-1 ring-orange-200" />)}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-500" htmlFor="notes">Observacoes gerais</label>
            <textarea id="notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ex: painel riscado, pneu calibrado, documento entregue..." className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 focus:border-gmi-blue focus:outline-none focus:ring-2 focus:ring-gmi-blue/20" />
          </div>

          <SignaturePad value={signature} onChange={setSignature} />
        </div>

        <aside className="h-fit rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 lg:sticky lg:top-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Resumo contrato</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-bold text-slate-500">Tipo</p><p className="text-lg font-black capitalize text-gmi-blue">{type}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Fotos anexadas</p><p className="text-lg font-black text-slate-950">{photoTotal}</p></div>
            <div className="rounded-2xl bg-orange-50 p-4"><p className="text-xs font-bold text-slate-500">Assinatura</p><p className={`text-lg font-black ${signature ? "text-emerald-600" : "text-gmi-orange"}`}>{signature ? "Capturada" : "Pendente"}</p></div>
          </div>
          <button type="button" disabled={!canSave} onClick={save} className={`mt-5 w-full rounded-2xl px-6 py-4 text-sm font-black shadow-xl transition ${canSave ? "bg-gradient-to-r from-gmi-blue to-gmi-blueDark text-white shadow-gmi-blue/20 hover:scale-[1.02]" : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"}`}>
            Gerar contrato com fotos
          </button>
        </aside>
      </div>
    </main>
  );
}
