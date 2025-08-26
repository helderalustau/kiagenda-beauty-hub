-- Criar tabela para gerenciar tokens de recuperação de senha
CREATE TABLE public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'client')),
  identifier TEXT NOT NULL, -- email ou telefone
  token_type TEXT NOT NULL CHECK (token_type IN ('email', 'phone')),
  token_value TEXT NOT NULL, -- token/código gerado
  user_id UUID, -- referência ao usuário (admin_auth ou client_auth)
  is_used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_password_reset_tokens_identifier ON public.password_reset_tokens(identifier);
CREATE INDEX idx_password_reset_tokens_token_value ON public.password_reset_tokens(token_value);
CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- RLS políticas
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de tokens
CREATE POLICY "Allow token creation" ON public.password_reset_tokens
FOR INSERT WITH CHECK (true);

-- Política para leitura de tokens válidos
CREATE POLICY "Allow token validation" ON public.password_reset_tokens
FOR SELECT USING (expires_at > now() AND is_used = false);

-- Política para atualização de tokens (marcar como usado)
CREATE POLICY "Allow token usage update" ON public.password_reset_tokens
FOR UPDATE USING (expires_at > now());

-- Função para limpar tokens expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.password_reset_tokens 
  WHERE expires_at < now() OR is_used = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-update do updated_at
CREATE OR REPLACE FUNCTION public.update_password_reset_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_password_reset_tokens_updated_at
  BEFORE UPDATE ON public.password_reset_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_password_reset_tokens_updated_at();