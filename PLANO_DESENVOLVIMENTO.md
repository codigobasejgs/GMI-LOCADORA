# GMI Locadora — Plano de Desenvolvimento

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | SSR/SSG, PWA, performance |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) | Zero infra, BaaS completo |
| Deploy | Vercel | CI/CD automático via GitHub |
| PDF | jsPDF + html2canvas | Contratos e relatórios |
| Versionamento | GitHub | Controle de código + CI |
| Monitoramento | Vercel Analytics | Performance e uso |

---

## Fases de Desenvolvimento

### FASE 1 — Frontend Demonstrativo (ATUAL)
**Objetivo**: Impressionar o cliente com interface funcional usando dados mockados.
**Status**: 🔄 Em andamento

**Entregas**:
- [x] Dashboard principal com cards de resumo
- [x] Grid de veículos com status visual
- [x] Alerta de cobrança com ação "Baixar Pagamento"
- [x] Barra de progresso KM com alerta de revisão
- [ ] **Catálogo Digital** — Galeria de veículos com fotos, specs e filtro por status
- [ ] **Calendário de Reservas** — Visualização de datas bloqueadas por veículo
- [ ] **Gestão de Contratos** — Formulário + geração de PDF mockado
- [ ] **Checklist Retirada/Devolução** — Formulário mobile-first com avarias e combustível
- [ ] **Painel Financeiro** — Gráficos de faturamento e alertas de manutenção
- [ ] **Atualizador de KM Rápido** — Input inline em cada card
- [ ] **Sidebar/Navegação** — Menu lateral responsivo entre seções
- [ ] **PWA Manifest** — Instalável no celular
- [ ] **Deploy Vercel** — URL pública para apresentação ao cliente

### FASE 2 — Infraestrutura Real (Pós-Aprovação)
**Objetivo**: Conectar Supabase, autenticação e persistência.

**Entregas**:
- [ ] Setup Supabase (projeto + tabelas + RLS)
- [ ] Auth (login admin com magic link ou senha)
- [ ] CRUD Veículos (com upload de fotos para Supabase Storage)
- [ ] CRUD Clientes (CPF/CNPJ, CNH, WhatsApp)
- [ ] CRUD Locações (vínculo cliente↔veículo, datas, valores)
- [ ] CRUD Manutenções (veículo, descrição, KM, custo)
- [ ] Migrar mocks → queries Supabase

### FASE 3 — Automação e Inteligência
**Objetivo**: Automações que economizam tempo do dono.

**Entregas**:
- [ ] Geração real de PDF de contrato com dados dinâmicos
- [ ] Notificação WhatsApp (via API) para cobranças
- [ ] Calendário dinâmico que bloqueia datas automaticamente
- [ ] Alertas automáticos de IPVA, seguro, revisão
- [ ] Histórico de pagamentos com timeline
- [ ] Relatórios exportáveis (Excel/PDF)

### FASE 4 — Portal do Cliente (Opcional)
**Objetivo**: Cliente consulta própria reserva e documentos.

**Entregas**:
- [ ] Login do cliente (Supabase Auth)
- [ ] Consulta de reserva e contrato
- [ ] Upload de documentos (CNH, comprovante)
- [ ] Assinatura digital de contrato

---

## Modelo de Dados (Supabase PostgreSQL)

```sql
-- Veículos
CREATE TABLE vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plate TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  brand TEXT NOT NULL,
  year INT NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'disponivel', -- disponivel | alugado | manutencao
  photo_url TEXT,
  current_km INT DEFAULT 0,
  next_revision_km INT DEFAULT 50000,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clientes
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf_cnpj TEXT UNIQUE NOT NULL,
  cnh TEXT,
  whatsapp TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Locações
CREATE TABLE rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  vehicle_id UUID REFERENCES vehicles(id),
  start_date DATE NOT NULL,
  end_date DATE,
  total_value DECIMAL(10,2),
  status TEXT DEFAULT 'pendente', -- pendente | ativo | finalizado
  payment_day TEXT, -- dia fixo de pagamento semanal
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Manutenções
CREATE TABLE maintenances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  km_at_service INT,
  cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pagamentos
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID REFERENCES rentals(id),
  amount DECIMAL(10,2) NOT NULL,
  paid_at TIMESTAMPTZ DEFAULT now(),
  method TEXT DEFAULT 'pix' -- pix | dinheiro | cartao | transferencia
);

-- Checklist Retirada/Devolução
CREATE TABLE checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID REFERENCES rentals(id),
  type TEXT NOT NULL, -- retirada | devolucao
  fuel_level TEXT, -- cheio | 3/4 | 1/2 | 1/4 | reserva
  km_reading INT,
  damages JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Estrutura de Arquivos (Fase 1)

```
GMI LOCADORA/
├── public/
│   ├── logo-gmi.jfif
│   ├── manifest.json          (PWA)
│   └── icons/                 (PWA icons)
├── app/
│   ├── layout.tsx             (root layout + nav)
│   ├── page.tsx               (dashboard)
│   ├── catalogo/page.tsx      (galeria veículos)
│   ├── reservas/page.tsx      (calendário)
│   ├── contratos/page.tsx     (gestão contratos)
│   ├── checklist/page.tsx     (retirada/devolução)
│   ├── financeiro/page.tsx    (painel financeiro)
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── mobile-nav.tsx
│   ├── dashboard/
│   │   ├── stat-card.tsx
│   │   ├── vehicle-card.tsx
│   │   └── km-updater.tsx
│   ├── catalog/
│   │   ├── vehicle-gallery.tsx
│   │   └── vehicle-detail-modal.tsx
│   ├── calendar/
│   │   └── reservation-calendar.tsx
│   ├── contracts/
│   │   ├── contract-form.tsx
│   │   └── contract-pdf.tsx
│   ├── checklist/
│   │   ├── checklist-form.tsx
│   │   └── fuel-gauge.tsx
│   └── financial/
│       ├── revenue-chart.tsx
│       └── maintenance-alerts.tsx
├── lib/
│   ├── mock-data.ts           (dados centralizados)
│   ├── types.ts               (TypeScript types)
│   └── utils.ts               (formatação, helpers)
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

---

## Workflow GitHub → Vercel

```
1. git init + push para GitHub (repo privado)
2. Conectar repo ao Vercel
3. Cada push na main → deploy automático
4. Branch "dev" para desenvolvimento
5. PR review antes de merge na main
```

---

## Cronograma Estimado

| Fase | Prazo | Dependência |
|------|-------|-------------|
| Fase 1 — Demo Frontend | 2-3 dias | Nenhuma |
| Fase 2 — Supabase + Auth | 3-5 dias | Aprovação do cliente |
| Fase 3 — Automações | 5-7 dias | Fase 2 completa |
| Fase 4 — Portal Cliente | 3-5 dias | Fase 3 completa |
