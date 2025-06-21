
-- Criar tabela para gerenciar usuários do estabelecimento
CREATE TABLE public.salon_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  is_owner BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS à tabela
ALTER TABLE public.salon_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que administradores vejam usuários do seu estabelecimento
CREATE POLICY "Admins can view salon users" 
  ON public.salon_users 
  FOR SELECT 
  USING (true);

-- Política para permitir que administradores criem usuários no seu estabelecimento
CREATE POLICY "Admins can create salon users" 
  ON public.salon_users 
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir que administradores atualizem usuários do seu estabelecimento
CREATE POLICY "Admins can update salon users" 
  ON public.salon_users 
  FOR UPDATE 
  USING (true);

-- Política para permitir que administradores excluam usuários do seu estabelecimento
CREATE POLICY "Admins can delete salon users" 
  ON public.salon_users 
  FOR DELETE 
  USING (true);

-- Adicionar coluna para limites de usuários nos planos
ALTER TABLE public.plan_configurations 
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 5;

-- Atualizar planos existentes com limites
UPDATE public.plan_configurations 
SET max_users = CASE 
  WHEN plan_type = 'bronze' THEN 2
  WHEN plan_type = 'silver' THEN 5
  WHEN plan_type = 'gold' THEN 10
  ELSE 5
END;

-- Função para criar usuário proprietário automaticamente
CREATE OR REPLACE FUNCTION create_owner_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir o proprietário como primeiro usuário
  INSERT INTO public.salon_users (
    salon_id,
    name,
    email,
    phone,
    role,
    is_owner,
    active
  ) VALUES (
    NEW.id,
    NEW.owner_name,
    '',
    NEW.phone,
    'owner',
    true,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para criar usuário proprietário automaticamente
CREATE TRIGGER create_owner_user_trigger
  AFTER INSERT ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION create_owner_user();
