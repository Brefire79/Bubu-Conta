# Bubu — Instruções para Assistentes AI

## Resumo

Bubu é um PWA mobile-first em React/TypeScript para casais controlarem contas da casa compartilhadas. Interface em pt-BR, tom coloquial.

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 18 + TypeScript 5 (strict) |
| Roteamento | React Router DOM v6 |
| Build | Vite 5 (`@/` → `src/`) |
| CSS | Tailwind 3.4 (dark mode: `class`) |
| PWA | vite-plugin-pwa + Workbox (NetworkFirst) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Demo | localStorage via `DemoStore` (src/lib/store-demo.ts) |

## Comandos

```bash
npm run dev        # dev server (http://localhost:5173)
npm run build      # tsc + vite build
npm run lint       # tsc --noEmit (type check)
npm run preview    # servir build de produção
```

## Modos da Aplicação

- **Modo Demo (padrão):** Sem env vars → `supabase.ts` retorna `supabase = null`, `USE_DEMO = true`. Tudo roda via `DemoStore` com `localStorage`.
- **Modo Produção:** Definir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env` ativa o cliente Supabase real. O schema SQL está em `supabase-schema.sql`.
- As páginas nunca acessam os stores diretamente: usam a fachada assíncrona `api` (src/lib/api.ts), que delega para `DemoStore` ou `supabaseStore` (src/lib/store-supabase.ts).

## Convenções

- Nomes de variáveis/componentes em português quando são conceitos do domínio (`conta`, `casa`, `marcarPago`, `transferir`).
- Strings de UI centralizadas em `src/copy.ts` — nunca hardcode strings nos componentes.
- Tipos em `src/types/index.ts`. O tipo `BillWithStatus` combina `Bill` + status computado do mês.
- `DemoStore` é singleton exportado como `store`.
- Componentes: cada aba é um arquivo em `src/pages/` (`Home`, `Contas`, `Relatorios`, `Config`), componentes compartilhados em `src/components/`.
- Design system: tema escuro navy/dourado do `GUIA-VISUAL` (docs/design). Tokens no `tailwind.config.js` (`bubu-base`, `bubu-card`, `bubu-gold`, `bubu-danger`, `bubu-success`, `bubu-info`, `bubu-divider`). Classes custom em `src/index.css` — `btn-primary`, `btn-danger`, `btn-success`, `card`, `card-month`, `bill-card*`, `input-field`, `pill-*`, `eyebrow`, animações.
- Helpers de data/moeda em `src/lib/dates.ts`.
- Proibido adicionar comentários em código exceto quando explicitamente solicitado.
- NUNCA commitar secrets. O `.gitignore` cobre `.env`, `dist` e `node_modules`.

## Requisitos de Ambiente

- `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para modo produção
- Fonte Inter carregada via Google Fonts no `index.html`
- Node >= 18

## Dados de Demo

Chave `bubu-demo` no localStorage. Se vazia, `DemoStore.seed()` popula 8 contas com 2 meses de status.

## Observações Importantes

- Início: ⚠️ Não adicionar comentários em código.
- Ao editar código, usar a ferramenta Edit (com oldString/newString), não Write.
- Sempre verificar tipagem com `npm run lint` após alterações.
- O schema SQL em `supabase-schema.sql` é a fonte da verdade para o modelo de dados.
- PRD completo em `PRD.md`.
