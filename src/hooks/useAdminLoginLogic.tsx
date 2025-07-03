
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
      // Verificação especial para super admin
      if (name === 'Helder' && password === 'Hd@123@@') {
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

      // Login normal para outros usuários
      const { data: adminData, error } = await supabase
        .from('admin_auth')
        .select(`
          id,
          name,
          email,
          role,
          salon_id,
          password,
          salons!inner(
            id,
            name,
            setup_completed
          )
        `)
        .eq('name', name)
        .single();

      if (error || !adminData) {
        toast({
          title: "Erro de Login",
          description: "Usuário não encontrado",
          variant: "destructive"
        });
        return;
      }

      // Verificar senha
      if (adminData.password !== password) {
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
      localStorage.setItem('selectedSalonId', adminData.salon_id);

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${adminData.name}!`
      });

      // Lógica de redirecionamento baseada no estabelecimento
      const salon = adminData.salons;
      if (salon && salon.setup_completed) {
        navigate('/admin-dashboard');
      } else {
        navigate('/salon-setup');
      }

    } catch (error) {
      console.error('Login error:', error);
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
