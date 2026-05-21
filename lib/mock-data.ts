import type { Vehicle, Client, Rental, Maintenance, Payment, NavItem } from "./types";

// ─── Veículos ───────────────────────────────────────────
export const vehicles: Vehicle[] = [
  {
    id: "polo-1", plate: "GMI-4A21", model: "Polo", brand: "Volkswagen", year: 2022,
    dailyRate: 120, status: "alugado", photoUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80",
    currentKm: 49200, nextRevisionKm: 50000, color: "Branco", fuel: "Flex", transmission: "Automático",
  },
  {
    id: "corolla-1", plate: "FRT-8C45", model: "Corolla", brand: "Toyota", year: 2023,
    dailyRate: 180, status: "alugado", photoUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80",
    currentKm: 73200, nextRevisionKm: 80000, color: "Prata", fuel: "Flex", transmission: "Automático",
  },
  {
    id: "corsa-1", plate: "HJK-2B77", model: "Corsa", brand: "Chevrolet", year: 2019,
    dailyRate: 80, status: "alugado", photoUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
    currentKm: 118500, nextRevisionKm: 120000, color: "Cinza", fuel: "Flex", transmission: "Manual",
  },
  {
    id: "hb20-1", plate: "QWE-9D12", model: "HB20", brand: "Hyundai", year: 2021,
    dailyRate: 110, status: "disponivel", photoUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80",
    currentKm: 34100, nextRevisionKm: 40000, color: "Vermelho", fuel: "Flex", transmission: "Automático",
  },
  {
    id: "onix-1", plate: "BRC-1F90", model: "Onix", brand: "Chevrolet", year: 2023,
    dailyRate: 130, status: "alugado", photoUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=600&q=80",
    currentKm: 58300, nextRevisionKm: 60000, color: "Preto", fuel: "Flex", transmission: "Automático",
  },
  {
    id: "ka-1", plate: "MOB-7H33", model: "Ka", brand: "Ford", year: 2020,
    dailyRate: 90, status: "disponivel", photoUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80",
    currentKm: 91200, nextRevisionKm: 100000, color: "Azul", fuel: "Flex", transmission: "Manual",
  },
  {
    id: "kicks-1", plate: "GMI-5E99", model: "Kicks", brand: "Nissan", year: 2024,
    dailyRate: 160, status: "manutencao", photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80",
    currentKm: 12800, nextRevisionKm: 15000, color: "Cinza Grafite", fuel: "Flex", transmission: "CVT",
  },
  {
    id: "creta-1", plate: "FLT-3H01", model: "Creta", brand: "Hyundai", year: 2023,
    dailyRate: 170, status: "disponivel", photoUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80",
    currentKm: 27400, nextRevisionKm: 30000, color: "Branco Polar", fuel: "Flex", transmission: "Automático",
  },
];

// ─── Clientes ───────────────────────────────────────────
export const clients: Client[] = [
  { id: "cli-1", name: "Bruno Silva", cpfCnpj: "123.456.789-00", cnh: "12345678900", whatsapp: "(11) 99999-1234", address: "Rua das Flores, 123 - SP" },
  { id: "cli-2", name: "Marcos Oliveira", cpfCnpj: "987.654.321-00", cnh: "98765432100", whatsapp: "(11) 99888-5678", address: "Av. Brasil, 456 - SP" },
  { id: "cli-3", name: "Ana Paula Costa", cpfCnpj: "456.789.123-00", cnh: "45678912300", whatsapp: "(11) 97777-9012", address: "Rua do Comércio, 789 - SP" },
  { id: "cli-4", name: "Ricardo Santos", cpfCnpj: "321.654.987-00", cnh: "32165498700", whatsapp: "(11) 96666-3456", address: "Rua XV de Novembro, 100 - SP" },
  { id: "cli-5", name: "Fernanda Lima", cpfCnpj: "45.123.456/0001-78", cnh: "78945612300", whatsapp: "(11) 95555-7890", address: "Av. Paulista, 2000 - SP" },
];

// ─── Locações ───────────────────────────────────────────
export const rentals: Rental[] = [
  { id: "loc-1", clientId: "cli-1", vehicleId: "polo-1", startDate: "2026-05-01", endDate: null, totalValue: 400, status: "ativo", paymentDay: "Quarta-feira" },
  { id: "loc-2", clientId: "cli-2", vehicleId: "corolla-1", startDate: "2026-04-15", endDate: null, totalValue: 650, status: "ativo", paymentDay: "Sexta-feira" },
  { id: "loc-3", clientId: "cli-3", vehicleId: "corsa-1", startDate: "2026-05-10", endDate: null, totalValue: 280, status: "ativo", paymentDay: "Quarta-feira" },
  { id: "loc-4", clientId: "cli-4", vehicleId: "onix-1", startDate: "2026-05-05", endDate: null, totalValue: 420, status: "ativo", paymentDay: "Terça-feira" },
  { id: "loc-5", clientId: "cli-5", vehicleId: "hb20-1", startDate: "2026-03-01", endDate: "2026-04-01", totalValue: 3300, status: "finalizado", paymentDay: "Segunda-feira" },
];

// ─── Manutenções ────────────────────────────────────────
export const maintenances: Maintenance[] = [
  { id: "man-1", vehicleId: "kicks-1", description: "Troca de óleo e filtros", date: "2026-05-18", kmAtService: 12800, cost: 350 },
  { id: "man-2", vehicleId: "corsa-1", description: "Revisão 120.000km", date: "2026-04-20", kmAtService: 118000, cost: 1200 },
  { id: "man-3", vehicleId: "polo-1", description: "Troca de pastilha de freio", date: "2026-03-15", kmAtService: 48000, cost: 450 },
  { id: "man-4", vehicleId: "corolla-1", description: "Alinhamento e balanceamento", date: "2026-04-01", kmAtService: 72000, cost: 180 },
  { id: "man-5", vehicleId: "onix-1", description: "Troca de pneus dianteiros", date: "2026-05-10", kmAtService: 57500, cost: 900 },
];

// ─── Pagamentos ─────────────────────────────────────────
export const payments: Payment[] = [
  { id: "pay-1", rentalId: "loc-1", amount: 400, paidAt: "2026-05-07", method: "pix" },
  { id: "pay-2", rentalId: "loc-1", amount: 400, paidAt: "2026-05-14", method: "pix" },
  { id: "pay-3", rentalId: "loc-2", amount: 650, paidAt: "2026-05-02", method: "transferencia" },
  { id: "pay-4", rentalId: "loc-2", amount: 650, paidAt: "2026-05-09", method: "transferencia" },
  { id: "pay-5", rentalId: "loc-2", amount: 650, paidAt: "2026-05-16", method: "pix" },
  { id: "pay-6", rentalId: "loc-3", amount: 280, paidAt: "2026-05-14", method: "dinheiro" },
  { id: "pay-7", rentalId: "loc-4", amount: 420, paidAt: "2026-05-06", method: "pix" },
  { id: "pay-8", rentalId: "loc-4", amount: 420, paidAt: "2026-05-13", method: "cartao" },
  { id: "pay-9", rentalId: "loc-5", amount: 3300, paidAt: "2026-04-01", method: "pix" },
];

// ─── Receita Mensal Mock (Financeiro) ───────────────────
export const monthlyRevenue = [
  { month: "Jan", revenue: 8200, expenses: 2100 },
  { month: "Fev", revenue: 9100, expenses: 1800 },
  { month: "Mar", revenue: 11500, expenses: 3200 },
  { month: "Abr", revenue: 10800, expenses: 2700 },
  { month: "Mai", revenue: 12400, expenses: 1950 },
];

// ─── Navegação ──────────────────────────────────────────
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Catálogo", href: "/catalogo", icon: "🚗" },
  { label: "Cadastros", href: "/cadastros", icon: "🧾" },
  { label: "Reservas", href: "/reservas", icon: "📅" },
  { label: "Contratos", href: "/contratos", icon: "📄" },
  { label: "Checklist", href: "/checklist", icon: "✅" },
  { label: "Financeiro", href: "/financeiro", icon: "💰" },
  { label: "Relatórios", href: "/relatorios", icon: "📈" },
  { label: "Configurações", href: "/configuracoes", icon: "⚙️" },
];

// ─── Helpers ────────────────────────────────────────────
export const today = "Quarta-feira";

export const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function getClientById(id: string) {
  return clients.find((c) => c.id === id);
}

export function getVehicleById(id: string) {
  return vehicles.find((v) => v.id === id);
}

export function getActiveRentals() {
  return rentals.filter((r) => r.status === "ativo");
}

export function getRentalByVehicleId(vehicleId: string) {
  return rentals.find((r) => r.vehicleId === vehicleId && r.status === "ativo");
}
