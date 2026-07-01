# 05 — Modelo de Dados Supabase

> Observação: o banco Supabase já existe. O agente deve adaptar esta proposta ao schema real informado pelo usuário.

## Tabelas sugeridas

### profiles
- id uuid PK auth.users.id
- nome text
- email text
- avatar_url text
- created_at timestamp

### families
- id uuid PK
- nome text
- owner_id uuid FK profiles.id
- created_at timestamp

### family_members
- id uuid PK
- family_id uuid FK families.id
- user_id uuid FK profiles.id
- role text: owner/admin/member
- created_at timestamp

### bills
Conta recorrente base.

- id uuid PK
- family_id uuid FK families.id
- name text
- category text
- icon text
- default_amount numeric
- due_day integer
- is_recurring boolean
- active boolean
- created_at timestamp

### monthly_bills
Conta gerada para um mês específico.

- id uuid PK
- bill_id uuid FK bills.id
- family_id uuid FK families.id
- reference_month date
- name text
- amount numeric
- due_date date
- status text: pending/paid/late
- paid_at timestamp
- paid_by uuid FK profiles.id
- created_at timestamp

### receipts
Comprovantes.

- id uuid PK
- monthly_bill_id uuid FK monthly_bills.id
- family_id uuid FK families.id
- uploaded_by uuid FK profiles.id
- file_url text
- file_path text
- file_type text
- ocr_text text
- extracted_amount numeric
- extracted_date date
- confidence numeric
- created_at timestamp

### activity_logs
Histórico de ações.

- id uuid PK
- family_id uuid FK families.id
- user_id uuid FK profiles.id
- action text
- entity_type text
- entity_id uuid
- metadata jsonb
- created_at timestamp

## Políticas RLS
- Usuário só acessa dados da família em que é membro.
- Comprovantes só podem ser lidos por membros da família.
- Apenas owner/admin pode excluir conta recorrente.
- Qualquer membro pode marcar pagamento, mas ação deve ser registrada em `activity_logs`.
