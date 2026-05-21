"use client";

import { useEffect, useState } from "react";
import { clients as seedClients, vehicles as seedVehicles } from "./mock-data";
import type { Client, Vehicle } from "./types";

export type AdminSettings = {
  companyName: string;
  tradeName: string;
  cnpj: string;
  whatsapp: string;
  email: string;
  address: string;
  receiptTitle: string;
  receiptFooter: string;
  primaryColor: string;
  accentColor: string;
  lateFee: number;
  dailyFine: number;
  defaultPaymentDay: string;
  monthlyRevenueGoal: number;
  monthlyProfitGoal: number;
  occupancyGoal: number;
  notifyCharges: boolean;
  notifyMaintenance: boolean;
};

export const defaultAdminSettings: AdminSettings = {
  companyName: "GMI Locadora",
  tradeName: "GMI Locadora",
  cnpj: "00.000.000/0001-00",
  whatsapp: "(11) 99999-0000",
  email: "contato@gmilocadora.com.br",
  address: "Endereço da locadora",
  receiptTitle: "Recibo GMI Locadora",
  receiptFooter: "Obrigado pela preferência. GMI Locadora.",
  primaryColor: "#0B5A93",
  accentColor: "#F58220",
  lateFee: 50,
  dailyFine: 50,
  defaultPaymentDay: "Segunda-feira",
  monthlyRevenueGoal: 25000,
  monthlyProfitGoal: 16000,
  occupancyGoal: 85,
  notifyCharges: true,
  notifyMaintenance: true,
};

function loadLocal<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

export function useStoredVehicles() {
  const [items, setItems] = useState<Vehicle[]>(seedVehicles);

  useEffect(() => {
    setItems(loadLocal("gmi-vehicles", seedVehicles));
  }, []);

  return items;
}

export function useStoredClients() {
  const [items, setItems] = useState<Client[]>(seedClients);

  useEffect(() => {
    setItems(loadLocal("gmi-clients", seedClients));
  }, []);

  return items;
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(defaultAdminSettings);

  useEffect(() => {
    const refresh = () => setSettings(loadLocal("gmi-settings", defaultAdminSettings));
    refresh();
    window.addEventListener("gmi-settings-updated", refresh);
    return () => window.removeEventListener("gmi-settings-updated", refresh);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--gmi-primary", settings.primaryColor);
    document.documentElement.style.setProperty("--gmi-accent", settings.accentColor);
  }, [settings]);

  return settings;
}

export function saveAdminSettings(settings: AdminSettings) {
  localStorage.setItem("gmi-settings", JSON.stringify(settings));
  window.dispatchEvent(new Event("gmi-settings-updated"));
}

export function findStoredVehicle(vehicles: Vehicle[], id: string) {
  return vehicles.find((item) => item.id === id);
}

export function findStoredClient(clients: Client[], id: string) {
  return clients.find((item) => item.id === id);
}
