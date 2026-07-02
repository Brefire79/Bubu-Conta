-- Schema para o Bubu no Supabase
-- Execute no SQL Editor do seu projeto Supabase (idempotente: pode rodar mais de uma vez)

-- 1. Tabelas

CREATE TABLE IF NOT EXISTS houses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE houses ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  house_id UUID REFERENCES houses,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID REFERENCES houses NOT NULL,
  nome TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'outros',
  vencimento INTEGER NOT NULL CHECK (vencimento >= 1 AND vencimento <= 31),
  tipo TEXT NOT NULL CHECK (tipo IN ('mensal', 'anual', 'parcelada')),
  parcelas INTEGER,
  parcela_atual INTEGER,
  created_by UUID REFERENCES profiles NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bill_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES bills NOT NULL,
  mes_referencia TEXT NOT NULL,
  pago BOOLEAN DEFAULT false,
  pago_por UUID REFERENCES profiles,
  pago_em TIMESTAMPTZ,
  transferida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bill_id, mes_referencia)
);

CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES bills NOT NULL,
  mes_referencia TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Função auxiliar (SECURITY DEFINER evita recursão nas policies de profiles)

CREATE OR REPLACE FUNCTION my_house_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT house_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql;

-- 3. RLS: houses

ALTER TABLE houses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário autenticado pode criar casa" ON houses;
CREATE POLICY "Usuário autenticado pode criar casa"
  ON houses FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Membros podem ver a própria casa" ON houses;
CREATE POLICY "Membros podem ver a própria casa"
  ON houses FOR SELECT
  USING (id = my_house_id() OR my_house_id() IS NULL);

-- 4. RLS: profiles

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros da casa podem ver perfis da mesma casa" ON profiles;
CREATE POLICY "Membros da casa podem ver perfis da mesma casa"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR house_id = my_house_id());

DROP POLICY IF EXISTS "Usuário pode criar seu próprio perfil" ON profiles;
CREATE POLICY "Usuário pode criar seu próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Usuário pode atualizar o próprio perfil" ON profiles;
CREATE POLICY "Usuário pode atualizar o próprio perfil"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- 5. RLS: bills

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros da casa podem ver contas" ON bills;
CREATE POLICY "Membros da casa podem ver contas"
  ON bills FOR SELECT
  USING (house_id = my_house_id());

DROP POLICY IF EXISTS "Membros da casa podem criar contas" ON bills;
CREATE POLICY "Membros da casa podem criar contas"
  ON bills FOR INSERT
  WITH CHECK (house_id = my_house_id());

DROP POLICY IF EXISTS "Membros da casa podem atualizar contas" ON bills;
CREATE POLICY "Membros da casa podem atualizar contas"
  ON bills FOR UPDATE
  USING (house_id = my_house_id());

-- 6. RLS: bill_status

ALTER TABLE bill_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros podem ver status" ON bill_status;
CREATE POLICY "Membros podem ver status"
  ON bill_status FOR SELECT
  USING (bill_id IN (SELECT id FROM bills WHERE house_id = my_house_id()));

DROP POLICY IF EXISTS "Membros podem inserir status" ON bill_status;
CREATE POLICY "Membros podem inserir status"
  ON bill_status FOR INSERT
  WITH CHECK (bill_id IN (SELECT id FROM bills WHERE house_id = my_house_id()));

DROP POLICY IF EXISTS "Membros podem atualizar status" ON bill_status;
CREATE POLICY "Membros podem atualizar status"
  ON bill_status FOR UPDATE
  USING (bill_id IN (SELECT id FROM bills WHERE house_id = my_house_id()));

-- 7. RLS: receipts

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros podem ver comprovantes" ON receipts;
CREATE POLICY "Membros podem ver comprovantes"
  ON receipts FOR SELECT
  USING (bill_id IN (SELECT id FROM bills WHERE house_id = my_house_id()));

DROP POLICY IF EXISTS "Membros podem inserir comprovantes" ON receipts;
CREATE POLICY "Membros podem inserir comprovantes"
  ON receipts FOR INSERT
  WITH CHECK (bill_id IN (SELECT id FROM bills WHERE house_id = my_house_id()));

-- 8. Storage bucket para comprovantes (privado)

INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes', 'comprovantes', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Membros sobem comprovantes da casa" ON storage.objects;
CREATE POLICY "Membros sobem comprovantes da casa"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'comprovantes'
    AND (storage.foldername(name))[1] = my_house_id()::text
  );

DROP POLICY IF EXISTS "Membros leem comprovantes da casa" ON storage.objects;
CREATE POLICY "Membros leem comprovantes da casa"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'comprovantes'
    AND (storage.foldername(name))[1] = my_house_id()::text
  );

-- 9. Backfill de dono para casas antigas (primeiro membro vira dono)

UPDATE houses
SET owner_id = (
  SELECT p.id FROM profiles p
  WHERE p.house_id = houses.id
  ORDER BY p.created_at
  LIMIT 1
)
WHERE owner_id IS NULL;

-- 10. Função para gerar código de convite único

CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..7 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 11. Função para entrar numa casa via código de convite

CREATE OR REPLACE FUNCTION join_house(code TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_house UUID;
BEGIN
  SELECT id INTO target_house FROM houses WHERE invite_code = code;
  IF target_house IS NULL THEN
    RAISE EXCEPTION 'Código de convite inválido';
  END IF;
  UPDATE profiles SET house_id = target_house WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- 12. Função para o dono da casa remover um participante
-- O removido ganha uma casa nova própria para continuar usando o app

CREATE OR REPLACE FUNCTION remove_member(member_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_house UUID;
  new_house UUID;
BEGIN
  SELECT house_id INTO my_house FROM profiles WHERE id = auth.uid();
  IF my_house IS NULL THEN
    RAISE EXCEPTION 'Usuário sem casa';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM houses WHERE id = my_house AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o dono da casa pode remover participantes';
  END IF;
  IF member_id = auth.uid() THEN
    RAISE EXCEPTION 'O dono não pode remover a si mesmo';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = member_id AND house_id = my_house) THEN
    RAISE EXCEPTION 'Participante não está na casa';
  END IF;
  INSERT INTO houses (invite_code, owner_id)
  VALUES (generate_invite_code(), member_id)
  RETURNING id INTO new_house;
  UPDATE profiles SET house_id = new_house WHERE id = member_id;
END;
$$ LANGUAGE plpgsql;
