-- Execute este SQL no Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)

-- 1. Criar a tabela de progresso
CREATE TABLE progresso (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,        -- ex: "2026-02-26"
  slot_key TEXT NOT NULL,        -- "acordar", "almoco", "dormir"
  checked BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date_key, slot_key)
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE progresso ENABLE ROW LEVEL SECURITY;

-- 3. Política: cada usuário só vê seus próprios dados
CREATE POLICY "Usuários podem ver seus dados"
  ON progresso FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Política: cada usuário só pode inserir seus próprios dados
CREATE POLICY "Usuários podem inserir seus dados"
  ON progresso FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Política: cada usuário só pode atualizar seus próprios dados
CREATE POLICY "Usuários podem atualizar seus dados"
  ON progresso FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Criar índice para performance
CREATE INDEX idx_progresso_user_id ON progresso(user_id);
CREATE INDEX idx_progresso_user_date ON progresso(user_id, date_key);
