# Bubu — Documento de Requisitos do Produto (PRD)

**Versão:** 0.1.0
**Data:** Junho 2026
**Status:** MVP funcional (modo demo local) — pendente integração Supabase

---

## 1. Visão Geral

**Bubu** é um aplicativo PWA mobile-first para casais e pessoas que dividem a mesma casa acompanharem contas domésticas compartilhadas. Ele resolve a confusão de "já pagou a luz?", "quanto eu te devo do mercado?" e "o IPTU venceu mês passado?" com uma interface simples em português, tom coloquial e zero fricção.

**Tagline:** *As contas da casa, do nosso jeito.*

---

## 2. Problema

Casais e colegas de casa no Brasil gerenciam contas compartilhadas por:
- Grupos de WhatsApp (mensagens se perdem)
- Planilhas (ninguém atualiza)
- Memória (dá briga)

Nenhuma solução brasileira oferece uma experiência simples, em português, pensada especificamente para a dinâmica de uma casa compartilhada.

---

## 3. Público-alvo

| Persona | Descrição |
|---|---|
| **Casal jovem** | Dividem aluguel, contas e assinaturas. Querem saber quem pagou o quê e quanto ainda falta no mês. |
| **Colegas de república** | 3-4 pessoas dividindo contas fixas. Precisam de clareza sobre o rateio e vencimentos. |
| **Família** | Pais organizando contas da casa com filhos adolescentes participando do controle. |

---

## 4. Funcionalidades

### 4.1 MVP Atual (implementado — demo local)

| ID | Funcionalidade | Descrição |
|---|---|---|
| F01 | Autenticação (demo) | Login/criação de conta com e-mail e senha (modo demo: qualquer credencial funciona) |
| F02 | Dashboard mensal | Visão do mês atual: lista de contas com status (pago/pendente/atrasado), total pendente, navegação entre meses |
| F03 | CRUD de contas | Criar, editar, excluir contas com nome, valor, categoria, dia de vencimento e tipo |
| F04 | Tipos de conta | Mensal (recorrente todo mês), anual (IPTU, IPVA, seguros), parcelada (N parcelas) |
| F05 | Categorização | 17 categorias com ícones: Água, Luz, Aluguel, Internet, Telefone, Condomínio, IPTU, IPVA, Seguros, Streaming, Assinaturas, Supermercado, Transporte, Educação, Saúde, Lazer, Outros |
| F06 | Marcar como pago | Toggle pago/não-pago com feedback visual e toast de confirmação. Registra quem pagou e quando |
| F07 | Transferir para próximo mês | Move conta não paga para o mês seguinte (ex: esqueceu de pagar a luz em janeiro, transfere pra fevereiro) |
| F08 | Aba Pendentes | Filtro de contas não pagas do mês atual (atrasadas + pendentes) |
| F09 | Aba Histórico | Histórico mês a mês com: total de contas, total pago, total pendente, expansão com detalhes por conta |
| F10 | Aba Casa | Código de convite da casa (7 caracteres), copiar código, entrar em casa existente, lista de membros, sair da casa |
| F11 | Modo escuro | Toggle com persistência em localStorage, respeita preferência do sistema |
| F12 | PWA | Instalável, service worker com estratégia NetworkFirst via Workbox, cache offline |
| F13 | Indicador de conectividade | Banner informando quando está offline e quando a conexão retorna |
| F14 | Animações e feedback | Toast de confirmação (salvar/pagar/editar/apagar/transferir), animações de slide-up e scale |
| F15 | Estados vazios | Mensagens amigáveis para cada aba quando não há dados |
| F16 | Dados de demonstração | 8 contas pré-cadastradas com status em 2 meses para visualização imediata |
| F17 | Persistência local | Dados salvos em localStorage (chave `bubu-demo`) |
| F18 | Responsivo | Mobile-first, max-w-lg, safe-area insets para dispositivos com notch |

### 4.2 Funcionalidades Planejadas (backlog)

| ID | Funcionalidade | Prioridade | Descrição |
|---|---|---|---|
| F19 | Integração Supabase | **Alta** | Substituir `DemoStore` pelo Supabase: auth real, banco PostgreSQL, sync em tempo real |
| F20 | Login com Google | Média | OAuth via Google (código de copy já existe: `auth.google`) |
| F21 | Sincronização multi-dispositivo | **Alta** | Via Supabase Realtime: alterações de um membro aparecem instantaneamente para os outros |
| F22 | Notificações push | Média | Lembrete de vencimento, alerta de conta atrasada, notificação de conta paga por outro membro |
| F23 | Rateio de contas | Média | Divisão do valor entre membros da casa (%, R$ fixo, igualitário) |
| F24 | Dashboard financeiro | Baixa | Gráfico de gastos por categoria, tendência mês a mês, quem mais gasta/paga |
| F25 | Recorrência automática | **Alta** | Gerar status de pagamento automaticamente para contas mensais em meses futuros |
| F26 | Fechamento do mês | Média | Botão "fechar mês" com resumo do que ficou pendente e confirmação de transferência |
| F27 | Exportação (PDF/CSV) | Baixa | Exportar histórico de contas para prestação de contas ou declaração de imposto |
| F28 | Lembretes configuráveis | Baixa | Alertas N dias antes do vencimento, repetição de lembrete |
| F29 | Múltiplas casas | Baixa | Um usuário participar de mais de uma casa (ex: casa própria + casa dos pais) |
| F30 | Comentários por conta | Baixa | Notas ou comentários em contas específicas (ex: "aumentou R$20 esse mês") |
| F31 | Upload de comprovante | Baixa | Anexar foto/PDF do boleto ou comprovante de pagamento |

---

## 5. Arquitetura Técnica

### 5.1 Stack Atual

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework UI | React | 18.3 |
| Linguagem | TypeScript | 5.5 |
| Roteamento | React Router DOM | 6.26 |
| Bundler | Vite | 5.4 |
| CSS | Tailwind CSS | 3.4 |
| PWA | vite-plugin-pwa + Workbox | 0.20 |
| Gerenciamento de estado | DemoStore (classe customizada) | — |
| Persistência (demo) | localStorage | — |
| Backend planejado | Supabase (PostgreSQL + Auth + RLS) | 2.45 |
| Utilitários | date-fns | 3.6 |

### 5.2 Modelo de Dados

```
houses ─────────┐
  id (PK)       │
  invite_code   │
                │
profiles ───────┤
  id (PK, FK→auth.users)
  name          │
  avatar_url    │
  house_id (FK)─┘

bills ──────────────────────┐
  id (PK)                   │
  house_id (FK)             │
  nome                      │
  valor                     │
  categoria                 │
  vencimento (1-31)         │
  tipo (mensal|anual|parcelada)
  parcelas, parcela_atual   │
  created_by (FK)           │
  ativo                     │
                            │
bill_status ────────────────┤
  id (PK)                   │
  bill_id (FK)──────────────┘
  mes_referencia (YYYY-MM)
  pago
  pago_por (FK)
  pago_em
  transferida
```

### 5.3 Segurança (RLS — SQL schema pronto)

Todas as tabelas possuem políticas de Row-Level Security que garantem:
- Usuários só veem dados da própria casa
- Usuários só criam/atualizam contas da própria casa
- Usuários só criam o próprio perfil
- Código de convite gerado via função PL/pgSQL (7 caracteres alfanuméricos)

### 5.4 Estrutura de Diretórios

```
src/
├── main.tsx                 Entry point
├── App.tsx                  Autenticação + layout + rotas
├── index.css                Tailwind + componentes de design system
├── copy.ts                  Strings da UI (pt-BR)
├── types/
│   └── index.ts             Tipos, categorias e mapa de categorias
├── lib/
│   ├── supabase.ts          Cliente Supabase (condicional)
│   └── store-demo.ts        Camada de dados do modo demo
├── components/
│   ├── Layout.tsx           Shell (header, tabs, dark mode toggle)
│   ├── BillCard.tsx         Card de conta com status, ações e menu
│   ├── BillForm.tsx         Formulário de criação/edição de conta
│   ├── MonthSelector.tsx    Navegação entre meses
│   └── OfflineBanner.tsx    Banner de status de conexão
└── pages/
    ├── Login.tsx            Tela de login/criação de conta
    ├── Dashboard.tsx        Dashboard do mês (aba "Este mês")
    ├── Pending.tsx          Contas pendentes/atrasadas (aba "Pendentes")
    ├── History.tsx          Histórico mensal (aba "Histórico")
    └── House.tsx            Gestão da casa (aba "Casa")
```

### 5.5 Rotas

| Rota | Componente | Aba |
|---|---|---|
| `/` | Dashboard | Este mês |
| `/pendentes` | Pending | Pendentes |
| `/historico` | History | Histórico |
| `/casa` | House | Casa |
| `*` | Redirect → `/` | — |

---

## 6. Design System

### 6.1 Paleta de Cores

| Token | Hex | Uso |
|---|---|---|
| `bubu-turquoise` | `#0EA5E9` | Ações primárias, destaque, marca |
| `bubu-turquoise-dark` | `#0284C7` | Hover, estados ativos |
| `bubu-turquoise-light` | `#E0F2FE` | Fundos de destaque sutil |
| `bubu-navy` | `#0B1B3D` | Fundo escuro, cards no dark mode |
| `bubu-navy-light` | `#1E3A5F` | Variação de navy |
| `bubu-yellow` | `#F59E0B` | Status pendente, alertas, avisos |
| `bubu-yellow-light` | `#FEF3C7` | Fundos de alerta |

### 6.2 Tipografia

- **Família:** Inter (Google Fonts)
- **Fallback:** system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif

### 6.3 Variantes de Componentes CSS

- 6 variantes de botão: `btn-primary`, `btn-danger`, `btn-ghost`, `btn-turquoise`, `btn-paid`, `btn-unpaid`
- Componente `card` com borda e padding padronizados
- `input-field` para campos de formulário
- Badges: `badge-paid` (verde), `badge-pending` (amarelo), `badge-overdue` (vermelho)
- Utilitários de safe-area: `safe-top`, `safe-bottom`

### 6.4 Tom de Voz (UI Copy)

- **Idioma:** Português brasileiro
- **Registro:** Informal, coloquial, acolhedor
- **Exemplos:** "Manda esse código pra quem divide as contas com você", "Tudo pago esse mês. Pode respirar.", "Não rolou. Tenta de novo?"

---

## 7. Modos de Operação

### 7.1 Modo Demo (atual)

- Nenhuma configuração necessária
- Dados salvos apenas em `localStorage`
- Usuário demo fixo: **Breno**
- Casa demo fixa com código `BUBU123`
- 8 contas de exemplo, 2 meses de histórico pré-preenchidos
- Qualquer e-mail/senha funciona no login

### 7.2 Modo Produção (planejado)

- Requer `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Auth real via Supabase (e-mail/senha + Google OAuth)
- Dados sincronizados via PostgreSQL + RLS
- Convites reais com códigos gerados por função PL/pgSQL
- Multi-dispositivo com Supabase Realtime

---

## 8. Sequência de Ativação (Onboarding)

1. Usuário abre o app → tela de login
2. Cria conta (nome + e-mail + senha) ou faz login
3. Ao criar conta, automaticamente uma nova "casa" é gerada com código de convite
4. Usuário é direcionado ao Dashboard vazio com CTA "Adicionar conta"
5. Usuário compartilha código de convite com parceiro(a)
6. Parceiro(a) faz login/cria conta e insere o código na aba "Casa" para ingressar
7. Ambos passam a ver e gerenciar as mesmas contas

---

## 9. Métricas de Sucesso

| Métrica | Alvo | Como medir |
|---|---|---|
| Usuários ativos (DAU) | 100 (mês 1 pós-lançamento) | Supabase Analytics |
| Casas criadas | 30 (mês 1) | Contagem na tabela `houses` |
| Contas cadastradas por casa | ≥ 5 (mediana) | Agregação em `bills` |
| Taxa de retenção D7 | ≥ 40% | Usuários que voltam em 7 dias |
| Tempo até primeira conta | < 60s | Evento de analytics |
| Taxa de convite aceito | ≥ 60% | Convites usados / convites gerados |
| NPS (qualitativo) | ≥ 50 | Pesquisa in-app após 14 dias |

---

## 10. Requisitos Não-Funcionais

| Categoria | Requisito |
|---|---|
| Performance | Lighthouse Score ≥ 90 (Performance, PWA) |
| Performance | First Contentful Paint < 1.5s |
| Performance | Time to Interactive < 3s |
| Offline | Funcionalidade básica (consulta, marcação de pago) disponível offline com sync ao reconectar |
| Offline | Indicador visual claro de estado offline/online |
| Segurança | Row-Level Security em todas as tabelas (já definido no schema SQL) |
| Segurança | Senhas gerenciadas exclusivamente pelo Supabase Auth (nunca armazenadas no cliente) |
| Acessibilidade | Contraste WCAG AA em ambos os temas (claro/escuro) |
| Acessibilidade | Área de toque mínima de 44px (mobile) |
| Compatibilidade | iOS Safari 15+, Chrome Android 90+ |
| Compatibilidade | PWA instalável em iOS e Android |
| Dados | Backup automático via PostgreSQL (Supabase) |
| Localização | Interface 100% em português brasileiro (pt-BR) |
| Localização | Valores monetários formatados em R$ (BRL) |

---

## 11. Roadmap

### Fase 1 — MVP com Supabase (Estimativa: 2-3 semanas)
- [x] Schema SQL definido e testável
- [ ] Configurar projeto Supabase (URL + anon key)
- [ ] Substituir `DemoStore` por chamadas reais ao Supabase
- [ ] Implementar auth real (e-mail/senha)
- [ ] Testar RLS com múltiplos usuários
- [ ] Login com Google OAuth

### Fase 2 — Beta Fechado (Estimativa: 2 semanas)
- [ ] Recorrência automática de contas mensais
- [ ] Sincronização em tempo real (Supabase Realtime)
- [ ] Testes com 5-10 casas reais
- [ ] Deploy em produção (Vercel/Netlify)

### Fase 3 — Lançamento Público (Estimativa: 4 semanas)
- [ ] Notificações push
- [ ] Rateio de contas
- [ ] Onboarding refinado com feedback dos beta testers
- [ ] Landing page
- [ ] Submissão às lojas (Play Store via TWA, App Store via PWA)

### Fase 4 — Crescimento (Estimativa: contínuo)
- [ ] Dashboard financeiro com gráficos
- [ ] Exportação PDF/CSV
- [ ] Múltiplas casas por usuário
- [ ] Comentários em contas
- [ ] Upload de comprovantes

---

## 12. Apêndice — Schema SQL

O schema completo está em `supabase-schema.sql` e inclui:

- **4 tabelas:** `houses`, `profiles`, `bills`, `bill_status`
- **10 políticas RLS** garantindo isolamento por casa
- **Índices** para performance (invite_code único, chaves estrangeiras)
- **Constraints** de integridade (`CHECK` para vencimento 1-31, tipo mensal/anual/parcelada, UNIQUE para bill_id + mes_referencia)
- **Função PL/pgSQL** `generate_invite_code()` para códigos de 7 caracteres

---

## 13. Glossário

| Termo | Definição |
|---|---|
| Casa | Unidade de agrupamento. Representa um grupo de pessoas que dividem contas (ex: um casal, uma república). |
| Conta | Uma despesa recorrente ou pontual (ex: Aluguel, Luz, Internet). |
| Status | Estado de uma conta em um mês específico: pago, pendente (não venceu), atrasado (venceu e não foi pago). |
| Transferir | Mover uma conta não paga para o mês seguinte, evitando que ela "suje" o mês atual. |
| Código de convite | Código alfanumérico de 7 caracteres que identifica unicamente uma casa e permite que novos membros ingressem. |
