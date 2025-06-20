
-- Verificar e corrigir a estrutura da tabela services se necessário
-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON public.services(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(active);
CREATE INDEX IF NOT EXISTS idx_services_salon_active ON public.services(salon_id, active);

-- Verificar se existem serviços órfãos (sem salon_id válido)
-- Limpar dados inconsistentes se houver
DELETE FROM public.services 
WHERE salon_id NOT IN (SELECT id FROM public.salons);

-- Garantir que preset_services tenha dados básicos se estiver vazio
INSERT INTO public.preset_services (category, name, description, default_duration_minutes)
SELECT 
    'Cabelo' as category,
    'Corte Feminino' as name,
    'Corte de cabelo feminino' as description,
    60 as default_duration_minutes
WHERE NOT EXISTS (SELECT 1 FROM public.preset_services WHERE name = 'Corte Feminino');

INSERT INTO public.preset_services (category, name, description, default_duration_minutes)
SELECT 
    'Cabelo' as category,
    'Corte Masculino' as name,
    'Corte de cabelo masculino' as description,
    45 as default_duration_minutes
WHERE NOT EXISTS (SELECT 1 FROM public.preset_services WHERE name = 'Corte Masculino');

INSERT INTO public.preset_services (category, name, description, default_duration_minutes)
SELECT 
    'Estética' as category,
    'Limpeza de Pele' as name,
    'Limpeza de pele completa' as description,
    90 as default_duration_minutes
WHERE NOT EXISTS (SELECT 1 FROM public.preset_services WHERE name = 'Limpeza de Pele');

INSERT INTO public.preset_services (category, name, description, default_duration_minutes)
SELECT 
    'Unha' as category,
    'Manicure' as name,
    'Serviço de manicure' as description,
    45 as default_duration_minutes
WHERE NOT EXISTS (SELECT 1 FROM public.preset_services WHERE name = 'Manicure');

INSERT INTO public.preset_services (category, name, description, default_duration_minutes)
SELECT 
    'Unha' as category,
    'Pedicure' as name,
    'Serviço de pedicure' as description,
    60 as default_duration_minutes
WHERE NOT EXISTS (SELECT 1 FROM public.preset_services WHERE name = 'Pedicure');
