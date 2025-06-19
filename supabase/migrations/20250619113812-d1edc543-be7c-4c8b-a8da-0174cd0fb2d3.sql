
-- Criar tabela para salões
CREATE TABLE public.salons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'bronze' CHECK (plan IN ('bronze', 'prata', 'gold')),
  notification_sound TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para usuários (administradores e colaboradores)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'collaborator')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para serviços
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para agendamentos
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (por enquanto permitindo acesso público para desenvolvimento)
CREATE POLICY "Allow all operations on salons" ON public.salons FOR ALL USING (true);
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations on services" ON public.services FOR ALL USING (true);
CREATE POLICY "Allow all operations on clients" ON public.clients FOR ALL USING (true);
CREATE POLICY "Allow all operations on appointments" ON public.appointments FOR ALL USING (true);

-- Inserir dados de exemplo
INSERT INTO public.salons (name, owner_name, phone, address, plan) VALUES
('Salão Bella Vista', 'Maria Santos', '(11) 99999-9999', 'Rua das Flores, 123', 'bronze');

INSERT INTO public.services (salon_id, name, description, price, duration_minutes) VALUES
((SELECT id FROM public.salons LIMIT 1), 'Corte Feminino', 'Corte de cabelo feminino', 45.00, 60),
((SELECT id FROM public.salons LIMIT 1), 'Escova', 'Escova modeladora', 35.00, 45),
((SELECT id FROM public.salons LIMIT 1), 'Manicure', 'Cuidados com as unhas das mãos', 25.00, 30),
((SELECT id FROM public.salons LIMIT 1), 'Coloração', 'Tintura e coloração capilar', 120.00, 120);

INSERT INTO public.clients (name, phone, email) VALUES
('Ana Silva', '(11) 98888-8888', 'ana@email.com'),
('Carla Costa', '(11) 97777-7777', 'carla@email.com'),
('Beatriz Lima', '(11) 96666-6666', 'beatriz@email.com');

INSERT INTO public.appointments (salon_id, client_id, service_id, appointment_date, appointment_time, status) VALUES
((SELECT id FROM public.salons LIMIT 1), (SELECT id FROM public.clients WHERE name = 'Ana Silva'), (SELECT id FROM public.services WHERE name = 'Corte Feminino'), CURRENT_DATE, '09:00', 'confirmed'),
((SELECT id FROM public.salons LIMIT 1), (SELECT id FROM public.clients WHERE name = 'Carla Costa'), (SELECT id FROM public.services WHERE name = 'Coloração'), CURRENT_DATE, '14:00', 'pending'),
((SELECT id FROM public.salons LIMIT 1), (SELECT id FROM public.clients WHERE name = 'Beatriz Lima'), (SELECT id FROM public.services WHERE name = 'Manicure'), CURRENT_DATE, '16:30', 'confirmed');
