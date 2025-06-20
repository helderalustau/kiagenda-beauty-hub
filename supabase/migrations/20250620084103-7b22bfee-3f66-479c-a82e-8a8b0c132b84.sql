
-- Remover a restrição NOT NULL da coluna category_id na tabela salons
ALTER TABLE public.salons ALTER COLUMN category_id DROP NOT NULL;

-- Remover a foreign key constraint da categoria
ALTER TABLE public.salons DROP CONSTRAINT IF EXISTS salons_category_id_fkey;

-- Remover a coluna category_id da tabela salons
ALTER TABLE public.salons DROP COLUMN IF EXISTS category_id;

-- Remover a tabela categories completamente
DROP TABLE IF EXISTS public.categories CASCADE;
