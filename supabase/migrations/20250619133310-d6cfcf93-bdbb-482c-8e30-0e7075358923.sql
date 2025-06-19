
-- Criar bucket para imagens dos estabelecimentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('salon-banners', 'salon-banners', true);

-- Permitir que todos possam ver as imagens (público)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'salon-banners');

-- Permitir que admins e super admins façam upload de imagens
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'salon-banners');

-- Permitir que admins e super admins deletem imagens
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'salon-banners');

-- Adicionar coluna banner_image_url na tabela salons
ALTER TABLE public.salons ADD COLUMN banner_image_url TEXT NULL;
