
-- Desabilitar RLS temporariamente para as tabelas de autenticação
ALTER TABLE public.admin_auth DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_auth DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes das tabelas de autenticação
DROP POLICY IF EXISTS "Allow all admin_auth operations" ON public.admin_auth;
DROP POLICY IF EXISTS "Allow all client_auth operations" ON public.client_auth;

-- Como estas tabelas são usadas para autenticação customizada e não dependem do auth.users do Supabase,
-- vamos manter elas sem RLS para evitar problemas de recursão infinita
-- O controle de acesso será feito na aplicação
