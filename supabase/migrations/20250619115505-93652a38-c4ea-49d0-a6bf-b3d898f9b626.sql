
-- Criar tabela para autenticação de clientes
CREATE TABLE public.client_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name)
);

-- Criar tabela para autenticação de administradores
CREATE TABLE public.admin_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'collaborator')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name)
);

-- Adicionar limites de atendentes por plano na tabela salons
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS max_attendants INTEGER DEFAULT 1;

-- Atualizar limites baseados no plano
UPDATE public.salons SET max_attendants = CASE 
  WHEN plan = 'bronze' THEN 1
  WHEN plan = 'prata' THEN 2  
  WHEN plan = 'gold' THEN 50
  ELSE 1
END;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.client_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Allow all operations on client_auth" ON public.client_auth FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_auth" ON public.admin_auth FOR ALL USING (true);

-- Inserir dados de exemplo para admin
INSERT INTO public.admin_auth (salon_id, name, password, email, role) VALUES
((SELECT id FROM public.salons LIMIT 1), 'admin', 'admin123', 'admin@salon.com', 'admin');

-- Inserir dados de exemplo para cliente
INSERT INTO public.client_auth (name, password, phone, email) VALUES
('cliente1', '123456', '(11) 99999-9999', 'cliente1@email.com'),
('cliente2', '123456', '(11) 98888-8888', 'cliente2@email.com');
