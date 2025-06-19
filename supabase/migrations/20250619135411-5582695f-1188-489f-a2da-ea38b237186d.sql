
-- Adicionar colunas para configuração completa do estabelecimento
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS street_number TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS opening_hours JSONB;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT false;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false;

-- Criar tabela para serviços pré-estabelecidos por categoria
CREATE TABLE IF NOT EXISTS public.preset_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir serviços pré-estabelecidos para salões de beleza
INSERT INTO public.preset_services (category, name, description, default_duration_minutes) VALUES
-- Cortes
('cortes', 'Corte Feminino', 'Corte de cabelo feminino', 60),
('cortes', 'Corte Masculino', 'Corte de cabelo masculino', 45),
('cortes', 'Corte Infantil', 'Corte de cabelo para crianças', 30),
('cortes', 'Corte com Máquina', 'Corte simples com máquina', 20),

-- Tratamentos Capilares
('tratamentos', 'Hidratação', 'Tratamento de hidratação capilar', 90),
('tratamentos', 'Cauterização', 'Tratamento de cauterização', 120),
('tratamentos', 'Botox Capilar', 'Tratamento com botox capilar', 150),
('tratamentos', 'Cronograma Capilar', 'Cronograma de tratamento completo', 180),

-- Coloração
('coloracao', 'Coloração Simples', 'Aplicação de cor única', 120),
('coloracao', 'Mechas', 'Aplicação de mechas', 180),
('coloracao', 'Ombré Hair', 'Técnica de ombré hair', 240),
('coloracao', 'Balayage', 'Técnica de balayage', 300),

-- Escova e Penteados
('escova_penteado', 'Escova Progressiva', 'Escova progressiva completa', 240),
('escova_penteado', 'Escova Simples', 'Escova e finalização', 45),
('escova_penteado', 'Penteado para Festa', 'Penteado elaborado para eventos', 90),
('escova_penteado', 'Penteado para Noiva', 'Penteado especial para noivas', 120),

-- Estética
('estetica', 'Limpeza de Pele', 'Limpeza facial completa', 90),
('estetica', 'Design de Sobrancelha', 'Design e modelagem de sobrancelhas', 30),
('estetica', 'Depilação Facial', 'Depilação da região facial', 45),
('estetica', 'Aplicação de Cílios', 'Aplicação de cílios postiços', 60),

-- Manicure e Pedicure
('manicure_pedicure', 'Manicure Simples', 'Manicure básica', 45),
('manicure_pedicure', 'Pedicure Simples', 'Pedicure básica', 60),
('manicure_pedicure', 'Esmaltação em Gel', 'Aplicação de esmalte em gel', 60),
('manicure_pedicure', 'Nail Art', 'Decoração artística das unhas', 90);
