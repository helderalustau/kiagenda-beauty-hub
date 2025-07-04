
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useAdminLoginLogic = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;

    try {
      console.log('Tentativa de login:', { name });

      // Verificação especial para super admin Helder
      if (name === 'Helder' && password === 'Hd@123@@') {
        console.log('Login como Super Admin detectado');
        
        const superAdminUser = {
          id: 'super-admin-helder',
          name: 'Helder',
          email: 'helder@superadmin.com',
          role: 'super_admin',
          isFirstAccess: false,
          loginTime: new Date().toISOString()
        };

        login(superAdminUser);
        localStorage.setItem('adminAuth', JSON.stringify(superAdminUser));
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo, Super Administrador!"
        });

        navigate('/super-admin-dashboard');
        return;
      }

      // Login normal para outros usuários - buscar primeiro pelo nome
      console.log('Buscando administrador no banco:', name);
      
      const { data: adminData, error } = await supabase
        .from('admin_auth')
        .select(`
          id,
          name,
          email,
          role,
          salon_id,
          password,
          password_hash,
          salons!inner(
            id,
            name,
            setup_completed,
            admin_setup_completed
          )
        `)
        .eq('name', name)
        .single();

      if (error || !adminData) {
        console.error('Erro ao buscar administrador:', error);
        toast({
          title: "Erro de Login",
          description: "Usuário não encontrado",
          variant: "destructive"
        });
        return;
      }

      console.log('Administrador encontrado:', adminData);

      // Verificar senha (suporte a hash e texto plano durante migração)
      let isPasswordValid = false;
      if (adminData.password_hash) {
        // Verificar senha com hash (implementar verificação adequada se necessário)
        isPasswordValid = adminData.password === password; // Temporário
      } else if (adminData.password) {
        isPasswordValid = adminData.password === password;
      }

      if (!isPasswordValid) {
        console.log('Senha incorreta');
        toast({
          title: "Erro de Login",
          description: "Senha incorreta",
          variant: "destructive"
        });
        return;
      }

      const userData = {
        id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        salon_id: adminData.salon_id,
        isFirstAccess: false,
        loginTime: new Date().toISOString()
      };

      login(userData);
      localStorage.setItem('adminAuth', JSON.stringify(userData));
      
      if (adminData.salon_id) {
        localStorage.setItem('selectedSalonId', adminData.salon_id);
      }

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${adminData.name}!`
      });

      // Lógica de redirecionamento baseada na configuração do estabelecimento
      const salon = adminData.salons;
      console.log('Status do salão:', {
        setup_completed: salon?.setup_completed,
        admin_setup_completed: salon?.admin_setup_completed
      });

      if (salon && salon.admin_setup_completed === true && salon.setup_completed === true) {
        console.log('Redirecionando para admin dashboard');
        navigate('/admin-dashboard');
      } else {
        console.log('Redirecionando para configuração do salão');
        navigate('/salon-setup');
      }

    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro interno",
        description: "Erro ao fazer login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate('/admin-registration');
  };

  return {
    handleLogin,
    handleCreateAccount,
    loading
  };
};
