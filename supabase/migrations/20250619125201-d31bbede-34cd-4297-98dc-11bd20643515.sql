
-- Primeiro, atualizar a constraint de role para incluir super_admin
ALTER TABLE public.admin_auth DROP CONSTRAINT IF EXISTS admin_auth_role_check;
ALTER TABLE public.admin_auth ADD CONSTRAINT admin_auth_role_check 
  CHECK (role IN ('admin', 'manager', 'collaborator', 'super_admin'));

-- Agora inserir o super administrador
INSERT INTO public.admin_auth (name, password, email, role) VALUES
('Helder', 'Hd@123@@', 'helderejc@gmail.com', 'super_admin')
ON CONFLICT (name) DO UPDATE SET 
  password = EXCLUDED.password,
  email = EXCLUDED.email,
  role = 'super_admin';

-- Inserir estabelecimentos de exemplo
INSERT INTO public.salons (name, owner_name, phone, address, plan) VALUES
('Bella Vista Salon', 'Maria Silva', '(11) 99999-9999', 'Rua das Flores, 123 - Centro', 'bronze'),
('Studio Elegance', 'Ana Costa', '(11) 98888-8888', 'Av. Principal, 456 - Vila Nova', 'prata'),
('Charme & Estilo', 'Carla Santos', '(11) 97777-7777', 'Rua da Beleza, 789 - Jardim', 'gold'),
('Salão Glamour', 'Juliana Oliveira', '(11) 96666-6666', 'Rua do Brilho, 321 - Moema', 'bronze'),
('Beauty Center', 'Fernanda Lima', '(11) 95555-5555', 'Av. da Beleza, 654 - Ipanema', 'prata'),
('Espaço Zen', 'Patricia Rocha', '(11) 94444-4444', 'Rua da Paz, 987 - Vila Madalena', 'gold'),
('Salão Moderno', 'Roberta Alves', '(11) 93333-3333', 'Av. Moderna, 159 - Pinheiros', 'bronze'),
('Hair & Beauty', 'Camila Torres', '(11) 92222-2222', 'Rua do Estilo, 753 - Brooklin', 'prata');

-- Criar administradores para cada salão
INSERT INTO public.admin_auth (salon_id, name, password, email, role) 
SELECT 
  s.id,
  LOWER(REPLACE(s.owner_name, ' ', '')),
  '123456',
  LOWER(REPLACE(s.owner_name, ' ', '')) || '@salon.com',
  'admin'
FROM public.salons s
ON CONFLICT (name) DO NOTHING;

-- Inserir alguns serviços básicos para os salões existentes
INSERT INTO public.services (salon_id, name, description, price, duration_minutes) 
SELECT s.id, 'Corte Feminino', 'Corte de cabelo feminino', 45.00, 60 FROM public.salons s
UNION ALL
SELECT s.id, 'Escova', 'Escova modeladora', 35.00, 45 FROM public.salons s
UNION ALL  
SELECT s.id, 'Manicure', 'Cuidados com as unhas das mãos', 25.00, 30 FROM public.salons s
UNION ALL
SELECT s.id, 'Coloração', 'Tintura e coloração capilar', 120.00, 120 FROM public.salons s;

-- Limpar agendamentos antigos que não têm relação válida
DELETE FROM public.appointments WHERE salon_id NOT IN (SELECT id FROM public.salons);
DELETE FROM public.appointments WHERE client_id NOT IN (SELECT id FROM public.clients);
DELETE FROM public.appointments WHERE service_id NOT IN (SELECT id FROM public.services);

-- Inserir alguns clientes exemplo
INSERT INTO public.clients (name, phone, email) VALUES
('João Silva', '(11) 91111-1111', 'joao@email.com'),
('Maria Fernanda', '(11) 90000-0000', 'maria.fernanda@email.com'),
('Carlos Roberto', '(11) 89999-9999', 'carlos@email.com'),
('Ana Paula', '(11) 88888-8888', 'ana.paula@email.com')
ON CONFLICT DO NOTHING;

-- Remover salões sem administradores vinculados
DELETE FROM public.salons 
WHERE id NOT IN (
  SELECT DISTINCT salon_id 
  FROM public.admin_auth 
  WHERE salon_id IS NOT NULL
);
