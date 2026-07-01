# Guia Visual — Tela Home (pós-login) — App Bubu

**Status:** referência oficial de UI, aprovada por Breno em 01/07/2026
**Fonte:** mockup anexado (print de referência)
**Onde entra no PRD:** Seção 6 (Design/UX) do PRD-ContasDoCasal.md — este documento substitui/complementa a especificação visual da Home

---

## 1. Estrutura da tela (de cima pra baixo)

1. **Header fixo**
2. **Card "Mês Referência"** (seletor de mês + resumo do mês)
3. **Lista de contas do mês** (cards individuais)
4. **Rodapé de navegação fixo** (bottom nav)

---

## 2. Header

| Elemento | Especificação |
|---|---|
| Fundo | Navy escuro `#0A0E1F` (mesmo tom do body) |
| Ícone esquerdo | Hambúrguer (☰), branco, abre menu lateral |
| Título central | `APP Bubu` — branco, bold, ~22px |
| Ícone direito | Sino de notificação, branco, com badge circular vermelho `#E5484D` mostrando contagem (ex: `2`) |

**Copy:** `copy.home.headerTitle = "Bubu"` (o "APP" é decoração de marca, não repetir em outras telas)

---

## 3. Card "Mês Referência"

Container com borda dourada `#D4A017` / `#E8B923` (1px, cantos arredondados 16px), fundo navy ligeiramente mais claro que o body `#0D1226`.

**Bloco 1 — Seletor de mês**
- Label pequena centralizada, cinza-claro uppercase: `MÊS REFERÊNCIA`
- Valor grande, dourado, bold, uppercase: `JULHO 2025`
- Setas `‹` `›` em círculos com borda sutil, uma de cada lado — navegam mês anterior/próximo
- Linha divisória fina abaixo, cor `#1E2540`

**Bloco 2 — Resumo do mês** (3 colunas, separadas por linhas verticais finas)

| Coluna | Ícone (círculo colorido) | Label | Valor |
|---|---|---|---|
| 1 | Vermelho `#E5484D`, ícone de nota/documento | `TOTAL A PAGAR` | Vermelho, bold — soma de tudo com status "a pagar" |
| 2 | Verde `#30A46C`, ícone de check | `PAGOS` | Verde, bold — soma de tudo com status "pago" |
| 3 | Azul `#3B82F6`, ícone de `$` | `TOTAL` | Branco, bold — soma geral do mês (pago + a pagar) |

**Copy keys:**
```js
home: {
  mesReferenciaLabel: "MÊS REFERÊNCIA",
  totalAPagar: "TOTAL A PAGAR",
  pagos: "PAGOS",
  total: "TOTAL",
}
```

---

## 4. Cards de conta (lista)

Cada conta é um card retangular, cantos arredondados (~14px), com **borda e fundo na cor do status**:

- **A pagar:** borda vermelha `#E5484D`, fundo gradiente vermelho escuro translúcido sobre o navy
- **Pago:** borda verde `#30A46C`, fundo gradiente verde escuro translúcido sobre o navy

**Anatomia do card (esquerda → direita):**

1. **Ícone circular de categoria** (cor = cor do status), 44px:
   - Casa 🏠 → aluguel/condomínio/moradia (ex: "MGK")
   - Lâmpada/energia 💡 → luz
   - Gota d'água 💧 → água
   - Wi-fi 📶 → internet
   - Cartão 💳 → juros/cartão de crédito
   - Capelo 🎓 → educação (ex: "INT & GT")
2. **Bloco de texto (centro-esquerda):**
   - Nome da conta — branco, bold, ~18px (ex: `MGK`, `LUZ`, `ÁGUA`)
   - `Vence: DD/MM/AAAA` — cor do status, ~13px
3. **Bloco de valor (direita):**
   - Valor `R$ X.XXX,00` — cor do status, bold, ~20px
   - Pill de status abaixo: `A PAGAR` (fundo vermelho sólido, texto branco) ou `PAGO` (fundo verde sólido, texto branco), cantos bem arredondados (pill)
4. **Chevron `›`** — cinza, indica que o card é clicável (abre detalhe/edição)

**Regra de negócio confirmada pela imagem:** contas parceladas devem mostrar o número da parcela dentro do mesmo padrão de nome (ex: card poderia exibir `INT & GT` como nome composto — mas quando for parcelamento real, usar o padrão já definido no PRD: `"{nome} — Parcela {atual} de {total}"`).

**Copy keys (já existentes em copy.js, confirmar que cobrem):**
```js
billCard: {
  vence: "Vence: {data}",
  statusAPagar: "A PAGAR",
  statusPago: "PAGO",
}
```

---

## 5. Rodapé (bottom nav) — "pés"

Fixo na parte inferior, fundo navy `#0A0E1F`, borda superior sutil `#1E2540`.

4 itens, distribuídos igualmente, cada um com ícone (24px) + label (11px, uppercase):

| Ícone | Label | Rota | Estado ativo |
|---|---|---|---|
| 🏠 Home | `INÍCIO` | `/home` | **Ativo nesta tela** — ícone e texto dourados `#E8B923`, barrinha indicadora dourada acima do ícone |
| 📋 Lista | `CONTAS` | `/contas` | Inativo — cinza `#6B7280` |
| 📈 Gráfico | `RELATÓRIOS` | `/relatorios` | Inativo — cinza `#6B7280` |
| ⚙️ Engrenagem | `CONFIGURAÇÕES` | `/config` | Inativo — cinza `#6B7280` |

**Copy keys:**
```js
nav: {
  inicio: "Início",
  contas: "Contas",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
}
```

Componente pronto pra colar: ver `rodape.js` (anexado junto com este guia).

---

## 6. Paleta de cores (tokens)

```css
--bg-base: #0A0E1F;
--bg-card: #0D1226;
--border-gold: #E8B923;
--text-primary: #FFFFFF;
--text-secondary: #9CA3AF;
--text-muted: #6B7280;
--status-danger: #E5484D;
--status-danger-bg: rgba(229, 72, 77, 0.12);
--status-success: #30A46C;
--status-success-bg: rgba(48, 164, 108, 0.12);
--status-info: #3B82F6;
--divider: #1E2540;
```

---

## 7. Próximos passos

1. Confirmar se os ícones de categoria (casa, luz, água, wifi, cartão, educação) vêm de um set fixo (ex: `lucide-react` no protótipo, ou SVGs próprios no Vanilla JS de produção) ou se cada conta tem categoria livre com ícone escolhido pelo usuário.
2. Confirmar `copy.js` atualizado com as chaves novas de `home` e `nav` acima (posso gerar o `copy.js` completo mesclado se você mandar o arquivo atual).
3. Aplicar esta paleta como tokens CSS (`:root`) no projeto para reuso em todas as telas — hoje só a Home tem essa referência visual fechada; Contas/Relatórios/Configurações ainda não têm mockup.
