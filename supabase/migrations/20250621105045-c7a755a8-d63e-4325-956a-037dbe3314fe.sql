
-- Adicionar coluna para controlar se o setup foi concluído pelo administrador
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS admin_setup_completed boolean DEFAULT false;

-- Atualizar estabelecimentos existentes que já têm setup_completed = true
UPDATE public.salons 
SET admin_setup_completed = true 
WHERE setup_completed = true;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_salons_admin_setup_completed 
ON public.salons (admin_setup_completed);
