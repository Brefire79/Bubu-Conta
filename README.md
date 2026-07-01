# Bubu

PWA mobile-first para casais controlarem as contas da casa. Tema escuro navy com dourado, cards vermelho (a pagar) e verde (pago), interface em pt-BR.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
```

Sem `.env`, o app roda em **modo demo** (dados de exemplo no localStorage — qualquer e-mail/senha entra).

## Conectando ao Supabase

1. Crie um `.env` a partir do `.env.example`:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publishable
```

2. No painel do Supabase, abra o **SQL Editor** e execute o conteúdo de [`supabase-schema.sql`](supabase-schema.sql). Ele cria as tabelas (`houses`, `profiles`, `bills`, `bill_status`, `receipts`), as políticas RLS, o bucket privado `comprovantes` e as funções `generate_invite_code` / `join_house`. Pode rodar mais de uma vez sem quebrar.

3. Em **Authentication → Providers**, deixe Email habilitado. Com confirmação de e-mail ativa, o app avisa o usuário para confirmar antes de entrar.

Com o `.env` presente, login/cadastro usam o Supabase Auth, as contas ficam no Postgres compartilhadas pela casa (código de convite em Configurações) e os comprovantes sobem para o Storage.

## Funcionalidades

- Dashboard mensal com navegação entre meses e resumo (a pagar / pagos / total)
- Cadastro de contas recorrentes (mensal, anual, parcelada) com categorias
- Marcar como pago, desfazer e transferir atrasadas para o próximo mês
- Upload de comprovantes (modo Supabase)
- Relatórios por mês e por categoria
- Casa compartilhada: convide o parceiro pelo código
- PWA instalável, funciona offline (dados demo) e mobile-first

## Comandos

```bash
npm run dev        # dev server
npm run build      # tsc + vite build
npm run lint       # type check
npm run preview    # servir build de produção
```

## Documentação

O PRD, fluxos, modelo de dados e backlog estão em [`docs/`](docs). O guia visual oficial da Home (aprovado em 01/07/2026) está em [`docs/design/GUIA-VISUAL-Tela-Home.md`](docs/design/GUIA-VISUAL-Tela-Home.md).
