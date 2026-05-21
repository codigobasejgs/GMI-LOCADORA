// ─── Veículo ────────────────────────────────────────────
export type VehicleStatus = "disponivel" | "alugado" | "manutencao";

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  dailyRate: number;
  status: VehicleStatus;
  photoUrl: string;
  currentKm: number;
  nextRevisionKm: number;
  color: string;
  fuel: string;
  transmission: string;
}

// ─── Cliente ────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  cnh: string;
  whatsapp: string;
  address: string;
}

// ─── Locação ────────────────────────────────────────────
export type RentalStatus = "pendente" | "ativo" | "finalizado";

export interface Rental {
  id: string;
  clientId: string;
  vehicleId: string;
  startDate: string; // ISO
  endDate: string | null;
  totalValue: number;
  status: RentalStatus;
  paymentDay: string; // dia da semana
}

// ─── Manutenção ─────────────────────────────────────────
export interface Maintenance {
  id: string;
  vehicleId: string;
  description: string;
  date: string;
  kmAtService: number;
  cost: number;
}

// ─── Pagamento ──────────────────────────────────────────
export type PaymentMethod = "pix" | "dinheiro" | "cartao" | "transferencia";

export interface Payment {
  id: string;
  rentalId: string;
  amount: number;
  paidAt: string;
  method: PaymentMethod;
}

// ─── Checklist ──────────────────────────────────────────
export type ChecklistType = "retirada" | "devolucao";
export type FuelLevel = "cheio" | "3/4" | "1/2" | "1/4" | "reserva";

export interface ChecklistDamage {
  area: string;
  description: string;
}

export interface Checklist {
  id: string;
  rentalId: string;
  type: ChecklistType;
  fuelLevel: FuelLevel;
  kmReading: number;
  damages: ChecklistDamage[];
  notes: string;
  createdAt: string;
}

// ─── Navegação ──────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string; // emoji as icon placeholder
}
