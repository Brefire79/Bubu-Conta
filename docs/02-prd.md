# 02 — PRD: APP Bubu

## Objetivo
Criar um PWA responsivo para registrar, acompanhar e comprovar pagamentos mensais familiares.

## Objetivos de negócio
- Reduzir esquecimento de contas.
- Facilitar controle compartilhado entre casal/família.
- Guardar comprovantes por mês e por conta.
- Permitir evolução futura para IA, WhatsApp e relatórios.

## Objetivos do usuário
- Ver rapidamente o mês atual.
- Saber quanto falta pagar.
- Marcar uma conta como paga.
- Anexar comprovante.
- Consultar histórico.
- Navegar entre meses.

## Funcionalidades principais

### 1. Dashboard mensal
- Mês referência em destaque.
- Navegação mês anterior/próximo.
- Total a pagar.
- Total pago.
- Total geral do mês.
- Lista de contas com status.

### 2. Cards de contas
Cada card deve exibir:
- ícone;
- nome da conta;
- vencimento;
- valor;
- status: `A PAGAR`, `PAGO`, `ATRASADO`;
- seta de detalhes.

### 3. Interação rápida
- Clique no card abre detalhe.
- Botão para marcar como pago.
- Upload/câmera para comprovante.
- Se comprovante for enviado, IA pode sugerir valor/data.

### 4. Histórico
- Consultar meses anteriores.
- Ver comprovantes por conta.
- Ver evolução de gastos.

### 5. Compartilhamento familiar
- Usuário pode convidar esposa/familiar.
- Ambos acessam a mesma família/casa.
- Toda ação gera registro de auditoria.

## Requisitos não funcionais
- PWA instalável.
- Mobile-first.
- Design escuro com cards coloridos.
- Funcionamento rápido.
- Código limpo e modular.
- Integração com Supabase.
- Preparado para IA e WhatsApp.
