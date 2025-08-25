-- Migração para suporte a reset de senhas por email

-- Garantir que a tabela admin_auth tenha email único e não nulo para admins que querem usar reset
ALTER TABLE public.admin_auth 
ADD CONSTRAINT unique_admin_email UNIQUE (email);

-- Garantir que a tabela client_auth tenha email único quando não for nulo
ALTER TABLE public.client_auth 
ADD CONSTRAINT unique_client_email UNIQUE (email);

-- Criar índices para melhor performance nas consultas por email
CREATE INDEX IF NOT EXISTS idx_admin_auth_email ON public.admin_auth(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_auth_email ON public.client_auth(email) WHERE email IS NOT NULL;

-- Função para sincronizar senhas do sistema de auth com as tabelas personalizadas
CREATE OR REPLACE FUNCTION sync_password_reset()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
    new_password_hash TEXT;
BEGIN
    -- Extrair email do metadata do usuário
    user_email := NEW.email;
    
    -- Hash da nova senha (se disponível)
    IF NEW.encrypted_password IS NOT NULL THEN
        new_password_hash := NEW.encrypted_password;
    END IF;
    
    -- Tentar atualizar admin_auth se o email corresponder
    UPDATE public.admin_auth 
    SET password_hash = new_password_hash,
        updated_at = now()
    WHERE email = user_email;
    
    -- Se não atualizou admin, tentar client_auth
    IF NOT FOUND THEN
        UPDATE public.client_auth 
        SET password_hash = new_password_hash,
            updated_at = now()
        WHERE email = user_email;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION sync_password_reset() IS 'Sincroniza alterações de senha do Supabase Auth com as tabelas admin_auth e client_auth';