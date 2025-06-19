
-- Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.categories (name, description) VALUES
('Salão de Beleza', 'Salões de beleza com serviços completos'),
('Manicure', 'Serviços especializados em unhas'),
('Barbearia', 'Serviços masculinos de corte e barba'),
('Estética', 'Tratamentos estéticos e de beleza'),
('Spa', 'Serviços relaxantes e terapêuticos');

-- Adicionar coluna de categoria aos estabelecimentos
ALTER TABLE public.salons ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Atualizar estabelecimentos existentes com categoria padrão (Salão de Beleza)
UPDATE public.salons SET category_id = (SELECT id FROM public.categories WHERE name = 'Salão de Beleza' LIMIT 1);

-- Tornar categoria obrigatória
ALTER TABLE public.salons ALTER COLUMN category_id SET NOT NULL;

-- Expandir tabela de clientes com informações de endereço
ALTER TABLE public.clients ADD COLUMN street_address TEXT;
ALTER TABLE public.clients ADD COLUMN house_number TEXT;
ALTER TABLE public.clients ADD COLUMN neighborhood TEXT;
ALTER TABLE public.clients ADD COLUMN city TEXT;
ALTER TABLE public.clients ADD COLUMN state TEXT;
ALTER TABLE public.clients ADD COLUMN zip_code TEXT;

-- Limpar estabelecimentos sem administradores usando a função existente
SELECT public.cleanup_salons_without_admins();
