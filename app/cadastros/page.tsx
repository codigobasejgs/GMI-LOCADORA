"use client";

import { useEffect, useMemo, useState } from "react";
import { clients as seedClients, vehicles as seedVehicles, money } from "@/lib/mock-data";
import type { Client, Vehicle, VehicleStatus } from "@/lib/types";

type Tab = "clientes" | "veiculos";

type ClientForm = Client;
type VehicleForm = Vehicle;

const emptyClient: ClientForm = { id: "", name: "", cpfCnpj: "", cnh: "", whatsapp: "", address: "" };
const emptyVehicle: VehicleForm = {
  id: "",
  plate: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  dailyRate: 0,
  status: "disponivel",
  photoUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80",
  currentKm: 0,
  nextRevisionKm: 10000,
  color: "",
  fuel: "Flex",
  transmission: "Manual",
};

function loadLocal<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function inputCls() {
  return "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-gmi-blue focus:ring-2 focus:ring-gmi-blue/20";
}

export default function CadastrosPage() {
  const [tab, setTab] = useState<Tab>("clientes");
  const [clients, setClients] = useState<Client[]>(seedClients);
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [clientForm, setClientForm] = useState<ClientForm>(emptyClient);
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>(emptyVehicle);

  useEffect(() => {
    setClients(loadLocal("gmi-clients", seedClients));
    setVehicles(loadLocal("gmi-vehicles", seedVehicles));
  }, []);

  useEffect(() => {
    localStorage.setItem("gmi-clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("gmi-vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  const editingClient = useMemo(() => clients.some((item) => item.id === clientForm.id), [clients, clientForm.id]);
  const editingVehicle = useMemo(() => vehicles.some((item) => item.id === vehicleForm.id), [vehicles, vehicleForm.id]);

  function saveClient() {
    if (!clientForm.name.trim() || !clientForm.whatsapp.trim()) return;
    const next = { ...clientForm, id: clientForm.id || `cli-${Date.now()}` };
    setClients((prev) => (prev.some((item) => item.id === next.id) ? prev.map((item) => (item.id === next.id ? next : item)) : [next, ...prev]));
    setClientForm(emptyClient);
  }

  function saveVehicle() {
    if (!vehicleForm.plate.trim() || !vehicleForm.model.trim() || !vehicleForm.brand.trim()) return;
    const next = { ...vehicleForm, id: vehicleForm.id || `veh-${Date.now()}` };
    setVehicles((prev) => (prev.some((item) => item.id === next.id) ? prev.map((item) => (item.id === next.id ? next : item)) : [next, ...prev]));
    setVehicleForm(emptyVehicle);
  }

  function resetData() {
    localStorage.removeItem("gmi-clients");
    localStorage.removeItem("gmi-vehicles");
    setClients(seedClients);
    setVehicles(seedVehicles);
    setClientForm(emptyClient);
    setVehicleForm(emptyVehicle);
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-slate-950">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">Base operacional</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Cadastros</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold text-blue-100/85">Adicione clientes, cadastre carros e edite informações existentes. Dados ficam salvos no navegador nesta demo.</p>
            </div>
            <button type="button" onClick={resetData} className="w-fit rounded-2xl bg-white/15 px-5 py-3 text-sm font-black text-white ring-1 ring-white/20 hover:bg-white/25">
              Restaurar dados demo
            </button>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-2 shadow-card ring-1 ring-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setTab("clientes")} className={`rounded-[1.5rem] px-5 py-4 text-sm font-black transition ${tab === "clientes" ? "bg-gmi-blue text-white shadow-lg shadow-gmi-blue/20" : "text-slate-500 hover:bg-slate-50"}`}>Clientes</button>
            <button type="button" onClick={() => setTab("veiculos")} className={`rounded-[1.5rem] px-5 py-4 text-sm font-black transition ${tab === "veiculos" ? "bg-gmi-blue text-white shadow-lg shadow-gmi-blue/20" : "text-slate-500 hover:bg-slate-50"}`}>Carros</button>
          </div>
        </div>
      </section>

      {tab === "clientes" ? (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[24rem_1fr] lg:px-8">
          <div className="h-fit rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 lg:sticky lg:top-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gmi-orange">{editingClient ? "Editar cliente" : "Novo cliente"}</p>
            <div className="mt-4 space-y-3">
              <Field label="Nome"><input className={inputCls()} value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} /></Field>
              <Field label="CPF/CNPJ"><input className={inputCls()} value={clientForm.cpfCnpj} onChange={(e) => setClientForm({ ...clientForm, cpfCnpj: e.target.value })} /></Field>
              <Field label="CNH"><input className={inputCls()} value={clientForm.cnh} onChange={(e) => setClientForm({ ...clientForm, cnh: e.target.value })} /></Field>
              <Field label="WhatsApp"><input className={inputCls()} value={clientForm.whatsapp} onChange={(e) => setClientForm({ ...clientForm, whatsapp: e.target.value })} /></Field>
              <Field label="Endereço"><input className={inputCls()} value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} /></Field>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={saveClient} className="rounded-2xl bg-gradient-to-r from-gmi-blue to-gmi-blueDark px-4 py-3 text-sm font-black text-white">Salvar</button>
              <button type="button" onClick={() => setClientForm(emptyClient)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">Limpar</button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {clients.map((client) => (
              <div key={client.id} className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-lg font-black text-slate-950">{client.name}</p><p className="text-xs font-bold text-slate-500">{client.cpfCnpj}</p></div>
                  <button type="button" onClick={() => setClientForm(client)} className="rounded-xl bg-gmi-blue/10 px-3 py-2 text-xs font-black text-gmi-blue hover:bg-gmi-blue/20">Editar</button>
                </div>
                <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
                  <p>CNH: <span className="font-black text-slate-900">{client.cnh}</span></p>
                  <p>WhatsApp: <span className="font-black text-slate-900">{client.whatsapp}</span></p>
                  <p>Endereço: <span className="font-black text-slate-900">{client.address}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[24rem_1fr] lg:px-8">
          <div className="h-fit rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 lg:sticky lg:top-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gmi-orange">{editingVehicle ? "Editar carro" : "Novo carro"}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Field label="Placa"><input className={inputCls()} value={vehicleForm.plate} onChange={(e) => setVehicleForm({ ...vehicleForm, plate: e.target.value.toUpperCase() })} /></Field>
              <Field label="Marca"><input className={inputCls()} value={vehicleForm.brand} onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })} /></Field>
              <Field label="Modelo"><input className={inputCls()} value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} /></Field>
              <Field label="Ano"><input type="number" className={inputCls()} value={vehicleForm.year} onChange={(e) => setVehicleForm({ ...vehicleForm, year: Number(e.target.value) })} /></Field>
              <Field label="Diária"><input type="number" className={inputCls()} value={vehicleForm.dailyRate} onChange={(e) => setVehicleForm({ ...vehicleForm, dailyRate: Number(e.target.value) })} /></Field>
              <Field label="Status"><select className={inputCls()} value={vehicleForm.status} onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as VehicleStatus })}><option value="disponivel">Disponível</option><option value="alugado">Alugado</option><option value="manutencao">Manutenção</option></select></Field>
              <Field label="KM atual"><input type="number" className={inputCls()} value={vehicleForm.currentKm} onChange={(e) => setVehicleForm({ ...vehicleForm, currentKm: Number(e.target.value) })} /></Field>
              <Field label="Próxima revisão KM"><input type="number" className={inputCls()} value={vehicleForm.nextRevisionKm} onChange={(e) => setVehicleForm({ ...vehicleForm, nextRevisionKm: Number(e.target.value) })} /></Field>
              <Field label="Cor"><input className={inputCls()} value={vehicleForm.color} onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })} /></Field>
              <Field label="Câmbio"><input className={inputCls()} value={vehicleForm.transmission} onChange={(e) => setVehicleForm({ ...vehicleForm, transmission: e.target.value })} /></Field>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={saveVehicle} className="rounded-2xl bg-gradient-to-r from-gmi-blue to-gmi-blueDark px-4 py-3 text-sm font-black text-white">Salvar</button>
              <button type="button" onClick={() => setVehicleForm(emptyVehicle)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">Limpar</button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-slate-100">
                <img src={vehicle.photoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-36 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-lg font-black text-slate-950">{vehicle.brand} {vehicle.model}</p><p className="text-xs font-bold text-slate-500">{vehicle.plate} • {vehicle.year}</p></div>
                    <button type="button" onClick={() => setVehicleForm(vehicle)} className="rounded-xl bg-gmi-blue/10 px-3 py-2 text-xs font-black text-gmi-blue hover:bg-gmi-blue/20">Editar</button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-blue-50 p-3"><p className="text-xs font-bold text-slate-500">Diária</p><p className="font-black text-gmi-blue">{money.format(vehicle.dailyRate)}</p></div>
                    <div className="rounded-2xl bg-orange-50 p-3"><p className="text-xs font-bold text-slate-500">Status</p><p className="font-black capitalize text-gmi-orange">{vehicle.status}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">KM</p><p className="font-black text-slate-900">{vehicle.currentKm.toLocaleString("pt-BR")}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">Revisão</p><p className="font-black text-slate-900">{vehicle.nextRevisionKm.toLocaleString("pt-BR")}</p></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
