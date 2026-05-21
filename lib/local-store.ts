"use client";

import { useEffect, useState } from "react";
import { clients as seedClients, vehicles as seedVehicles } from "./mock-data";
import type { Client, Vehicle } from "./types";

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

export function findStoredVehicle(vehicles: Vehicle[], id: string) {
  return vehicles.find((item) => item.id === id);
}

export function findStoredClient(clients: Client[], id: string) {
  return clients.find((item) => item.id === id);
}
