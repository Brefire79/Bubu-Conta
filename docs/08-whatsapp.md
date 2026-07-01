# 08 — WhatsApp

## Estratégia recomendada
No MVP, não depender de integração automática com WhatsApp.

## Motivo
Integração oficial com WhatsApp exige Business Platform, opt-in, templates, regras de envio e backend público. Evitar automações não oficiais.

## Caminho MVP
- Botão `Compartilhar no WhatsApp` usando share nativo do celular.
- Mensagem gerada pelo app:

```text
✅ Conta paga
Conta: Luz
Valor: R$ 380,00
Mês: Julho/2025
Comprovante anexado no APP Bubu.
```

## Caminho futuro
- WhatsApp Business Cloud API.
- Templates aprovados.
- Grupo familiar ou mensagem individual.
- Envio apenas de resumo + link seguro, não do comprovante inteiro.

## Princípio
O WhatsApp deve ser canal de aviso, não cofre oficial de comprovantes.
