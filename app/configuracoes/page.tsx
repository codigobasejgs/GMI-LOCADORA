"use client";

import { useEffect, useState } from "react";
import { defaultAdminSettings, saveAdminSettings, useAdminSettings, type AdminSettings } from "@/lib/local-store";

const paymentDays = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <span className="mt-1 block text-xs font-semibold text-slate-400">{hint}</span>}
    </label>
  );
}

const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-gmi-blue focus:bg-white focus:ring-2 focus:ring-gmi-blue/20";

export default function ConfiguracoesPage() {
  const current = useAdminSettings();
  const [form, setForm] = useState<AdminSettings>(current);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(current);
  }, [current]);

  function update<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function apply() {
    saveAdminSettings(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  function reset() {
    setForm(defaultAdminSettings);
    saveAdminSettings(defaultAdminSettings);
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-slate-950">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--gmi-primary,#2b8fcc)_0,#0b5a93_36%,#063957_100%)] px-4 pb-16 pt-7 text-white sm:px-6 lg:px-8">
        <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: `${form.accentColor}33` }} />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-200">Painel administrativo</p>
          <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Configurações</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold text-blue-100/85">Configure empresa, recibos, WhatsApp, regras financeiras, metas e aparência do sistema.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={reset} className="rounded-2xl bg-white/15 px-6 py-4 text-sm font-black text-white ring-1 ring-white/20 hover:bg-white/25">Restaurar padrão</button>
              <button type="button" onClick={apply} className="rounded-2xl px-6 py-4 text-sm font-black text-white shadow-xl hover:scale-[1.02]" style={{ backgroundColor: form.accentColor }}>Aplicar configurações</button>
            </div>
          </div>
        </div>
      </section>

      {saved && (
        <div className="fixed right-4 top-4 z-50 rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-black text-white shadow-2xl shadow-emerald-200">
          Configurações aplicadas no sistema
        </div>
      )}

      <section className="relative mx-auto -mt-10 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
        <div className="space-y-6">
          <Panel title="Dados da empresa" subtitle="Esses dados aparecem em recibos, relatórios e mensagens.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome fantasia"><input className={inputClass} value={form.tradeName} onChange={(e) => update("tradeName", e.target.value)} /></Field>
              <Field label="Razão social"><input className={inputClass} value={form.companyName} onChange={(e) => update("companyName", e.target.value)} /></Field>
              <Field label="CNPJ"><input className={inputClass} value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} /></Field>
              <Field label="WhatsApp oficial"><input className={inputClass} value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} /></Field>
              <Field label="E-mail"><input className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
              <Field label="Endereço"><input className={inputClass} value={form.address} onChange={(e) => update("address", e.target.value)} /></Field>
            </div>
          </Panel>

          <Panel title="Recibos e contratos" subtitle="Texto que sai no recibo, baixa de pagamento e WhatsApp.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Título do recibo"><input className={inputClass} value={form.receiptTitle} onChange={(e) => update("receiptTitle", e.target.value)} /></Field>
              <Field label="Dia padrão de pagamento"><select className={inputClass} value={form.defaultPaymentDay} onChange={(e) => update("defaultPaymentDay", e.target.value)}>{paymentDays.map((day) => <option key={day}>{day}</option>)}</select></Field>
              <Field label="Rodapé do recibo"><textarea rows={4} className={`${inputClass} resize-none md:col-span-2`} value={form.receiptFooter} onChange={(e) => update("receiptFooter", e.target.value)} /></Field>
            </div>
          </Panel>

          <Panel title="Regras financeiras" subtitle="Base para rateio, multas, alertas e metas.">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Multa fixa atraso"><input type="number" className={inputClass} value={form.lateFee} onChange={(e) => update("lateFee", Number(e.target.value))} /></Field>
              <Field label="Multa por diária"><input type="number" className={inputClass} value={form.dailyFine} onChange={(e) => update("dailyFine", Number(e.target.value))} /></Field>
              <Field label="Meta ocupação %"><input type="number" className={inputClass} value={form.occupancyGoal} onChange={(e) => update("occupancyGoal", Number(e.target.value))} /></Field>
              <Field label="Meta receita mensal"><input type="number" className={inputClass} value={form.monthlyRevenueGoal} onChange={(e) => update("monthlyRevenueGoal", Number(e.target.value))} /></Field>
              <Field label="Meta lucro mensal"><input type="number" className={inputClass} value={form.monthlyProfitGoal} onChange={(e) => update("monthlyProfitGoal", Number(e.target.value))} /></Field>
              <Field label="Alertas"><div className="grid gap-2"><Toggle label="Cobranças do dia" checked={form.notifyCharges} onChange={(checked) => update("notifyCharges", checked)} /><Toggle label="Manutenção/óleo" checked={form.notifyMaintenance} onChange={(checked) => update("notifyMaintenance", checked)} /></div></Field>
            </div>
          </Panel>

          <Panel title="Aparência" subtitle="Cores que alteram a experiência visual da demo.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Cor principal"><input type="color" className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2" value={form.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} /></Field>
              <Field label="Cor destaque"><input type="color" className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2" value={form.accentColor} onChange={(e) => update("accentColor", e.target.value)} /></Field>
            </div>
          </Panel>
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-slate-100">
            <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${form.primaryColor}, #063957)` }}>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Prévia aplicada</p>
              <h2 className="mt-2 text-2xl font-black">{form.tradeName}</h2>
              <p className="mt-1 text-sm font-semibold text-white/80">{form.cnpj}</p>
            </div>
            <div className="space-y-3 p-6">
              <PreviewRow label="WhatsApp" value={form.whatsapp} />
              <PreviewRow label="E-mail" value={form.email} />
              <PreviewRow label="Endereço" value={form.address} />
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Recibo</p>
                <p className="mt-2 font-black text-slate-950">{form.receiptTitle}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{form.receiptFooter}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: form.primaryColor }}><p className="text-xs font-bold text-white/70">Principal</p><p className="font-black">{form.primaryColor}</p></div>
                <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: form.accentColor }}><p className="text-xs font-bold text-white/70">Destaque</p><p className="font-black">{form.accentColor}</p></div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-gmi-orange">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition ${checked ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"}`}>
      {label}<span className={`h-5 w-10 rounded-full p-0.5 transition ${checked ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-0"}`} /></span>
    </button>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 font-black text-slate-950">{value}</p></div>;
}
