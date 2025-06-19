
-- Inserir o superadministrador com as credenciais especificadas
INSERT INTO public.admin_auth (name, password, email, role) 
VALUES ('Helder', 'Hd@123@@', 'helderejc@gmail.com', 'super_admin')
ON CONFLICT (name) DO UPDATE SET 
  password = EXCLUDED.password,
  email = EXCLUDED.email,
  role = 'super_admin';
