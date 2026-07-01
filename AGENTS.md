# Bubu — Agents

## Agent: frontend-dev
**Propósito:** Implementar funcionalidades de UI, componentes React, páginas e estilos.
**Regras:**
- Sempre consultar `src/copy.ts` para strings de UI — nunca hardcodar.
- Adicionar tipos novos em `src/types/index.ts`.
- Seguir classes do design system em `src/index.css`.
- Usar `src/lib/store-demo.ts` para acesso a dados (modo demo) ou `src/lib/supabase.ts` (produção).
- Testar visualmente com `npm run dev`.
- Após implementar, rodar `npm run lint` para checagem de tipos.

## Agent: supabase-dev
**Propósito:** Trabalhar com schema SQL, RLS, migrações e integração Supabase.
**Regras:**
- O schema canônico está em `supabase-schema.sql`.
- Env vars esperadas: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (prefixo VITE_).
- A factory do cliente está em `src/lib/supabase.ts` (retorna `null` se env vars ausentes).
- RLS está definido para todas as 4 tabelas (houses, profiles, bills, bill_status).
- Função PL/pgSQL `generate_invite_code()` gera códigos de 7 chars.

## Agent: pwa-dev
**Propósito:** Configuração de PWA, service worker, caching e manifest.
**Regras:**
- Configuração em `vite.config.ts` (plugin `VitePWA`).
- Manifest em `public/manifest.webmanifest`.
- Ícones em `public/icons/` (SVG 192 e 512).
- Estratégia de cache: NetworkFirst com fallback em `bubu-api-cache`.
- Sempre testar PWA com `npm run build && npm run preview`.
