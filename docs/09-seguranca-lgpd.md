# 09 — Segurança e LGPD

## Dados sensíveis no contexto do app
O app pode armazenar:
- nome;
- e-mail;
- hábitos de consumo;
- comprovantes;
- valores pagos;
- endereço indiretamente em boletos/comprovantes.

## Princípios
- Coletar somente o necessário.
- Guardar comprovantes com controle de acesso.
- Usar RLS no Supabase.
- Permitir exclusão de dados.
- Não expor comprovantes em links públicos permanentes.
- Registrar ações importantes.

## Regras técnicas
- Supabase Auth obrigatório.
- RLS habilitado em todas as tabelas.
- Storage com bucket privado.
- URLs assinadas temporárias para comprovantes.
- Logs de alteração.
- Validação no backend quando possível.

## Documentos futuros
- Termos de uso.
- Política de privacidade.
- Política de retenção de comprovantes.
- Registro de consentimento para notificações e WhatsApp.
