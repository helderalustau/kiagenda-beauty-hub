
-- Criar bucket salon-assets se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'salon-assets',
  'salon-assets', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket salon-assets
CREATE POLICY "Allow public uploads to salon-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'salon-assets');

CREATE POLICY "Allow public reads from salon-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'salon-assets');

CREATE POLICY "Allow public updates to salon-assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'salon-assets');

CREATE POLICY "Allow public deletes from salon-assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'salon-assets');
