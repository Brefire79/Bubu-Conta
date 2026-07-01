# 06 — Fluxos do App

## Fluxo 1 — Primeiro acesso
1. Usuário faz login.
2. Cria família/casa.
3. Cadastra contas fixas.
4. App gera mês atual.
5. Dashboard exibe resumo.

## Fluxo 2 — Marcar conta como paga
1. Usuário toca no card vermelho.
2. Tela de detalhe abre.
3. Usuário toca em `Marcar como pago`.
4. App pergunta se deseja anexar comprovante.
5. Card muda para verde.
6. Registro entra no histórico.

## Fluxo 3 — Enviar comprovante
1. Usuário abre detalhe da conta.
2. Toca em `Enviar comprovante`.
3. Seleciona foto/PDF ou usa câmera.
4. Arquivo sobe para Supabase Storage.
5. Registro é salvo em `receipts`.
6. Futuramente IA extrai valor, data e banco.

## Fluxo 4 — Navegar meses
1. Usuário toca seta esquerda/direita.
2. App carrega contas do mês selecionado.
3. Se mês ainda não existe, app pode gerar a partir das contas recorrentes.

## Fluxo 5 — Relatório mensal
1. Usuário toca em Relatórios.
2. Escolhe mês.
3. App mostra total pago, pendente, atrasado e categorias.
4. Futuramente pode exportar PDF.
