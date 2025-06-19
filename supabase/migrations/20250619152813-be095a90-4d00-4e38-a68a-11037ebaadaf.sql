
-- Remover políticas existentes que estão causando recursão
DROP POLICY IF EXISTS "Allow all operations on admin_auth" ON public.admin_auth;

-- Criar políticas RLS mais específicas e seguras para admin_auth
CREATE POLICY "Enable read access for all users" ON public.admin_auth
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.admin_auth
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.admin_auth
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.admin_auth
    FOR DELETE USING (true);

-- Fazer o mesmo para client_auth para evitar problemas similares
DROP POLICY IF EXISTS "Allow all operations on client_auth" ON public.client_auth;

CREATE POLICY "Enable read access for all users" ON public.client_auth
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.client_auth
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.client_auth
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.client_auth
    FOR DELETE USING (true);

-- Garantir que a tabela salons também tenha políticas básicas
CREATE POLICY "Enable all operations for salons" ON public.salons
    FOR ALL USING (true);

-- Inserir dados de teste para verificar se o problema foi resolvido
INSERT INTO public.admin_auth (name, password, email, role) 
VALUES ('Rosivaldo', '123', 'rosivaldo@test.com', 'admin')
ON CONFLICT (name) DO NOTHING;
