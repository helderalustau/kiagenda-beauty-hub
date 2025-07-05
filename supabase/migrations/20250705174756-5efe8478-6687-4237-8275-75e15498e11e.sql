
-- Adicionar colunas de cidade e estado se não existirem
ALTER TABLE public.client_auth 
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT;

-- Garantir que a coluna username seja única e não nula
DO $$ 
BEGIN
    -- Verificar se a constraint única já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_auth_username_key' 
        AND table_name = 'client_auth'
    ) THEN
        ALTER TABLE public.client_auth ADD CONSTRAINT client_auth_username_key UNIQUE (username);
    END IF;
END $$;

-- Atualizar dados existentes onde username está vazio
UPDATE public.client_auth 
SET username = name 
WHERE username IS NULL OR username = '';

-- Garantir que username seja obrigatório
ALTER TABLE public.client_auth 
  ALTER COLUMN username SET NOT NULL;

-- Comentários para documentar as colunas
COMMENT ON COLUMN public.client_auth.username IS 'Nome de usuário único para login';
COMMENT ON COLUMN public.client_auth.name IS 'Nome de usuário (compatibilidade)';
COMMENT ON COLUMN public.client_auth.full_name IS 'Nome completo do cliente';
COMMENT ON COLUMN public.client_auth.city IS 'Cidade do cliente';
COMMENT ON COLUMN public.client_auth.state IS 'Estado do cliente';
COMMENT ON COLUMN public.client_auth.phone IS 'Telefone do cliente (apenas dígitos)';
COMMENT ON COLUMN public.client_auth.email IS 'Email do cliente';
COMMENT ON COLUMN public.client_auth.address IS 'Endereço completo do cliente';
COMMENT ON COLUMN public.client_auth.street_address IS 'Endereço da rua';
COMMENT ON COLUMN public.client_auth.house_number IS 'Número da casa';
COMMENT ON COLUMN public.client_auth.neighborhood IS 'Bairro';
COMMENT ON COLUMN public.client_auth.zip_code IS 'CEP';
