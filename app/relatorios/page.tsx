"use client";

import Image from "next/image";
import { clients as seedClients, maintenances, money, payments, rentals, today } from "@/lib/mock-data";
import { findStoredClient, findStoredVehicle, useStoredClients, useStoredVehicles } from "@/lib/local-store";

function fmtDate(iso: string | null) {
  if (!iso) return "Em aberto";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function sanitize(value: unknown) {
  return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] ?? char));
}

function section(title: string, rows: (string | number)[][], headers: string[]) {
  return `
    <h2>${sanitize(title)}</h2>
    <table>
      <thead><tr>${headers.map((h) => `<th>${sanitize(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${sanitize(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  `;
}

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function RelatoriosPage() {
  const vehicles = useStoredVehicles();
  const clients = useStoredClients();

  const activeRentals = rentals.filter((r) => r.status === "ativo");
  const paidRentalIds = new Set(payments.map((p) => p.rentalId));
  const pendingRentals = activeRentals.filter((r) => !paidRentalIds.has(r.id) || r.paymentDay === today);
  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const costs = maintenances.reduce((sum, m) => sum + m.cost, 0);
  const profit = revenue - costs;

  const vehicleRows = vehicles.map((vehicle) => [vehicle.plate, `${vehicle.brand} ${vehicle.model}`, vehicle.year, vehicle.status, money.format(vehicle.dailyRate), vehicle.currentKm.toLocaleString("pt-BR"), vehicle.nextRevisionKm.toLocaleString("pt-BR")]);
  const clientRows = clients.map((client) => [client.name, client.cpfCnpj, client.cnh, client.whatsapp, client.address]);
  const rentalRows = rentals.map((rental) => {
    const client = findStoredClient(clients, rental.clientId) ?? seedClients.find((item) => item.id === rental.clientId);
    const vehicle = findStoredVehicle(vehicles, rental.vehicleId);
    return [rental.id, client?.name ?? "---", vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.plate}` : "---", fmtDate(rental.startDate), fmtDate(rental.endDate), rental.status, rental.paymentDay, money.format(rental.totalValue)];
  });
  const paymentRows = payments.map((payment) => {
    const rental = rentals.find((item) => item.id === payment.rentalId);
    const client = rental ? findStoredClient(clients, rental.clientId) : null;
    const vehicle = rental ? findStoredVehicle(vehicles, rental.vehicleId) : null;
    return [payment.id, client?.name ?? "---", vehicle?.plate ?? "---", money.format(payment.amount), fmtDate(payment.paidAt), payment.method];
  });
  const maintenanceRows = maintenances.map((item) => {
    const vehicle = findStoredVehicle(vehicles, item.vehicleId);
    return [vehicle?.plate ?? "---", vehicle ? `${vehicle.brand} ${vehicle.model}` : "---", item.description, fmtDate(item.date), item.kmAtService.toLocaleString("pt-BR"), money.format(item.cost)];
  });
  const pendingRows = pendingRentals.map((rental) => {
    const client = findStoredClient(clients, rental.clientId);
    const vehicle = findStoredVehicle(vehicles, rental.vehicleId);
    return [client?.name ?? "---", client?.whatsapp ?? "---", vehicle?.plate ?? "---", rental.paymentDay, money.format(rental.totalValue)];
  });
  const profitabilityRows = vehicles.map((vehicle) => {
    const vehicleRentals = rentals.filter((rental) => rental.vehicleId === vehicle.id);
    const vehiclePayments = payments.filter((payment) => vehicleRentals.some((rental) => rental.id === payment.rentalId)).reduce((sum, payment) => sum + payment.amount, 0);
    const vehicleCosts = maintenances.filter((item) => item.vehicleId === vehicle.id).reduce((sum, item) => sum + item.cost, 0);
    return [vehicle.plate, `${vehicle.brand} ${vehicle.model}`, money.format(vehiclePayments), money.format(vehicleCosts), money.format(vehiclePayments - vehicleCosts)];
  });

  function reportHtml() {
    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Relatório Premium GMI Locadora</title>
<style>
  body { margin: 0; font-family: Arial, sans-serif; color: #0f172a; background: #eef3f7; }
  .hero { background: radial-gradient(circle at top left,#2b8fcc 0,#0b5a93 36%,#063957 100%); color: white; padding: 42px; }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand img { width: 140px; border-radius: 22px; background: white; padding: 12px; }
  h1 { margin: 16px 0 4px; font-size: 34px; }
  h2 { margin: 34px 0 12px; color: #073F68; font-size: 22px; }
  .wrap { padding: 28px 42px 54px; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 24px; }
  .card { background: white; border-radius: 20px; padding: 18px; border: 1px solid #dbe7f1; }
  .card span { color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: .12em; }
  .card strong { display: block; margin-top: 8px; font-size: 22px; color: #0B5A93; }
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 18px; overflow: hidden; margin-bottom: 20px; }
  th { background: #0B5A93; color: white; text-align: left; padding: 11px; font-size: 12px; text-transform: uppercase; }
  td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
  tr:nth-child(even) td { background: #f8fafc; }
  .footer { margin-top: 36px; padding-top: 18px; border-top: 2px solid #F58220; color: #64748b; font-size: 12px; }
</style>
</head>
<body>
  <div class="hero">
    <div class="brand"><img src="/logo-gmi.png" alt="GMI" /><div><h1>Relatório Premium GMI Locadora</h1><p>Gestão completa de frota, contratos, financeiro e pendências</p></div></div>
  </div>
  <div class="wrap">
    <div class="cards">
      <div class="card"><span>Frota</span><strong>${vehicles.length}</strong></div>
      <div class="card"><span>Clientes</span><strong>${clients.length}</strong></div>
      <div class="card"><span>Receita</span><strong>${money.format(revenue)}</strong></div>
      <div class="card"><span>Lucro</span><strong>${money.format(profit)}</strong></div>
    </div>
    ${section("Catálogo de veículos", vehicleRows, ["Placa", "Veículo", "Ano", "Status", "Diária", "KM atual", "Próxima revisão"])}
    ${section("Clientes", clientRows, ["Nome", "CPF/CNPJ", "CNH", "WhatsApp", "Endereço"])}
    ${section("Reservas e contratos", rentalRows, ["Contrato", "Cliente", "Veículo", "Início", "Fim", "Status", "Pagamento", "Valor"])}
    ${section("Pagamentos", paymentRows, ["ID", "Cliente", "Placa", "Valor", "Data", "Método"])}
    ${section("Pagamentos pendentes / cobranças", pendingRows, ["Cliente", "WhatsApp", "Placa", "Dia cobrança", "Valor"])}
    ${section("Manutenções e custos", maintenanceRows, ["Placa", "Veículo", "Descrição", "Data", "KM", "Custo"])}
    ${section("Rentabilidade por veículo", profitabilityRows, ["Placa", "Veículo", "Receita", "Custos", "Lucro"])}
    <div class="footer">Gerado em ${new Date().toLocaleString("pt-BR")} • GMI Locadora • Relatório demonstrativo premium</div>
  </div>
</body>
</html>`;
  }

  function exportHtml() {
    download(`relatorio-gmi-${Date.now()}.html`, reportHtml(), "text/html;charset=utf-8");
  }

  function exportExcel() {
    download(`relatorio-gmi-${Date.now()}.xls`, reportHtml(), "application/vnd.ms-excel;charset=utf-8");
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-slate-950">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#2b8fcc_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-gmi-orange/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">Inteligência executiva</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Relatório Premium</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold text-blue-100/85">Exportação completa com logo, frota, reservas, contratos, pagamentos, pendências, custos e rentabilidade.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={exportExcel} className="rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-emerald-900/20 hover:scale-[1.02]">Exportar Excel</button>
              <button type="button" onClick={exportHtml} className="rounded-2xl bg-white px-6 py-4 text-sm font-black text-gmi-blue shadow-xl shadow-black/10 hover:scale-[1.02]">Exportar HTML</button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[['Veículos', vehicles.length], ['Clientes', clients.length], ['Receita', money.format(revenue)], ['Lucro', money.format(profit)]].map(([label, value]) => (
            <div key={label} className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-gmi-blue">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-slate-100">
          <div className="flex items-center gap-4 border-b border-slate-100 p-6">
            <Image src="/logo-gmi.png" alt="GMI" width={90} height={48} className="rounded-2xl bg-white object-contain" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gmi-orange">Prévia do relatório</p>
              <h2 className="text-2xl font-black text-gmi-blueDark">Pacote completo para diretoria/cliente</h2>
            </div>
          </div>

          <div className="grid gap-4 p-6 lg:grid-cols-3">
            <ReportBlock title="Catálogo" value={`${vehicles.length} veículos`} detail="Placa, status, diária, KM e revisão" />
            <ReportBlock title="Contratos" value={`${rentals.length} contratos`} detail="Ativos, finalizados, período e valor" />
            <ReportBlock title="Pendências" value={`${pendingRentals.length} cobranças`} detail="Cliente, WhatsApp, placa e valor" />
            <ReportBlock title="Financeiro" value={money.format(revenue)} detail="Receitas, pagamentos e métodos" />
            <ReportBlock title="Custos" value={money.format(costs)} detail="Manutenções e serviços" />
            <ReportBlock title="Rentabilidade" value={money.format(profit)} detail="Lucro por veículo e total" />
          </div>
        </div>
      </section>
    </main>
  );
}

function ReportBlock({ title, value, detail }: { title: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-[2rem] bg-slate-50 p-5 ring-1 ring-slate-100">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-gmi-blue">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{detail}</p>
    </div>
  );
}
