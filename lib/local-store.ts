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
  userRoles: string;
  contractClauses: string;
  damagePolicy: string;
  depositRequired: boolean;
  defaultDeposit: number;
  insuranceIncluded: boolean;
  insuranceDeductible: number;
  requirePickupPhotos: boolean;
  requireReturnPhotos: boolean;
  requireSignature: boolean;
  requiredChecklistAreas: string;
  financialCategories: string;
  whatsappChargeMessage: string;
  whatsappReceiptMessage: string;
  reservationMaxDays: number;
  reservationDepositRequired: boolean;
  reservationStatuses: string;
  notifyHour: string;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  requireCnh: boolean;
  requireCpf: boolean;
  requireAddressProof: boolean;
  requireCnhValidity: boolean;
  advancedVehicleStatuses: string;
  systemName: string;
  splashSubtitle: string;
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
  userRoles: "Dono/Admin\nAtendente\nFinanceiro\nSomente leitura",
  contractClauses: "Locatário declara receber o veículo em perfeito estado. Multas, avarias e atrasos serão cobrados conforme vistoria e regras da locadora.",
  damagePolicy: "Avarias não registradas na retirada serão cobradas na devolução conforme fotos, checklist e orçamento.",
  depositRequired: true,
  defaultDeposit: 500,
  insuranceIncluded: false,
  insuranceDeductible: 1500,
  requirePickupPhotos: true,
  requireReturnPhotos: true,
  requireSignature: true,
  requiredChecklistAreas: "Dianteira\nTraseira\nLaterais\nTeto\nPara-brisa\nPneus\nInterior\nPainel\nKM\nCombustível",
  financialCategories: "Diária\nCombustível\nÓleo\nPneus\nMecânica\nFunilaria\nDocumentação\nSeguro\nMultas\nAvarias\nOutros",
  whatsappChargeMessage: "Olá, tudo bem? Passando para lembrar do pagamento da locação do veículo.",
  whatsappReceiptMessage: "Segue recibo da GMI Locadora. Obrigado pela preferência.",
  reservationMaxDays: 7,
  reservationDepositRequired: true,
  reservationStatuses: "Pendente\nConfirmada\nCancelada\nExpirada",
  notifyHour: "08:00",
  notifyEmail: true,
  notifyWhatsapp: true,
  requireCnh: true,
  requireCpf: true,
  requireAddressProof: true,
  requireCnhValidity: true,
  advancedVehicleStatuses: "Disponível\nReservado\nAlugado\nManutenção\nBloqueado\nVendido/Inativo",
  systemName: "GMI Locadora",
  splashSubtitle: "Gestão de frota premium",
};

function loadLocal<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  const parsed = JSON.parse(raw) as T;
  if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as T;
  return { ...(fallback as object), ...(parsed as object) } as T;
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
  return Array.isArray(vehicles) ? vehicles.find((item) => item.id === id) : undefined;
}

export function findStoredClient(clients: Client[], id: string) {
  return Array.isArray(clients) ? clients.find((item) => item.id === id) : undefined;
}
