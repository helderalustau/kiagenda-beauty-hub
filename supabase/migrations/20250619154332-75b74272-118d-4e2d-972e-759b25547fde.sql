
-- Adicionar campo unique_slug para criar URLs únicas para cada estabelecimento
ALTER TABLE public.salons 
ADD COLUMN unique_slug text UNIQUE;

-- Criar índice para otimizar buscas por slug
CREATE INDEX idx_salons_unique_slug ON public.salons(unique_slug);

-- Função para gerar slug único baseado no nome do estabelecimento
CREATE OR REPLACE FUNCTION generate_unique_slug(salon_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug text;
    final_slug text;
    counter integer := 0;
BEGIN
    -- Criar slug base: converter para minúsculas, remover acentos e substituir espaços por hífens
    base_slug := lower(regexp_replace(
        translate(salon_name, 
            'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ', 
            'aaaaaaaceeeeiiiinooooooouuuuyyy'
        ), 
        '[^a-z0-9]+', '-', 'g'
    ));
    
    -- Remover hífens do início e fim
    base_slug := trim(base_slug, '-');
    
    -- Garantir que o slug não esteja vazio
    IF base_slug = '' THEN
        base_slug := 'salon';
    END IF;
    
    final_slug := base_slug;
    
    -- Verificar se já existe e adicionar contador se necessário
    WHILE EXISTS (SELECT 1 FROM public.salons WHERE unique_slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$;

-- Trigger para gerar slug automaticamente ao inserir ou atualizar
CREATE OR REPLACE FUNCTION set_salon_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Gerar slug apenas se não existir ou se o nome mudou
    IF NEW.unique_slug IS NULL OR (OLD.name IS DISTINCT FROM NEW.name) THEN
        NEW.unique_slug := generate_unique_slug(NEW.name);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_set_salon_slug ON public.salons;
CREATE TRIGGER trigger_set_salon_slug
    BEFORE INSERT OR UPDATE ON public.salons
    FOR EACH ROW
    EXECUTE FUNCTION set_salon_slug();

-- Gerar slugs para estabelecimentos existentes
UPDATE public.salons 
SET unique_slug = generate_unique_slug(name) 
WHERE unique_slug IS NULL;
