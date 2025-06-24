
-- Primeiro, vamos verificar e corrigir a estrutura da tabela appointments
-- Se a coluna client_auth_id já existe, vamos trabalhar com ela

-- Remover a tabela clients já que vamos usar apenas client_auth
DROP TABLE IF EXISTS public.clients CASCADE;

-- Modificar a tabela client_auth para incluir todas as informações necessárias
ALTER TABLE public.client_auth 
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS zip_code TEXT,
  ADD COLUMN IF NOT EXISTS house_number TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS street_address TEXT;

-- Atualizar a estrutura para usar username como campo único
-- Mover dados existentes do campo 'name' para 'username' se necessário
UPDATE public.client_auth 
SET username = name 
WHERE username IS NULL;

-- Tornar o username obrigatório e único
ALTER TABLE public.client_auth 
  ALTER COLUMN username SET NOT NULL;

-- Adicionar constraint único para username se não existir
DO $$ 
BEGIN
    ALTER TABLE public.client_auth ADD CONSTRAINT unique_username UNIQUE (username);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- A constraint já existe, ignorar
END $$;

-- Remover a constraint única do campo name se existir
ALTER TABLE public.client_auth 
  DROP CONSTRAINT IF EXISTS client_auth_name_key;

-- Verificar se a coluna client_id ainda existe e renomeá-la se necessário
DO $$
BEGIN
    -- Se client_id existir e client_auth_id não existir, renomear
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'client_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'client_auth_id') THEN
        ALTER TABLE public.appointments RENAME COLUMN client_id TO client_auth_id;
    END IF;
    
    -- Se ambas existirem, remover client_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'client_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'client_auth_id') THEN
        ALTER TABLE public.appointments DROP COLUMN client_id;
    END IF;
END $$;

-- Remover constraints foreign key antigas se existirem
ALTER TABLE public.appointments 
  DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;

-- Adicionar a nova foreign key constraint se não existir
DO $$
BEGIN
    ALTER TABLE public.appointments 
      ADD CONSTRAINT appointments_client_auth_id_fkey 
      FOREIGN KEY (client_auth_id) REFERENCES public.client_auth(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- A constraint já existe, ignorar
END $$;

-- Atualizar os comentários da tabela
COMMENT ON TABLE public.client_auth IS 'Tabela unificada para autenticação e dados dos clientes';
COMMENT ON COLUMN public.client_auth.username IS 'Nome de usuário único para login';
COMMENT ON COLUMN public.client_auth.full_name IS 'Nome completo do cliente';
