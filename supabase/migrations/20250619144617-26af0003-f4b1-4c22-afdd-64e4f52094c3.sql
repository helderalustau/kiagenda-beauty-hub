
-- Habilitar RLS para todas as tabelas que não possuem
ALTER TABLE public.plan_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preset_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas para plan_configurations (apenas super admins podem gerenciar)
CREATE POLICY "Super admins can manage plan configurations" 
ON public.plan_configurations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Políticas para preset_services (leitura pública, escrita apenas super admins)
CREATE POLICY "Anyone can read preset services" 
ON public.preset_services 
FOR SELECT 
USING (true);

CREATE POLICY "Super admins can manage preset services" 
ON public.preset_services 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Políticas para salons (admins podem gerenciar seus próprios salões)
CREATE POLICY "Admins can manage their own salon" 
ON public.salons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE admin_auth.salon_id = salons.id 
    AND admin_auth.id = auth.uid()
  )
);

CREATE POLICY "Super admins can manage all salons" 
ON public.salons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Public can read open salons" 
ON public.salons 
FOR SELECT 
USING (true);

-- Políticas para services (admins podem gerenciar serviços do seu salão)
CREATE POLICY "Admins can manage their salon services" 
ON public.services 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE admin_auth.salon_id = services.salon_id 
    AND admin_auth.id = auth.uid()
  )
);

CREATE POLICY "Public can read active services" 
ON public.services 
FOR SELECT 
USING (active = true);

-- Políticas para clients (leitura pública para agendamentos)
CREATE POLICY "Public can read clients" 
ON public.clients 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage clients" 
ON public.clients 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE admin_auth.id = auth.uid()
  )
);

-- Políticas para appointments (admins podem ver agendamentos do seu salão)
CREATE POLICY "Admins can manage their salon appointments" 
ON public.appointments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE admin_auth.salon_id = appointments.salon_id 
    AND admin_auth.id = auth.uid()
  )
);

CREATE POLICY "Clients can read their own appointments" 
ON public.appointments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.client_auth 
    WHERE client_auth.id = auth.uid()
  )
);

-- Políticas para admin_auth (admins podem ver outros admins do mesmo salão)
CREATE POLICY "Admins can manage their salon team" 
ON public.admin_auth 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth admin_check 
    WHERE admin_check.salon_id = admin_auth.salon_id 
    AND admin_check.id = auth.uid()
    AND admin_check.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Super admins can manage all admin users" 
ON public.admin_auth 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Admins can read their own profile" 
ON public.admin_auth 
FOR SELECT 
USING (id = auth.uid());

-- Políticas para client_auth (clientes podem gerenciar apenas seu próprio perfil)
CREATE POLICY "Clients can manage their own profile" 
ON public.client_auth 
FOR ALL 
USING (id = auth.uid());

-- Políticas para users (usuários podem gerenciar apenas seu próprio perfil)
CREATE POLICY "Users can manage their own profile" 
ON public.users 
FOR ALL 
USING (id = auth.uid());

CREATE POLICY "Salon admins can read users from their salon" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE admin_auth.salon_id = users.salon_id 
    AND admin_auth.id = auth.uid()
  )
);
