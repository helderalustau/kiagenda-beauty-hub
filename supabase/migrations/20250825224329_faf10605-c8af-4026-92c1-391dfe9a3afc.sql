-- Corrigir emails duplicados antes de aplicar constraints únicas

-- Primeiro, identificar e remover duplicatas de email na tabela client_auth
-- Manter apenas o registro mais recente para cada email duplicado
WITH duplicates AS (
  SELECT id, email, 
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM public.client_auth 
  WHERE email IS NOT NULL AND email != ''
)
DELETE FROM public.client_auth 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Agora aplicar as constraints únicas para emails não nulos
ALTER TABLE public.client_auth 
ADD CONSTRAINT unique_client_email UNIQUE (email) DEFERRABLE INITIALLY DEFERRED;

-- Para admin_auth (pode não ter duplicatas, mas vamos ser cautelosos)
-- Verificar e limpar duplicatas se existirem
WITH admin_duplicates AS (
  SELECT id, email, 
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM public.admin_auth 
  WHERE email IS NOT NULL AND email != ''
)
DELETE FROM public.admin_auth 
WHERE id IN (
  SELECT id FROM admin_duplicates WHERE rn > 1
);

-- Aplicar constraint única para admin_auth
ALTER TABLE public.admin_auth 
ADD CONSTRAINT unique_admin_email UNIQUE (email) DEFERRABLE INITIALLY DEFERRED;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_admin_auth_email ON public.admin_auth(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_auth_email ON public.client_auth(email) WHERE email IS NOT NULL;