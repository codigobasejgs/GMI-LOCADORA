"use client";

import { useMemo, useState } from "react";
import { maintenances, money, payments, rentals, today } from "@/lib/mock-data";
import { findStoredClient, findStoredVehicle, useAdminSettings, useStoredClients, useStoredVehicles } from "@/lib/local-store";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function fmtDate(iso: string | null) {
  if (!iso) return "Em aberto";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function whatsappUrl(phone: string, text: string) {
  return `https://wa.me/${onlyDigits(phone)}?text=${encodeURIComponent(text)}`;
}

export default function InteligenciaPage() {
  const settings = useAdminSettings();
  const vehicles = useStoredVehicles();
  const clients = useStoredClients();
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id ?? "");
  const [presentationMode, setPresentationMode] = useState(false);

  const activeRentals = rentals.filter((r) => r.status === "ativo");
  const todayCharges = activeRentals.filter((r) => r.paymentDay === today);
  const dueReturns = rentals.filter((r) => r.endDate === new Date().toISOString().slice(0, 10));
  const maintenanceAlerts = vehicles.filter((v) => v.status === "manutencao" || v.nextRevisionKm - v.currentKm <= 3000);
  const revenue = payments.reduce((sum, item) => sum + item.amount, 0);
  const costs = maintenances.reduce((sum, item) => sum + item.cost, 0);
  const selectedVehicle = findStoredVehicle(vehicles, selectedVehicleId) ?? vehicles[0];

  const vehicleScore = useMemo(() => vehicles.map((vehicle) => {
    const vehicleRentals = rentals.filter((r) => r.vehicleId === vehicle.id);
    const vehicleRevenue = payments.filter((p) => vehicleRentals.some((r) => r.id === p.rentalId)).reduce((sum, p) => sum + p.amount, 0);
    const vehicleCosts = maintenances.filter((m) => m.vehicleId === vehicle.id).reduce((sum, m) => sum + m.cost, 0);
    const profit = vehicleRevenue - vehicleCosts;
    const kmLeft = vehicle.nextRevisionKm - vehicle.currentKm;
    const status = profit < 0 || kmLeft <= 1000 ? "red" : profit < 1000 || kmLeft <= 3000 ? "yellow" : "green";
    const recommendation = status === "green" ? "Manter e priorizar locação" : status === "yellow" ? "Observar custos e revisão" : "Avaliar venda/troca";
    return { vehicle, revenue: vehicleRevenue, costs: vehicleCosts, profit, status, recommendation, kmLeft };
  }).sort((a, b) => a.profit - b.profit), [vehicles]);

  const selectedScore = vehicleScore.find((item) => item.vehicle.id === selectedVehicle?.id);

  const clientScores = clients.map((client) => {
    const clientRentals = rentals.filter((r) => r.clientId === client.id);
    const paid = payments.filter((p) => clientRentals.some((r) => r.id === p.rentalId)).length;
    const active = clientRentals.some((r) => r.status === "ativo");
    const score = paid >= 2 && active ? "Bom pagador" : active ? "Atenção" : paid > 0 ? "Histórico OK" : "Novo cliente";
    return { client, score };
  });

  const dailySummary = `${settings.tradeName} - Resumo do dia\n${todayCharges.length} cobranças hoje\n${dueReturns.length} devoluções previstas\n${maintenanceAlerts.length} alertas de manutenção\nReceita recebida: ${money.format(revenue)}\nCustos registrados: ${money.format(costs)}\nLucro parcial: ${money.format(revenue - costs)}`;

  function copySummary() {
    navigator.clipboard.writeText(dailySummary);
    alert("Resumo diário copiado.");
  }

  return (
    <main className={`min-h-screen bg-slate-50 pb-12 text-slate-950 ${presentationMode ? "presentation-mode" : ""}`}>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">Central inteligente</p>
          <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Inteligência operacional</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold text-blue-100/85">Tudo que ajuda o dono a decidir, cobrar, prevenir prejuízo e navegar rápido.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={copySummary} className="rounded-2xl bg-white px-6 py-4 text-sm font-black text-gmi-blue shadow-xl shadow-black/10 hover:scale-[1.02]">Copiar resumo do dia</button>
              <button type="button" onClick={() => setPresentationMode(!presentationMode)} className="rounded-2xl bg-gmi-orange px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-900/20 hover:scale-[1.02]">{presentationMode ? "Sair apresentação" : "Modo apresentação"}</button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric title="Cobrar hoje" value={todayCharges.length} tone="red" />
          <Metric title="Devoluções" value={dueReturns.length} tone="orange" />
          <Metric title="Manutenção" value={maintenanceAlerts.length} tone="yellow" />
          <Metric title="Receita" value={money.format(revenue)} tone="blue" />
          <Metric title="Lucro" value={money.format(revenue - costs)} tone="green" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <Panel title="Modo Hoje" subtitle="Agenda executiva do dono">
          <div className="space-y-3">
            {todayCharges.map((rental) => {
              const client = findStoredClient(clients, rental.clientId);
              const vehicle = findStoredVehicle(vehicles, rental.vehicleId);
              const message = `${settings.whatsappChargeMessage}\nCliente: ${client?.name}\nVeículo: ${vehicle?.plate}\nValor: ${money.format(rental.totalValue)}\nPIX: ${settings.whatsapp}`;
              return <ActionRow key={rental.id} title={client?.name ?? "Cliente"} detail={`${vehicle?.plate ?? "---"} • ${money.format(rental.totalValue)}`} href={whatsappUrl(client?.whatsapp ?? "", message)} action="Cobrar agora" />;
            })}
            {maintenanceAlerts.map((vehicle) => <InfoRow key={vehicle.id} title={`${vehicle.brand} ${vehicle.model}`} detail={`Revisão/manutenção: faltam ${(vehicle.nextRevisionKm - vehicle.currentKm).toLocaleString("pt-BR")} km`} tone="yellow" />)}
          </div>
        </Panel>

        <Panel title="Semáforo da frota" subtitle="Quem dá lucro e quem vira dor de cabeça">
          <div className="space-y-3">
            {vehicleScore.map((item) => <InfoRow key={item.vehicle.id} title={`${item.vehicle.plate} • ${item.vehicle.model}`} detail={`${money.format(item.profit)} • ${item.recommendation}`} tone={item.status} />)}
          </div>
        </Panel>

        <Panel title="Ranking dor de cabeça" subtitle="Maior risco primeiro">
          <div className="space-y-3">
            {vehicleScore.slice(0, 5).map((item, index) => <InfoRow key={item.vehicle.id} title={`${index + 1}. ${item.vehicle.brand} ${item.vehicle.model}`} detail={`Custos ${money.format(item.costs)} • Lucro ${money.format(item.profit)}`} tone={item.status} />)}
          </div>
        </Panel>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <Panel title="Ficha inteligente do carro" subtitle="Histórico, lucro, custos, status e recomendação">
          <select value={selectedVehicle?.id ?? ""} onChange={(e) => setSelectedVehicleId(e.target.value)} className="mb-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold">
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} - {vehicle.plate}</option>)}
          </select>
          {selectedVehicle && selectedScore && (
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBox label="Status" value={selectedVehicle.status} />
              <InfoBox label="Diária" value={money.format(selectedVehicle.dailyRate)} />
              <InfoBox label="Receita" value={money.format(selectedScore.revenue)} />
              <InfoBox label="Custos" value={money.format(selectedScore.costs)} />
              <InfoBox label="Lucro" value={money.format(selectedScore.profit)} />
              <InfoBox label="Decisão" value={selectedScore.recommendation} />
            </div>
          )}
        </Panel>

        <Panel title="Assistente de decisão" subtitle="Alertas escritos em linguagem de dono">
          <div className="space-y-3">
            {vehicleScore.filter((item) => item.status !== "green").map((item) => <InfoRow key={item.vehicle.id} title={item.vehicle.plate} detail={`Esse carro exige atenção: ${item.recommendation}. Lucro atual ${money.format(item.profit)}.`} tone={item.status} />)}
            {todayCharges.length > 0 && <InfoRow title="Cobrança" detail={`Você tem ${todayCharges.length} cobrança(s) para fazer hoje. Use botão Cobrar agora.`} tone="red" />}
            {revenue - costs < settings.monthlyProfitGoal && <InfoRow title="Meta" detail={`Lucro abaixo da meta configurada: faltam ${money.format(settings.monthlyProfitGoal - (revenue - costs))}.`} tone="yellow" />}
          </div>
        </Panel>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <Panel title="Reserva inteligente" subtitle="Evita conflito antes de confirmar">
          <div className="space-y-3">
            {vehicles.slice(0, 5).map((vehicle) => <InfoRow key={vehicle.id} title={vehicle.plate} detail={vehicle.status === "manutencao" ? "Bloquear reserva: manutenção" : vehicle.status === "alugado" ? "Atenção: já alugado" : "Disponível para reserva"} tone={vehicle.status === "disponivel" ? "green" : "yellow"} />)}
          </div>
        </Panel>

        <Panel title="Agenda visual" subtitle="Cores do dia e próximos eventos">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, index) => {
              const tone = index % 9 === 0 ? "bg-red-500" : index % 6 === 0 ? "bg-amber-400" : index % 4 === 0 ? "bg-gmi-blue" : "bg-emerald-500";
              return <div key={index} className={`flex aspect-square items-center justify-center rounded-2xl text-xs font-black text-white ${tone}`}>{index + 1}</div>;
            })}
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Azul alugado • laranja cobrança • vermelho atraso • verde livre</p>
        </Panel>

        <Panel title="QR contrato/recibo" subtitle="Visual profissional para apresentação">
          <div className="mx-auto grid w-44 grid-cols-7 gap-1 rounded-3xl bg-white p-4 ring-1 ring-slate-200">
            {Array.from({ length: 49 }).map((_, index) => <span key={index} className={`aspect-square rounded-sm ${index % 2 === 0 || index % 5 === 0 || index % 13 === 0 ? "bg-slate-950" : "bg-white"}`} />)}
          </div>
          <p className="mt-4 text-center text-sm font-bold text-slate-500">QR demonstrativo para abrir contrato/recibo digital.</p>
        </Panel>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <Panel title="Checklist comparativo" subtitle="Retirada vs devolução">
          <div className="space-y-3">
            {settings.requiredChecklistAreas.split("\n").slice(0, 7).map((area) => <InfoRow key={area} title={area} detail="Comparar foto retirada x devolução" tone="blue" />)}
          </div>
        </Panel>

        <Panel title="Score do cliente" subtitle="Decidir se aluga ou bloqueia">
          <div className="space-y-3">
            {clientScores.map((item) => <InfoRow key={item.client.id} title={item.client.name} detail={`${item.score} • ${item.client.whatsapp}`} tone={item.score === "Bom pagador" ? "green" : item.score === "Atenção" ? "yellow" : "blue"} />)}
          </div>
        </Panel>

        <Panel title="Mensagens padrão" subtitle="WhatsApp pronto para copiar/enviar">
          <div className="space-y-3">
            <MessageBox title="Cobrança" text={settings.whatsappChargeMessage} />
            <MessageBox title="Recibo" text={settings.whatsappReceiptMessage} />
            <MessageBox title="Devolução" text="Olá, lembrando da devolução do veículo e vistoria final." />
            <MessageBox title="Avaria" text={settings.damagePolicy} />
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Metric({ title, value, tone }: { title: string; value: string | number; tone: "red" | "orange" | "yellow" | "blue" | "green" }) {
  const color = { red: "text-red-600 bg-red-50", orange: "text-gmi-orange bg-orange-50", yellow: "text-amber-600 bg-amber-50", blue: "text-gmi-blue bg-blue-50", green: "text-emerald-600 bg-emerald-50" }[tone];
  return <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{title}</p><p className={`mt-2 rounded-2xl px-3 py-2 text-2xl font-black ${color}`}>{value}</p></div>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-gmi-orange">{title}</p><h2 className="mt-1 text-xl font-black text-gmi-blueDark">{subtitle}</h2><div className="mt-5">{children}</div></div>;
}

function InfoRow({ title, detail, tone }: { title: string; detail: string; tone: string }) {
  const dot = tone === "red" ? "bg-red-500" : tone === "yellow" ? "bg-amber-400" : tone === "green" ? "bg-emerald-500" : "bg-gmi-blue";
  return <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><div className="flex gap-3"><span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${dot}`} /><div><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-sm font-semibold text-slate-500">{detail}</p></div></div></div>;
}

function ActionRow({ title, detail, href, action }: { title: string; detail: string; href: string; action: string }) {
  return <div className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-100"><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-sm font-semibold text-slate-500">{detail}</p><a href={href} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white hover:bg-emerald-600">{action}</a></div>;
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 font-black text-slate-950">{value}</p></div>;
}

function MessageBox({ title, text }: { title: string; text: string }) {
  function copy() {
    navigator.clipboard.writeText(text);
    alert("Mensagem copiada.");
  }
  return <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-sm font-semibold text-slate-500">{text}</p></div><button type="button" onClick={copy} className="rounded-xl bg-gmi-blue px-3 py-2 text-xs font-black text-white">Copiar</button></div></div>;
}
