
-- Adicionar campos para códigos únicos e vínculos hierárquicos

-- 1. Adicionar código único para estabelecimentos
ALTER TABLE public.salons 
ADD COLUMN unique_code VARCHAR(50) UNIQUE,
ADD COLUMN super_admin_code VARCHAR(50),
ADD COLUMN created_by_super_admin BOOLEAN DEFAULT true;

-- 2. Adicionar campos de vínculo na tabela admin_auth
ALTER TABLE public.admin_auth 
ADD COLUMN unique_admin_code VARCHAR(50) UNIQUE,
ADD COLUMN salon_code VARCHAR(50),
ADD COLUMN super_admin_link_code VARCHAR(50),
ADD COLUMN hierarchy_level VARCHAR(20) DEFAULT 'admin';

-- 3. Criar tabela para gerenciar vínculos hierárquicos
CREATE TABLE public.admin_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_code VARCHAR(50) NOT NULL,
    salon_code VARCHAR(50) NOT NULL,
    admin_code VARCHAR(50) NOT NULL,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.admin_auth(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(super_admin_code, salon_code, admin_code)
);

-- 4. Função para gerar códigos únicos
CREATE OR REPLACE FUNCTION generate_unique_code(prefix TEXT, length INTEGER DEFAULT 12)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := prefix || '-';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. Função para criar vínculos hierárquicos
CREATE OR REPLACE FUNCTION create_admin_hierarchy_link(
    p_salon_id UUID,
    p_admin_id UUID,
    p_salon_name TEXT,
    p_admin_name TEXT
) RETURNS JSONB AS $$
DECLARE
    v_super_admin_code TEXT;
    v_salon_code TEXT;
    v_admin_code TEXT;
    v_result JSONB;
BEGIN
    -- Gerar códigos únicos
    v_super_admin_code := generate_unique_code('SA');
    v_salon_code := generate_unique_code('SL');
    v_admin_code := generate_unique_code('AD');
    
    -- Garantir unicidade dos códigos
    WHILE EXISTS (SELECT 1 FROM public.salons WHERE unique_code = v_salon_code) LOOP
        v_salon_code := generate_unique_code('SL');
    END LOOP;
    
    WHILE EXISTS (SELECT 1 FROM public.admin_auth WHERE unique_admin_code = v_admin_code) LOOP
        v_admin_code := generate_unique_code('AD');
    END LOOP;
    
    WHILE EXISTS (SELECT 1 FROM public.admin_hierarchy WHERE super_admin_code = v_super_admin_code) LOOP
        v_super_admin_code := generate_unique_code('SA');
    END LOOP;
    
    -- Atualizar estabelecimento
    UPDATE public.salons 
    SET 
        unique_code = v_salon_code,
        super_admin_code = v_super_admin_code,
        updated_at = now()
    WHERE id = p_salon_id;
    
    -- Atualizar administrador
    UPDATE public.admin_auth 
    SET 
        unique_admin_code = v_admin_code,
        salon_code = v_salon_code,
        super_admin_link_code = v_super_admin_code,
        updated_at = now()
    WHERE id = p_admin_id;
    
    -- Criar vínculo hierárquico
    INSERT INTO public.admin_hierarchy (
        super_admin_code,
        salon_code,
        admin_code,
        salon_id,
        admin_id
    ) VALUES (
        v_super_admin_code,
        v_salon_code,
        v_admin_code,
        p_salon_id,
        p_admin_id
    );
    
    -- Retornar códigos gerados
    v_result := jsonb_build_object(
        'super_admin_code', v_super_admin_code,
        'salon_code', v_salon_code,
        'admin_code', v_admin_code,
        'success', true
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 6. Índices para otimizar consultas
CREATE INDEX idx_salons_unique_code ON public.salons(unique_code);
CREATE INDEX idx_salons_super_admin_code ON public.salons(super_admin_code);
CREATE INDEX idx_admin_auth_unique_code ON public.admin_auth(unique_admin_code);
CREATE INDEX idx_admin_auth_salon_code ON public.admin_auth(salon_code);
CREATE INDEX idx_admin_hierarchy_codes ON public.admin_hierarchy(super_admin_code, salon_code, admin_code);
