-- Habilitar realtime para a tabela appointments
ALTER TABLE appointments REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Verificar se já está na publicação (não vai dar erro se já estiver)
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';